import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const _require = createRequire(import.meta.url);
const dotenv = _require('dotenv');
dotenv.config({ path: join(__dirname, '../../.env'), override: true });

import express from 'express';
import { getAllProductFamilies, getProductFamily, getAllSkus, getSku, getSkusForFamily, getAllBundles, getChannelListings, getDashboardStats } from '../shared/db.js';
import { seedBusyLittleHappyCatalog, buildBusyLittleHappyProducts } from '../orchestrator.js';
import { getBuildStatusForSku } from '../shared/product-builder.js';

const app = express();
const PORT = Number(process.env.WEB_PORT || 7373);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));
app.use('/artifacts', express.static(join(__dirname, '../../output/products')));

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (v) => v == null ? '—' : `$${Number(v).toFixed(2)}`;
const badge = (v) => `<span style="display:inline-block;padding:4px 8px;border-radius:999px;background:#eef1f5;color:#58606f;font-size:12px;font-weight:700;">${esc(v)}</span>`;

function shell(title, path, body) {
  const links = [['/','Dashboard'],['/families','Families'],['/skus','SKUs'],['/bundles','Bundles']]
    .map(([href,label]) => `<a href="${href}" style="display:block;padding:10px 12px;border-radius:14px;text-decoration:none;font-weight:700;color:${path===href||path.startsWith(href+'/')?'#18325f':'#6d6b73'};background:${path===href||path.startsWith(href+'/')?'linear-gradient(90deg, rgba(255,111,145,.14), rgba(78,199,193,.14))':'transparent'};">${label}</a>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(title)}</title><style>
  body{margin:0;background:#fffaf3;color:#18325f;font:14px/1.45 Inter,system-ui,sans-serif} .shell{display:grid;grid-template-columns:300px 1fr;min-height:100vh} .sidebar{background:#fff4ea;border-right:1px solid #f1dfcf;padding:28px 22px} .main{padding:30px}
  .card,.panel{background:#fff;border:1px solid #f1dfcf;border-radius:24px;box-shadow:0 12px 30px rgba(24,50,95,.08)} .card{padding:18px 20px}.panel{padding:20px;margin-bottom:18px}
  .stats{display:grid;gap:14px;grid-template-columns:repeat(4,minmax(0,1fr));margin-bottom:22px} table{width:100%;border-collapse:collapse} th,td{text-align:left;padding:12px 10px;border-bottom:1px solid #f1dfcf;vertical-align:top} th{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6d6b73} .muted{color:#6d6b73} .btn{border:1px solid #f1dfcf;padding:10px 12px;border-radius:14px;background:#fff;cursor:pointer;font:inherit;font-weight:700} .btn.primary{background:linear-gradient(135deg,#ff6f91 0%,#ff9f40 35%,#f7c548 70%,#4ec7c1 100%)}
  @media(max-width:1100px){.shell{grid-template-columns:1fr}.stats{grid-template-columns:1fr}}
  </style></head><body><div class="shell"><aside class="sidebar"><img src="/busy-little-happy-logo.svg?v=2" alt="Busy Little Happy" style="display:block;width:100%;max-width:240px;height:auto;border-radius:18px;background:#fff;padding:10px;box-shadow:0 12px 30px rgba(24,50,95,.08)"/><div style="margin-top:10px;color:#6d6b73;font-size:13px">Build actual draft materials. No fake marketplace data.</div><nav style="margin-top:20px">${links}</nav><div class="card" style="margin-top:20px"><button id="seed" class="btn primary" type="button">Reseed demo catalog</button><div style="height:10px"></div><button id="build" class="btn" type="button">Build product artifacts</button></div></aside><main class="main">${body}</main></div><script>
  const seedBtn=document.getElementById('seed'); const buildBtn=document.getElementById('build');
  if(seedBtn) seedBtn.onclick=async()=>{seedBtn.disabled=true; seedBtn.textContent='Reseeding...'; const r=await fetch('/api/seed',{method:'POST'}); if(r.ok) location.reload(); else alert('Reseed failed');};
  if(buildBtn) buildBtn.onclick=async()=>{buildBtn.disabled=true; buildBtn.textContent='Building...'; const r=await fetch('/api/build-products',{method:'POST'}); if(r.ok) location.reload(); else alert('Build failed');};
  </script></body></html>`;
}

function state() {
  let families = getAllProductFamilies();
  if (!families.length) { seedBusyLittleHappyCatalog(); families = getAllProductFamilies(); }
  const skus = getAllSkus().map((sku) => ({ ...sku, buildStatus: getBuildStatusForSku(sku.id) }));
  return { families, skus, bundles: getAllBundles(), listings: getChannelListings(), stats: getDashboardStats() };
}

app.get('/', (req, res) => {
  const s = state();
  const built = s.skus.filter((sku) => sku.buildStatus).length;
  const body = `<div class="panel"><h1 style="margin-top:0">Busy Little Happy</h1><p class="muted">This app plans SKUs and builds actual draft activity-pack artifacts you can inspect. Marketplace data is intentionally empty until you publish for real.</p></div>
  <div class="stats"><div class="card"><div class="muted">Families</div><div style="font-size:28px;font-weight:800">${s.stats.families}</div></div><div class="card"><div class="muted">SKUs</div><div style="font-size:28px;font-weight:800">${s.stats.skus}</div></div><div class="card"><div class="muted">Built artifacts</div><div style="font-size:28px;font-weight:800">${built}</div></div><div class="card"><div class="muted">Recorded revenue</div><div style="font-size:28px;font-weight:800">${money(s.stats.estimatedNetRevenue)}</div></div></div>
  <div class="panel"><h2 style="margin-top:0">Families</h2><table><thead><tr><th>Family</th><th>Use case</th><th>SKUs</th><th>Built</th></tr></thead><tbody>${s.families.map((f)=>{ const familySkus=s.skus.filter((sku)=>sku.productFamilyId===f.id); return `<tr><td><a href="/families/${f.id}">${esc(f.title)}</a></td><td>${esc(f.useCase)}</td><td>${familySkus.length}</td><td>${familySkus.filter((sku)=>sku.buildStatus).length}</td></tr>`; }).join('')}</tbody></table></div>`;
  res.send(shell('Busy Little Happy', req.path, body));
});

app.get('/families', (req, res) => {
  const s = state();
  const body = `<div class="panel"><h1 style="margin-top:0">Families</h1><table><thead><tr><th>Family</th><th>Use case</th><th>Theme</th><th>SKUs</th><th>Built</th></tr></thead><tbody>${s.families.map((f)=>{ const familySkus=s.skus.filter((sku)=>sku.productFamilyId===f.id); return `<tr><td><a href="/families/${f.id}">${esc(f.title)}</a><div class="muted">${esc(f.description)}</div></td><td>${esc(f.useCase)}</td><td>${esc(f.theme)}</td><td>${familySkus.length}</td><td>${familySkus.filter((sku)=>sku.buildStatus).length}</td></tr>`; }).join('')}</tbody></table></div>`;
  res.send(shell('Families', req.path, body));
});

app.get('/families/:id', (req, res) => {
  const family = getProductFamily(req.params.id);
  if (!family) return res.status(404).send(shell('Not found', req.path, `<div class="panel"><h1>Missing page</h1><p class="muted">Family not found: ${esc(req.path)}</p></div>`));
  const skus = getSkusForFamily(family.id).map((sku) => ({ ...sku, buildStatus: getBuildStatusForSku(sku.id) }));
  const body = `<div class="panel"><h1 style="margin-top:0">${esc(family.title)}</h1><p class="muted">${esc(family.description)}</p><p><strong>Use case:</strong> ${esc(family.useCase)} · <strong>Default age:</strong> ${esc(family.defaultAgeBand)}</p></div>
  <div class="panel"><h2 style="margin-top:0">SKUs in this family</h2><table><thead><tr><th>SKU</th><th>Age</th><th>Theme</th><th>Planned Etsy price</th><th>Build</th><th>Preview</th></tr></thead><tbody>${skus.map((sku)=>`<tr><td><a href="/skus/${sku.id}">${esc(sku.title)}</a><div class="muted">${esc(sku.subtitle)}</div></td><td>${esc(sku.ageBand)}</td><td>${esc(sku.theme)}</td><td>${money(sku.priceEtsy)}</td><td>${badge(sku.filePackageStatus || 'not_built')}</td><td>${sku.buildStatus ? `<a href="/artifacts/${sku.id}/activity-pack.html" target="_blank">Open</a>` : '—'}</td></tr>`).join('')}</tbody></table></div>`;
  res.send(shell(family.title, req.path, body));
});

app.get('/skus', (req, res) => {
  const s = state();
  const body = `<div class="panel"><h1 style="margin-top:0">SKUs</h1><table><thead><tr><th>SKU</th><th>Use case</th><th>Theme</th><th>Price</th><th>Build</th><th>Preview</th></tr></thead><tbody>${s.skus.map((sku)=>`<tr><td><a href="/skus/${sku.id}">${esc(sku.title)}</a><div class="muted">${esc(sku.subtitle)}</div></td><td>${esc(sku.useCase)}</td><td>${esc(sku.theme)}</td><td>${money(sku.priceEtsy)}</td><td>${badge(sku.filePackageStatus || 'not_built')}</td><td>${sku.buildStatus ? `<a href="/artifacts/${sku.id}/activity-pack.html" target="_blank">Open</a>` : '—'}</td></tr>`).join('')}</tbody></table></div>`;
  res.send(shell('SKUs', req.path, body));
});

app.get('/skus/:id', (req, res) => {
  const sku = getSku(req.params.id);
  if (!sku) return res.status(404).send(shell('Not found', req.path, `<div class="panel"><h1>Missing page</h1><p class="muted">SKU not found: ${esc(req.path)}</p></div>`));
  const family = getProductFamily(sku.productFamilyId);
  const build = getBuildStatusForSku(sku.id);
  const body = `<div class="panel"><h1 style="margin-top:0">${esc(sku.title)}</h1><p class="muted">${esc(sku.subtitle)}</p><p><strong>Family:</strong> <a href="/families/${family.id}">${esc(family.title)}</a> · <strong>Age:</strong> ${esc(sku.ageBand)} · <strong>Theme:</strong> ${esc(sku.theme)}</p><p><strong>Planned Etsy price:</strong> ${money(sku.priceEtsy)}</p></div>
  <div class="panel"><h2 style="margin-top:0">Build artifacts</h2>${build ? `<p><a href="/artifacts/${sku.id}/activity-pack.html" target="_blank">Open activity pack</a> · <a href="/artifacts/${sku.id}/listing-copy.md" target="_blank">Open listing copy</a> · <a href="/artifacts/${sku.id}/activity-plan.json" target="_blank">Open page plan</a></p><div class="muted">${esc(build.outputDir || '')}</div>` : '<div class="muted">No artifacts built yet.</div>'}</div>`;
  res.send(shell(sku.title, req.path, body));
});

app.get('/bundles', (req, res) => {
  const s = state();
  const body = `<div class="panel"><h1 style="margin-top:0">Bundles</h1><table><thead><tr><th>Bundle</th><th>Type</th><th>Planned Etsy price</th></tr></thead><tbody>${s.bundles.map((b)=>`<tr><td>${esc(b.title)}<div class="muted">${esc(b.notes)}</div></td><td>${esc(b.bundleType)}</td><td>${money(b.priceEtsy)}</td></tr>`).join('')}</tbody></table></div>`;
  res.send(shell('Bundles', req.path, body));
});

app.post('/api/seed', (req, res) => { const seeded = seedBusyLittleHappyCatalog(); res.json({ ok: true, count: seeded.skus.length }); });
app.post('/api/build-products', async (req, res) => { const built = await buildBusyLittleHappyProducts(); res.json({ ok: true, built: built.length }); });
app.use((req, res) => res.status(404).send(shell('Not found', req.path, `<div class="panel"><h1>Missing page</h1><p class="muted">Page not found: ${esc(req.path)}</p></div>`)));
app.listen(PORT, () => console.log(`\n☀️ Busy Little Happy UI running at http://localhost:${PORT}\n`));
