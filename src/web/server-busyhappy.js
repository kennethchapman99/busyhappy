import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const _require = createRequire(import.meta.url);
const dotenv = _require('dotenv');
dotenv.config({ path: join(__dirname, '../../.env'), override: true });

import express from 'express';
import { getAllProductFamilies, getProductFamily, getAllSkus, getSku, getSkusForFamily, getAllBundles, getChannelListings, getPerformanceSnapshots, getDerivativeJobs, createDerivativeJob, getDashboardStats, getChannelSummary, getTopPerformers } from '../shared/db.js';
import { buildDerivativeOpportunities } from '../shared/derivatives.js';
import { seedBusyLittleHappyCatalog } from '../orchestrator-busyhappy.js';
import { buildAllProductPackages, buildSkuProductPackage, getBuildStatusForSku } from '../shared/product-builder.js';

const app = express();
const PORT = Number(process.env.WEB_PORT || 3737);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));
app.use('/products-output', express.static(join(__dirname, '../../output/products')));

const money = (v) => (v === null || v === undefined || Number.isNaN(Number(v)) ? '—' : `$${Number(v).toFixed(2)}`);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const badge = (v, tone='gold') => `<span style="display:inline-block;padding:4px 8px;border-radius:999px;${tone==='plum'?'background:#efe3f9;color:#6a2f7e;':tone==='teal'?'background:#dff7f5;color:#13615d;':'background:#fff1cc;color:#7a5400;'}font-size:12px;font-weight:700;">${esc(v)}</span>`;

