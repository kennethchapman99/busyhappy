const FAMILY_DEFS = [
  { id: 'PF_AIRPLANE', slug: 'airplane-activity-pack', title: 'Airplane Activity Pack', niche: 'kids travel printables', useCase: 'airplane', defaultAgeBand: '4-6', theme: 'travel', status: 'launch', description: 'Screen-free printable activities for flights, airport waiting, tray table time, and in-seat boredom.', parentStrategy: 'Travel + wait-time starter shelf', derivativePotentialScore: 92 },
  { id: 'PF_ROADTRIP', slug: 'road-trip-activity-pack', title: 'Road Trip Activity Pack', niche: 'kids travel printables', useCase: 'road trip', defaultAgeBand: '4-6', theme: 'adventure', status: 'launch', description: 'Printable activities for car rides, snack stops, and backseat boredom.', parentStrategy: 'Travel + wait-time starter shelf', derivativePotentialScore: 95 },
  { id: 'PF_RESTAURANT', slug: 'restaurant-placemat-pack', title: 'Restaurant Placemat Pack', niche: 'kids wait-time printables', useCase: 'restaurant', defaultAgeBand: '3-5', theme: 'animals', status: 'launch', description: 'Placemat-style printables that buy 20 to 40 minutes of calm restaurant time.', parentStrategy: 'Everyday wait-time shelf', derivativePotentialScore: 88 },
  { id: 'PF_WAITING', slug: 'waiting-room-pack', title: 'Waiting Room Pack', niche: 'kids wait-time printables', useCase: 'waiting room', defaultAgeBand: '4-6', theme: 'calm', status: 'launch', description: 'Quiet, low-mess printables for appointments, errands, and delays.', parentStrategy: 'Everyday wait-time shelf', derivativePotentialScore: 84 },
  { id: 'PF_HOTEL', slug: 'hotel-quiet-time-pack', title: 'Hotel Quiet-Time Pack', niche: 'kids travel printables', useCase: 'hotel', defaultAgeBand: '4-6', theme: 'travel', status: 'launch', description: 'Printables for hotel downtime, early arrivals, rainy-day rest, and pre-dinner calm.', parentStrategy: 'Travel + downtime shelf', derivativePotentialScore: 81 },
  { id: 'PF_CAMPING', slug: 'camping-activity-pack', title: 'Camping Activity Pack', niche: 'kids outdoor printables', useCase: 'camping', defaultAgeBand: '4-6', theme: 'nature', status: 'launch', description: 'Nature-themed printables for campsite downtime, cabins, and rainy-day outdoor trips.', parentStrategy: 'Seasonal and destination shelf', derivativePotentialScore: 78 },
  { id: 'PF_BEACH', slug: 'beach-day-pack', title: 'Beach Day Pack', niche: 'kids outdoor printables', useCase: 'beach', defaultAgeBand: '4-6', theme: 'ocean', status: 'launch', description: 'Beach-themed printables for travel days, condos, cottages, and off-sand recovery time.', parentStrategy: 'Seasonal and destination shelf', derivativePotentialScore: 77 },
  { id: 'PF_JOURNAL', slug: 'travel-journal-for-kids', title: 'Travel Journal for Kids', niche: 'kids travel journals', useCase: 'travel journal', defaultAgeBand: '6-8', theme: 'travel', status: 'launch', description: 'A guided printable travel journal for memories, checklists, drawing prompts, and trip reflections.', parentStrategy: 'Higher-value printable journal shelf', derivativePotentialScore: 83 },
  { id: 'PF_AIRPORT', slug: 'airport-bingo-pack', title: 'Airport Bingo Pack', niche: 'kids travel printables', useCase: 'airport', defaultAgeBand: '4-6', theme: 'travel', status: 'launch', description: 'Fast, low-page airport and terminal games that work before boarding and during delays.', parentStrategy: 'Travel + wait-time add-on shelf', derivativePotentialScore: 86 },
  { id: 'PF_SCAVENGER', slug: 'road-trip-scavenger-hunt-pack', title: 'Road Trip Scavenger Hunt Pack', niche: 'kids travel printables', useCase: 'road trip scavenger', defaultAgeBand: '6-8', theme: 'adventure', status: 'launch', description: 'High-engagement scavenger pages and visual spotting challenges for longer drives.', parentStrategy: 'Travel + wait-time add-on shelf', derivativePotentialScore: 90 }
];

