const FAMILY_DEFS = [
  { id: 'PF_AIRPLANE', slug: 'airplane-activity-pack', title: 'Airplane Activity Pack', niche: 'kids travel printables', useCase: 'airplane', defaultAgeBand: '4-6', theme: 'travel', status: 'planned', description: 'Screen-free printable activities for flights, airport waiting, tray table time, and in-seat boredom.', parentStrategy: 'Travel + wait-time starter shelf', derivativePotentialScore: 92 },
  { id: 'PF_ROADTRIP', slug: 'road-trip-activity-pack', title: 'Road Trip Activity Pack', niche: 'kids travel printables', useCase: 'road trip', defaultAgeBand: '4-6', theme: 'adventure', status: 'planned', description: 'Printable activities for car rides, snack stops, and backseat boredom.', parentStrategy: 'Travel + wait-time starter shelf', derivativePotentialScore: 95 },
  { id: 'PF_RESTAURANT', slug: 'restaurant-placemat-pack', title: 'Restaurant Placemat Pack', niche: 'kids wait-time printables', useCase: 'restaurant', defaultAgeBand: '3-5', theme: 'animals', status: 'planned', description: 'Placemat-style printables that buy 20 to 40 minutes of calm restaurant time.', parentStrategy: 'Everyday wait-time shelf', derivativePotentialScore: 88 },
  { id: 'PF_WAITING', slug: 'waiting-room-pack', title: 'Waiting Room Pack', niche: 'kids wait-time printables', useCase: 'waiting room', defaultAgeBand: '4-6', theme: 'calm', status: 'planned', description: 'Quiet, low-mess printables for appointments, errands, and delays.', parentStrategy: 'Everyday wait-time shelf', derivativePotentialScore: 84 },
  { id: 'PF_HOTEL', slug: 'hotel-quiet-time-pack', title: 'Hotel Quiet-Time Pack', niche: 'kids travel printables', useCase: 'hotel', defaultAgeBand: '4-6', theme: 'travel', status: 'planned', description: 'Printables for hotel downtime, early arrivals, rainy-day rest, and pre-dinner calm.', parentStrategy: 'Travel + downtime shelf', derivativePotentialScore: 81 },
  { id: 'PF_CAMPING', slug: 'camping-activity-pack', title: 'Camping Activity Pack', niche: 'kids outdoor printables', useCase: 'camping', defaultAgeBand: '4-6', theme: 'nature', status: 'planned', description: 'Nature-themed printables for campsite downtime, cabins, and rainy-day outdoor trips.', parentStrategy: 'Seasonal and destination shelf', derivativePotentialScore: 78 },
  { id: 'PF_BEACH', slug: 'beach-day-pack', title: 'Beach Day Pack', niche: 'kids outdoor printables', useCase: 'beach', defaultAgeBand: '4-6', theme: 'ocean', status: 'planned', description: 'Beach-themed printables for travel days, condos, cottages, and off-sand recovery time.', parentStrategy: 'Seasonal and destination shelf', derivativePotentialScore: 77 },
  { id: 'PF_JOURNAL', slug: 'travel-journal-for-kids', title: 'Travel Journal for Kids', niche: 'kids travel journals', useCase: 'travel journal', defaultAgeBand: '6-8', theme: 'travel', status: 'planned', description: 'A guided printable travel journal for memories, checklists, drawing prompts, and trip reflections.', parentStrategy: 'Higher-value printable journal shelf', derivativePotentialScore: 83 },
  { id: 'PF_AIRPORT', slug: 'airport-bingo-pack', title: 'Airport Bingo Pack', niche: 'kids travel printables', useCase: 'airport', defaultAgeBand: '4-6', theme: 'travel', status: 'planned', description: 'Fast, low-page airport and terminal games that work before boarding and during delays.', parentStrategy: 'Travel + wait-time add-on shelf', derivativePotentialScore: 86 },
  { id: 'PF_SCAVENGER', slug: 'road-trip-scavenger-hunt-pack', title: 'Road Trip Scavenger Hunt Pack', niche: 'kids travel printables', useCase: 'road trip scavenger', defaultAgeBand: '6-8', theme: 'adventure', status: 'planned', description: 'High-engagement scavenger pages and visual spotting challenges for longer drives.', parentStrategy: 'Travel + wait-time add-on shelf', derivativePotentialScore: 90 }
];

