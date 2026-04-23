/**
 * Busy Little Happy — Catalog Orchestrator
 */

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
import {
  getAllProductFamilies,
  getAllSkus,
  getAllBundles,
  getChannelSummary,
  getDashboardStats,
  getPerformanceSnapshots,
  getTopPerformers,
  getDerivativeJobs,
  seedCatalog,
  getProductFamily,
  getSkusForFamily,
  getChannelListings,
  upsertSku,
} from './shared/db.js';
import {
  getSeedFamilies,
  getSeedSkus,
  getSeedBundles,
  buildSeedListings,
  buildSeedPerformanceSnapshots,
  buildSeedDerivativeJobs,
} from './shared/seed-data.js';
import { buildDerivativeOpportunities } from './shared/derivatives.js';
import { buildAllProductPackages } from './shared/product-builder.js';

function printBanner() {
  console.log(chalk.bgYellow.black('\n ════════════════════════════════════════════ '));
  console.log(chalk.bgYellow.black(' ☀️  BUSY LITTLE HAPPY — Catalog Pipeline 1.0 '));
  console.log(chalk.bgYellow.black(' ════════════════════════════════════════════ \n'));
}

function printUsage() {
  console.log(chalk.bold('Usage:'));
  console.log('  node src/orchestrator.js --setup            Initialize and seed Busy Little Happy');
  console.log('  node src/orchestrator.js --seed             Reset and reseed demo catalog');
  console.log('  node src/orchestrator.js --build-products   Build real per-SKU artifacts under output/product-builds');
  console.log('  node src/orchestrator.js --list-families    List product families');
  console.log('  node src/orchestrator.js --list-skus        List SKUs');
  console.log('  node src/orchestrator.js --report           Print dashboard and channel summary');
  console.log('  node src/orchestrator.js --suggest          Print derivative opportunities');
  console.log('');
}

export function seedBusyLittleHappyCatalog() {
  const families = getSeedFamilies();
  const skus = getSeedSkus();
  const bundles = getSeedBundles();
  const listings = buildSeedListings(families, skus, bundles, { buildSkuListing, buildBundleListing });
  const snapshots = buildSeedPerformanceSnapshots(skus, bundles);
  const derivativeJobs = buildSeedDerivativeJobs();
  seedCatalog({ families, skus, bundles, listings, snapshots, derivativeJobs });
  return { families, skus, bundles, listings, snapshots, derivativeJobs };
}

export function buildBusyLittleHappyProducts() {
  const families = getAllProductFamilies();
  const skus = getAllSkus();
  const built = buildAllProductPackages(skus, families);
  skus.forEach((sku) => {
    upsertSku({ ...sku, status: 'built', filePackageStatus: 'draft_artifacts_generated', qaStatus: sku.qaStatus || 'not_started' });
  });
  return built;
}

function listFamilies() {
  const families = getAllProductFamilies();
  console.log(chalk.bold('\nProduct Families\n'));
  console.log(`${'ID'.padEnd(18)} ${'Title'.padEnd(32)} ${'Use case'.padEnd(18)} ${'Status'.padEnd(12)} Deriv.`);
  console.log('─'.repeat(94));
  for (const family of families) {
    console.log(`${family.id.padEnd(18)} ${family.title.padEnd(32)} ${(family.useCase || '—').padEnd(18)} ${(family.status || '—').padEnd(12)} ${String(family.derivativePotentialScore || 0).padStart(3)}`);
  }
  console.log('');
}

function listSkus() {
  const skus = getAllSkus();
  console.log(chalk.bold('\nSKUs\n'));
  console.log(`${'SKU'.padEnd(26)} ${'Age'.padEnd(8)} ${'Theme'.padEnd(12)} ${'Format'.padEnd(18)} ${'Build'.padEnd(24)} ${'QA'.padEnd(12)}`);
  console.log('─'.repeat(112));
  for (const sku of skus) {
    console.log(`${sku.title.slice(0, 25).padEnd(26)} ${(sku.ageBand || '—').padEnd(8)} ${(sku.theme || '—').padEnd(12)} ${(sku.formatType || '—').padEnd(18)} ${(sku.filePackageStatus || '—').padEnd(24)} ${(sku.qaStatus || '—').padEnd(12)}`);
  }
  console.log('');
}

