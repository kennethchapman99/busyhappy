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
import { seedBusyLittleHappyCatalog, buildBusyLittleHappyProducts } from '../orchestrator.js';
import { getBuildStatusForSku } from '../shared/product-builder.js';

const app = express();
const PORT = Number(process.env.WEB_PORT || 3737);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));
app.use('/artifacts', express.static(join(__dirname, '../../output/products')));

function money(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `$${Number(value).toFixed(2)}`;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function badge(value, tone = 'gold') {
  const styles = {
    gold: 'background:#fff1cc;color:#7a5400;',
    teal: 'background:#dff7f5;color:#13615d;',
    plum: 'background:#efe3f9;color:#6a2f7e;',
    gray: 'background:#eef1f5;color:#58606f;'
  };
  return `<span style="display:inline-block;padding:4px 8px;border-radius:999px;${styles[tone] || styles.gold}font-size:12px;font-weight:700;">${esc(value)}</span>`;
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
    return `<a href="${href}" style="display:block;padding:10px 12px;border-radius:14px;text-decoration:none;font-weight:700;color:${active ? '#18325f' : '#6d6b73'};background:${active ? 'linear-gradient(90deg, rgba(255,111,145,.14), rgba(78,199,193,.14))' : 'transparent'};">${label}</a>`;
  }).join('');

  return `<!doctype html>
  <html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${esc(title)}</title>
  <style>
    :root{--bg:#fffaf3;--panel:#fff;--sidebar:#fff4ea;--border:#f1dfcf;--text:#18325f;--muted:#6d6b73;--shadow:0 12px 30px rgba(24,50,95,.08);--pink:#ff6f91;--orange:#ff9f40;--yellow:#f7c548;--teal:#4ec7c1;--plum:#a56cc1}
    *{box-sizing:border-box} body{margin:0;background:linear-gradient(180deg,#fffaf3 0%,#fff7f0 100%);color:var(--text);font:14px/1.45 Inter,system-ui,sans-serif}
    a{color:inherit} .shell{display:grid;grid-template-columns:300px 1fr;min-height:100vh} .sidebar{background:var(--sidebar);border-right:1px solid var(--border);padding:28px 22px}
    .brand{margin-bottom:22px}.brand-logo{display:block;width:100%;max-width:240px;height:auto;border-radius:18px;background:#fff;box-shadow:var(--shadow);padding:10px}.brand-copy{margin-top:10px;color:var(--muted);font-size:13px}
    .eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:11px;color:var(--muted);margin-bottom:6px} .main{padding:30px}
    .card,.panel{background:var(--panel);border:1px solid var(--border);border-radius:24px;box-shadow:var(--shadow)} .card{padding:18px 20px}.panel{padding:20px;margin-bottom:18px}
    .stats{display:grid;gap:14px;grid-template-columns:repeat(5,minmax(0,1fr));margin-bottom:22px}.label{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.08em}.value{display:block;font-size:28px;margin-top:10px;font-weight:800}
    .grid2{display:grid;gap:18px;grid-template-columns:1fr 1fr} table{width:100%;border-collapse:collapse} th,td{text-align:left;padding:12px 10px;border-bottom:1px solid var(--border);vertical-align:top}
    th{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)} .muted{color:var(--muted)} .small{font-size:12px}
    .row{display:flex;justify-content:space-between;align-items:start;gap:16px;padding:14px;border:1px solid var(--border);border-radius:18px;background:#fffdfa;margin-bottom:12px}
    .btn{border:1px solid var(--border);padding:10px 12px;border-radius:14px;background:#fff;cursor:pointer;font:inherit;font-weight:700}.btn.primary{background:linear-gradient(135deg,var(--pink) 0%, var(--orange) 35%, var(--yellow) 70%, var(--teal) 100%);color:#18325f}
    .filters{display:flex;gap:12px;margin-bottom:18px;flex-wrap:wrap}.filters input,.filters select{border-radius:14px;border:1px solid var(--border);padding:10px 12px;background:#fff;font:inherit}
    .hero{display:grid;grid-template-columns:280px 1fr;gap:24px;align-items:center}.hero-logo{width:100%;max-width:280px;border-radius:24px;background:#fff9f0;padding:12px;border:1px solid var(--border)}
    .hero-kicker{display:inline-block;padding:6px 10px;border-radius:999px;background:#dff7f5;color:#13615d;font-weight:700;margin-bottom:10px}.hero h2{font-size:40px;line-height:1.05;margin:0 0 10px 0}.hero p{font-size:16px;color:var(--muted);margin:0 0 16px 0}
    .swatches{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}.swatch{width:28px;height:28px;border-radius:10px;border:1px solid rgba(0,0,0,.06)}
    .artifact-links a{display:inline-block;margin-right:10px;margin-bottom:8px;padding:8px 10px;border-radius:12px;border:1px solid var(--border);text-decoration:none;background:#fff}
    @media(max-width:1100px){.shell{grid-template-columns:1fr}.stats,.grid2,.hero{grid-template-columns:1fr}}
  </style></head><body><div class="shell"><aside class="sidebar">
  <div class="brand"><img class="brand-logo" src="/busy-little-happy-logo.svg?v=2" alt="Busy Little Happy logo"/><div class="brand-copy">Screen-free printable fun packs for restaurants, waiting rooms, hotel downtime, travel journals, and activity bundles.</div></div>
  <nav>${nav}</nav>
  <div class="card"><h3 style="margin-top:0">Quick actions</h3><button id="seed" class="btn primary" type="button">Reseed demo catalog</button><div style="height:10px"></div><button id="build" class="btn" type="button">Build product artifacts</button><p class="muted small">Builds actual per-SKU files under output/products. No fake sales data.</p></div>
  </aside><main class="main">${body}</main></div>
  <script>
  const seedBtn=document.getElementById('seed');
  const buildBtn=document.getElementById('build');
  if(seedBtn){seedBtn.onclick=async()=>{seedBtn.disabled=true;seedBtn.textContent='Reseeding...';const r=await fetch('/api/seed',{method:'POST'});if(r.ok) location.reload(); else {alert('Reseed failed'); seedBtn.disabled=false; seedBtn.textContent='Reseed demo catalog';}}}
  if(buildBtn){buildBtn.onclick=async()=>{buildBtn.disabled=true;buildBtn.textContent='Building...';const r=await fetch('/api/build-products',{method:'POST'});if(r.ok) location.reload(); else {alert('Build failed'); buildBtn.disabled=false; buildBtn.textContent='Build product artifacts';}}}
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

function attachSkuContext(skus, snapshots) {
  const latestBySku = {};
  for (const snap of snapshots.filter((item) => item.ownerType === 'sku')) {
    if (!latestBySku[snap.ownerId] || latestBySku[snap.ownerId].snapshotDate < snap.snapshotDate) latestBySku[snap.ownerId] = snap;
  }
  return skus.map((sku) => ({ ...sku, latestSnapshot: latestBySku[sku.id] || null, buildStatus: getBuildStatusForSku(sku.id) }));
}

app.get('/', (req, res) => {
  const catalog = getCatalogState();
  const stats = getDashboardStats();
  const channels = getChannelSummary();
  const topPerformers = getTopPerformers();
  const skusWithBuild = attachSkuContext(catalog.skus, catalog.snapshots);
  const builtCount = skusWithBuild.filter((sku) => sku.buildStatus).length;
  const families = catalog.families.slice(0, 6).map((family) => {
    const familySkus = skusWithBuild.filter((sku) => sku.productFamilyId === family.id);
    const skuIds = new Set(familySkus.map((sku) => sku.id));
    return { ...family, skuCount: familySkus.length, builtCount: familySkus.filter((sku) => sku.buildStatus).length, liveListingCount: catalog.listings.filter((listing) => listing.status === 'live' && skuIds.has(listing.ownerId)).length };
  });

  const body = `
    <section class="panel hero" style="margin-bottom:22px"><img class="hero-logo" src="/busy-little-happy-logo.svg?v=2" alt="Busy Little Happy"/><div><span class="hero-kicker">Busy Little Happy 1.0</span><h2>Printable fun packs built for real parent pain points</h2><p>Travel, wait-time, and quiet-time activity packs with an Etsy-first catalog model. No fake sales data, no fake listings. Build artifacts first, publish only when the product is real.</p><div class="swatches"><div class="swatch" style="background:#ff6f91"></div><div class="swatch" style="background:#ff9f40"></div><div class="swatch" style="background:#f7c548"></div><div class="swatch" style="background:#4ec7c1"></div><div class="swatch" style="background:#a56cc1"></div><div class="swatch" style="background:#18325f"></div></div></div></section>
    <section class="stats">
      <article class="card"><span class="label">Families</span><strong class="value">${stats.families}</strong></article>
      <article class="card"><span class="label">SKUs</span><strong class="value">${stats.skus}</strong></article>
      <article class="card"><span class="label">Built artifacts</span><strong class="value">${builtCount}</strong></article>
      <article class="card"><span class="label">Live listings</span><strong class="value">${stats.liveListings}</strong></article>
      <article class="card"><span class="label">Recorded net revenue</span><strong class="value">${money(stats.estimatedNetRevenue)}</strong></article>
    </section>
    <section class="grid2">
      <article class="panel"><h3 style="margin-top:0">Launch families</h3><table><thead><tr><th>Family</th><th>Use case</th><th>SKUs</th><th>Built</th><th>Live</th></tr></thead><tbody>${families.map((f)=>`<tr><td><a href="/families/${f.id}">${esc(f.title)}</a></td><td>${esc(f.useCase)}</td><td>${f.skuCount}</td><td>${f.builtCount}</td><td>${f.liveListingCount}</td></tr>`).join('')}</tbody></table></article>
      <article class="panel"><h3 style="margin-top:0">Channel summary</h3><table><thead><tr><th>Channel</th><th>Listings</th><th>Live</th><th>Planned list price</th></tr></thead><tbody>${channels.map((row)=>`<tr><td>${esc(row.channel)}</td><td>${row.listing_count}</td><td>${row.live_count}</td><td>${money(row.total_list_price)}</td></tr>`).join('')}</tbody></table></article>
    </section>
    <section class="grid2">
      <article class="panel"><h3 style="margin-top:0">Marketplace performance</h3>${topPerformers.length ? `<table><thead><tr><th>Owner</th><th>Orders</th><th>Net revenue</th></tr></thead><tbody>${topPerformers.map((p)=>`<tr><td>${esc(p.owner_type)}:${esc(p.owner_id)}</td><td>${p.total_orders}</td><td>${money(p.total_net_revenue)}</td></tr>`).join('')}</tbody></table>` : `<div class="muted">No live marketplace performance data yet. Build the products first, then publish and import real results later.</div>`}</article>
      <article class="panel"><h3 style="margin-top:0">Derivative opportunities</h3>${catalog.derivativeOpportunities.slice(0,8).map((opp)=>`<div class="row"><div><strong>${esc(opp.headline)}</strong><p class="muted">${esc(opp.why)}</p></div><button class="btn" type="button" data-derivative-owner-type="${esc(opp.sourceOwnerType)}" data-derivative-owner="${esc(opp.sourceOwnerId)}" data-derivative-type="${esc(opp.derivativeType)}" data-derivative-notes="${esc(opp.recommendedOutput)}">Plan job</button></div>`).join('')}</article>
    </section>`;
  res.send(shell('Busy Little Happy Dashboard', req.path, body));
});

app.get('/families', (req, res) => {
  const catalog = getCatalogState();
  const skusWithBuild = attachSkuContext(catalog.skus, catalog.snapshots);
  let families = catalog.families.map((family) => {
    const familySkus = skusWithBuild.filter((sku) => sku.productFamilyId === family.id);
    const skuIds = new Set(familySkus.map((sku) => sku.id));
    return { ...family, skuCount: familySkus.length, builtCount: familySkus.filter((sku) => sku.buildStatus).length, liveListingCount: catalog.listings.filter((listing) => listing.status === 'live' && skuIds.has(listing.ownerId)).length };
  });
  const q = String(req.query.q || '').trim().toLowerCase();
  const useCase = String(req.query.useCase || '').trim().toLowerCase();
  if (q) families = families.filter((f) => f.title.toLowerCase().includes(q) || (f.description || '').toLowerCase().includes(q) || (f.theme || '').toLowerCase().includes(q));
  if (useCase) families = families.filter((f) => (f.useCase || '').toLowerCase() === useCase);
  const useCases = [...new Set(catalog.families.map((f) => f.useCase).filter(Boolean))].sort();
  const body = `<section style="margin-bottom:22px"><div class="eyebrow">Catalog</div><h2 style="margin:0 0 6px 0">Product families</h2><p class="muted">Reusable parent shelves for Busy Little Happy's travel and wait-time printables.</p></section>
  <form class="filters" method="GET" action="/families"><input type="text" name="q" value="${esc(q)}" placeholder="Search families"/><select name="useCase"><option value="">All use cases</option>${useCases.map((u)=>`<option value="${esc(u)}" ${useCase===u?'selected':''}>${esc(u)}</option>`).join('')}</select><button class="btn primary" type="submit">Filter</button></form>
  <section class="panel"><table><thead><tr><th>Family</th><th>Use case</th><th>Default age</th><th>Theme</th><th>SKUs</th><th>Built</th><th>Live listings</th></tr></thead><tbody>${families.map((f)=>`<tr><td><a href="/families/${f.id}">${esc(f.title)}</a><div class="muted small">${esc(f.description)}</div></td><td>${esc(f.useCase)}</td><td>${esc(f.defaultAgeBand)}</td><td>${esc(f.theme)}</td><td>${f.skuCount}</td><td>${f.builtCount}</td><td>${f.liveListingCount}</td></tr>`).join('')}</tbody></table></section>`;
  res.send(shell('Product Families', req.path, body));
});

app.get('/skus', (req, res) => {
  const catalog = getCatalogState();
  let skus = attachSkuContext(catalog.skus, catalog.snapshots);
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
  <section class="panel"><table><thead><tr><th>SKU</th><th>Age</th><th>Use case</th><th>Theme</th><th>Planned Etsy price</th><th>Build</th><th>Preview</th></tr></thead><tbody>${skus.map((s)=>`<tr><td><a href="/skus/${s.id}">${esc(s.title)}</a><div class="muted small">${esc(s.subtitle)}</div></td><td>${esc(s.ageBand)}</td><td>${esc(s.useCase)}</td><td>${esc(s.theme)}</td><td>${money(s.priceEtsy)}</td><td>${badge(s.filePackageStatus || 'not_built','gray')}</td><td>${s.buildStatus ? `<a href="/artifacts/${s.id}/activity-pack.html" target="_blank">Open</a>` : '—'}</td></tr>`).join('')}</tbody></table></section>`;
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
  const buildStatus = getBuildStatusForSku(sku.id);
  const body = `<section style="margin-bottom:22px"><div class="eyebrow"><a href="/skus">SKUs</a></div><h2 style="margin:0 0 6px 0">${esc(sku.title)}</h2><p class="muted">${esc(sku.subtitle)}</p></section>
  <section class="stats"><article class="card"><span class="label">Family</span><strong class="value" style="font-size:20px"><a href="/families/${family.id}">${esc(family.title)}</a></strong></article><article class="card"><span class="label">Age band</span><strong class="value" style="font-size:20px">${esc(sku.ageBand)}</strong></article><article class="card"><span class="label">Theme</span><strong class="value" style="font-size:20px">${esc(sku.theme)}</strong></article><article class="card"><span class="label">Format</span><strong class="value" style="font-size:20px">${esc(sku.formatType)}</strong></article><article class="card"><span class="label">Build status</span><strong class="value" style="font-size:20px">${esc(sku.filePackageStatus || 'not_built')}</strong></article></section>
  <section class="grid2"><article class="panel"><h3 style="margin-top:0">Channel listings</h3><table><thead><tr><th>Channel</th><th>Status</th><th>Sync</th><th>Planned price</th></tr></thead><tbody>${listings.map((l)=>`<tr><td>${esc(l.channel)}</td><td>${badge(l.status,'teal')}</td><td>${esc(l.syncStatus)}</td><td>${money(l.price)}</td></tr>`).join('')}</tbody></table></article><article class="panel"><h3 style="margin-top:0">Marketplace performance</h3>${snapshots.length ? `<table><thead><tr><th>Date</th><th>Impr.</th><th>Clicks</th><th>Orders</th><th>Net revenue</th></tr></thead><tbody>${snapshots.map((s)=>`<tr><td>${esc(s.snapshotDate)}</td><td>${s.impressions}</td><td>${s.clicks}</td><td>${s.orders}</td><td>${money(s.netRevenueEstimate)}</td></tr>`).join('')}</tbody></table>` : '<div class="muted">No marketplace performance imported for this SKU yet.</div>'}</article></section>
  <section class="grid2"><article class="panel"><h3 style="margin-top:0">Build artifacts</h3>${buildStatus ? `<div class="artifact-links"><a href="/artifacts/${sku.id}/activity-pack.html" target="_blank">Open activity pack</a><a href="/artifacts/${sku.id}/listing-copy.md" target="_blank">Open listing copy</a><a href="/artifacts/${sku.id}/activity-plan.json" target="_blank">Open page plan</a></div><div class="muted small">Artifacts generated at ${esc(buildStatus.outputDir || '')}</div>` : '<div class="muted">No build artifacts yet. Use “Build product artifacts”.</div>'}</article><article class="panel"><h3 style="margin-top:0">Derivative opportunities</h3>${derivativeOpportunities.length ? derivativeOpportunities.map((opp)=>`<div class="row"><div><strong>${esc(opp.headline)}</strong><p class="muted">${esc(opp.why)}</p></div><button class="btn" type="button" data-derivative-owner-type="${esc(opp.sourceOwnerType)}" data-derivative-owner="${esc(opp.sourceOwnerId)}" data-derivative-type="${esc(opp.derivativeType)}" data-derivative-notes="${esc(opp.recommendedOutput)}">Plan job</button></div>`).join('') : '<div class="muted">No SKU-specific opportunities yet. Strongest ideas are family-level expansions.</div>'}</article></section>
  <section class="panel"><h3 style="margin-top:0">Derivative jobs</h3><table><thead><tr><th>Type</th><th>Status</th><th>Reason</th><th>Notes</th></tr></thead><tbody>${derivativeJobs.map((job)=>`<tr><td>${esc(job.derivativeType)}</td><td>${badge(job.jobStatus,'plum')}</td><td>${esc(job.ruleTriggeredBy||'—')}</td><td>${esc(job.notes||'—')}</td></tr>`).join('')}</tbody></table></section>`;
  res.send(shell(sku.title, req.path, body));
});

