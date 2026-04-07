import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
  }));

  // API: Обработка заказа
  app.post("/api/order", async (req, res) => {
    // ИСПРАВЛЕНО: Фронтенд присылает данные напрямую в теле запроса (req.body)
    const data = req.body; 
    
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    // Проверка: пришло ли хоть что-то
    if (!data || !data.customer) {
      console.error("Payload error: Data is missing or 'customer' field is empty");
      return res.status(400).json({ error: "Данные заказа неполные" });
    }

    if (!token || !adminChatId) {
      console.error("Config error: TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID is missing in Vercel Env");
      return res.status(500).json({ error: "Ошибка конфигурации сервера" });
    }

    // Формируем текст сообщения для бота
    const message = `
🎂 *НОВЫЙ ЗАКАЗ!*
--------------------------
🍰 *Торт:* ${data.cake || 'Не указан'}
💰 *Цена:* ${data.price || 0} BYN
👤 *Клиент:* ${data.customer}
📞 *Телефон:* ${data.phone}
📅 *Дата:* ${data.date || '-'}
⏰ *Время:* ${data.time || '-'}
📝 *Пожелания:* ${data.wishes || '-'}
--------------------------`.trim();

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: message,
          parse_mode: "Markdown",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Telegram API Error:", result);
        return res.status(500).json({ error: `TG Error: ${result.description}` });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Critical Server Error:", error);
      res.status(500).json({ error: "Не удалось отправить заказ в Telegram" });
    }
  });

  // Эндпоинт для вебхука Telegram (авто-ответ на /start)
  app.post("/api/webhook", async (req, res) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const appUrl = process.env.APP_URL || "https://repo-cake.vercel.app/";
    const update = req.body;

    if (update.message && update.message.text === "/start") {
      const chatId = update.message.chat.id;
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "Добро пожаловать! Нажмите кнопку ниже, чтобы открыть магазин:",
            reply_markup: {
              inline_keyboard: [[
                { text: "Открыть магазин 🍰", web_app: { url: appUrl } }
              ]]
            }
          }),
        });
      } catch (err) {
        console.error("Webhook error:", err);
      }
    }
    res.sendStatus(200);
  });

  // Раздача фронтенда
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
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

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Сервер запущен: http://localhost:${PORT}`);
    });
  }

  return app;
}

const appPromise = startServer();

export default async (req: any, res: any) => {
  const app = await appPromise;
  app(req, res);
};