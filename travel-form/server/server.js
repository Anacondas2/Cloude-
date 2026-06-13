/**
 * World Traveler — Express backend
 * Stores submissions and serves public results.
 *
 * Env vars:
 *   PORT          – HTTP port (default 3000)
 *   BOT_TOKEN     – Telegram bot token (for optional bot integration)
 *   WEBAPP_URL    – Public URL of the mini-app (https://...)
 */

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const Database   = require('better-sqlite3');
const { createHmac } = require('crypto');

const PORT      = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const WEBAPP_URL = process.env.WEBAPP_URL || '';

const app = express();
const db  = new Database(path.join(__dirname, 'travel.db'));

// ── DB setup ─────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT,
    name        TEXT NOT NULL,
    countries   TEXT NOT NULL,
    ts          INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
  );
`);

const insertStmt = db.prepare(`
  INSERT INTO submissions (telegram_id, name, countries)
  VALUES (@telegramId, @name, @countries)
`);

const getLatestPerUser = db.prepare(`
  SELECT telegram_id, name, countries, MAX(ts) as ts
  FROM submissions
  GROUP BY telegram_id
  ORDER BY ts DESC
  LIMIT 50
`);

const getAnonymous = db.prepare(`
  SELECT name, countries, ts FROM submissions
  WHERE telegram_id IS NULL OR telegram_id = ''
  ORDER BY ts DESC LIMIT 50
`);

// ── Telegram init-data verification ──────
function verifyTelegramData(initData, botToken) {
  if (!botToken || !initData) return true; // skip if no token configured
  const params  = new URLSearchParams(initData);
  const hash    = params.get('hash');
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calcHash  = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  return calcHash === hash;
}

// ── Middleware ────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..'))); // serve ../index.html etc.

// ── Routes ───────────────────────────────

// GET /api/results — public leaderboard
app.get('/api/results', (req, res) => {
  try {
    const rows = getLatestPerUser.all();
    const result = rows.map(row => ({
      name:      row.name,
      ts:        row.ts,
      countries: JSON.parse(row.countries),
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// POST /api/submit — save user's selection
app.post('/api/submit', (req, res) => {
  const { name, telegramId, initData, countries } = req.body || {};

  if (!Array.isArray(countries) || countries.length === 0) {
    return res.status(400).json({ error: 'no countries' });
  }
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'no name' });
  }

  // Optionally verify Telegram data
  if (BOT_TOKEN && initData && !verifyTelegramData(initData, BOT_TOKEN)) {
    return res.status(403).json({ error: 'invalid init data' });
  }

  const safeName    = name.trim().slice(0, 80);
  const safeCountries = countries
    .filter(c => c && c.code && c.name && c.emoji)
    .map(c => ({ code: String(c.code).slice(0,5), name: String(c.name).slice(0,50), emoji: String(c.emoji).slice(0,8) }));

  if (safeCountries.length === 0) return res.status(400).json({ error: 'invalid countries' });

  insertStmt.run({
    telegramId: telegramId ? String(telegramId) : null,
    name:       safeName,
    countries:  JSON.stringify(safeCountries),
  });

  // Fire-and-forget: notify bot channel if configured
  if (BOT_TOKEN && process.env.CHANNEL_ID) {
    notifyChannel(safeName, safeCountries).catch(() => {});
  }

  res.json({ ok: true });
});

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ── Telegram channel notification ─────────
async function notifyChannel(name, countries) {
  const { default: fetch } = await import('node-fetch');
  const chatId = process.env.CHANNEL_ID;
  const text = `🌍 <b>${name}</b> побывал(а) в <b>${countries.length}</b> стран(ах):\n\n` +
    countries.map(c => `${c.emoji} ${c.name}`).join('  ·  ');

  const btn = WEBAPP_URL ? JSON.stringify({
    inline_keyboard: [[{ text: '🗺 Открыть форму', web_app: { url: WEBAPP_URL } }]]
  }) : undefined;

  const params = new URLSearchParams({
    chat_id: chatId, text, parse_mode: 'HTML',
    ...(btn ? { reply_markup: btn } : {}),
  });

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?${params}`);
}

// ── Start ─────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  World Traveler server running on http://localhost:${PORT}`);
  console.log(`    Mini app: http://localhost:${PORT}/`);
  console.log(`    API:      http://localhost:${PORT}/api/results`);
});
