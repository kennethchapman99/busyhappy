import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const _require = createRequire(import.meta.url);
const dotenv = _require('dotenv');
dotenv.config({ path: join(__dirname, '../../.env'), override: true });

import express from 'express';
import {
  getAllProductFamilies,
  getProductFamily,
  getAllSkus,
  getSku,
  getSkusForFamily,
  getAllBundles,
  getChannelListings,
  getPerformanceSnapshots,
  getDashboardStats,
  getChannelSummary,
  getTopPerformers,
} from '../shared/db.js';
import { seedBusyLittleHappyCatalog, buildBusyLittleHappyProducts } from '../orchestrator.js';
import { getMaterialBuildStatus } from '../shared/material-product-builder.js';

const app = express();
const PORT = Number(process.env.WEB_PORT || 3737);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));
app.use('/artifacts', express.static(join(__dirname, '../../output/materials')));

function money(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `$${Number(value).toFixed(2)}`;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function layout(title, path, body) {
  const nav = [
    ['/', 'Dashboard'],
    ['/families', 'Families'],
    ['/skus', 'SKUs'],
    ['/bundles', 'Bundles'],
    ['/channels', 'Channels'],
  ].map(([href, label]) => {
    const active = path === href || (href !== '/' && path.startsWith(href));
    return `<a href="${href}" style="display:block;padding:10px 12px;border-radius:14px;text-decoration:none;font-weight:700;color:${active ? '#18325f' : '#6d6b73'};background:${active ? 'linear-gradient(90deg, rgba(255,111,145,.14), rgba(78,199,193,.14))' : 'transparent'};">${label}</a>`;
  }).join('');

  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(title)}</title><style>
  :root{--bg:#fffaf3;--panel:#fff;--sidebar:#fff4ea;--border:#f1dfcf;--text:#18325f;--muted:#6d6b73;--shadow:0 12px 30px rgba(24,50,95,.08);--pink:#ff6f91;--orange:#ff9f40;--yellow:#f7c548;--teal:#4ec7c1;--plum:#a56cc1}
  *{box-sizing:border-box} body{margin:0;background:linear-gradient(180deg,#fffaf3 0%,#fff7f0 100%);color:var(--text);font:14px/1.45 Inter,system-ui,sans-serif}
  .shell{display:grid;grid-template-columns:300px 1fr;min-height:100vh}.sidebar{background:var(--sidebar);border-right:1px solid var(--border);padding:28px 22px}.main{padding:30px}
  .brand-logo{display:block;width:100%;max-width:240px;height:auto;border-radius:18px;background:#fff;box-shadow:var(--shadow);padding:10px;margin-bottom:12px}
  .card,.panel{background:var(--panel);border:1px solid var(--border);border-radius:24px;box-shadow:var(--shadow)} .card{padding:18px 20px}.panel{padding:20px;margin-bottom:18px}
  .stats{display:grid;gap:14px;grid-template-columns:repeat(5,minmax(0,1fr));margin-bottom:22px}.label{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.08em}.value{display:block;font-size:28px;margin-top:10px;font-weight:800}
  table{width:100%;border-collapse:collapse} th,td{text-align:left;padding:12px 10px;border-bottom:1px solid var(--border);vertical-align:top} th{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
  .muted{color:var(--muted)} .btn{border:1px solid var(--border);padding:10px 12px;border-radius:14px;background:#fff;cursor:pointer;font:inherit;font-weight:700}.btn.primary{background:linear-gradient(135deg,var(--pink) 0%, var(--orange) 35%, var(--yellow) 70%, var(--teal) 100%);color:#18325f}
  .hero{display:grid;grid-template-columns:280px 1fr;gap:24px;align-items:center}.hero-logo{width:100%;max-width:280px;border-radius:24px;background:#fff9f0;padding:12px;border:1px solid var(--border)}
  .artifact-links a{display:inline-block;margin-right:10px;margin-bottom:8px;padding:8px 10px;border-radius:12px;border:1px solid var(--border);text-decoration:none;background:#fff}
  @media(max-width:1100px){.shell{grid-template-columns:1fr}.stats,.hero{grid-template-columns:1fr}}
  </style></head><body><div class="shell"><aside class="sidebar"><img class="brand-logo" src="/busy-little-happy-logo.svg?v=2" alt="Busy Little Happy logo"/><div class="muted" style="margin-bottom:18px">Screen-free printable fun packs with real build artifacts and no fake sales data.</div><nav>${nav}</nav><div class="card"><h3 style="margin-top:0">Quick actions</h3><button id="seed" class="btn primary" type="button">Reseed demo catalog</button><div style="height:10px"></div><button id="build" class="btn" type="button">Build product artifacts</button></div></aside><main class="main">${body}</main></div><script>
  const seed=document.getElementById('seed'); const build=document.getElementById('build');
  if(seed) seed.onclick=async()=>{seed.disabled=true;seed.textContent='Reseeding...';const r=await fetch('/api/seed',{method:'POST'}); if(r.ok) location.reload(); else alert('Reseed failed');};
  if(build) build.onclick=async()=>{build.disabled=true;build.textContent='Building...';const r=await fetch('/api/build-products',{method:'POST'}); if(r.ok) location.reload(); else alert('Build failed');};
  </script></body></html>`;
}

function state() {
  let families = getAllProductFamilies();
  if (!families.length) { seedBusyLittleHappyCatalog(); families = getAllProductFamilies(); }
  return {
    families,
    skus: getAllSkus(),
    bundles: getAllBundles(),
    listings: getChannelListings(),
    snapshots: getPerformanceSnapshots(),
  };
}

app.get('/', (req, res) => {
  const s = state();
  const stats = getDashboardStats();
  const channels = getChannelSummary();
  const topPerformers = getTopPerformers();
  const builtCount = s.skus.filter((sku) => getMaterialBuildStatus(sku.id)).length;
  const body = `<section class="panel hero"><img class="hero-logo" src="/busy-little-happy-logo.svg?v=2" alt="Busy Little Happy"/><div><div class="muted" style="text-transform:uppercase;letter-spacing:.12em;font-size:11px;margin-bottom:6px">Busy Little Happy 1.0</div><h2 style="font-size:38px;line-height:1.05;margin:0 0 10px 0">Real draft materials, not fake market data</h2><p class="muted">Build and inspect actual buyer-facing pack drafts. Marketplace performance stays empty until you add real data later.</p></div></section>
  <section class="stats"><article class="card"><span class="label">Families</span><strong class="value">${stats.families}</strong></article><article class="card"><span class="label">SKUs</span><strong class="value">${stats.skus}</strong></article><article class="card"><span class="label">Built artifacts</span><strong class="value">${builtCount}</strong></article><article class="card"><span class="label">Live listings</span><strong class="value">${stats.liveListings}</strong></article><article class="card"><span class="label">Recorded net revenue</span><strong class="value">${money(stats.estimatedNetRevenue)}</strong></article></section>
  <section class="panel"><h3 style="margin-top:0">Channel summary</h3><table><thead><tr><th>Channel</th><th>Listings</th><th>Live</th><th>Planned list price</th></tr></thead><tbody>${channels.map((c)=>`<tr><td>${esc(c.channel)}</td><td>${c.listing_count}</td><td>${c.live_count}</td><td>${money(c.total_list_price)}</td></tr>`).join('')}</tbody></table></section>
  <section class="panel"><h3 style="margin-top:0">Marketplace performance</h3>${topPerformers.length ? `<table><thead><tr><th>Owner</th><th>Orders</th><th>Net revenue</th></tr></thead><tbody>${topPerformers.map((p)=>`<tr><td>${esc(p.owner_type)}:${esc(p.owner_id)}</td><td>${p.total_orders}</td><td>${money(p.total_net_revenue)}</td></tr>`).join('')}</tbody></table>` : '<div class="muted">No live marketplace performance data yet.</div>'}</section>`;
  res.send(layout('Busy Little Happy', req.path, body));
});

app.get('/families', (req, res) => {
  const s = state();
  const body = `<section class="panel"><h2 style="margin-top:0">Product families</h2><table><thead><tr><th>Family</th><th>Use case</th><th>Age</th><th>Theme</th><th>SKUs</th></tr></thead><tbody>${s.families.map((f)=>`<tr><td><a href="/families/${f.id}">${esc(f.title)}</a><div class="muted">${esc(f.description)}</div></td><td>${esc(f.useCase)}</td><td>${esc(f.defaultAgeBand)}</td><td>${esc(f.theme)}</td><td>${s.skus.filter((sku)=>sku.productFamilyId===f.id).length}</td></tr>`).join('')}</tbody></table></section>`;
  res.send(layout('Families', req.path, body));
});

app.get('/families/:id', (req, res) => {
  const s = state();
  const family = getProductFamily(req.params.id);
  if (!family) return res.status(404).send(layout('Not found', req.path, `<h2>Missing page</h2><p class="muted">Family not found: ${esc(req.params.id)}</p>`));
  const skus = getSkusForFamily(family.id);
  const body = `<section class="panel"><div class="muted" style="text-transform:uppercase;letter-spacing:.12em;font-size:11px;margin-bottom:6px"><a href="/families">Families</a></div><h2 style="margin:0 0 6px 0">${esc(family.title)}</h2><p class="muted">${esc(family.description)}</p><table><thead><tr><th>SKU</th><th>Theme</th><th>Age</th><th>Price</th><th>Build</th><th>Preview</th></tr></thead><tbody>${skus.map((sku)=>{const build=getMaterialBuildStatus(sku.id); return `<tr><td><a href="/skus/${sku.id}">${esc(sku.title)}</a></td><td>${esc(sku.theme)}</td><td>${esc(sku.ageBand)}</td><td>${money(sku.priceEtsy)}</td><td>${esc(sku.filePackageStatus || 'not_built')}</td><td>${build ? `<a href="/artifacts/${sku.id}/activity-pack.html" target="_blank">Open</a>` : '—'}</td></tr>`;}).join('')}</tbody></table></section>`;
  res.send(layout(family.title, req.path, body));
});

app.get('/skus', (req, res) => {
  const s = state();
  const body = `<section class="panel"><h2 style="margin-top:0">SKUs</h2><table><thead><tr><th>SKU</th><th>Use case</th><th>Theme</th><th>Age</th><th>Planned price</th><th>Build</th><th>Preview</th></tr></thead><tbody>${s.skus.map((sku)=>{const build=getMaterialBuildStatus(sku.id); return `<tr><td><a href="/skus/${sku.id}">${esc(sku.title)}</a><div class="muted">${esc(sku.subtitle)}</div></td><td>${esc(sku.useCase)}</td><td>${esc(sku.theme)}</td><td>${esc(sku.ageBand)}</td><td>${money(sku.priceEtsy)}</td><td>${esc(sku.filePackageStatus || 'not_built')}</td><td>${build ? `<a href="/artifacts/${sku.id}/activity-pack.html" target="_blank">Open</a>` : '—'}</td></tr>`;}).join('')}</tbody></table></section>`;
  res.send(layout('SKUs', req.path, body));
});

app.get('/skus/:id', (req, res) => {
  const sku = getSku(req.params.id);
  if (!sku) return res.status(404).send(layout('Not found', req.path, `<h2>Missing page</h2><p class="muted">SKU not found: ${esc(req.params.id)}</p>`));
  const family = getProductFamily(sku.productFamilyId);
  const build = getMaterialBuildStatus(sku.id);
  const body = `<section class="panel"><div class="muted" style="text-transform:uppercase;letter-spacing:.12em;font-size:11px;margin-bottom:6px"><a href="/skus">SKUs</a></div><h2 style="margin:0 0 6px 0">${esc(sku.title)}</h2><p class="muted">${esc(sku.subtitle)}</p><div class="artifact-links">${build ? `<a href="/artifacts/${sku.id}/activity-pack.html" target="_blank">Open activity pack</a><a href="/artifacts/${sku.id}/listing-copy.md" target="_blank">Open listing copy</a><a href="/artifacts/${sku.id}/material-package.json" target="_blank">Open material package</a>` : 'No build artifacts yet'}</div><table><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody><tr><td>Family</td><td><a href="/families/${family.id}">${esc(family.title)}</a></td></tr><tr><td>Use case</td><td>${esc(sku.useCase)}</td></tr><tr><td>Theme</td><td>${esc(sku.theme)}</td></tr><tr><td>Age band</td><td>${esc(sku.ageBand)}</td></tr><tr><td>Format</td><td>${esc(sku.formatType)}</td></tr><tr><td>Planned Etsy price</td><td>${money(sku.priceEtsy)}</td></tr><tr><td>Build status</td><td>${esc(sku.filePackageStatus || 'not_built')}</td></tr></tbody></table></section>`;
  res.send(layout(sku.title, req.path, body));
});

app.get('/bundles', (req, res) => {
  const bundles = getAllBundles();
  const body = `<section class="panel"><h2 style="margin-top:0">Bundles</h2><table><thead><tr><th>Bundle</th><th>Type</th><th>Channels</th><th>Planned Etsy price</th></tr></thead><tbody>${bundles.map((b)=>`<tr><td>${esc(b.title)}<div class="muted">${esc(b.notes)}</div></td><td>${esc(b.bundleType)}</td><td>${esc((b.channelAvailability || []).join(', '))}</td><td>${money(b.priceEtsy)}</td></tr>`).join('')}</tbody></table></section>`;
  res.send(layout('Bundles', req.path, body));
});

app.get('/channels', (req, res) => {
  const listings = getChannelListings();
  const body = `<section class="panel"><h2 style="margin-top:0">Channels</h2><table><thead><tr><th>Owner</th><th>Channel</th><th>Status</th><th>Planned price</th></tr></thead><tbody>${listings.map((l)=>`<tr><td>${esc(l.ownerType)}:${esc(l.ownerId)}</td><td>${esc(l.channel)}</td><td>${esc(l.status)}</td><td>${money(l.price)}</td></tr>`).join('')}</tbody></table></section>`;
  res.send(layout('Channels', req.path, body));
});

app.post('/api/seed', (req, res) => {
  const seeded = seedBusyLittleHappyCatalog();
  res.json({ ok: true, families: seeded.families.length, skus: seeded.skus.length });
});

app.post('/api/build-products', async (req, res) => {
  const built = await buildBusyLittleHappyProducts();
  res.json({ ok: true, built: built.length });
});

app.use((req, res) => res.status(404).send(layout('Not found', req.path, `<h2>Missing page</h2><p class="muted">Page not found: ${esc(req.path)}</p>`)));

app.listen(PORT, () => {
  console.log(`\n☀️  Busy Little Happy UI running at http://localhost:${PORT}\n`);
});
