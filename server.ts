import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));

// API: Обработка заказа
app.post("/api/order", async (req, res) => {
  // Исправлено: берем данные напрямую из body
  const data = req.body;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ error: "Данные заказа пусты" });
  }

  if (!token || !adminChatId) {
    return res.status(500).json({ error: "Ошибка конфига: проверьте токены в Vercel" });
  }

  // Формируем сообщение, используя данные напрямую
  const message = `
🎂 *НОВЫЙ ЗАКАЗ!*
--------------------------
🍰 *Торт:* ${data.cake || 'Не выбран'}
💰 *Цена:* ${data.price || 0} BYN
👤 *Клиент:* ${data.customer || data.name || 'Не указан'}
📞 *Телефон:* ${data.phone || 'Не указан'}
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
      return res.status(500).json({ error: `Ошибка Telegram: ${result.description}` });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: `Ошибка сервера: ${error.message}` });
  }
});

// Обработка вебхука
app.post("/api/webhook", async (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.APP_URL || "https://repo-cake.vercel.app/";
  const update = req.body;

  if (update.message?.text === "/start") {
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: update.message.chat.id,
          text: "Добро пожаловать! Нажмите кнопку ниже, чтобы открыть магазин:",
          reply_markup: {
            inline_keyboard: [[
              { text: "Магазин 🍰", web_app: { url: appUrl } }
            ]]
          }
        }),
      });
    } catch (err) {
      console.error(err);
    }
  }
  res.sendStatus(200);
});

// Статика
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Экспорт для Vercel
export default app;