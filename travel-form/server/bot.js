/**
 * World Traveler — Telegram Bot
 * Registers the Mini App button and handles /start command.
 *
 * Run: BOT_TOKEN=xxx WEBAPP_URL=https://yourapp.com node bot.js
 */

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

if (!BOT_TOKEN || !WEBAPP_URL) {
  console.error('❌  Set BOT_TOKEN and WEBAPP_URL env vars');
  process.exit(1);
}

const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function call(method, body = {}) {
  const { default: fetch } = await import('node-fetch');
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ── Set bot commands ───────────────────────
async function setup() {
  await call('setMyCommands', {
    commands: [
      { command: 'start', description: '🌍 Открыть World Traveler' },
      { command: 'results', description: '👥 Посмотреть результаты всех' },
    ],
  });

  // Set mini app button in menu
  await call('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: '🗺 World Traveler',
      web_app: { url: WEBAPP_URL },
    },
  });

  console.log('✅  Bot configured. Starting polling…');
  poll();
}

// ── Long polling ──────────────────────────
let offset = 0;
async function poll() {
  try {
    const { ok, result } = await call('getUpdates', {
      offset, timeout: 30, allowed_updates: ['message', 'web_app_data'],
    });

    if (ok && result?.length) {
      for (const update of result) {
        offset = update.update_id + 1;
        await handleUpdate(update);
      }
    }
  } catch (err) {
    console.error('Poll error:', err.message);
  }
  setTimeout(poll, 500);
}

// ── Handle updates ────────────────────────
async function handleUpdate(update) {
  // Web app data submitted
  if (update.web_app_data) {
    const { data, user } = update.web_app_data;
    try {
      const payload = JSON.parse(data);
      if (payload.action === 'submit') await onSubmit(update.web_app_data, payload);
    } catch {}
    return;
  }

  const msg = update.message;
  if (!msg) return;

  const chatId = msg.chat.id;
  const text   = msg.text || '';
  const name   = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || 'Путешественник';

  if (text.startsWith('/start')) {
    await call('sendMessage', {
      chat_id: chatId,
      text: `Привет, ${name}! 👋\n\n🌍 <b>World Traveler</b> — отметь страны, в которых ты побывал, и поделись своим списком с друзьями!`,
      parse_mode: 'HTML',
      reply_markup: JSON.stringify({
        inline_keyboard: [[
          { text: '🗺️ Открыть карту путешествий', web_app: { url: WEBAPP_URL } },
        ]],
      }),
    });
  } else if (text.startsWith('/results')) {
    await call('sendMessage', {
      chat_id: chatId,
      text: '👥 Смотри результаты всех путешественников прямо в приложении:',
      reply_markup: JSON.stringify({
        inline_keyboard: [[
          { text: '📊 Открыть результаты', web_app: { url: WEBAPP_URL + '?view=results' } },
        ]],
      }),
    });
  }
}

// ── On web_app_data submit ────────────────
async function onSubmit(webAppData, payload) {
  const chatId = webAppData.from?.id;
  if (!chatId) return;

  const countries = payload.countries || [];
  const name      = [webAppData.from?.first_name, webAppData.from?.last_name]
    .filter(Boolean).join(' ') || 'Путешественник';

  const list = countries.map(c => `${c.emoji} ${c.name}`).join('  ·  ');
  const text = `✅ <b>Список опубликован!</b>\n\n` +
    `${name} побывал(а) в <b>${countries.length}</b> стран(ах):\n\n${list}`;

  await call('sendMessage', {
    chat_id: chatId,
    text, parse_mode: 'HTML',
    reply_markup: JSON.stringify({
      inline_keyboard: [[
        { text: '👥 Посмотреть чужие списки', web_app: { url: WEBAPP_URL + '?view=results' } },
      ]],
    }),
  });
}

setup().catch(console.error);
