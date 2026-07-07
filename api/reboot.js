const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = 'rb_individuals_v1';
const ADMIN_PW = '0512';
const DEFAULT_NAMES = ['정다운','한병주','김군주','이은솔','김규진','류지상','백동훈','김민재','신민호','김규동','한성영','백종관','황승하','이동현','박선영','김규진(팀관리)'];

async function getSlots() {
  const slots = await redis.get(KEY);
  if (slots && Array.isArray(slots) && slots.length) return slots;
  return DEFAULT_NAMES.map((name) => ({ name: name + ' 님', text: '' }));
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const slots = await getSlots();
    return res.status(200).json(slots);
  }

  if (req.method === 'POST') {
    const body = req.body;

    if (body && typeof body === 'object' && !Array.isArray(body) && typeof body.index === 'number') {
      const slots = await getSlots();
      const idx = body.index;
      while (slots.length <= idx) slots.push({ name: '', text: '' });
      slots[idx] = {
        name: typeof body.name === 'string' ? body.name.slice(0, 30) : '',
        text: typeof body.text === 'string' ? body.text.slice(0, 500) : '',
      };
      await redis.set(KEY, slots);
      return res.status(200).json(slots);
    }

    if (Array.isArray(body)) {
      const clean = body.map((s) => ({
        name: typeof s?.name === 'string' ? s.name.slice(0, 30) : '',
        text: typeof s?.text === 'string' ? s.text.slice(0, 500) : '',
      }));
      await redis.set(KEY, clean);
      return res.status(200).json(clean);
    }

    return res.status(400).json({ error: 'invalid payload' });
  }

  if (req.method === 'DELETE') {
    const { index, pw } = req.query;
    if (pw !== ADMIN_PW) return res.status(403).json({ error: 'forbidden' });
    const idx = Number(index);
    if (!Number.isInteger(idx) || idx < 0) return res.status(400).json({ error: 'invalid index' });
    const slots = await getSlots();
    if (idx >= slots.length) return res.status(404).json({ error: 'not found' });
    slots[idx] = { name: '', text: '' };
    await redis.set(KEY, slots);
    return res.status(200).json(slots);
  }

  res.status(405).end();
};