function shell(title, path, body) {
  const nav = [['/','Dashboard'],['/families','Families'],['/skus','SKUs'],['/bundles','Bundles'],['/channels','Channels']].map(([href,label]) => {
    const active = path===href || (href!=='/' && path.startsWith(href));
    return `<a href="${href}" style="display:block;padding:10px 12px;border-radius:14px;text-decoration:none;font-weight:700;color:${active?'#18325f':'#6d6b73'};background:${active?'linear-gradient(90deg, rgba(255,111,145,.14), rgba(78,199,193,.14))':'transparent'};">${label}</a>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(title)}</title><style>
  :root{--bg:#fffaf3;--panel:#fff;--sidebar:#fff4ea;--border:#f1dfcf;--text:#18325f;--muted:#6d6b73;--shadow:0 12px 30px rgba(24,50,95,.08);--pink:#ff6f91;--orange:#ff9f40;--yellow:#f7c548;--teal:#4ec7c1;--plum:#a56cc1}
  *{box-sizing:border-box} body{margin:0;background:linear-gradient(180deg,#fffaf3 0%,#fff7f0 100%);color:var(--text);font:14px/1.45 Inter,system-ui,sans-serif} a{color:inherit} .shell{display:grid;grid-template-columns:300px 1fr;min-height:100vh} .sidebar{background:var(--sidebar);border-right:1px solid var(--border);padding:28px 22px}.brand{margin-bottom:22px}.brand-logo{display:block;width:100%;max-width:240px;height:auto;border-radius:18px;background:#fff;box-shadow:var(--shadow);padding:10px}.brand-copy{margin-top:10px;color:var(--muted);font-size:13px}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:11px;color:var(--muted);margin-bottom:6px}.main{padding:30px}.card,.panel{background:var(--panel);border:1px solid var(--border);border-radius:24px;box-shadow:var(--shadow)}.card{padding:18px 20px}.panel{padding:20px;margin-bottom:18px}.stats{display:grid;gap:14px;grid-template-columns:repeat(5,minmax(0,1fr));margin-bottom:22px}.label{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.08em}.value{display:block;font-size:28px;margin-top:10px;font-weight:800}.grid2{display:grid;gap:18px;grid-template-columns:1fr 1fr} table{width:100%;border-collapse:collapse} th,td{text-align:left;padding:12px 10px;border-bottom:1px solid var(--border);vertical-align:top} th{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)} .muted{color:var(--muted)} .small{font-size:12px}.row{display:flex;justify-content:space-between;align-items:start;gap:16px;padding:14px;border:1px solid var(--border);border-radius:18px;background:#fffdfa;margin-bottom:12px}.btn{border:1px solid var(--border);padding:10px 12px;border-radius:14px;background:#fff;cursor:pointer;font:inherit;font-weight:700}.btn.primary{background:linear-gradient(135deg,var(--pink) 0%, var(--orange) 35%, var(--yellow) 70%, var(--teal) 100%);color:#18325f}.hero{display:grid;grid-template-columns:280px 1fr;gap:24px;align-items:center}.hero-logo{width:100%;max-width:280px;border-radius:24px;background:#fff9f0;padding:12px;border:1px solid var(--border)} .filters{display:flex;gap:12px;margin-bottom:18px;flex-wrap:wrap}.filters input,.filters select{border-radius:14px;border:1px solid var(--border);padding:10px 12px;background:#fff;font:inherit}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}@media(max-width:1100px){.shell{grid-template-columns:1fr}.stats,.grid2,.hero{grid-template-columns:1fr}}</style></head>
  <body><div class="shell"><aside class="sidebar"><div class="brand"><img class="brand-logo" src="/busy-little-happy-logo.svg?v=2" alt="Busy Little Happy logo"/><div class="brand-copy">Real product planning only. No fake sales, no fake listings, no fake revenue.</div></div><nav>${nav}</nav><div class="card"><h3 style="margin-top:0">Actions</h3><button id="seed" class="btn primary" type="button">Reset honest catalog</button><button id="buildAll" class="btn" type="button" style="margin-top:10px">Build all item files</button><p class="muted small">Writes actual HTML, JSON, and listing draft files to output/products.</p></div></aside><main class="main">${body}</main></div>
  <script>
    async function post(url, payload){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:payload?JSON.stringify(payload):undefined});const d=await r.json();if(!r.ok) throw new Error(d.error||'Request failed'); return d;}
    const seed=document.getElementById('seed'); if(seed){seed.onclick=async()=>{seed.disabled=true;seed.textContent='Resetting...'; try{await post('/api/seed'); location.reload();}catch(err){alert(err.message); seed.disabled=false; seed.textContent='Reset honest catalog';}}}
    const buildAll=document.getElementById('buildAll'); if(buildAll){buildAll.onclick=async()=>{buildAll.disabled=true;buildAll.textContent='Building...'; try{const result=await post('/api/build-all'); alert('Built '+result.count+' item packages in output/products'); location.reload();}catch(err){alert(err.message); buildAll.disabled=false; buildAll.textContent='Build all item files';}}}
    document.addEventListener('click', async (e)=>{const buildBtn=e.target.closest('[data-build-sku]'); if(buildBtn){buildBtn.disabled=true; buildBtn.textContent='Building...'; try{const r=await post('/api/build-sku/'+buildBtn.dataset.buildSku); alert('Built '+r.skuId); location.reload();}catch(err){alert(err.message); buildBtn.disabled=false; buildBtn.textContent='Build files';}} const jobBtn=e.target.closest('[data-derivative-owner]'); if(jobBtn){jobBtn.disabled=true; jobBtn.textContent='Creating...'; try{await post('/api/derivative-jobs',{sourceOwnerType:jobBtn.dataset.derivativeOwnerType,sourceOwnerId:jobBtn.dataset.derivativeOwner,derivativeType:jobBtn.dataset.derivativeType,notes:jobBtn.dataset.derivativeNotes||''}); location.reload();}catch(err){alert(err.message); jobBtn.disabled=false; jobBtn.textContent='Plan job';}}});
  </script></body></html>`;
}

function getCatalogState() {
  let families = getAllProductFamilies();
  if (!families.length) { seedBusyLittleHappyCatalog(); families = getAllProductFamilies(); }
  const skus = getAllSkus();
  const bundles = getAllBundles();
  const listings = getChannelListings();
  const snapshots = getPerformanceSnapshots();
  const derivativeJobs = getDerivativeJobs();
  const derivativeOpportunities = buildDerivativeOpportunities({ families, skus, bundles, snapshots, derivativeJobs });
  return { families, skus, bundles, listings, snapshots, derivativeJobs, derivativeOpportunities };
}

function attachBuildAndPerformance(skus, snapshots) {
  const latest = {};
  for (const snap of snapshots.filter((s)=>s.ownerType==='sku')) if (!latest[snap.ownerId] || latest[snap.ownerId].snapshotDate < snap.snapshotDate) latest[snap.ownerId] = snap;
  return skus.map((sku) => ({ ...sku, latestSnapshot: latest[sku.id] || null, buildStatus: getBuildStatusForSku(sku.id) }));
}

app.get('/', (req, res) => {
  const catalog = getCatalogState();
  const stats = getDashboardStats();
  const channels = getChannelSummary();
  const topPerformers = getTopPerformers();
  const builtCount = catalog.skus.filter((sku)=>getBuildStatusForSku(sku.id)).length;
  const body = `<section class="panel hero" style="margin-bottom:22px"><img class="hero-logo" src="/busy-little-happy-logo.svg?v=2" alt="Busy Little Happy"/><div><span class="eyebrow">Busy Little Happy 1.0</span><h2 style="font-size:38px;line-height:1.05;margin:0 0 10px 0">Build the actual product files first</h2><p class="muted" style="font-size:16px">This dashboard is now honest by default. Listing drafts are planning objects only. Revenue and top-performer sections stay empty until you have real marketplace data.</p></div></section>
  <section class="stats"><article class="card"><span class="label">Families</span><strong class="value">${stats.families}</strong></article><article class="card"><span class="label">SKUs</span><strong class="value">${stats.skus}</strong></article><article class="card"><span class="label">Bundles</span><strong class="value">${stats.bundles}</strong></article><article class="card"><span class="label">Built item files</span><strong class="value">${builtCount}</strong></article><article class="card"><span class="label">Recorded revenue</span><strong class="value">${money(stats.estimatedNetRevenue)}</strong></article></section>
  <section class="grid2"><article class="panel"><h3 style="margin-top:0">Channel summary</h3><table><thead><tr><th>Channel</th><th>Drafts</th><th>Live</th><th>Planned price</th></tr></thead><tbody>${channels.map((r)=>`<tr><td>${esc(r.channel)}</td><td>${r.listing_count}</td><td>${r.live_count}</td><td>${money(r.total_list_price)}</td></tr>`).join('')}</tbody></table><p class="muted small">These are internal listing drafts only. None are live until you actually publish them.</p></article><article class="panel"><h3 style="margin-top:0">Performance</h3>${topPerformers.length?`<table><thead><tr><th>Owner</th><th>Orders</th><th>Net revenue</th></tr></thead><tbody>${topPerformers.map((p)=>`<tr><td class="mono">${esc(p.owner_type)}:${esc(p.owner_id)}</td><td>${p.total_orders}</td><td>${money(p.total_net_revenue)}</td></tr>`).join('')}</tbody></table>`:'<div class="muted">No real orders, revenue, or listing performance yet.</div>'}</article></section>
  <section class="panel"><h3 style="margin-top:0">Next honest step</h3><div class="row"><div><strong>Build the item files</strong><p class="muted">Use the build action to generate real product artifacts for each SKU in <span class="mono">output/products</span>.</p></div><button class="btn primary" type="button" id="buildAllInline">Build all</button></div><script>document.getElementById('buildAllInline').onclick=()=>document.getElementById('buildAll').click()</script></section>`;
  res.send(shell('Busy Little Happy Dashboard', req.path, body));
});

app.get('/skus', (req, res) => {
  const catalog = getCatalogState();
  const skus = attachBuildAndPerformance(catalog.skus, catalog.snapshots);
  const body = `<section style="margin-bottom:22px"><div class="eyebrow">Catalog</div><h2 style="margin:0 0 6px 0">SKUs</h2><p class="muted">Build files first. Review polish second. Publish later.</p></section><section class="panel"><table><thead><tr><th>SKU</th><th>Age</th><th>Theme</th><th>Build status</th><th>Orders</th><th>Action</th></tr></thead><tbody>${skus.map((s)=>`<tr><td><a href="/skus/${s.id}">${esc(s.title)}</a><div class="muted small">${esc(s.subtitle)}</div></td><td>${esc(s.ageBand)}</td><td>${esc(s.theme)}</td><td>${s.buildStatus?badge('built','teal'):badge('not built','gold')}</td><td>${s.latestSnapshot ? s.latestSnapshot.orders : 0}</td><td><button class="btn" type="button" data-build-sku="${esc(s.id)}">Build files</button></td></tr>`).join('')}</tbody></table></section>`;
  res.send(shell('SKUs', req.path, body));
});

app.get('/skus/:id', (req, res) => {
  const catalog = getCatalogState();
  const sku = getSku(req.params.id);
  if (!sku) return res.status(404).send(shell('Not found', req.path, `<h2>SKU not found</h2>`));
  const family = getProductFamily(sku.productFamilyId);
  const listings = getChannelListings('sku', sku.id);
  const snapshots = getPerformanceSnapshots('sku', sku.id);
  const buildStatus = getBuildStatusForSku(sku.id);
  const derivativeOpportunities = catalog.derivativeOpportunities.filter((opp)=>opp.sourceOwnerType==='sku' && opp.sourceOwnerId===sku.id);
  const htmlLink = buildStatus ? `/products-output/${sku.id}/activity-pack.html` : null;
  const listingLink = buildStatus ? `/products-output/${sku.id}/listing-copy.md` : null;
  const body = `<section style="margin-bottom:22px"><div class="eyebrow"><a href="/skus">SKUs</a></div><h2 style="margin:0 0 6px 0">${esc(sku.title)}</h2><p class="muted">${esc(sku.subtitle)}</p></section>
  <section class="stats"><article class="card"><span class="label">Family</span><strong class="value" style="font-size:20px"><a href="/families/${family.id}">${esc(family.title)}</a></strong></article><article class="card"><span class="label">Age band</span><strong class="value" style="font-size:20px">${esc(sku.ageBand)}</strong></article><article class="card"><span class="label">Theme</span><strong class="value" style="font-size:20px">${esc(sku.theme)}</strong></article><article class="card"><span class="label">Planned Etsy price</span><strong class="value" style="font-size:20px">${money(sku.priceEtsy)}</strong></article><article class="card"><span class="label">Build status</span><strong class="value" style="font-size:20px">${buildStatus ? 'Built' : 'Not built'}</strong></article></section>
  <section class="grid2"><article class="panel"><h3 style="margin-top:0">Actual files</h3>${buildStatus?`<ul><li><a href="${htmlLink}" target="_blank">activity-pack.html</a></li><li><a href="${listingLink}" target="_blank">listing-copy.md</a></li><li><a href="/products-output/${sku.id}/activity-plan.json" target="_blank">activity-plan.json</a></li><li><a href="/products-output/${sku.id}/manifest.json" target="_blank">manifest.json</a></li></ul>`:'<div class="muted">No files built yet for this SKU.</div>'}<button class="btn primary" type="button" data-build-sku="${esc(sku.id)}" style="margin-top:12px">Build files for this SKU</button></article><article class="panel"><h3 style="margin-top:0">Listing drafts</h3><table><thead><tr><th>Channel</th><th>Status</th><th>Price</th></tr></thead><tbody>${listings.map((l)=>`<tr><td>${esc(l.channel)}</td><td>${badge(l.status,'gold')}</td><td>${money(l.price)}</td></tr>`).join('')}</tbody></table><p class="muted small">Draft only. Not published. No URL. No revenue.</p></article></section>
  <section class="grid2"><article class="panel"><h3 style="margin-top:0">Performance</h3>${snapshots.length?`<table><thead><tr><th>Date</th><th>Orders</th><th>Net revenue</th></tr></thead><tbody>${snapshots.map((s)=>`<tr><td>${esc(s.snapshotDate)}</td><td>${s.orders}</td><td>${money(s.netRevenueEstimate)}</td></tr>`).join('')}</tbody></table>`:'<div class="muted">No real performance data yet.</div>'}</article><article class="panel"><h3 style="margin-top:0">Derivative opportunities</h3>${derivativeOpportunities.length?derivativeOpportunities.map((opp)=>`<div class="row"><div><strong>${esc(opp.headline)}</strong><p class="muted">${esc(opp.why)}</p></div><button class="btn" type="button" data-derivative-owner-type="${esc(opp.sourceOwnerType)}" data-derivative-owner="${esc(opp.sourceOwnerId)}" data-derivative-type="${esc(opp.derivativeType)}" data-derivative-notes="${esc(opp.recommendedOutput)}">Plan job</button></div>`).join(''):'<div class="muted">No data-backed derivative opportunities yet.</div>'}</article></section>`;
  res.send(shell(sku.title, req.path, body));
});

app.get('/families', (req, res) => {
  const catalog = getCatalogState();
  const families = catalog.families.map((family) => {
    const skus = catalog.skus.filter((sku)=>sku.productFamilyId===family.id);
    return { ...family, skuCount: skus.length, builtCount: skus.filter((sku)=>getBuildStatusForSku(sku.id)).length };
  });
  const body = `<section style="margin-bottom:22px"><div class="eyebrow">Catalog</div><h2 style="margin:0 0 6px 0">Product families</h2><p class="muted">Families organize the real products you still need to build and polish.</p></section><section class="panel"><table><thead><tr><th>Family</th><th>Use case</th><th>SKUs</th><th>Built</th><th>Status</th></tr></thead><tbody>${families.map((f)=>`<tr><td><a href="/families/${f.id}">${esc(f.title)}</a><div class="muted small">${esc(f.description)}</div></td><td>${esc(f.useCase)}</td><td>${f.skuCount}</td><td>${f.builtCount}</td><td>${badge(f.status,'gold')}</td></tr>`).join('')}</tbody></table></section>`;
  res.send(shell('Families', req.path, body));
});

app.get('/families/:id', (req, res) => {
  const family = getProductFamily(req.params.id);
  if (!family) return res.status(404).send(shell('Not found', req.path, `<h2>Family not found</h2>`));
  const skus = getSkusForFamily(family.id).map((sku)=>({ ...sku, buildStatus:getBuildStatusForSku(sku.id) }));
  const body = `<section style="margin-bottom:22px"><div class="eyebrow"><a href="/families">Families</a></div><h2 style="margin:0 0 6px 0">${esc(family.title)}</h2><p class="muted">${esc(family.description)}</p></section><section class="panel"><table><thead><tr><th>SKU</th><th>Age</th><th>Theme</th><th>Build</th><th>Action</th></tr></thead><tbody>${skus.map((sku)=>`<tr><td><a href="/skus/${sku.id}">${esc(sku.title)}</a></td><td>${esc(sku.ageBand)}</td><td>${esc(sku.theme)}</td><td>${sku.buildStatus?badge('built','teal'):badge('not built','gold')}</td><td><button class="btn" type="button" data-build-sku="${esc(sku.id)}">Build files</button></td></tr>`).join('')}</tbody></table></section>`;
  res.send(shell(family.title, req.path, body));
});

app.get('/bundles', (req, res) => {
  const bundles = getAllBundles();
  const body = `<section style="margin-bottom:22px"><div class="eyebrow">Catalog</div><h2 style="margin:0 0 6px 0">Bundles</h2><p class="muted">Bundles are offer plans. They are not live until you publish them.</p></section><section class="panel"><table><thead><tr><th>Bundle</th><th>Type</th><th>Planned Etsy price</th><th>Status</th></tr></thead><tbody>${bundles.map((b)=>`<tr><td>${esc(b.title)}<div class="muted small">${esc(b.notes)}</div></td><td>${esc(b.bundleType)}</td><td>${money(b.priceEtsy)}</td><td>${badge(b.status,'gold')}</td></tr>`).join('')}</tbody></table></section>`;
  res.send(shell('Bundles', req.path, body));
});

app.get('/channels', (req, res) => {
  const listings = getChannelListings();
  const grouped = {};
  for (const listing of listings) { if (!grouped[listing.channel]) grouped[listing.channel] = []; grouped[listing.channel].push(listing); }
  const summary = getChannelSummary();
  const body = `<section style="margin-bottom:22px"><div class="eyebrow">Distribution</div><h2 style="margin:0 0 6px 0">Channels</h2><p class="muted">Every row here is a draft object only until you manually publish for real.</p></section><section class="panel"><h3 style="margin-top:0">Summary</h3><table><thead><tr><th>Channel</th><th>Drafts</th><th>Live</th><th>Planned price total</th></tr></thead><tbody>${summary.map((r)=>`<tr><td>${esc(r.channel)}</td><td>${r.listing_count}</td><td>${r.live_count}</td><td>${money(r.total_list_price)}</td></tr>`).join('')}</tbody></table></section>${Object.entries(grouped).map(([channel, items])=>`<section class="panel"><h3 style="margin-top:0">${esc(channel)} draft objects</h3><table><thead><tr><th>Owner</th><th>Title</th><th>Status</th><th>Price</th></tr></thead><tbody>${items.map((l)=>`<tr><td class="mono">${esc(l.ownerType)}:${esc(l.ownerId)}</td><td>${esc(l.title)}</td><td>${badge(l.status,'gold')}</td><td>${money(l.price)}</td></tr>`).join('')}</tbody></table></section>`).join('')}`;
  res.send(shell('Channels', req.path, body));
});

app.post('/api/seed', (req, res) => { const seeded = seedBusyLittleHappyCatalog(); res.json({ ok:true, families:seeded.families.length, skus:seeded.skus.length }); });
app.post('/api/build-all', (req, res) => { const built = buildAllProductPackages(getAllSkus(), getAllProductFamilies()); res.json({ ok:true, count: built.length }); });
app.post('/api/build-sku/:id', (req, res) => { const sku = getSku(req.params.id); if (!sku) return res.status(404).json({ error: 'SKU not found' }); const family = getProductFamily(sku.productFamilyId); buildSkuProductPackage(sku, family); res.json({ ok:true, skuId: sku.id }); });
app.post('/api/derivative-jobs', (req, res) => { const { sourceOwnerType, sourceOwnerId, derivativeType, notes } = req.body; if (!sourceOwnerType || !sourceOwnerId || !derivativeType) return res.status(400).json({ error:'sourceOwnerType, sourceOwnerId, and derivativeType are required' }); const id = createDerivativeJob({ sourceOwnerType, sourceOwnerId, derivativeType, ruleTriggeredBy:'Created manually from admin UI', jobStatus:'planned', outputOwnerIds:[], notes: notes || null }); res.json({ ok:true, id }); });
app.use((req, res) => res.status(404).send(shell('Not found', req.path, `<section><h2>Missing page</h2><p class="muted">${esc(req.path)}</p></section>`)));
app.listen(PORT, () => console.log(`\n☀️  Busy Little Happy UI running at http://localhost:${PORT}\n`));
