const CHANNEL_CONFIG = {
  etsy: { status: 'live', syncStatus: 'seeded', urlBase: 'https://www.etsy.com/listing/' },
  gumroad: { status: 'draft', syncStatus: 'planned', urlBase: 'https://busy-little-happy.gumroad.com/l/' },
  kdp: { status: 'candidate', syncStatus: 'planned', urlBase: 'https://kdp.amazon.com/en_US/bookshelf' },
};

function toSlug(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function sentenceCase(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}

function buildEtsyTags(sku) {
  const tags = [
    `${sku.useCase} printable`,
    `kids ${sku.useCase}`,
    `ages ${sku.ageBand}`,
    `${sku.theme} activity`,
    'screen free kids',
    'travel printable',
    'busy little happy',
  ];
  return [...new Set(tags.map((tag) => tag.slice(0, 20)))].slice(0, 13);
}

function buildDescriptionLines(sku) {
  return [
    `${sku.title}`,
    `${sku.subtitle}`,
    '',
    `Use case: ${sentenceCase(sku.useCase)}`,
    `Age band: ${sku.ageBand}`,
    `Theme: ${sentenceCase(sku.theme)}`,
    `Format: ${sentenceCase(sku.formatType)}`,
    `Pages: ${sku.pageCount}`,
    '',
    'What is included:',
    '- Printable PDF activity pack',
    '- Cover page',
    '- Instructions page',
    '- Screen-free games, prompts, and quiet-time activities',
    '',
    'AI disclosure: Listing copy and illustrations may be AI-assisted and are reviewed before publishing.',
  ];
}

export function buildSkuListing(sku, channel) {
  const config = CHANNEL_CONFIG[channel];
  const listingId = `${channel.toUpperCase()}_${sku.id}`;
  const title = channel === 'kdp'
    ? `${sku.title}: Printable Activity Book for Kids ${sku.ageBand}`
    : `${sku.title} | ${sentenceCase(sku.useCase)} Printable | ${sentenceCase(sku.theme)} Theme`;

  return {
    id: listingId,
    ownerType: 'sku',
    ownerId: sku.id,
    channel,
    externalId: listingId,
    title,
    description: buildDescriptionLines(sku).join('\n'),
    tags: channel === 'etsy' ? buildEtsyTags(sku) : sku.tags,
    price: channel === 'etsy' ? sku.priceEtsy : channel === 'gumroad' ? sku.priceGumroad : sku.priceKdp,
    status: config.status,
    syncStatus: config.syncStatus,
    listingUrl: `${config.urlBase}${toSlug(title)}`,
    channelMetadata: {
      aiDisclosure: true,
      formatType: sku.formatType,
      pageCount: sku.pageCount,
      primaryChannel: channel,
    },
  };
}

export function buildBundleListing(bundle, skus, channel) {
  const config = CHANNEL_CONFIG[channel];
  const listingId = `${channel.toUpperCase()}_${bundle.id}`;
  return {
    id: listingId,
    ownerType: 'bundle',
    ownerId: bundle.id,
    channel,
    externalId: listingId,
    title: bundle.title,
    description: [
      bundle.title,
      bundle.notes || '',
      '',
      'Included products:',
      ...skus.map((sku) => `- ${sku.title}`),
      '',
      'Primary value:',
      '- Lower cost per pack',
      '- Faster purchase decision',
      '- Better giftable and travel-planning offer',
    ].join('\n'),
    tags: ['bundle', 'kids printable', 'screen free', 'travel activities', 'busy little happy'],
    price: channel === 'etsy' ? bundle.priceEtsy : channel === 'gumroad' ? bundle.priceGumroad : bundle.priceKdp,
    status: config.status,
    syncStatus: config.syncStatus,
    listingUrl: `${config.urlBase}${toSlug(bundle.title)}`,
    channelMetadata: { skuCount: skus.length, bundleType: bundle.bundleType },
  };
}