const SKU_VARIANTS = {
  PF_AIRPLANE: [
    { id: 'SKU_AIRPLANE_35_ANIMALS', ageBand: '3-5', theme: 'animals', formatType: 'mini pack', pageCount: 16, difficultyLevel: 'easy', subtitle: 'Gentle flight-time printables', priceEtsy: 4.49, priceGumroad: 4.99, priceKdp: 7.99 },
    { id: 'SKU_AIRPLANE_46_DINOS', ageBand: '4-6', theme: 'dinosaurs', formatType: 'standard pack', pageCount: 24, difficultyLevel: 'medium', subtitle: 'Airplane boredom buster', priceEtsy: 6.49, priceGumroad: 6.99, priceKdp: 8.99 },
    { id: 'SKU_AIRPLANE_68_TRAVEL', ageBand: '6-8', theme: 'travel', formatType: 'standard pack', pageCount: 30, difficultyLevel: 'medium', subtitle: 'Flight games, puzzles, and prompts', priceEtsy: 7.49, priceGumroad: 7.99, priceKdp: 9.99 }
  ],
  PF_ROADTRIP: [
    { id: 'SKU_ROADTRIP_35_TRUCKS', ageBand: '3-5', theme: 'trucks', formatType: 'mini pack', pageCount: 18, difficultyLevel: 'easy', subtitle: 'Big-rig and road sign fun', priceEtsy: 4.49, priceGumroad: 4.99, priceKdp: 7.99 },
    { id: 'SKU_ROADTRIP_46_DINOS', ageBand: '4-6', theme: 'dinosaurs', formatType: 'standard pack', pageCount: 28, difficultyLevel: 'medium', subtitle: 'Road trip games and printable prompts', priceEtsy: 6.99, priceGumroad: 7.49, priceKdp: 9.49 },
    { id: 'SKU_ROADTRIP_68_SPACE', ageBand: '6-8', theme: 'space', formatType: 'standard pack', pageCount: 32, difficultyLevel: 'medium', subtitle: 'Long-drive challenge pack', priceEtsy: 7.99, priceGumroad: 8.49, priceKdp: 10.49 }
  ],
  PF_RESTAURANT: [
    { id: 'SKU_RESTAURANT_35_ANIMALS', ageBand: '3-5', theme: 'animals', formatType: 'placemat pack', pageCount: 14, difficultyLevel: 'easy', subtitle: 'Table-friendly coloring and spotting pages', priceEtsy: 3.99, priceGumroad: 4.49, priceKdp: 6.99 },
    { id: 'SKU_RESTAURANT_46_OCEAN', ageBand: '4-6', theme: 'ocean', formatType: 'placemat pack', pageCount: 18, difficultyLevel: 'easy', subtitle: 'Quiet pages for restaurant waits', priceEtsy: 4.99, priceGumroad: 5.49, priceKdp: 7.49 },
    { id: 'SKU_RESTAURANT_68_NATURE', ageBand: '6-8', theme: 'nature', formatType: 'placemat pack', pageCount: 20, difficultyLevel: 'medium', subtitle: 'Puzzle placemats for older kids', priceEtsy: 5.49, priceGumroad: 5.99, priceKdp: 7.99 }
  ],
  PF_WAITING: [
    { id: 'SKU_WAITING_35_ANIMALS', ageBand: '3-5', theme: 'animals', formatType: 'mini pack', pageCount: 16, difficultyLevel: 'easy', subtitle: 'Quiet pages for appointments', priceEtsy: 4.49, priceGumroad: 4.99, priceKdp: 7.99 },
    { id: 'SKU_WAITING_46_SPACE', ageBand: '4-6', theme: 'space', formatType: 'standard pack', pageCount: 22, difficultyLevel: 'easy', subtitle: 'Waiting room calm-down kit', priceEtsy: 5.99, priceGumroad: 6.49, priceKdp: 8.49 },
    { id: 'SKU_WAITING_68_TRAVEL', ageBand: '6-8', theme: 'travel', formatType: 'standard pack', pageCount: 24, difficultyLevel: 'medium', subtitle: 'Quiet challenge sheets and prompts', priceEtsy: 6.49, priceGumroad: 6.99, priceKdp: 8.99 }
  ],
  PF_HOTEL: [
    { id: 'SKU_HOTEL_35_ANIMALS', ageBand: '3-5', theme: 'animals', formatType: 'mini pack', pageCount: 18, difficultyLevel: 'easy', subtitle: 'Hotel room calm-time printables', priceEtsy: 4.49, priceGumroad: 4.99, priceKdp: 7.99 },
    { id: 'SKU_HOTEL_46_TRAVEL', ageBand: '4-6', theme: 'travel', formatType: 'standard pack', pageCount: 24, difficultyLevel: 'medium', subtitle: 'Quiet-time pack for hotel downtime', priceEtsy: 6.49, priceGumroad: 6.99, priceKdp: 8.99 },
    { id: 'SKU_HOTEL_68_SPACE', ageBand: '6-8', theme: 'space', formatType: 'standard pack', pageCount: 28, difficultyLevel: 'medium', subtitle: 'Rainy day hotel challenge pack', priceEtsy: 7.49, priceGumroad: 7.99, priceKdp: 9.99 }
  ],
  PF_CAMPING: [
    { id: 'SKU_CAMPING_35_NATURE', ageBand: '3-5', theme: 'nature', formatType: 'mini pack', pageCount: 16, difficultyLevel: 'easy', subtitle: 'Cabin and campsite coloring fun', priceEtsy: 4.49, priceGumroad: 4.99, priceKdp: 7.99 },
    { id: 'SKU_CAMPING_46_ANIMALS', ageBand: '4-6', theme: 'animals', formatType: 'standard pack', pageCount: 22, difficultyLevel: 'easy', subtitle: 'Camping bingo and scavenger pages', priceEtsy: 5.99, priceGumroad: 6.49, priceKdp: 8.49 },
    { id: 'SKU_CAMPING_68_ADVENTURE', ageBand: '6-8', theme: 'adventure', formatType: 'standard pack', pageCount: 26, difficultyLevel: 'medium', subtitle: 'Outdoor explorer challenge pack', priceEtsy: 6.99, priceGumroad: 7.49, priceKdp: 9.49 }
  ],
  PF_BEACH: [
    { id: 'SKU_BEACH_35_OCEAN', ageBand: '3-5', theme: 'ocean', formatType: 'mini pack', pageCount: 16, difficultyLevel: 'easy', subtitle: 'Beach and ocean coloring pages', priceEtsy: 4.49, priceGumroad: 4.99, priceKdp: 7.99 },
    { id: 'SKU_BEACH_46_ANIMALS', ageBand: '4-6', theme: 'animals', formatType: 'standard pack', pageCount: 22, difficultyLevel: 'easy', subtitle: 'Beach day printable fun', priceEtsy: 5.99, priceGumroad: 6.49, priceKdp: 8.49 },
    { id: 'SKU_BEACH_68_TRAVEL', ageBand: '6-8', theme: 'travel', formatType: 'standard pack', pageCount: 26, difficultyLevel: 'medium', subtitle: 'Vacation challenge pages for beach trips', priceEtsy: 6.99, priceGumroad: 7.49, priceKdp: 9.49 }
  ],
  PF_JOURNAL: [
    { id: 'SKU_JOURNAL_35_DRAW', ageBand: '3-5', theme: 'travel', formatType: 'mini journal', pageCount: 14, difficultyLevel: 'easy', subtitle: 'Draw-my-trip printable journal', priceEtsy: 4.49, priceGumroad: 4.99, priceKdp: 7.99 },
    { id: 'SKU_JOURNAL_46_MEMORY', ageBand: '4-6', theme: 'travel', formatType: 'standard journal', pageCount: 22, difficultyLevel: 'easy', subtitle: 'Trip memories and drawing prompts', priceEtsy: 5.99, priceGumroad: 6.49, priceKdp: 8.49 },
    { id: 'SKU_JOURNAL_68_EXPLORER', ageBand: '6-8', theme: 'travel', formatType: 'standard journal', pageCount: 30, difficultyLevel: 'medium', subtitle: 'Explorer-style printable travel journal', priceEtsy: 7.49, priceGumroad: 7.99, priceKdp: 9.99 }
  ],
  PF_AIRPORT: [
    { id: 'SKU_AIRPORT_35_BINGO', ageBand: '3-5', theme: 'travel', formatType: 'mini pack', pageCount: 12, difficultyLevel: 'easy', subtitle: 'Simple airport spotting game', priceEtsy: 3.49, priceGumroad: 3.99, priceKdp: 6.49 },
    { id: 'SKU_AIRPORT_46_TRAVEL', ageBand: '4-6', theme: 'travel', formatType: 'bingo pack', pageCount: 16, difficultyLevel: 'easy', subtitle: 'Airport bingo and boarding-time fun', priceEtsy: 4.49, priceGumroad: 4.99, priceKdp: 7.49 },
    { id: 'SKU_AIRPORT_68_CHALLENGE', ageBand: '6-8', theme: 'adventure', formatType: 'challenge pack', pageCount: 20, difficultyLevel: 'medium', subtitle: 'Airport wait challenge sheets', priceEtsy: 5.49, priceGumroad: 5.99, priceKdp: 7.99 }
  ],
  PF_SCAVENGER: [
    { id: 'SKU_SCAVENGER_35_COLORS', ageBand: '3-5', theme: 'nature', formatType: 'mini hunt', pageCount: 14, difficultyLevel: 'easy', subtitle: 'Color-and-find road trip hunt', priceEtsy: 4.49, priceGumroad: 4.99, priceKdp: 7.99 },
    { id: 'SKU_SCAVENGER_46_ROADSIGNS', ageBand: '4-6', theme: 'vehicles', formatType: 'standard hunt', pageCount: 18, difficultyLevel: 'easy', subtitle: 'Road sign and vehicle scavenger set', priceEtsy: 5.49, priceGumroad: 5.99, priceKdp: 7.99 },
    { id: 'SKU_SCAVENGER_68_EXPLORER', ageBand: '6-8', theme: 'adventure', formatType: 'challenge hunt', pageCount: 24, difficultyLevel: 'medium', subtitle: 'Long-drive explorer hunt pack', priceEtsy: 6.99, priceGumroad: 7.49, priceKdp: 9.49 }
  ]
};

