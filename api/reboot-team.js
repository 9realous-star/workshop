const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = 'rb_team_v1';
const FIELDS = ['ta', 'tb', 't1', 't2', 't3'];
const DEFAULT = { ta: '', tb: '', t1: '', t2: '', t3: '' };

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const data = (await redis.get(KEY)) || {};
    return res.status(200).json({ ...DEFAULT, ...data });
  }

  if (req.method === 'POST') {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'invalid payload' });
    }
    const clean = {};
    for (const k of FIELDS) {
      clean[k] = typeof body[k] === 'string' ? body[k].slice(0, 2000) : '';
    }
    await redis.set(KEY, clean);
    return res.status(200).json(clean);
  }

  res.status(405).end();
};
