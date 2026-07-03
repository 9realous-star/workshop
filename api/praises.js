const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = 'ws_praises_v4';
const ADMIN_PW = '0512';

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const list = (await redis.get(KEY)) || [];
    return res.status(200).json(list);
  }

  if (req.method === 'POST') {
    const p = req.body;
    if (!p || !p.from || !p.to || !p.text) {
      return res.status(400).json({ error: 'invalid payload' });
    }
    const list = (await redis.get(KEY)) || [];
    list.unshift(p);
    await redis.set(KEY, list);
    return res.status(200).json(list);
  }

  if (req.method === 'DELETE') {
    const { id, pw } = req.query;
    let list = (await redis.get(KEY)) || [];
    if (id) {
      list = list.filter((p) => String(p.id) !== String(id));
      await redis.set(KEY, list);
      return res.status(200).json(list);
    }
    if (pw === ADMIN_PW) {
      await redis.set(KEY, []);
      return res.status(200).json([]);
    }
    return res.status(403).json({ error: 'forbidden' });
  }

  res.status(405).end();
};