const BUNDLES = [
  { id: 'BUNDLE_TRAVEL_STARTER', title: 'Family Travel Starter Bundle', bundleType: '3-pack', channelAvailability: ['etsy', 'gumroad'], priceEtsy: 14.99, priceGumroad: 15.99, priceKdp: null, status: 'launch', notes: 'Best-entry bundle for parents planning a trip this week.', skuIds: ['SKU_AIRPLANE_46_DINOS', 'SKU_ROADTRIP_46_DINOS', 'SKU_AIRPORT_46_TRAVEL'] },
  { id: 'BUNDLE_WAIT_TIME', title: 'Busy Anywhere Bundle', bundleType: 'mega bundle', channelAvailability: ['etsy', 'gumroad'], priceEtsy: 18.99, priceGumroad: 19.99, priceKdp: null, status: 'launch', notes: 'General-purpose boredom-buster bundle for restaurants, waiting rooms, and hotel downtime.', skuIds: ['SKU_RESTAURANT_46_OCEAN', 'SKU_WAITING_46_SPACE', 'SKU_HOTEL_46_TRAVEL'] },
  { id: 'BUNDLE_SUMMER', title: 'Summer Adventure Bundle', bundleType: '3-pack', channelAvailability: ['etsy', 'gumroad'], priceEtsy: 16.99, priceGumroad: 17.99, priceKdp: null, status: 'launch', notes: 'Seasonal bundle for cottages, campsites, and beach travel.', skuIds: ['SKU_BEACH_46_ANIMALS', 'SKU_CAMPING_46_ANIMALS', 'SKU_JOURNAL_46_MEMORY'] }
];

