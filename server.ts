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

    // Проверка на старый отозванный токен (для удобства отладки)
    if (token.includes("AAHRkYi4s8txsG5zUyu-S_e_j8W-EoJigY8")) {
      return res.status(401).json({ error: "Вы используете СТАРЫЙ отозванный токен. Обновите TELEGRAM_BOT_TOKEN в настройках!" });
    }

    const escapeHtml = (text: string) => {
      if (!text) return '-';
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    // Формируем сообщение, используя данные напрямую
    const message = `
<b>🎂 НОВЫЙ ЗАКАЗ!</b>
--------------------------
🍰 <b>Торт:</b> ${escapeHtml(data.cake)}
⚖️ <b>Размер:</b> ${escapeHtml(data.size)}
🍓 <b>Начинка:</b> ${escapeHtml(data.filling)}
🍞 <b>Бисквит:</b> ${escapeHtml(data.biscuit)}
🥜 <b>Добавки:</b> ${escapeHtml(data.addon)}
💰 <b>Цена:</b> ${data.price || 0} BYN
👤 <b>Клиент:</b> ${escapeHtml(data.customer || data.name)}
📞 <b>Телефон:</b> ${escapeHtml(data.phone)}
📅 <b>Дата:</b> ${escapeHtml(data.date)}
⏰ <b>Время:</b> ${escapeHtml(data.time)}
📝 <b>Пожелания:</b> ${escapeHtml(data.wishes)}
--------------------------`.trim();

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: message,
          parse_mode: "HTML",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return res.status(500).json({ error: `Ошибка Telegram: ${result.description}` });
      }

      // Отправляем подтверждение пользователю, если есть chatId
      if (data.chatId) {
        const userMessage = `
✨ <b>Ваш заказ принят!</b>

Спасибо за доверие! Мы уже передали детали нашим кондитерам 👩‍🍳👨‍🍳

В ближайшее время мы свяжемся с вами для окончательного подтверждения заказа.

С любовью, ваша кондитерская 🍰❤️`.trim();

        try {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: data.chatId,
              text: userMessage,
              parse_mode: "HTML",
            }),
          });
        } catch (err) {
          console.error("Ошибка при отправке сообщения пользователю:", err);
        }
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

  // Интеграция Vite для разработки или обслуживание статики для продакшена
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

  // Запускаем прослушивание порта только если мы НЕ на Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Сервер запущен локально: http://localhost:${PORT}`);
    });
  }

  return app;
}

// Экспортируем промис с приложением для Vercel
const appPromise = startServer();

export default async (req: any, res: any) => {
  const app = await appPromise;
  app(req, res); // Vercel сам передаст сюда запросы
};
