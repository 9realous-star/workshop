const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = 'rv_photos_v1';
const ADMIN_PW = '0512';
const MAX_PHOTOS = 2;
const MAX_DATA_URL_LEN = 1_500_000;

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const list = (await redis.get(KEY)) || [];
    return res.status(200).json(list);
  }

  if (req.method === 'POST') {
    const { pw, dataUrl } = req.body || {};
    if (pw !== ADMIN_PW) return res.status(403).json({ error: 'forbidden' });
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      return res.status(400).json({ error: 'invalid payload' });
    }
    if (dataUrl.length > MAX_DATA_URL_LEN) {
      return res.status(413).json({ error: 'image too large' });
    }
    const list = (await redis.get(KEY)) || [];
    if (list.length >= MAX_PHOTOS) {
      return res.status(400).json({ error: 'max photos reached' });
    }
    list.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2), dataUrl });
    await redis.set(KEY, list);
    return res.status(200).json(list);
  }

  if (req.method === 'DELETE') {
    const { id, pw } = req.query;
    if (pw !== ADMIN_PW) return res.status(403).json({ error: 'forbidden' });
    let list = (await redis.get(KEY)) || [];
    list = list.filter((p) => p.id !== id);
    await redis.set(KEY, list);
    return res.status(200).json(list);
  }

  res.status(405).end();
};