const BASE_METRICS = {
  SKU_AIRPLANE_46_DINOS: { impressions: 1820, clicks: 146, favorites: 28, conversions: 21, orders: 18, grossRevenue: 116.82, netRevenueEstimate: 95.2, refundCount: 0, ratingAvg: 4.9, reviewCount: 9 },
  SKU_AIRPLANE_68_TRAVEL: { impressions: 2140, clicks: 168, favorites: 36, conversions: 27, orders: 22, grossRevenue: 164.78, netRevenueEstimate: 132.7, refundCount: 1, ratingAvg: 4.8, reviewCount: 12 },
  SKU_ROADTRIP_46_DINOS: { impressions: 2480, clicks: 201, favorites: 41, conversions: 33, orders: 29, grossRevenue: 202.71, netRevenueEstimate: 161.54, refundCount: 0, ratingAvg: 4.9, reviewCount: 14 },
  SKU_RESTAURANT_35_ANIMALS: { impressions: 1660, clicks: 152, favorites: 39, conversions: 24, orders: 20, grossRevenue: 79.8, netRevenueEstimate: 64.9, refundCount: 0, ratingAvg: 5.0, reviewCount: 16 },
  BUNDLE_TRAVEL_STARTER: { impressions: 720, clicks: 66, favorites: 19, conversions: 13, orders: 11, grossRevenue: 164.89, netRevenueEstimate: 133.3, refundCount: 0, ratingAvg: 4.9, reviewCount: 5 }
};

export function getSeedFamilies() {
  return FAMILY_DEFS.map((family) => ({ ...family, tags: [family.useCase, family.theme, 'screen-free', 'printable'] }));
}

