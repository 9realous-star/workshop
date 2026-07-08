const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = 'cp_comments_v1';
const GROUPS = ['dep-1', 'dep-2', 'dep-3', 'dep-4', 'dep-5', 'dep-6', 'dep-7', 'ret-1', 'ret-2', 'ret-3', 'ret-4', 'ret-5', 'ret-6', 'ret-7'];
const MAX_TEXT = 80;
const MAX_NAME = 10;

async function getData() {
  const data = await redis.get(KEY);
  const base = {};
  GROUPS.forEach((g) => { base[g] = []; });
  return { ...base, ...(data || {}) };
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const data = await getData();
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { group, name, text } = req.body || {};
    if (!GROUPS.includes(group)) return res.status(400).json({ error: 'invalid group' });
    const cleanText = typeof text === 'string' ? text.trim() : '';
    if (!cleanText) return res.status(400).json({ error: 'invalid payload' });
    const cleanName = typeof name === 'string' ? name.trim().slice(0, MAX_NAME) : '';
    const data = await getData();
    data[group].push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: cleanName || '익명',
      text: cleanText.slice(0, MAX_TEXT),
    });
    await redis.set(KEY, data);
    return res.status(200).json(data[group]);
  }

  if (req.method === 'DELETE') {
    const { group, id } = req.query;
    if (!GROUPS.includes(group)) return res.status(400).json({ error: 'invalid group' });
    const data = await getData();
    data[group] = data[group].filter((c) => c.id !== id);
    await redis.set(KEY, data);
    return res.status(200).json(data[group]);
  }

  res.status(405).end();
};
