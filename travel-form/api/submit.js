import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { name, countries, telegramId } = req.body || {};

  if (!Array.isArray(countries) || countries.length === 0)
    return res.status(400).json({ error: 'no countries' });
  if (typeof name !== 'string' || !name.trim())
    return res.status(400).json({ error: 'no name' });

  const entry = {
    name:      name.trim().slice(0, 80),
    telegramId: telegramId ? String(telegramId) : null,
    countries: countries
      .filter(c => c?.code && c?.name && c?.emoji)
      .map(c => ({
        code:  String(c.code).slice(0, 5),
        name:  String(c.name).slice(0, 50),
        emoji: String(c.emoji).slice(0, 8),
      })),
    ts: Date.now(),
  };

  if (entry.countries.length === 0)
    return res.status(400).json({ error: 'invalid countries' });

  await kv.lpush('tw:submissions', JSON.stringify(entry));
  await kv.ltrim('tw:submissions', 0, 99);   // keep last 100

  res.json({ ok: true });
}
