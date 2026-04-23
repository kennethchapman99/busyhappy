import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../busyhappy.db');
let db;

const j = (v, fallback = []) => { try { return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const now = () => new Date().toISOString();

export function getDb() {
  if (db) return db;
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_families (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      slug TEXT UNIQUE,
      title TEXT NOT NULL,
      niche TEXT,
      use_case TEXT,
      default_age_band TEXT,
      theme TEXT,
      status TEXT DEFAULT 'draft',
      description TEXT,
      parent_strategy TEXT,
      derivative_potential_score INTEGER DEFAULT 0,
      tags_json TEXT
    );
    CREATE TABLE IF NOT EXISTS skus (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      product_family_id TEXT NOT NULL,
      sku_code TEXT UNIQUE,
      title TEXT NOT NULL,
      subtitle TEXT,
      age_band TEXT,
      use_case TEXT,
      theme TEXT,
      format_type TEXT,
      page_count INTEGER DEFAULT 0,
      difficulty_level TEXT,
      price_etsy REAL,
      price_gumroad REAL,
      price_kdp REAL,
      status TEXT DEFAULT 'draft',
      qa_status TEXT DEFAULT 'pending',
      file_package_status TEXT DEFAULT 'unpackaged',
      notes TEXT,
      tags_json TEXT,
      FOREIGN KEY (product_family_id) REFERENCES product_families(id)
    );
    CREATE TABLE IF NOT EXISTS bundles (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      title TEXT NOT NULL,
      bundle_type TEXT,
      channel_availability_json TEXT,
      price_etsy REAL,
      price_gumroad REAL,
      price_kdp REAL,
      status TEXT DEFAULT 'draft',
      notes TEXT
    );
    CREATE TABLE IF NOT EXISTS bundle_items (
      bundle_id TEXT NOT NULL,
      sku_id TEXT NOT NULL,
      PRIMARY KEY (bundle_id, sku_id)
    );
    CREATE TABLE IF NOT EXISTS channel_listings (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      owner_type TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      external_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      tags_json TEXT,
      price REAL,
      status TEXT DEFAULT 'draft',
      sync_status TEXT DEFAULT 'planned',
      listing_url TEXT,
      channel_metadata_json TEXT
    );
    CREATE TABLE IF NOT EXISTS performance_snapshots (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      owner_type TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      snapshot_date TEXT NOT NULL,
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      favorites INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      orders INTEGER DEFAULT 0,
      gross_revenue REAL DEFAULT 0,
      net_revenue_estimate REAL DEFAULT 0,
      refund_count INTEGER DEFAULT 0,
      rating_avg REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      notes TEXT
    );
    CREATE TABLE IF NOT EXISTS derivative_jobs (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      source_owner_type TEXT NOT NULL,
      source_owner_id TEXT NOT NULL,
      derivative_type TEXT NOT NULL,
      rule_triggered_by TEXT,
      job_status TEXT DEFAULT 'suggested',
      output_owner_ids_json TEXT,
      notes TEXT
    );
  `);
  return db;
}

const mapFamily = (r) => r && ({ id: r.id, createdAt: r.created_at, updatedAt: r.updated_at, slug: r.slug, title: r.title, niche: r.niche, useCase: r.use_case, defaultAgeBand: r.default_age_band, theme: r.theme, status: r.status, description: r.description, parentStrategy: r.parent_strategy, derivativePotentialScore: r.derivative_potential_score, tags: j(r.tags_json) });
const mapSku = (r) => r && ({ id: r.id, createdAt: r.created_at, updatedAt: r.updated_at, productFamilyId: r.product_family_id, skuCode: r.sku_code, title: r.title, subtitle: r.subtitle, ageBand: r.age_band, useCase: r.use_case, theme: r.theme, formatType: r.format_type, pageCount: r.page_count, difficultyLevel: r.difficulty_level, priceEtsy: r.price_etsy, priceGumroad: r.price_gumroad, priceKdp: r.price_kdp, status: r.status, qaStatus: r.qa_status, filePackageStatus: r.file_package_status, notes: r.notes, tags: j(r.tags_json) });
const mapBundle = (r) => r && ({ id: r.id, createdAt: r.created_at, updatedAt: r.updated_at, title: r.title, bundleType: r.bundle_type, channelAvailability: j(r.channel_availability_json), priceEtsy: r.price_etsy, priceGumroad: r.price_gumroad, priceKdp: r.price_kdp, status: r.status, notes: r.notes });
const mapListing = (r) => r && ({ id: r.id, createdAt: r.created_at, updatedAt: r.updated_at, ownerType: r.owner_type, ownerId: r.owner_id, channel: r.channel, externalId: r.external_id, title: r.title, description: r.description, tags: j(r.tags_json), price: r.price, status: r.status, syncStatus: r.sync_status, listingUrl: r.listing_url, channelMetadata: j(r.channel_metadata_json, {}) });
const mapSnapshot = (r) => r && ({ id: r.id, createdAt: r.created_at, ownerType: r.owner_type, ownerId: r.owner_id, channel: r.channel, snapshotDate: r.snapshot_date, impressions: r.impressions, clicks: r.clicks, favorites: r.favorites, conversions: r.conversions, orders: r.orders, grossRevenue: r.gross_revenue, netRevenueEstimate: r.net_revenue_estimate, refundCount: r.refund_count, ratingAvg: r.rating_avg, reviewCount: r.review_count, notes: r.notes });
const mapJob = (r) => r && ({ id: r.id, createdAt: r.created_at, updatedAt: r.updated_at, sourceOwnerType: r.source_owner_type, sourceOwnerId: r.source_owner_id, derivativeType: r.derivative_type, ruleTriggeredBy: r.rule_triggered_by, jobStatus: r.job_status, outputOwnerIds: j(r.output_owner_ids_json), notes: r.notes });

export const getProductFamily = (id) => mapFamily(getDb().prepare('SELECT * FROM product_families WHERE id = ?').get(id));
export const getAllProductFamilies = () => getDb().prepare('SELECT * FROM product_families ORDER BY title').all().map(mapFamily);
export const getSku = (id) => mapSku(getDb().prepare('SELECT * FROM skus WHERE id = ?').get(id));
export const getAllSkus = () => getDb().prepare('SELECT * FROM skus ORDER BY title').all().map(mapSku);
export const getSkusForFamily = (productFamilyId) => getDb().prepare('SELECT * FROM skus WHERE product_family_id = ? ORDER BY age_band, title').all(productFamilyId).map(mapSku);
export const getBundle = (id) => {
  const bundle = mapBundle(getDb().prepare('SELECT * FROM bundles WHERE id = ?').get(id));
  if (!bundle) return null;
  bundle.skuIds = getDb().prepare('SELECT sku_id FROM bundle_items WHERE bundle_id = ? ORDER BY sku_id').all(id).map((r) => r.sku_id);
  return bundle;
};
export const getAllBundles = () => getDb().prepare('SELECT * FROM bundles ORDER BY title').all().map((r) => {
  const bundle = mapBundle(r);
  bundle.skuIds = getDb().prepare('SELECT sku_id FROM bundle_items WHERE bundle_id = ? ORDER BY sku_id').all(bundle.id).map((x) => x.sku_id);
  return bundle;
});
export const getChannelListings = (ownerType = null, ownerId = null) => {
  const rows = ownerType && ownerId
    ? getDb().prepare('SELECT * FROM channel_listings WHERE owner_type = ? AND owner_id = ? ORDER BY channel, title').all(ownerType, ownerId)
    : getDb().prepare('SELECT * FROM channel_listings ORDER BY channel, title').all();
  return rows.map(mapListing);
};
export const getPerformanceSnapshots = (ownerType = null, ownerId = null) => {
  const rows = ownerType && ownerId
    ? getDb().prepare('SELECT * FROM performance_snapshots WHERE owner_type = ? AND owner_id = ? ORDER BY snapshot_date DESC').all(ownerType, ownerId)
    : getDb().prepare('SELECT * FROM performance_snapshots ORDER BY snapshot_date DESC, owner_type, owner_id').all();
  return rows.map(mapSnapshot);
};
export const getDerivativeJobs = (sourceOwnerType = null, sourceOwnerId = null) => {
  const rows = sourceOwnerType && sourceOwnerId
    ? getDb().prepare('SELECT * FROM derivative_jobs WHERE source_owner_type = ? AND source_owner_id = ? ORDER BY updated_at DESC').all(sourceOwnerType, sourceOwnerId)
    : getDb().prepare('SELECT * FROM derivative_jobs ORDER BY updated_at DESC').all();
  return rows.map(mapJob);
};

function upsert(table, id, fields) {
  const database = getDb();
  const exists = database.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(id);
  const cols = Object.keys(fields);
  if (exists) {
    const set = cols.map((c) => `${c} = ?`).join(', ');
    database.prepare(`UPDATE ${table} SET ${set} WHERE id = ?`).run(...cols.map((c) => fields[c]), id);
  } else {
    database.prepare(`INSERT INTO ${table} (id, ${cols.join(', ')}) VALUES (?, ${cols.map(() => '?').join(', ')})`).run(id, ...cols.map((c) => fields[c]));
  }
}

export const upsertSku = (sku) => upsert('skus', sku.id, {
  created_at: sku.createdAt || now(),
  updated_at: now(),
  product_family_id: sku.productFamilyId,
  sku_code: sku.skuCode,
  title: sku.title,
  subtitle: sku.subtitle || null,
  age_band: sku.ageBand || null,
  use_case: sku.useCase || null,
  theme: sku.theme || null,
  format_type: sku.formatType || null,
  page_count: sku.pageCount || 0,
  difficulty_level: sku.difficultyLevel || null,
  price_etsy: sku.priceEtsy || null,
  price_gumroad: sku.priceGumroad || null,
  price_kdp: sku.priceKdp || null,
  status: sku.status || 'draft',
  qa_status: sku.qaStatus || 'pending',
  file_package_status: sku.filePackageStatus || 'unpackaged',
  notes: sku.notes || null,
  tags_json: JSON.stringify(sku.tags || []),
});

export function createDerivativeJob(job) {
  const id = job.id || `DJ_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  upsert('derivative_jobs', id, {
    created_at: now(),
    updated_at: now(),
    source_owner_type: job.sourceOwnerType,
    source_owner_id: job.sourceOwnerId,
    derivative_type: job.derivativeType,
    rule_triggered_by: job.ruleTriggeredBy || null,
    job_status: job.jobStatus || 'suggested',
    output_owner_ids_json: JSON.stringify(job.outputOwnerIds || []),
    notes: job.notes || null,
  });
  return id;
}

export const updateDerivativeJobStatus = (id, jobStatus) => getDb().prepare('UPDATE derivative_jobs SET job_status = ?, updated_at = ? WHERE id = ?').run(jobStatus, now(), id);

export function seedCatalog({ families, skus, bundles, listings, snapshots, derivativeJobs }) {
  const database = getDb();
  const tx = database.transaction(() => {
    ['derivative_jobs', 'performance_snapshots', 'channel_listings', 'bundle_items', 'bundles', 'skus', 'product_families'].forEach((t) => database.prepare(`DELETE FROM ${t}`).run());

    families.forEach((family) => upsert('product_families', family.id, {
      created_at: now(), updated_at: now(), slug: family.slug, title: family.title, niche: family.niche || null, use_case: family.useCase || null,
      default_age_band: family.defaultAgeBand || null, theme: family.theme || null, status: family.status || 'draft', description: family.description || null,
      parent_strategy: family.parentStrategy || null, derivative_potential_score: family.derivativePotentialScore || 0, tags_json: JSON.stringify(family.tags || []),
    }));

    skus.forEach(upsertSku);

    bundles.forEach((bundle) => {
      upsert('bundles', bundle.id, {
        created_at: now(), updated_at: now(), title: bundle.title, bundle_type: bundle.bundleType || null, channel_availability_json: JSON.stringify(bundle.channelAvailability || []),
        price_etsy: bundle.priceEtsy || null, price_gumroad: bundle.priceGumroad || null, price_kdp: bundle.priceKdp || null, status: bundle.status || 'draft', notes: bundle.notes || null,
      });
      (bundle.skuIds || []).forEach((skuId) => database.prepare('INSERT INTO bundle_items (bundle_id, sku_id) VALUES (?, ?)').run(bundle.id, skuId));
    });

    listings.forEach((listing) => upsert('channel_listings', listing.id, {
      created_at: now(), updated_at: now(), owner_type: listing.ownerType, owner_id: listing.ownerId, channel: listing.channel, external_id: listing.externalId || null,
      title: listing.title, description: listing.description || null, tags_json: JSON.stringify(listing.tags || []), price: listing.price || null,
      status: listing.status || 'draft', sync_status: listing.syncStatus || 'planned', listing_url: listing.listingUrl || null, channel_metadata_json: JSON.stringify(listing.channelMetadata || {}),
    }));

    snapshots.forEach((snapshot) => upsert('performance_snapshots', snapshot.id, {
      created_at: now(), owner_type: snapshot.ownerType, owner_id: snapshot.ownerId, channel: snapshot.channel, snapshot_date: snapshot.snapshotDate,
      impressions: snapshot.impressions || 0, clicks: snapshot.clicks || 0, favorites: snapshot.favorites || 0, conversions: snapshot.conversions || 0, orders: snapshot.orders || 0,
      gross_revenue: snapshot.grossRevenue || 0, net_revenue_estimate: snapshot.netRevenueEstimate || 0, refund_count: snapshot.refundCount || 0,
      rating_avg: snapshot.ratingAvg || 0, review_count: snapshot.reviewCount || 0, notes: snapshot.notes || null,
    }));

    derivativeJobs.forEach((job) => createDerivativeJob(job));
  });
  tx();
}

export function getDashboardStats() {
  const database = getDb();
  const families = database.prepare('SELECT COUNT(*) c FROM product_families').get().c;
  const skus = database.prepare('SELECT COUNT(*) c FROM skus').get().c;
  const bundles = database.prepare('SELECT COUNT(*) c FROM bundles').get().c;
  const liveListings = database.prepare("SELECT COUNT(*) c FROM channel_listings WHERE status = 'live'").get().c;
  const estimatedNetRevenue = liveListings > 0 ? +(database.prepare('SELECT SUM(net_revenue_estimate) total FROM performance_snapshots').get().total || 0).toFixed(2) : 0;
  return { families, skus, bundles, liveListings, estimatedNetRevenue };
}

export const getChannelSummary = () => getDb().prepare(`
  SELECT channel, COUNT(*) listing_count, SUM(CASE WHEN status = 'live' THEN 1 ELSE 0 END) live_count, ROUND(SUM(price), 2) total_list_price
  FROM channel_listings GROUP BY channel ORDER BY channel
`).all();

export const getTopPerformers = (limit = 8) => {
  const liveListings = getDb().prepare("SELECT COUNT(*) c FROM channel_listings WHERE status = 'live'").get().c;
  if (!liveListings) return [];
  return getDb().prepare(`
    SELECT owner_type, owner_id, channel, MAX(snapshot_date) latest_snapshot, SUM(orders) total_orders, ROUND(SUM(net_revenue_estimate), 2) total_net_revenue
    FROM performance_snapshots GROUP BY owner_type, owner_id, channel ORDER BY total_orders DESC, total_net_revenue DESC LIMIT ?
  `).all(limit);
};
