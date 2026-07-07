const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = 'rf_activities_v1';
const ADMIN_PW = '0512';
const IDS = ['a1', 'a2', 'a3', 'a4'];
const MAX_TEXT = 500;
const MAX_DATA_URL_LEN = 900_000;
const MAX_IMAGES = 8;

async function getData() {
  const data = await redis.get(KEY);
  const base = { a1: [], a2: [], a3: [], a4: [] };
  return { ...base, ...(data || {}) };
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const data = await getData();
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { activity, text, images } = req.body || {};
    if (!IDS.includes(activity)) return res.status(400).json({ error: 'invalid activity' });
    const cleanText = typeof text === 'string' ? text.trim() : '';
    const imgs = Array.isArray(images) ? images.filter((d) => typeof d === 'string' && d) : [];
    if (!cleanText && !imgs.length) return res.status(400).json({ error: 'invalid payload' });
    if (imgs.length > MAX_IMAGES) return res.status(400).json({ error: 'too many images' });
    for (const d of imgs) {
      if (!d.startsWith('data:image/') || d.length > MAX_DATA_URL_LEN) {
        return res.status(400).json({ error: 'invalid image' });
      }
    }
    const data = await getData();
    data[activity].unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      text: cleanText.slice(0, MAX_TEXT),
      dataUrls: imgs,
    });
    await redis.set(KEY, data);
    return res.status(200).json(data[activity]);
  }

  if (req.method === 'DELETE') {
    const { activity, pw } = req.query;
    if (pw !== ADMIN_PW) return res.status(403).json({ error: 'forbidden' });
    if (!IDS.includes(activity)) return res.status(400).json({ error: 'invalid activity' });
    const data = await getData();
    data[activity] = [];
    await redis.set(KEY, data);
    return res.status(200).json(data[activity]);
  }

  res.status(405).end();
};