const VARIANTS = {
  PF_AIRPLANE: [['SKU_AIRPLANE_35_ANIMALS','3-5','animals','mini pack',16,'easy','Gentle flight-time printables',4.49,4.99,7.99],['SKU_AIRPLANE_46_DINOS','4-6','dinosaurs','standard pack',24,'medium','Airplane boredom buster',6.49,6.99,8.99],['SKU_AIRPLANE_68_TRAVEL','6-8','travel','standard pack',30,'medium','Flight games, puzzles, and prompts',7.49,7.99,9.99]],
  PF_ROADTRIP: [['SKU_ROADTRIP_35_TRUCKS','3-5','trucks','mini pack',18,'easy','Big-rig and road sign fun',4.49,4.99,7.99],['SKU_ROADTRIP_46_DINOS','4-6','dinosaurs','standard pack',28,'medium','Road trip games and printable prompts',6.99,7.49,9.49],['SKU_ROADTRIP_68_SPACE','6-8','space','standard pack',32,'medium','Long-drive challenge pack',7.99,8.49,10.49]],
  PF_RESTAURANT: [['SKU_RESTAURANT_35_ANIMALS','3-5','animals','placemat pack',14,'easy','Table-friendly coloring and spotting pages',3.99,4.49,6.99],['SKU_RESTAURANT_46_OCEAN','4-6','ocean','placemat pack',18,'easy','Quiet pages for restaurant waits',4.99,5.49,7.49],['SKU_RESTAURANT_68_NATURE','6-8','nature','placemat pack',20,'medium','Puzzle placemats for older kids',5.49,5.99,7.99]],
  PF_WAITING: [['SKU_WAITING_35_ANIMALS','3-5','animals','mini pack',16,'easy','Quiet pages for appointments',4.49,4.99,7.99],['SKU_WAITING_46_SPACE','4-6','space','standard pack',22,'easy','Waiting room calm-down kit',5.99,6.49,8.49],['SKU_WAITING_68_TRAVEL','6-8','travel','standard pack',24,'medium','Quiet challenge sheets and prompts',6.49,6.99,8.99]],
  PF_HOTEL: [['SKU_HOTEL_35_ANIMALS','3-5','animals','mini pack',18,'easy','Hotel room calm-time printables',4.49,4.99,7.99],['SKU_HOTEL_46_TRAVEL','4-6','travel','standard pack',24,'medium','Quiet-time pack for hotel downtime',6.49,6.99,8.99],['SKU_HOTEL_68_SPACE','6-8','space','standard pack',28,'medium','Rainy day hotel challenge pack',7.49,7.99,9.99]],
  PF_CAMPING: [['SKU_CAMPING_35_NATURE','3-5','nature','mini pack',16,'easy','Cabin and campsite coloring fun',4.49,4.99,7.99],['SKU_CAMPING_46_ANIMALS','4-6','animals','standard pack',22,'easy','Camping bingo and scavenger pages',5.99,6.49,8.49],['SKU_CAMPING_68_ADVENTURE','6-8','adventure','standard pack',26,'medium','Outdoor explorer challenge pack',6.99,7.49,9.49]],
  PF_BEACH: [['SKU_BEACH_35_OCEAN','3-5','ocean','mini pack',16,'easy','Beach and ocean coloring pages',4.49,4.99,7.99],['SKU_BEACH_46_ANIMALS','4-6','animals','standard pack',22,'easy','Beach day printable fun',5.99,6.49,8.49],['SKU_BEACH_68_TRAVEL','6-8','travel','standard pack',26,'medium','Vacation challenge pages for beach trips',6.99,7.49,9.49]],
  PF_JOURNAL: [['SKU_JOURNAL_35_DRAW','3-5','travel','mini journal',14,'easy','Draw-my-trip printable journal',4.49,4.99,7.99],['SKU_JOURNAL_46_MEMORY','4-6','travel','standard journal',22,'easy','Trip memories and drawing prompts',5.99,6.49,8.49],['SKU_JOURNAL_68_EXPLORER','6-8','travel','standard journal',30,'medium','Explorer-style printable travel journal',7.49,7.99,9.99]],
  PF_AIRPORT: [['SKU_AIRPORT_35_BINGO','3-5','travel','mini pack',12,'easy','Simple airport spotting game',3.49,3.99,6.49],['SKU_AIRPORT_46_TRAVEL','4-6','travel','bingo pack',16,'easy','Airport bingo and boarding-time fun',4.49,4.99,7.49],['SKU_AIRPORT_68_CHALLENGE','6-8','adventure','challenge pack',20,'medium','Airport wait challenge sheets',5.49,5.99,7.99]],
  PF_SCAVENGER: [['SKU_SCAVENGER_35_COLORS','3-5','nature','mini hunt',14,'easy','Color-and-find road trip hunt',4.49,4.99,7.99],['SKU_SCAVENGER_46_ROADSIGNS','4-6','vehicles','standard hunt',18,'easy','Road sign and vehicle scavenger set',5.49,5.99,7.99],['SKU_SCAVENGER_68_EXPLORER','6-8','adventure','challenge hunt',24,'medium','Long-drive explorer hunt pack',6.99,7.49,9.49]],
};