app.get('/bundles', (req, res) => {
  const bundles = getAllBundles().map((bundle) => ({ ...bundle, snapshots: getPerformanceSnapshots('bundle', bundle.id) }));
  const body = `<section style="margin-bottom:22px"><div class="eyebrow">Catalog</div><h2 style="margin:0 0 6px 0">Bundles</h2><p class="muted">Higher-AOV offers assembled from Busy Little Happy's strongest single-pack SKUs.</p></section>
  <section class="panel"><table><thead><tr><th>Bundle</th><th>Type</th><th>Channels</th><th>Planned Etsy price</th><th>Marketplace data</th></tr></thead><tbody>${bundles.map((b)=>`<tr><td><strong>${esc(b.title)}</strong><div class="muted small">${esc(b.notes)}</div></td><td>${esc(b.bundleType)}</td><td>${esc((b.channelAvailability||[]).join(', '))}</td><td>${money(b.priceEtsy)}</td><td>${b.snapshots[0] ? `${b.snapshots[0].orders} orders` : 'none yet'}</td></tr>`).join('')}</tbody></table></section>`;
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
  <section class="panel"><h3 style="margin-top:0">Channel summary</h3><table><thead><tr><th>Channel</th><th>Listings</th><th>Live</th><th>Planned list price</th></tr></thead><tbody>${summary.map((r)=>`<tr><td>${esc(r.channel)}</td><td>${r.listing_count}</td><td>${r.live_count}</td><td>${money(r.total_list_price)}</td></tr>`).join('')}</tbody></table></section>
  ${Object.entries(grouped).map(([channel, items])=>`<section class="panel"><h3 style="margin-top:0">${esc(channel)} listings</h3><table><thead><tr><th>Owner</th><th>Title</th><th>Status</th><th>Sync</th><th>Planned price</th></tr></thead><tbody>${items.map((l)=>`<tr><td>${esc(l.ownerType)}:${esc(l.ownerId)}</td><td>${esc(l.title)}</td><td>${badge(l.status,'teal')}</td><td>${esc(l.syncStatus)}</td><td>${money(l.price)}</td></tr>`).join('')}</tbody></table></section>`).join('')}`;
  res.send(shell('Channels', req.path, body));
});

app.post('/api/seed', (req, res) => {
  const seeded = seedBusyLittleHappyCatalog();
  res.json({ ok: true, families: seeded.families.length, skus: seeded.skus.length, bundles: seeded.bundles.length, listings: seeded.listings.length });
});

app.post('/api/build-products', (req, res) => {
  const built = buildBusyLittleHappyProducts();
  res.json({ ok: true, built: built.length });
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
