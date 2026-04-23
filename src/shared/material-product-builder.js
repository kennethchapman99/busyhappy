import fs from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateMaterialPackage } from '../agents/materials-agent.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_ROOT = join(__dirname, '../../output/materials');

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function safe(text) { return String(text ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function pageHtml(page, family, sku) {
  const items = (page.body || []).map((line) => `<li>${safe(line)}</li>`).join('');
  return `<section class="page"><h2>${safe(page.title)}</h2><p class="instructions">${safe(page.instructions)}</p><ul>${items}</ul><div class="workspace">Use this page during ${safe(family.useCase || sku.useCase)} time.</div></section>`;
}

function renderHtml(material, family, sku) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${safe(material.title)}</title>
<style>
body{font-family:Arial,sans-serif;color:#18325f;background:#fff;margin:0}
.page{width:8.5in;min-height:11in;padding:.55in;box-sizing:border-box;page-break-after:always}
.cover{background:#fff9f0}.band{display:inline-block;background:#a56cc1;color:white;padding:8px 14px;border-radius:999px;font-weight:bold;margin:8px 0}
h1{font-size:32px;margin:0 0 8px 0} h2{font-size:24px;margin:0 0 10px 0}.sub{font-size:18px;color:#5d6781;margin-bottom:18px}
.box{border:2px solid #f1dfcf;border-radius:18px;padding:16px;margin:16px 0}.workspace{border:2px dashed #d8c7b6;border-radius:14px;padding:14px;min-height:220px;margin-top:14px}
.instructions{font-weight:bold;color:#5d6781} ul{padding-left:22px;line-height:1.6}
.badges span{display:inline-block;background:#dff7f5;padding:6px 10px;border-radius:999px;margin-right:8px;margin-bottom:8px}
</style>
</head>
<body>
<section class="page cover">
  <div class="band">Busy Little Happy</div>
  <h1>${safe(material.title)}</h1>
  <div class="sub">${safe(material.subtitle)}</div>
  <div class="box"><strong>Buyer promise:</strong> ${safe(material.buyerPromise)}</div>
  <div class="badges"><span>Ages ${safe(sku.ageBand)}</span><span>${safe(family.useCase)}</span><span>${safe(sku.theme)}</span><span>${safe(sku.formatType)}</span></div>
  <div class="box"><strong>Design notes</strong><ul>${(material.designNotes || []).map((n) => `<li>${safe(n)}</li>`).join('')}</ul></div>
</section>
${(material.pages || []).map((page) => pageHtml(page, family, sku)).join('')}
</body>
</html>`;
}

function renderMarkdown(material, family, sku) {
  return `# ${material.title}

## Subtitle
${material.subtitle || ''}

## Buyer promise
${material.buyerPromise}

## Planned Etsy price
CAD ${Number(sku.priceEtsy || 0).toFixed(2)}

## Listing hook
${material.listing?.hook || ''}

## Listing bullets
${(material.listing?.bullets || []).map((b) => `- ${b}`).join('\n')}

## Materials needed
${material.listing?.materials || ''}

## Pages
${(material.pages || []).map((page) => `### Page ${page.pageNumber}: ${page.title}
- Type: ${page.type}
- Instructions: ${page.instructions}
${(page.body || []).map((b) => `  - ${b}`).join('\n')}`).join('\n\n')}
`;
}

export async function buildSkuMaterialPackage(sku, family) {
  const dir = join(OUTPUT_ROOT, sku.id);
  ensureDir(dir);
  const material = await generateMaterialPackage({ sku, family });
  const html = renderHtml(material, family, sku);
  const markdown = renderMarkdown(material, family, sku);
  const manifest = {
    skuId: sku.id,
    title: sku.title,
    familyId: family.id,
    familyTitle: family.title,
    outputDir: dir,
    files: ['activity-pack.html', 'material-package.json', 'listing-copy.md', 'manifest.json'],
    builtAt: new Date().toISOString(),
    status: 'material_artifacts_generated'
  };
  fs.writeFileSync(join(dir, 'activity-pack.html'), html, 'utf8');
  fs.writeFileSync(join(dir, 'material-package.json'), JSON.stringify(material, null, 2), 'utf8');
  fs.writeFileSync(join(dir, 'listing-copy.md'), markdown, 'utf8');
  fs.writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  return { dir, manifest };
}

export async function buildAllMaterialPackages(skus, families) {
  ensureDir(OUTPUT_ROOT);
  const familyMap = Object.fromEntries(families.map((family) => [family.id, family]));
  const built = [];
  for (const sku of skus) {
    built.push(await buildSkuMaterialPackage(sku, familyMap[sku.productFamilyId]));
  }
  fs.writeFileSync(join(OUTPUT_ROOT, 'catalog-manifest.json'), JSON.stringify({ builtAt: new Date().toISOString(), count: built.length, items: built.map((b) => b.manifest) }, null, 2), 'utf8');
  return built;
}

export function getMaterialBuildStatus(skuId) {
  const dir = join(OUTPUT_ROOT, skuId);
  const manifestPath = join(dir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return null;
  try { return JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch { return null; }
}
