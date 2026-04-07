import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import { createServer as createViteServer } from "vite";

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
    const { orderData } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    const message = `
🎂 *НОВЫЙ ЗАКАЗ!*
--------------------------
🍰 *Торт:* ${orderData.cake}
💰 *Цена:* ${orderData.price} BYN
👤 *Клиент:* ${orderData.customer}
📞 *Телефон:* ${orderData.phone}
--------------------------`;

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: message,
          parse_mode: "Markdown",
        }),
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Order error:", error);
      res.status(500).json({ error: "Ошибка при отправке заказа" });
    }
  });

  // Эндпоинт для вебхука Telegram
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
            text: "Добро пожаловать в нашу кондитерскую! Нажмите кнопку ниже, чтобы открыть магазин:",
            reply_markup: {
              inline_keyboard: [[
                { text: "Магазин 🍰", web_app: { url: appUrl } }
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

  // Интеграция Vite для разработки или обслуживание статики для продакшена
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
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

  // Запускаем прослушивание порта только если мы НЕ на Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Сервер запущен локально: http://localhost:${PORT}`);
    });
  }

  return app;
}

// Экспортируем промис с приложением для Vercel
export default startServer();