const BUNDLES = [
  { id: 'BUNDLE_TRAVEL_STARTER', title: 'Family Travel Starter Bundle', bundleType: '3-pack', channelAvailability: ['etsy', 'gumroad'], priceEtsy: 14.99, priceGumroad: 15.99, priceKdp: null, status: 'planned', notes: 'Best-entry bundle for parents planning a trip this week.', skuIds: ['SKU_AIRPLANE_46_DINOS', 'SKU_ROADTRIP_46_DINOS', 'SKU_AIRPORT_46_TRAVEL'] },
  { id: 'BUNDLE_WAIT_TIME', title: 'Busy Anywhere Bundle', bundleType: 'mega bundle', channelAvailability: ['etsy', 'gumroad'], priceEtsy: 18.99, priceGumroad: 19.99, priceKdp: null, status: 'planned', notes: 'General-purpose boredom-buster bundle for restaurants, waiting rooms, and hotel downtime.', skuIds: ['SKU_RESTAURANT_46_OCEAN', 'SKU_WAITING_46_SPACE', 'SKU_HOTEL_46_TRAVEL'] },
  { id: 'BUNDLE_SUMMER', title: 'Summer Adventure Bundle', bundleType: '3-pack', channelAvailability: ['etsy', 'gumroad'], priceEtsy: 16.99, priceGumroad: 17.99, priceKdp: null, status: 'planned', notes: 'Seasonal bundle for cottages, campsites, and beach travel.', skuIds: ['SKU_BEACH_46_ANIMALS', 'SKU_CAMPING_46_ANIMALS', 'SKU_JOURNAL_46_MEMORY'] }
];

export function getSeedFamilies() {
  return FAMILY_DEFS.map((family) => ({ ...family, tags: [family.useCase, family.theme, 'screen-free', 'printable'] }));
}

export function getSeedSkus() {
  const familyMap = Object.fromEntries(getSeedFamilies().map((family) => [family.id, family]));
  const skus = [];
  for (const [familyId, variants] of Object.entries(VARIANTS)) {
    const family = familyMap[familyId];
    for (const [id, ageBand, theme, formatType, pageCount, difficultyLevel, subtitle, priceEtsy, priceGumroad, priceKdp] of variants) {
      skus.push({
        id,
        productFamilyId: familyId,
        skuCode: id.replace('SKU_', 'BLH-'),
        title: `${family.title} — Ages ${ageBand}`,
        subtitle,
        ageBand,
        useCase: family.useCase,
        theme,
        formatType,
        pageCount,
        difficultyLevel,
        priceEtsy,
        priceGumroad,
        priceKdp,
        status: 'planned',
        qaStatus: 'not_reviewed',
        filePackageStatus: 'not_built',
        notes: `${family.title} for ages ${ageBand}. Theme: ${theme}.`,
        tags: [family.useCase, theme, `ages-${ageBand.replace('-', '')}`, 'screen-free', 'printable'],
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

export function buildSeedPerformanceSnapshots() {
  return [];
}

export function buildSeedDerivativeJobs() {
  return [];
}