export function getSeedSkus() {
  const familyMap = Object.fromEntries(getSeedFamilies().map((family) => [family.id, family]));
  const skus = [];
  for (const [familyId, variants] of Object.entries(SKU_VARIANTS)) {
    const family = familyMap[familyId];
    for (const variant of variants) {
      skus.push({
        id: variant.id,
        productFamilyId: familyId,
        skuCode: variant.id.replace('SKU_', 'BLH-'),
        title: `${family.title} — Ages ${variant.ageBand}`,
        subtitle: variant.subtitle,
        ageBand: variant.ageBand,
        useCase: family.useCase,
        theme: variant.theme,
        formatType: variant.formatType,
        pageCount: variant.pageCount,
        difficultyLevel: variant.difficultyLevel,
        priceEtsy: variant.priceEtsy,
        priceGumroad: variant.priceGumroad,
        priceKdp: variant.priceKdp,
        status: 'ready',
        qaStatus: 'approved',
        filePackageStatus: 'packaged',
        notes: `${family.title} for ages ${variant.ageBand}. Theme: ${variant.theme}.`,
        tags: [family.useCase, variant.theme, `ages-${variant.ageBand.replace('-', '')}`, 'screen-free', 'printable']
      });
    }
  }
  return skus;
}

export function getSeedBundles() {
  return BUNDLES.map((bundle) => ({ ...bundle }));
}

export function buildSeedListings(families, skus, bundles, helpers) {
  const listings = [];
  skus.forEach((sku) => {
    listings.push(helpers.buildSkuListing(sku, 'etsy'));
    listings.push(helpers.buildSkuListing(sku, 'gumroad'));
  });
  bundles.forEach((bundle) => {
    const bundleSkus = skus.filter((sku) => bundle.skuIds.includes(sku.id));
    listings.push(helpers.buildBundleListing(bundle, bundleSkus, 'etsy'));
    listings.push(helpers.buildBundleListing(bundle, bundleSkus, 'gumroad'));
  });
  ['SKU_AIRPLANE_68_TRAVEL', 'SKU_ROADTRIP_46_DINOS', 'SKU_JOURNAL_68_EXPLORER'].forEach((skuId) => {
    const sku = skus.find((item) => item.id === skuId);
    if (sku) listings.push(helpers.buildSkuListing(sku, 'kdp'));
  });
  return listings;
}

export function buildSeedPerformanceSnapshots(skus, bundles) {
  const snapshots = [];
  const today = new Date().toISOString().slice(0, 10);
  for (const sku of skus) {
    const metrics = BASE_METRICS[sku.id] || { impressions: 520, clicks: 34, favorites: 6, conversions: 4, orders: 3, grossRevenue: +(sku.priceEtsy * 3).toFixed(2), netRevenueEstimate: +(sku.priceEtsy * 2.4).toFixed(2), refundCount: 0, ratingAvg: 4.7, reviewCount: 1 };
    snapshots.push({ id: `SNAP_${sku.id}`, ownerType: 'sku', ownerId: sku.id, channel: 'etsy', snapshotDate: today, ...metrics, notes: 'Seeded launch performance snapshot' });
  }
  for (const bundle of bundles) {
    const metrics = BASE_METRICS[bundle.id] || { impressions: 300, clicks: 22, favorites: 4, conversions: 3, orders: 2, grossRevenue: +(bundle.priceEtsy * 2).toFixed(2), netRevenueEstimate: +(bundle.priceEtsy * 1.55).toFixed(2), refundCount: 0, ratingAvg: 4.8, reviewCount: 1 };
    snapshots.push({ id: `SNAP_${bundle.id}`, ownerType: 'bundle', ownerId: bundle.id, channel: 'etsy', snapshotDate: today, ...metrics, notes: 'Seeded bundle performance snapshot' });
  }
  return snapshots;
}

export function buildSeedDerivativeJobs() {
  return [
    { id: 'DJ_TRAVEL_STARTER_KDP', sourceOwnerType: 'sku', sourceOwnerId: 'SKU_ROADTRIP_46_DINOS', derivativeType: 'kdp_print_edition', ruleTriggeredBy: 'High Etsy conversion with strong review density', jobStatus: 'suggested', outputOwnerIds: [], notes: 'Road trip pack has the strongest balance of traffic and conversion. Likely first KDP candidate.' },
    { id: 'DJ_RESTAURANT_THEME_EXPANSION', sourceOwnerType: 'family', sourceOwnerId: 'PF_RESTAURANT', derivativeType: 'theme_variant', ruleTriggeredBy: 'Strong conversion from younger buyers suggests more character themes could work', jobStatus: 'suggested', outputOwnerIds: [], notes: 'Recommend adding unicorn/fairy-adjacent original theme and a vehicle theme.' }
  ];
}
