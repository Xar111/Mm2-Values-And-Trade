import { readFile, writeFile } from 'node:fs/promises';

const KEY = process.env.RBLX_API_KEY;
if (!KEY) { console.error('Set RBLX_API_KEY'); process.exit(1); }

const BASE = 'https://api.rblxvalue.com/v2/items';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function page(offset) {
  for (let tries = 0; tries < 3; tries++) {
    const res = await fetch(`${BASE}?limit=100&offset=${offset}`, { headers: { 'X-Api-Key': KEY } });
    if (res.status === 429) { await sleep((Number(res.headers.get('Retry-After')) || 60) * 1000); continue; }
    if (!res.ok) throw new Error('API error ' + res.status);
    return res.json();
  }
  throw new Error('Rate limited too many times');
}

const items = []; let credit = null, total = Infinity;
for (let offset = 0; offset < total; offset += 100) {
  const d = await page(offset);
  total = d.total; credit = credit ?? d.credit;
  for (const i of d.items) items.push({
    name: i.name, value: i.value, category: i.category,
    mm2values: i.value_source_a, supreme: i.value_source_b,
    stability: i.stability ?? null, demand: i.demand ?? null, image: i.image_url ?? null
  });
}

const old = JSON.parse(await readFile('values.json', 'utf8'));
const oldMap = new Map(old.items.map(i => [i.name, i]));
const now = new Date().toISOString();

// Remember what each value was before it last changed, so the site can show top movers.
const clean = items.filter(i => i.name && Number.isFinite(i.value)).map(i => {
  const o = oldMap.get(i.name);
  if (!o) return { ...i, prev: null, changedAt: null };
  if (o.value !== i.value) return { ...i, prev: o.value, changedAt: now };
  return { ...i, prev: o.prev ?? null, changedAt: o.changedAt ?? null };
});

if (!old.sample && clean.length < old.items.length * 0.8) throw new Error('Got far fewer items than before; keeping old data.');
if (clean.length === 0) throw new Error('No items returned.');

if (JSON.stringify(clean) !== JSON.stringify(old.items)) {
  await writeFile('values.json', JSON.stringify({
    updated: now,
    source: 'RBLXValue (blend of MM2Values and Supreme Values)',
    credit: credit ?? 'Data from rblxvalue.com',
    sample: false,
    items: clean
  }, null, 2));
  console.log('Updated', clean.length, 'items');
} else console.log('No changes');
