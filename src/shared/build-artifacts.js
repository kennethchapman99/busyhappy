import fs from 'fs';
import { join } from 'path';

function slugify(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function ensureDir(path) {
  fs.mkdirSync(path, { recursive: true });
}

function pageTemplatesForSku(sku) {
  const base = [
    'cover',
    'instructions',
    'maze',
    'coloring_page',
    'i_spy',
    'drawing_prompt',
    'spot_the_difference',
    'matching_game',
    'journal_prompt',
    'scavenger_hunt',
    'bingo_card'
  ];

  const pages = [];
  for (let i = 0; i < sku.pageCount; i += 1) {
    const type = base[i % base.length];
    pages.push({
      pageNumber: i + 1,
      pageType: type,
      theme: sku.theme,
      useCase: sku.useCase,
      ageBand: sku.ageBand,
      difficulty: sku.difficultyLevel,
      prompt: `Create a ${type.replace(/_/g, ' ')} for a ${sku.theme} themed ${sku.useCase} activity pack for ages ${sku.ageBand}`,
    });
  }
  return pages;
}

function buildListingDraft(sku, channel) {
  return [
    `# ${sku.title}`,
    '',
    `Channel: ${channel}`,
    `Subtitle: ${sku.subtitle}`,
    `Age band: ${sku.ageBand}`,
    `Use case: ${sku.useCase}`,
    `Theme: ${sku.theme}`,
    `Format: ${sku.formatType}`,
    `Page count: ${sku.pageCount}`,
    `Target list price: ${channel === 'etsy' ? sku.priceEtsy : channel === 'gumroad' ? sku.priceGumroad : sku.priceKdp}`,
    '',
    '## Promise',
    'Download fast, print at home, keep kids occupied without screens.',
    '',
    '## Listing bullets',
    '- Screen-free printable activity pack',
    `- Built for ${sku.useCase}`,
    `- Designed for ages ${sku.ageBand}`,
    `- ${sku.pageCount} pages of printable activities`,
    '- Cover page + instructions page + activity pages',
    '',
    '## Notes',
    'This is a draft generated locally and should be edited before publishing.',
    ''
  ].join('\n');
}

function buildSkuBrief(family, sku) {
  return [
    `# ${sku.title}`,
    '',
    `Family: ${family.title}`,
    `Age band: ${sku.ageBand}`,
    `Theme: ${sku.theme}`,
    `Use case: ${sku.useCase}`,
    `Format: ${sku.formatType}`,
    `Difficulty: ${sku.difficultyLevel}`,
    `Target pages: ${sku.pageCount}`,
    '',
    '## Buyer',
    'Parent or caregiver who needs a fast printable solution for a child in a travel or wait-time setting.',
    '',
    '## Product promise',
    'Keep a child engaged for 20 to 60 minutes with a printable, screen-free pack that feels tailored to the setting.',
    '',
    '## Build checklist',
    '- Cover artwork',
    '- Instructions page',
    '- All activity pages',
    '- PDF export',
    '- Etsy listing assets',
    '- Gumroad bundle-ready files',
    ''
  ].join('\n');
}

export function buildCatalogArtifacts({ rootDir, families, skus, bundles, listings }) {
  const outputDir = join(rootDir, 'output', 'busy-little-happy');
  const familiesDir = join(outputDir, 'families');
  const skusDir = join(outputDir, 'skus');
  const bundlesDir = join(outputDir, 'bundles');
  const listingsDir = join(outputDir, 'listings');

  [outputDir, familiesDir, skusDir, bundlesDir, listingsDir].forEach(ensureDir);

  const familyMap = Object.fromEntries(families.map((family) => [family.id, family]));

  families.forEach((family) => {
    const familyFolder = join(familiesDir, family.id);
    ensureDir(familyFolder);
    fs.writeFileSync(join(familyFolder, 'family-brief.md'), [
      `# ${family.title}`,
      '',
      `Use case: ${family.useCase}`,
      `Default age band: ${family.defaultAgeBand}`,
      `Theme: ${family.theme}`,
      '',
      family.description,
      '',
      `Parent strategy: ${family.parentStrategy}`,
    ].join('\n'));
  });

  skus.forEach((sku) => {
    const family = familyMap[sku.productFamilyId];
    const skuFolder = join(skusDir, sku.id);
    ensureDir(skuFolder);
    fs.writeFileSync(join(skuFolder, 'product-brief.md'), buildSkuBrief(family, sku));
    fs.writeFileSync(join(skuFolder, 'content-plan.json'), JSON.stringify({
      skuId: sku.id,
      title: sku.title,
      pageCount: sku.pageCount,
      pages: pageTemplatesForSku(sku),
    }, null, 2));
    fs.writeFileSync(join(skuFolder, 'etsy-listing-draft.md'), buildListingDraft(sku, 'etsy'));
    fs.writeFileSync(join(skuFolder, 'gumroad-listing-draft.md'), buildListingDraft(sku, 'gumroad'));
    fs.writeFileSync(join(skuFolder, 'build-status.json'), JSON.stringify({
      skuId: sku.id,
      buildStatus: 'not_built',
      hasPdf: false,
      hasCoverArt: false,
      hasPreviewImages: false,
      notes: 'Generated as planning artifacts only. Printable files still need to be created.'
    }, null, 2));
  });

  bundles.forEach((bundle) => {
    const bundleFolder = join(bundlesDir, bundle.id);
    ensureDir(bundleFolder);
    fs.writeFileSync(join(bundleFolder, 'bundle-brief.md'), [
      `# ${bundle.title}`,
      '',
      `Bundle type: ${bundle.bundleType}`,
      `Target Etsy price: ${bundle.priceEtsy}`,
      `Target Gumroad price: ${bundle.priceGumroad}`,
      '',
      'Included SKUs:',
      ...(bundle.skuIds || []).map((skuId) => `- ${skuId}`),
      '',
      bundle.notes || ''
    ].join('\n'));
  });

  listings.forEach((listing) => {
    const listingFolder = join(listingsDir, `${listing.channel}-${slugify(listing.ownerId)}`);
    ensureDir(listingFolder);
    fs.writeFileSync(join(listingFolder, 'listing.json'), JSON.stringify(listing, null, 2));
  });

  fs.writeFileSync(join(outputDir, 'README.md'), [
    '# Busy Little Happy build artifacts',
    '',
    'This folder contains real planning artifacts generated by the local setup command.',
    '',
    '- `families/` contains family briefs',
    '- `skus/` contains product briefs, content plans, and listing drafts',
    '- `bundles/` contains bundle briefs',
    '- `listings/` contains channel-specific draft listing payloads',
    '',
    'These are planning and production-prep assets. They are not live marketplace listings and do not imply sales or revenue.',
    ''
  ].join('\n'));

  return { outputDir };
}
