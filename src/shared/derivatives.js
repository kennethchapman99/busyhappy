function groupBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function safeRate(numerator, denominator) {
  if (!numerator || !denominator) return 0;
  return numerator / denominator;
}

export function buildDerivativeOpportunities({ families, skus, bundles, snapshots, derivativeJobs = [] }) {
  const byOwner = {};
  for (const snap of snapshots) byOwner[`${snap.ownerType}:${snap.ownerId}`] = snap;

  const skuByFamily = groupBy(skus, (sku) => sku.productFamilyId);
  const opportunities = [];

  for (const family of families) {
    const familySkus = skuByFamily[family.id] || [];
    const ranked = familySkus
      .map((sku) => ({ sku, snap: byOwner[`sku:${sku.id}`] }))
      .filter((item) => item.snap)
      .sort((a, b) => (b.snap.orders || 0) - (a.snap.orders || 0));

    const totalOrders = ranked.reduce((sum, item) => sum + (item.snap.orders || 0), 0);
    const avgConversion = ranked.length
      ? ranked.reduce((sum, item) => sum + safeRate(item.snap.conversions, item.snap.clicks), 0) / ranked.length
      : 0;

    const hasBundle = bundles.some((bundle) => (bundle.skuIds || []).some((skuId) => familySkus.some((sku) => sku.id === skuId)));
    const themes = new Set(familySkus.map((sku) => sku.theme));

    if (ranked[0] && ranked[0].snap.orders >= 20) {
      opportunities.push({
        id: `OPP_${family.id}_KDP`,
        sourceOwnerType: 'family',
        sourceOwnerId: family.id,
        derivativeType: 'kdp_print_edition',
        priority: 98,
        headline: `${family.title} is ready for a KDP print edition`,
        why: `${ranked[0].sku.title} has ${ranked[0].snap.orders} Etsy orders with a ${Math.round(avgConversion * 100)}% average click-to-conversion rate across the family.`,
        recommendedOutput: `${family.title} — Print Activity Book`,
      });
    }

    if (!hasBundle && totalOrders >= 18) {
      opportunities.push({
        id: `OPP_${family.id}_BUNDLE`,
        sourceOwnerType: 'family',
        sourceOwnerId: family.id,
        derivativeType: 'family_bundle',
        priority: 90,
        headline: `${family.title} deserves a dedicated family bundle`,
        why: `The family has ${totalOrders} cumulative Etsy orders but is only being sold as single SKUs.`,
        recommendedOutput: `${family.title} Mega Bundle`,
      });
    }

    if (themes.size < 4 && totalOrders >= 12) {
      opportunities.push({
        id: `OPP_${family.id}_THEME`,
        sourceOwnerType: 'family',
        sourceOwnerId: family.id,
        derivativeType: 'theme_variant',
        priority: 82,
        headline: `${family.title} has room for more themes`,
        why: `Current coverage is only ${themes.size} themes. Stronger families should expand into new characters and seasonal overlays.`,
        recommendedOutput: `${family.title} — new theme variants`,
      });
    }

    if (family.useCase.includes('road trip') && totalOrders >= 15) {
      opportunities.push({
        id: `OPP_${family.id}_DESTINATION`,
        sourceOwnerType: 'family',
        sourceOwnerId: family.id,
        derivativeType: 'destination_variant',
        priority: 80,
        headline: `${family.title} can stretch into destination-specific variants`,
        why: 'Road trip and travel products translate naturally into beach, zoo, museum, and national park versions.',
        recommendedOutput: `${family.title} — destination spin-offs`,
      });
    }
  }

  for (const bundle of bundles) {
    const snap = byOwner[`bundle:${bundle.id}`];
    if (snap && snap.orders >= 8 && !(bundle.channelAvailability || []).includes('kdp')) {
      opportunities.push({
        id: `OPP_${bundle.id}_PRINT`,
        sourceOwnerType: 'bundle',
        sourceOwnerId: bundle.id,
        derivativeType: 'printed_companion',
        priority: 74,
        headline: `${bundle.title} may support a printed companion edition`,
        why: `The bundle already has ${snap.orders} Etsy orders and can graduate into a workbook or printed planner.`,
        recommendedOutput: `${bundle.title} — printed workbook`,
      });
    }
  }

  const existingSuggestedKeys = new Set(
    derivativeJobs.filter((job) => job.jobStatus === 'suggested').map((job) => `${job.sourceOwnerType}:${job.sourceOwnerId}:${job.derivativeType}`)
  );

  return opportunities
    .filter((opp) => !existingSuggestedKeys.has(`${opp.sourceOwnerType}:${opp.sourceOwnerId}:${opp.derivativeType}`))
    .sort((a, b) => b.priority - a.priority);
}
