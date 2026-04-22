import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const _require = createRequire(import.meta.url);
const dotenv = _require('dotenv');
dotenv.config({ path: join(__dirname, '../.env'), override: true });

import chalk from 'chalk';
import { buildSkuListing, buildBundleListing } from './shared/channels.js';
import { getAllProductFamilies, getAllSkus, getAllBundles, getChannelSummary, getDashboardStats, getPerformanceSnapshots, getTopPerformers, getDerivativeJobs, seedCatalog, getProductFamily, getSkusForFamily, getChannelListings } from './shared/db.js';
import { getSeedFamilies, getSeedSkus, getSeedBundles, buildSeedListings, buildSeedPerformanceSnapshots, buildSeedDerivativeJobs } from './shared/seed-data-honest.js';
import { buildDerivativeOpportunities } from './shared/derivatives.js';
import { buildAllProductPackages, buildSkuProductPackage } from './shared/product-builder.js';

function banner() {
  console.log(chalk.bgYellow.black('\n ════════════════════════════════════════════ '));
  console.log(chalk.bgYellow.black(' ☀️  BUSY LITTLE HAPPY — Real Product Builder '));
  console.log(chalk.bgYellow.black(' ════════════════════════════════════════════ \n'));
}

function usage() {
  console.log('  node src/orchestrator-busyhappy.js --setup');
  console.log('  node src/orchestrator-busyhappy.js --seed');
  console.log('  node src/orchestrator-busyhappy.js --list-families');
  console.log('  node src/orchestrator-busyhappy.js --list-skus');
  console.log('  node src/orchestrator-busyhappy.js --report');
  console.log('  node src/orchestrator-busyhappy.js --suggest');
  console.log('  node src/orchestrator-busyhappy.js --build-all');
  console.log('  node src/orchestrator-busyhappy.js --build-sku <sku-id>');
}

export function seedBusyLittleHappyCatalog() {
  const families = getSeedFamilies();
  const skus = getSeedSkus();
  const bundles = getSeedBundles();
  const listings = buildSeedListings(families, skus, bundles, { buildSkuListing, buildBundleListing });
  const snapshots = buildSeedPerformanceSnapshots();
  const derivativeJobs = buildSeedDerivativeJobs();
  seedCatalog({ families, skus, bundles, listings, snapshots, derivativeJobs });
  return { families, skus, bundles, listings, snapshots, derivativeJobs };
}

function listFamilies() {
  const families = getAllProductFamilies();
  console.log(chalk.bold('\nProduct Families\n'));
  console.log(`${'ID'.padEnd(18)} ${'Title'.padEnd(32)} ${'Use case'.padEnd(18)} ${'Status'.padEnd(12)} Deriv.`);
  console.log('─'.repeat(96));
  for (const family of families) {
    console.log(`${family.id.padEnd(18)} ${family.title.padEnd(32)} ${(family.useCase || '—').padEnd(18)} ${(family.status || '—').padEnd(12)} ${String(family.derivativePotentialScore || 0).padStart(3)}`);
  }
  console.log('');
}

function listSkus() {
  const skus = getAllSkus();
  console.log(chalk.bold('\nSKUs\n'));
  console.log(`${'SKU'.padEnd(28)} ${'Age'.padEnd(8)} ${'Theme'.padEnd(12)} ${'Format'.padEnd(18)} ${'Build'.padEnd(12)} ${'Price'.padEnd(8)}`);
  console.log('─'.repeat(104));
  for (const sku of skus) {
    console.log(`${sku.title.slice(0, 27).padEnd(28)} ${(sku.ageBand || '—').padEnd(8)} ${(sku.theme || '—').padEnd(12)} ${(sku.formatType || '—').padEnd(18)} ${(sku.filePackageStatus || '—').padEnd(12)} ${String(sku.priceEtsy ?? '—').padEnd(8)}`);
  }
  console.log('');
}

