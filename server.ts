import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // Максимально разрешаем CORS для работы с Vercel
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
  }));

  // API: Обработка заказа
  app.post("/api/order", async (req, res) => {
    const { orderData } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!token) {
      return res.status(500).json({ error: "TELEGRAM_BOT_TOKEN не настроен" });
    }

    // Формируем сообщение для админа
    const message = `
🎂 *НОВЫЙ ЗАКАЗ!*
--------------------------
🍰 *Торт:* ${orderData.cake}
💰 *Цена:* ${orderData.price} BYN
👤 *Клиент:* ${orderData.customer}
📞 *Телефон:* ${orderData.phone}
🚚 *Тип:* ${orderData.type}
📅 *Дата:* ${orderData.date}
⏰ *Время:* ${orderData.time}
📝 *Пожелания:* ${orderData.wishes || "нет"}
--------------------------
    `;

    try {
      // Отправляем админу (если ID указан)
      if (adminChatId) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: adminChatId,
            text: message,
            parse_mode: "Markdown",
          }),
        });
      }

      // Также можно отправить подтверждение самому пользователю, 
      // если мы получили его chat_id из WebApp (через initData)
      
      res.json({ success: true });
    } catch (error) {
      console.error("Ошибка отправки в Telegram:", error);
      res.status(500).json({ error: "Ошибка при отправке уведомления" });
    }
  });

  // Vite middleware для разработки
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
  });

  // Простейший Long Polling для обработки /start (чтобы бот отвечал)
  startBotPolling();
}

async function startBotPolling() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.APP_URL;
  if (!token) return;

  let lastUpdateId = 0;

  setInterval(async () => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`);
      const data = await response.json();

      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          if (update.message && update.message.text === "/start") {
            const chatId = update.message.chat.id;
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: "Добро пожаловать в нашу кондитерскую! Нажмите кнопку ниже, чтобы открыть магазин:",
                reply_markup: {
                  inline_keyboard: [[
                    { text: "Магазин 🍰", web_app: { url: "https://repo-cake.vercel.app/" } }
                  ]]
                }
              }),
            });
          }
        }
      }
    } catch (e) {
      // Игнорируем ошибки сети в поллинге
    }
  }, 3000);
}

startServer();
