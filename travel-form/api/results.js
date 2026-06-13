import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const raw = await kv.lrange('tw:submissions', 0, 49);
    const results = raw.map(r => (typeof r === 'string' ? JSON.parse(r) : r));
    res.json(results);
  } catch {
    res.json([]);
  }
}
