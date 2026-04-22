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
  getDerivativeJobs,
  createDerivativeJob,
  updateDerivativeJobStatus,
  getDashboardStats,
  getChannelSummary,
  getTopPerformers,
} from '../shared/db.js';
import { buildDerivativeOpportunities } from '../shared/derivatives.js';
import { seedBusyLittleHappyCatalog } from '../orchestrator.js';

const app = express();
const PORT = Number(process.env.WEB_PORT || 3737);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function money(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `$${Number(value).toFixed(2)}`;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function badge(value) {
  return `<span style="display:inline-block;padding:4px 8px;border-radius:999px;background:#fff1cc;color:#7a5400;font-size:12px;font-weight:700;">${esc(value)}</span>`;
}

function shell(title, currentPath, body) {
  const nav = [
    ['/', 'Dashboard'],
    ['/families', 'Families'],
    ['/skus', 'SKUs'],
    ['/bundles', 'Bundles'],
    ['/channels', 'Channels'],
  ].map(([href, label]) => {
    const active = currentPath === href || (href !== '/' && currentPath.startsWith(href));
    return `<a href="${href}" style="display:block;padding:10px 12px;border-radius:12px;text-decoration:none;font-weight:700;color:${active ? '#2c261f' : '#756a5a'};background:${active ? 'rgba(255,184,77,.18)' : 'transparent'};">${label}</a>`;
  }).join('');

  return `<!doctype html>
  <html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${esc(title)}</title>
  <style>
    :root{--bg:#fffaf3;--panel:#fff;--sidebar:#fff3de;--border:#f0dec0;--text:#2c261f;--muted:#756a5a;--shadow:0 10px 30px rgba(48,32,8,.08)}
    *{box-sizing:border-box} body{margin:0;background:linear-gradient(180deg,#fffaf3 0%,#fff8ef 100%);color:var(--text);font:14px/1.45 Inter,system-ui,sans-serif}
    a{color:inherit} .shell{display:grid;grid-template-columns:280px 1fr;min-height:100vh} .sidebar{background:var(--sidebar);border-right:1px solid var(--border);padding:28px 22px}
    .brand{display:flex;gap:14px;align-items:center;margin-bottom:26px}.mark{width:52px;height:52px;border-radius:18px;background:linear-gradient(180deg,#ffd98c 0%,#ffb84d 100%);display:grid;place-items:center;font-size:24px;box-shadow:var(--shadow)}
    .eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:11px;color:var(--muted);margin-bottom:6px} .main{padding:28px}
    .card,.panel{background:var(--panel);border:1px solid var(--border);border-radius:20px;box-shadow:var(--shadow)} .card{padding:18px 20px}.panel{padding:18px;margin-bottom:18px}
    .stats{display:grid;gap:14px;grid-template-columns:repeat(5,minmax(0,1fr));margin-bottom:22px}.label{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.08em}.value{display:block;font-size:28px;margin-top:10px;font-weight:800}
    .grid2{display:grid;gap:18px;grid-template-columns:1fr 1fr} table{width:100%;border-collapse:collapse} th,td{text-align:left;padding:12px 10px;border-bottom:1px solid var(--border);vertical-align:top}
    th{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)} .muted{color:var(--muted)} .small{font-size:12px}
    .row{display:flex;justify-content:space-between;align-items:start;gap:16px;padding:14px;border:1px solid var(--border);border-radius:16px;background:#fffdfa;margin-bottom:12px}
    .btn{border:1px solid var(--border);padding:10px 12px;border-radius:12px;background:#fff;cursor:pointer;font:inherit;font-weight:700}.btn.primary{background:linear-gradient(180deg,#ffcf6e 0%,#ffb84d 100%)}
    .filters{display:flex;gap:12px;margin-bottom:18px}.filters input,.filters select{border-radius:12px;border:1px solid var(--border);padding:10px 12px;background:#fff;font:inherit}
    @media(max-width:1100px){.shell{grid-template-columns:1fr}.stats,.grid2{grid-template-columns:1fr}}
  </style></head><body><div class="shell"><aside class="sidebar">
  <div class="brand"><div class="mark">☀️</div><div><div class="eyebrow">Busy Little Happy</div><h1 style="margin:0;font-size:24px">Catalog Admin</h1></div></div>
  <nav>${nav}</nav>
  <div class="card"><h3 style="margin-top:0">Quick action</h3><button id="seed" class="btn primary" type="button">Reseed demo catalog</button><p class="muted small">Reset the repo to the 1.0 launch shelf.</p></div>
  </aside><main class="main">${body}</main></div>
  <script>
  const seedBtn=document.getElementById('seed');
  if(seedBtn){seedBtn.onclick=async()=>{seedBtn.disabled=true;seedBtn.textContent='Reseeding...';const r=await fetch('/api/seed',{method:'POST'});if(r.ok) location.reload(); else {alert('Reseed failed'); seedBtn.disabled=false; seedBtn.textContent='Reseed demo catalog';}}}
  async function createDerivativeJob(payload){const r=await fetch('/api/derivative-jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok) throw new Error(d.error||'Could not create job');return d;}
  document.addEventListener('click', async (e)=>{const btn=e.target.closest('[data-derivative-owner]'); if(!btn) return; btn.disabled=true; const original=btn.textContent; btn.textContent='Creating...'; try{await createDerivativeJob({sourceOwnerType:btn.dataset.derivativeOwnerType,sourceOwnerId:btn.dataset.derivativeOwner,derivativeType:btn.dataset.derivativeType,notes:btn.dataset.derivativeNotes||''}); location.reload();}catch(err){alert(err.message);btn.disabled=false;btn.textContent=original;}});
  </script></body></html>`;
}

function getCatalogState() {
  let families = getAllProductFamilies();
  if (!families.length) {
    seedBusyLittleHappyCatalog();
    families = getAllProductFamilies();
  }
  const skus = getAllSkus();
  const bundles = getAllBundles();
  const listings = getChannelListings();
  const snapshots = getPerformanceSnapshots();
  const derivativeJobs = getDerivativeJobs();
  const derivativeOpportunities = buildDerivativeOpportunities({ families, skus, bundles, snapshots, derivativeJobs });
  return { families, skus, bundles, listings, snapshots, derivativeJobs, derivativeOpportunities };
}

function attachPerformance(skus, snapshots) {
  const latestBySku = {};
  for (const snap of snapshots.filter((item) => item.ownerType === 'sku')) {
    if (!latestBySku[snap.ownerId] || latestBySku[snap.ownerId].snapshotDate < snap.snapshotDate) latestBySku[snap.ownerId] = snap;
  }
  return skus.map((sku) => ({ ...sku, latestSnapshot: latestBySku[sku.id] || null }));
}

app.get('/', (req, res) => {
  const catalog = getCatalogState();
  const stats = getDashboardStats();
  const channels = getChannelSummary();
  const topPerformers = getTopPerformers();
  const families = catalog.families.slice(0, 6).map((family) => {
    const familySkus = catalog.skus.filter((sku) => sku.productFamilyId === family.id);
    const skuIds = new Set(familySkus.map((sku) => sku.id));
    return { ...family, skuCount: familySkus.length, liveListingCount: catalog.listings.filter((listing) => listing.status === 'live' && skuIds.has(listing.ownerId)).length };
  });

  const body = `
    <section style="margin-bottom:22px"><div class="eyebrow">Busy Little Happy 1.0</div><h2 style="margin:0 0 6px 0">Dashboard</h2><p class="muted">Pancake Robot's catalog workflow, repurposed for screen-free kids activity packs.</p></section>
    <section class="stats">
      <article class="card"><span class="label">Families</span><strong class="value">${stats.families}</strong></article>
      <article class="card"><span class="label">SKUs</span><strong class="value">${stats.skus}</strong></article>
      <article class="card"><span class="label">Bundles</span><strong class="value">${stats.bundles}</strong></article>
      <article class="card"><span class="label">Live listings</span><strong class="value">${stats.liveListings}</strong></article>
      <article class="card"><span class="label">Estimated net revenue</span><strong class="value">${money(stats.estimatedNetRevenue)}</strong></article>
    </section>
    <section class="grid2">
      <article class="panel"><h3 style="margin-top:0">Launch families</h3><table><thead><tr><th>Family</th><th>Use case</th><th>SKUs</th><th>Live</th></tr></thead><tbody>${families.map((f)=>`<tr><td><a href="/families/${f.id}">${esc(f.title)}</a></td><td>${esc(f.useCase)}</td><td>${f.skuCount}</td><td>${f.liveListingCount}</td></tr>`).join('')}</tbody></table></article>
      <article class="panel"><h3 style="margin-top:0">Channel summary</h3><table><thead><tr><th>Channel</th><th>Listings</th><th>Live</th><th>Total list price</th></tr></thead><tbody>${channels.map((row)=>`<tr><td>${esc(row.channel)}</td><td>${row.listing_count}</td><td>${row.live_count}</td><td>${money(row.total_list_price)}</td></tr>`).join('')}</tbody></table></article>
    </section>
    <section class="grid2">
      <article class="panel"><h3 style="margin-top:0">Top performers</h3><table><thead><tr><th>Owner</th><th>Orders</th><th>Net revenue</th></tr></thead><tbody>${topPerformers.map((p)=>`<tr><td>${esc(p.owner_type)}:${esc(p.owner_id)}</td><td>${p.total_orders}</td><td>${money(p.total_net_revenue)}</td></tr>`).join('')}</tbody></table></article>
      <article class="panel"><h3 style="margin-top:0">Derivative opportunities</h3>${catalog.derivativeOpportunities.slice(0,8).map((opp)=>`<div class="row"><div><strong>${esc(opp.headline)}</strong><p class="muted">${esc(opp.why)}</p></div><button class="btn" type="button" data-derivative-owner-type="${esc(opp.sourceOwnerType)}" data-derivative-owner="${esc(opp.sourceOwnerId)}" data-derivative-type="${esc(opp.derivativeType)}" data-derivative-notes="${esc(opp.recommendedOutput)}">Plan job</button></div>`).join('')}</article>
    </section>
    <section class="panel"><h3 style="margin-top:0">Existing derivative jobs</h3><table><thead><tr><th>Source</th><th>Type</th><th>Status</th><th>Notes</th></tr></thead><tbody>${catalog.derivativeJobs.slice(0,8).map((job)=>`<tr><td>${esc(job.sourceOwnerType)}:${esc(job.sourceOwnerId)}</td><td>${esc(job.derivativeType)}</td><td>${badge(job.jobStatus)}</td><td>${esc(job.notes||'—')}</td></tr>`).join('')}</tbody></table></section>`;
  res.send(shell('Busy Little Happy Dashboard', req.path, body));
});

app.get('/families', (req, res) => {
  const catalog = getCatalogState();
  let families = catalog.families.map((family) => {
    const familySkus = catalog.skus.filter((sku) => sku.productFamilyId === family.id);
    const skuIds = new Set(familySkus.map((sku) => sku.id));
    return { ...family, skuCount: familySkus.length, liveListingCount: catalog.listings.filter((listing) => listing.status === 'live' && skuIds.has(listing.ownerId)).length };
  });
  const q = String(req.query.q || '').trim().toLowerCase();
  const useCase = String(req.query.useCase || '').trim().toLowerCase();
  if (q) families = families.filter((f) => f.title.toLowerCase().includes(q) || (f.description || '').toLowerCase().includes(q) || (f.theme || '').toLowerCase().includes(q));
  if (useCase) families = families.filter((f) => (f.useCase || '').toLowerCase() === useCase);
  const useCases = [...new Set(catalog.families.map((f) => f.useCase).filter(Boolean))].sort();
  const body = `<section style="margin-bottom:22px"><div class="eyebrow">Catalog</div><h2 style="margin:0 0 6px 0">Product families</h2><p class="muted">Reusable parent shelves for Busy Little Happy's travel and wait-time printables.</p></section>
  <form class="filters" method="GET" action="/families"><input type="text" name="q" value="${esc(q)}" placeholder="Search families"/><select name="useCase"><option value="">All use cases</option>${useCases.map((u)=>`<option value="${esc(u)}" ${useCase===u?'selected':''}>${esc(u)}</option>`).join('')}</select><button class="btn primary" type="submit">Filter</button></form>
  <section class="panel"><table><thead><tr><th>Family</th><th>Use case</th><th>Default age</th><th>Theme</th><th>SKUs</th><th>Live listings</th><th>Derivative score</th></tr></thead><tbody>${families.map((f)=>`<tr><td><a href="/families/${f.id}">${esc(f.title)}</a><div class="muted small">${esc(f.description)}</div></td><td>${esc(f.useCase)}</td><td>${esc(f.defaultAgeBand)}</td><td>${esc(f.theme)}</td><td>${f.skuCount}</td><td>${f.liveListingCount}</td><td>${f.derivativePotentialScore}</td></tr>`).join('')}</tbody></table></section>`;
  res.send(shell('Product Families', req.path, body));
});

app.get('/families/:id', (req, res) => {
  const catalog = getCatalogState();
  const family = getProductFamily(req.params.id);
  if (!family) return res.status(404).send(shell('Not found', req.path, `<h2>Product family not found</h2>`));
  const skus = attachPerformance(getSkusForFamily(family.id), catalog.snapshots);
  const skuIds = new Set(skus.map((sku) => sku.id));
  const familyListings = catalog.listings.filter((listing) => skuIds.has(listing.ownerId));
  const familyJobs = catalog.derivativeJobs.filter((job) => job.sourceOwnerType === 'family' && job.sourceOwnerId === family.id);
  const familyOpps = catalog.derivativeOpportunities.filter((opp) => opp.sourceOwnerType === 'family' && opp.sourceOwnerId === family.id);
  const bundleMatches = catalog.bundles.filter((bundle) => (bundle.skuIds || []).some((skuId) => skuIds.has(skuId)));
  const body = `<section style="margin-bottom:22px"><div class="eyebrow"><a href="/families">Families</a></div><h2 style="margin:0 0 6px 0">${esc(family.title)}</h2><p class="muted">${esc(family.description)}</p></section>
  <section class="stats"><article class="card"><span class="label">Use case</span><strong class="value" style="font-size:22px">${esc(family.useCase)}</strong></article><article class="card"><span class="label">Default age</span><strong class="value" style="font-size:22px">${esc(family.defaultAgeBand)}</strong></article><article class="card"><span class="label">Theme</span><strong class="value" style="font-size:22px">${esc(family.theme)}</strong></article><article class="card"><span class="label">Derivative score</span><strong class="value" style="font-size:22px">${family.derivativePotentialScore}</strong></article><article class="card"><span class="label">Bundles</span><strong class="value" style="font-size:22px">${bundleMatches.length}</strong></article></section>
  <section class="grid2"><article class="panel"><h3 style="margin-top:0">SKUs in this family</h3><table><thead><tr><th>SKU</th><th>Age</th><th>Theme</th><th>Orders</th><th>Etsy price</th></tr></thead><tbody>${skus.map((sku)=>`<tr><td><a href="/skus/${sku.id}">${esc(sku.title)}</a></td><td>${esc(sku.ageBand)}</td><td>${esc(sku.theme)}</td><td>${sku.latestSnapshot ? sku.latestSnapshot.orders : 0}</td><td>${money(sku.priceEtsy)}</td></tr>`).join('')}</tbody></table></article><article class="panel"><h3 style="margin-top:0">Bundles using this family</h3>${bundleMatches.map((b)=>`<div class="row"><div><strong>${esc(b.title)}</strong><div class="muted">${esc(b.bundleType)} · Etsy ${money(b.priceEtsy)}</div></div></div>`).join('')}</article></section>
  <section class="grid2"><article class="panel"><h3 style="margin-top:0">Listings</h3><table><thead><tr><th>Channel</th><th>Title</th><th>Status</th><th>Price</th></tr></thead><tbody>${familyListings.map((l)=>`<tr><td>${esc(l.channel)}</td><td>${esc(l.title)}</td><td>${badge(l.status)}</td><td>${money(l.price)}</td></tr>`).join('')}</tbody></table></article><article class="panel"><h3 style="margin-top:0">Derivative opportunities</h3>${familyOpps.map((opp)=>`<div class="row"><div><strong>${esc(opp.headline)}</strong><p class="muted">${esc(opp.why)}</p></div><button class="btn" type="button" data-derivative-owner-type="${esc(opp.sourceOwnerType)}" data-derivative-owner="${esc(opp.sourceOwnerId)}" data-derivative-type="${esc(opp.derivativeType)}" data-derivative-notes="${esc(opp.recommendedOutput)}">Plan job</button></div>`).join('')}</article></section>
  <section class="panel"><h3 style="margin-top:0">Derivative jobs</h3><table><thead><tr><th>Type</th><th>Status</th><th>Reason</th><th>Notes</th></tr></thead><tbody>${familyJobs.map((job)=>`<tr><td>${esc(job.derivativeType)}</td><td>${badge(job.jobStatus)}</td><td>${esc(job.ruleTriggeredBy||'—')}</td><td>${esc(job.notes||'—')}</td></tr>`).join('')}</tbody></table></section>`;
  res.send(shell(family.title, req.path, body));
});

app.get('/skus', (req, res) => {
  const catalog = getCatalogState();
  let skus = attachPerformance(catalog.skus, catalog.snapshots);
  const q = String(req.query.q || '').trim().toLowerCase();
  const ageBand = String(req.query.ageBand || '').trim().toLowerCase();
  const useCase = String(req.query.useCase || '').trim().toLowerCase();
  if (q) skus = skus.filter((s) => s.title.toLowerCase().includes(q) || (s.subtitle || '').toLowerCase().includes(q) || (s.theme || '').toLowerCase().includes(q));
  if (ageBand) skus = skus.filter((s) => (s.ageBand || '').toLowerCase() === ageBand);
  if (useCase) skus = skus.filter((s) => (s.useCase || '').toLowerCase() === useCase);
  const ageBands = [...new Set(catalog.skus.map((s) => s.ageBand).filter(Boolean))].sort();
  const useCases = [...new Set(catalog.skus.map((s) => s.useCase).filter(Boolean))].sort();
  const body = `<section style="margin-bottom:22px"><div class="eyebrow">Catalog</div><h2 style="margin:0 0 6px 0">SKUs</h2><p class="muted">Age-band and theme variants generated from Busy Little Happy's launch families.</p></section>
  <form class="filters" method="GET" action="/skus"><input type="text" name="q" value="${esc(q)}" placeholder="Search SKUs"/><select name="ageBand"><option value="">All age bands</option>${ageBands.map((a)=>`<option value="${esc(a)}" ${ageBand===a?'selected':''}>${esc(a)}</option>`).join('')}</select><select name="useCase"><option value="">All use cases</option>${useCases.map((u)=>`<option value="${esc(u)}" ${useCase===u?'selected':''}>${esc(u)}</option>`).join('')}</select><button class="btn primary" type="submit">Filter</button></form>
  <section class="panel"><table><thead><tr><th>SKU</th><th>Age</th><th>Use case</th><th>Theme</th><th>Etsy price</th><th>Orders</th><th>QA</th></tr></thead><tbody>${skus.map((s)=>`<tr><td><a href="/skus/${s.id}">${esc(s.title)}</a><div class="muted small">${esc(s.subtitle)}</div></td><td>${esc(s.ageBand)}</td><td>${esc(s.useCase)}</td><td>${esc(s.theme)}</td><td>${money(s.priceEtsy)}</td><td>${s.latestSnapshot ? s.latestSnapshot.orders : 0}</td><td>${badge(s.qaStatus)}</td></tr>`).join('')}</tbody></table></section>`;
  res.send(shell('SKUs', req.path, body));
});

app.get('/skus/:id', (req, res) => {
  const catalog = getCatalogState();
  const sku = getSku(req.params.id);
  if (!sku) return res.status(404).send(shell('Not found', req.path, `<h2>SKU not found</h2>`));
  const family = getProductFamily(sku.productFamilyId);
  const listings = getChannelListings('sku', sku.id);
  const snapshots = getPerformanceSnapshots('sku', sku.id);
  const derivativeJobs = getDerivativeJobs('sku', sku.id);
  const derivativeOpportunities = catalog.derivativeOpportunities.filter((opp) => opp.sourceOwnerType === 'sku' && opp.sourceOwnerId === sku.id);
  const body = `<section style="margin-bottom:22px"><div class="eyebrow"><a href="/skus">SKUs</a></div><h2 style="margin:0 0 6px 0">${esc(sku.title)}</h2><p class="muted">${esc(sku.subtitle)}</p></section>
  <section class="stats"><article class="card"><span class="label">Family</span><strong class="value" style="font-size:20px"><a href="/families/${family.id}">${esc(family.title)}</a></strong></article><article class="card"><span class="label">Age band</span><strong class="value" style="font-size:20px">${esc(sku.ageBand)}</strong></article><article class="card"><span class="label">Theme</span><strong class="value" style="font-size:20px">${esc(sku.theme)}</strong></article><article class="card"><span class="label">Format</span><strong class="value" style="font-size:20px">${esc(sku.formatType)}</strong></article><article class="card"><span class="label">Etsy price</span><strong class="value" style="font-size:20px">${money(sku.priceEtsy)}</strong></article></section>
  <section class="grid2"><article class="panel"><h3 style="margin-top:0">Channel listings</h3><table><thead><tr><th>Channel</th><th>Status</th><th>Sync</th><th>Price</th></tr></thead><tbody>${listings.map((l)=>`<tr><td>${esc(l.channel)}</td><td>${badge(l.status)}</td><td>${esc(l.syncStatus)}</td><td>${money(l.price)}</td></tr>`).join('')}</tbody></table></article><article class="panel"><h3 style="margin-top:0">Performance snapshots</h3><table><thead><tr><th>Date</th><th>Impr.</th><th>Clicks</th><th>Orders</th><th>Net revenue</th></tr></thead><tbody>${snapshots.map((s)=>`<tr><td>${esc(s.snapshotDate)}</td><td>${s.impressions}</td><td>${s.clicks}</td><td>${s.orders}</td><td>${money(s.netRevenueEstimate)}</td></tr>`).join('')}</tbody></table></article></section>
  <section class="grid2"><article class="panel"><h3 style="margin-top:0">Derivative opportunities</h3>${derivativeOpportunities.length ? derivativeOpportunities.map((opp)=>`<div class="row"><div><strong>${esc(opp.headline)}</strong><p class="muted">${esc(opp.why)}</p></div><button class="btn" type="button" data-derivative-owner-type="${esc(opp.sourceOwnerType)}" data-derivative-owner="${esc(opp.sourceOwnerId)}" data-derivative-type="${esc(opp.derivativeType)}" data-derivative-notes="${esc(opp.recommendedOutput)}">Plan job</button></div>`).join('') : '<div class="muted">No SKU-specific opportunities yet. Strongest ideas are family-level expansions.</div>'}</article><article class="panel"><h3 style="margin-top:0">Derivative jobs</h3><table><thead><tr><th>Type</th><th>Status</th><th>Reason</th><th>Notes</th></tr></thead><tbody>${derivativeJobs.map((job)=>`<tr><td>${esc(job.derivativeType)}</td><td>${badge(job.jobStatus)}</td><td>${esc(job.ruleTriggeredBy||'—')}</td><td>${esc(job.notes||'—')}</td></tr>`).join('')}</tbody></table></article></section>`;
  res.send(shell(sku.title, req.path, body));
});

app.get('/bundles', (req, res) => {
  const bundles = getAllBundles().map((bundle) => ({ ...bundle, snapshots: getPerformanceSnapshots('bundle', bundle.id) }));
  const body = `<section style="margin-bottom:22px"><div class="eyebrow">Catalog</div><h2 style="margin:0 0 6px 0">Bundles</h2><p class="muted">Higher-AOV offers assembled from Busy Little Happy's strongest single-pack SKUs.</p></section>
  <section class="panel"><table><thead><tr><th>Bundle</th><th>Type</th><th>Channels</th><th>Etsy price</th><th>Orders</th></tr></thead><tbody>${bundles.map((b)=>`<tr><td><strong>${esc(b.title)}</strong><div class="muted small">${esc(b.notes)}</div></td><td>${esc(b.bundleType)}</td><td>${esc((b.channelAvailability||[]).join(', '))}</td><td>${money(b.priceEtsy)}</td><td>${b.snapshots[0] ? b.snapshots[0].orders : 0}</td></tr>`).join('')}</tbody></table></section>`;
  res.send(shell('Bundles', req.path, body));
});

app.get('/channels', (req, res) => {
  const listings = getChannelListings();
  const grouped = {};
  for (const listing of listings) {
    if (!grouped[listing.channel]) grouped[listing.channel] = [];
    grouped[listing.channel].push(listing);
  }
  const summary = getChannelSummary();
  const body = `<section style="margin-bottom:22px"><div class="eyebrow">Distribution</div><h2 style="margin:0 0 6px 0">Channels</h2><p class="muted">Etsy-first, Gumroad-second, KDP-later channel model inherited from the business plan.</p></section>
  <section class="panel"><h3 style="margin-top:0">Channel summary</h3><table><thead><tr><th>Channel</th><th>Listings</th><th>Live</th><th>Total list price</th></tr></thead><tbody>${summary.map((r)=>`<tr><td>${esc(r.channel)}</td><td>${r.listing_count}</td><td>${r.live_count}</td><td>${money(r.total_list_price)}</td></tr>`).join('')}</tbody></table></section>
  ${Object.entries(grouped).map(([channel, items])=>`<section class="panel"><h3 style="margin-top:0">${esc(channel)} listings</h3><table><thead><tr><th>Owner</th><th>Title</th><th>Status</th><th>Sync</th><th>Price</th></tr></thead><tbody>${items.map((l)=>`<tr><td>${esc(l.ownerType)}:${esc(l.ownerId)}</td><td>${esc(l.title)}</td><td>${badge(l.status)}</td><td>${esc(l.syncStatus)}</td><td>${money(l.price)}</td></tr>`).join('')}</tbody></table></section>`).join('')}`;
  res.send(shell('Channels', req.path, body));
});

app.post('/api/seed', (req, res) => {
  const seeded = seedBusyLittleHappyCatalog();
  res.json({ ok: true, families: seeded.families.length, skus: seeded.skus.length, bundles: seeded.bundles.length, listings: seeded.listings.length });
});

app.post('/api/derivative-jobs', (req, res) => {
  const { sourceOwnerType, sourceOwnerId, derivativeType, notes } = req.body;
  if (!sourceOwnerType || !sourceOwnerId || !derivativeType) return res.status(400).json({ error: 'sourceOwnerType, sourceOwnerId, and derivativeType are required' });
  const id = createDerivativeJob({ sourceOwnerType, sourceOwnerId, derivativeType, ruleTriggeredBy: 'Created manually from admin UI', jobStatus: 'planned', outputOwnerIds: [], notes: notes || null });
  res.json({ ok: true, id });
});

app.post('/api/derivative-jobs/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });
  updateDerivativeJobStatus(req.params.id, status);
  res.json({ ok: true });
});

app.use((req, res) => res.status(404).send(shell('Not found', req.path, `<section><div class="eyebrow">Not found</div><h2>Missing page</h2><p class="muted">Page not found: ${esc(req.path)}</p></section>`)));

app.listen(PORT, () => {
  console.log(`\n☀️  Busy Little Happy UI running at http://localhost:${PORT}\n`);
});