function printReport() {
  const stats = getDashboardStats();
  const channelSummary = getChannelSummary();
  const topPerformers = getTopPerformers();
  console.log(chalk.bold('\nDashboard Summary\n'));
  console.log(`Families:             ${stats.families}`);
  console.log(`SKUs:                 ${stats.skus}`);
  console.log(`Bundles:              ${stats.bundles}`);
  console.log(`Live listings:        ${stats.liveListings}`);
  console.log(`Recorded net revenue: $${stats.estimatedNetRevenue.toFixed(2)}`);

  console.log(chalk.bold('\nChannel Summary\n'));
  for (const row of channelSummary) {
    console.log(`- ${row.channel}: ${row.live_count}/${row.listing_count} live, aggregate planned list price $${Number(row.total_list_price || 0).toFixed(2)}`);
  }

  console.log(chalk.bold('\nTop Performers\n'));
  if (!topPerformers.length) {
    console.log('No live marketplace performance data yet.\n');
    return;
  }
  for (const performer of topPerformers) {
    console.log(`- ${performer.owner_type}:${performer.owner_id} — ${performer.total_orders} orders, $${Number(performer.total_net_revenue || 0).toFixed(2)} net`);
  }
  console.log('');
}

function printSuggestions() {
  const families = getAllProductFamilies();
  const skus = getAllSkus();
  const bundles = getAllBundles();
  const snapshots = getPerformanceSnapshots();
  const derivativeJobs = getDerivativeJobs();
  const opportunities = buildDerivativeOpportunities({ families, skus, bundles, snapshots, derivativeJobs });
  console.log(chalk.bold('\nDerivative Opportunities\n'));
  if (!opportunities.length) {
    console.log('No new opportunities found.\n');
    return;
  }
  opportunities.slice(0, 12).forEach((opp, index) => {
    console.log(chalk.bold(`${index + 1}. ${opp.headline}`));
    console.log(`   Type: ${opp.derivativeType}`);
    console.log(`   Why:  ${opp.why}`);
    console.log(`   Next: ${opp.recommendedOutput}`);
    console.log('');
  });
}

function printFamilySummary(familyId) {
  const family = getProductFamily(familyId);
  if (!family) return;
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

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  printBanner();
  switch (cmd) {
    case '--setup':
    case '--seed': {
      const seeded = seedBusyLittleHappyCatalog();
      console.log(chalk.green('✓ Busy Little Happy catalog seeded'));
      console.log(`  Families: ${seeded.families.length}`);
      console.log(`  SKUs: ${seeded.skus.length}`);
      console.log(`  Bundles: ${seeded.bundles.length}`);
      console.log(`  Listings: ${seeded.listings.length}`);
      console.log(`  Snapshots: ${seeded.snapshots.length}\n`);
      break;
    }
    case '--build-products': {
      const built = buildBusyLittleHappyProducts();
      console.log(chalk.green(`✓ Built ${built.length} product artifact packages`));
      built.slice(0, 5).forEach((item) => console.log(`  - ${item.manifest?.skuId || item.skuId}: ${item.dir || item.directory}`));
      console.log('\nArtifacts written to output/product-builds\n');
      break;
    }
    case '--list-families': listFamilies(); break;
    case '--list-skus': listSkus(); break;
    case '--report': printReport(); break;
    case '--suggest': printSuggestions(); break;
    case '--family': {
      const familyId = args[1];
      if (!familyId) {
        console.error(chalk.red('Usage: --family <family-id>'));
        process.exit(1);
      }
      printFamilySummary(familyId);
      break;
    }
    case undefined:
    case '--help':
    case '-h': printUsage(); break;
    default:
      console.error(chalk.red(`Unknown command: ${cmd}\n`));
      printUsage();
      process.exit(1);
  }
}

if (process.argv[1] && process.argv[1] === __filename) {
  main().catch((err) => {
    console.error(chalk.red('\nFatal error:'), err.message);
    process.exit(1);
  });
}
