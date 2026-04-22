const CHANNEL_CONFIG = {
  etsy: { status: 'not_listed', syncStatus: 'not_started', marketplaceLabel: 'Etsy draft' },
  gumroad: { status: 'not_listed', syncStatus: 'not_started', marketplaceLabel: 'Gumroad draft' },
  kdp: { status: 'not_listed', syncStatus: 'not_started', marketplaceLabel: 'KDP candidate' },
};

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

function buildDescriptionLines(sku, channel) {
  return [
    `${sku.title}`,
    `${sku.subtitle}`,
    '',
    `Channel state: ${CHANNEL_CONFIG[channel].marketplaceLabel}`,
    `Use case: ${sentenceCase(sku.useCase)}`,
    `Age band: ${sku.ageBand}`,
    `Theme: ${sentenceCase(sku.theme)}`,
    `Format: ${sentenceCase(sku.formatType)}`,
    `Pages: ${sku.pageCount}`,
    '',
    'What is intended to be included once built:',
    '- Printable activity pack PDF',
    '- Cover page',
    '- Instructions page',
    '- Screen-free games, prompts, and quiet-time activities',
    '',
    'This is a planning draft only. The product is not live and has no marketplace listing yet.',
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
    externalId: null,
    title,
    description: buildDescriptionLines(sku, channel).join('\n'),
    tags: channel === 'etsy' ? buildEtsyTags(sku) : sku.tags,
    price: channel === 'etsy' ? sku.priceEtsy : channel === 'gumroad' ? sku.priceGumroad : sku.priceKdp,
    status: config.status,
    syncStatus: config.syncStatus,
    listingUrl: null,
    channelMetadata: {
      aiDisclosure: true,
      formatType: sku.formatType,
      pageCount: sku.pageCount,
      primaryChannel: channel,
      planningOnly: true,
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
    externalId: null,
    title: bundle.title,
    description: [
      bundle.title,
      bundle.notes || '',
      '',
      `Channel state: ${config.marketplaceLabel}`,
      'Included products once built:',
      ...skus.map((sku) => `- ${sku.title}`),
      '',
      'This is a bundle plan only. It is not live and has no revenue yet.',
    ].join('\n'),
    tags: ['bundle', 'kids printable', 'screen free', 'travel activities', 'busy little happy'],
    price: channel === 'etsy' ? bundle.priceEtsy : channel === 'gumroad' ? bundle.priceGumroad : bundle.priceKdp,
    status: config.status,
    syncStatus: config.syncStatus,
    listingUrl: null,
    channelMetadata: { skuCount: skus.length, bundleType: bundle.bundleType, planningOnly: true },
  };
}
