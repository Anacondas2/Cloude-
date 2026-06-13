/**
 * Trewel — Telegram bot (optional)
 * Opens the Mini App via /start and the menu button.
 *
 *   BOT_TOKEN=xxx WEBAPP_URL=https://your.vercel.app node bot/bot.mjs
 */

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

if (!BOT_TOKEN || !WEBAPP_URL) {
  console.error("Set BOT_TOKEN and WEBAPP_URL");
  process.exit(1);
}

const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function call(method, body = {}) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function setup() {
  await call("setChatMenuButton", {
    menu_button: { type: "web_app", text: "🌍 Trewel", web_app: { url: WEBAPP_URL } },
  });
  await call("setMyCommands", {
    commands: [
      { command: "start", description: "🌍 Открыть Trewel" },
      { command: "results", description: "👥 Результаты группы" },
    ],
  });
  console.log("Bot ready, polling…");
  poll();
}

let offset = 0;
async function poll() {
  try {
    const { result } = await call("getUpdates", { offset, timeout: 30 });
    for (const u of result || []) {
      offset = u.update_id + 1;
      await onUpdate(u);
    }
  } catch (e) {
    console.error(e.message);
  }
  setTimeout(poll, 400);
}

async function onUpdate(u) {
  const msg = u.message;
  if (!msg?.text) return;
  const chat_id = msg.chat.id;

  if (msg.text.startsWith("/start")) {
    await call("sendMessage", {
      chat_id,
      text: "🌍 Отметь страны, в которых ты побывал, и попади в общую ленту группы!",
      reply_markup: {
        inline_keyboard: [[{ text: "Открыть Trewel", web_app: { url: WEBAPP_URL } }]],
      },
    });
  } else if (msg.text.startsWith("/results")) {
    await call("sendMessage", {
      chat_id,
      text: "👥 Карта путешествий группы:",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Смотреть результаты", web_app: { url: `${WEBAPP_URL}/results` } }],
        ],
      },
    });
  }
}

setup().catch(console.error);