function report() {
  const stats = getDashboardStats();
  const channelSummary = getChannelSummary();
  const topPerformers = getTopPerformers();
  console.log(chalk.bold('\nDashboard Summary\n'));
  console.log(`Families:             ${stats.families}`);
  console.log(`SKUs:                 ${stats.skus}`);
  console.log(`Bundles:              ${stats.bundles}`);
  console.log(`Live listings:        ${stats.liveListings}`);
  console.log(`Recorded revenue:     $${stats.estimatedNetRevenue.toFixed(2)}`);

  console.log(chalk.bold('\nChannel Summary\n'));
  for (const row of channelSummary) console.log(`- ${row.channel}: ${row.live_count}/${row.listing_count} live, planned price total $${Number(row.total_list_price || 0).toFixed(2)}`);

  console.log(chalk.bold('\nPerformance Data\n'));
  if (!topPerformers.length) console.log('No real performance data yet. Nothing is listed or earning revenue yet.\n');
  else topPerformers.forEach((p) => console.log(`- ${p.owner_type}:${p.owner_id} — ${p.total_orders} orders, $${Number(p.total_net_revenue || 0).toFixed(2)}`));
}

function suggest() {
  const opportunities = buildDerivativeOpportunities({ families: getAllProductFamilies(), skus: getAllSkus(), bundles: getAllBundles(), snapshots: getPerformanceSnapshots(), derivativeJobs: getDerivativeJobs() });
  console.log(chalk.bold('\nDerivative Opportunities\n'));
  if (!opportunities.length) {
    console.log('No data-backed derivative opportunities yet. Build products first, list them, then track real results.\n');
    return;
  }
  opportunities.forEach((opp, idx) => {
    console.log(`${idx + 1}. ${opp.headline}`);
    console.log(`   ${opp.why}`);
    console.log(`   Next: ${opp.recommendedOutput}`);
  });
}

function familySummary(familyId) {
  const family = getProductFamily(familyId);
  if (!family) return console.log('Family not found.');
  const skus = getSkusForFamily(family.id);
  const listings = getChannelListings('family', family.id);
  console.log(chalk.bold(`\n${family.title}\n`));
  console.log(`${family.description}`);
  console.log(`Use case: ${family.useCase}`);
  console.log(`Default age band: ${family.defaultAgeBand}`);
  console.log(`Derivative potential: ${family.derivativePotentialScore}`);
  console.log(`SKUs: ${skus.length}`);
  console.log(`Direct family listings: ${listings.length}`);
}

function buildAll() {
  const families = getAllProductFamilies();
  const skus = getAllSkus();
  const built = buildAllProductPackages(skus, families);
  console.log(chalk.green(`✓ Built ${built.length} product packages in output/products`));
}

function buildSku(skuId) {
  const sku = getAllSkus().find((item) => item.id === skuId);
  if (!sku) {
    console.error(chalk.red(`SKU not found: ${skuId}`));
    process.exit(1);
  }
  const family = getProductFamily(sku.productFamilyId);
  const built = buildSkuProductPackage(sku, family);
  console.log(chalk.green(`✓ Built ${sku.id}`));
  console.log(built.dir);
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  banner();
  switch (cmd) {
    case '--setup':
    case '--seed': {
      const seeded = seedBusyLittleHappyCatalog();
      console.log(chalk.green('✓ Busy Little Happy catalog seeded'));
      console.log(`  Families: ${seeded.families.length}`);
      console.log(`  SKUs: ${seeded.skus.length}`);
      console.log(`  Bundles: ${seeded.bundles.length}`);
      console.log(`  Listing drafts: ${seeded.listings.length}`);
      console.log('  Revenue snapshots: 0 (intentionally empty)\n');
      break;
    }
    case '--list-families': listFamilies(); break;
    case '--list-skus': listSkus(); break;
    case '--report': report(); break;
    case '--suggest': suggest(); break;
    case '--family': familySummary(args[1]); break;
    case '--build-all': buildAll(); break;
    case '--build-sku': buildSku(args[1]); break;
    case undefined:
    case '--help':
    case '-h': usage(); break;
    default: console.error(chalk.red(`Unknown command: ${cmd}`)); usage(); process.exit(1);
  }
}

if (process.argv[1] && process.argv[1] === __filename) {
  main().catch((err) => { console.error(chalk.red('\nFatal error:'), err.message); process.exit(1); });
}
