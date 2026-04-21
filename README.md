# Busy Little Happy

Busy Little Happy is a catalog-first digital product business for **screen-free printable activity packs** for kids ages 3–8, optimized for travel and wait-time situations.

This repo contains **Busy Little Happy 1.0**: a local-first React + TypeScript admin prototype that models the catalog, channel listings, performance snapshots, and derivative recommendations for an Etsy-first digital-download business.

## 1.0 scope

This version is intentionally focused on the parts of the business that matter most early:

- product families
- SKU variants
- bundles
- channel listings
- seeded performance snapshots
- derivative recommendations
- launch catalog planning

It does **not** yet include live marketplace APIs, PDF rendering, or automated image generation. Those are next-phase capabilities after the core catalog model proves out.

## Business plan

## Executive summary

This business uses a reusable content-production and catalog-publishing architecture as a **digital product factory** for a narrow, discovery-friendly niche: **screen-free printable activity packs for kids ages 3–8**, focused on travel and wait-time situations.

The first channel is **Etsy digital downloads** because Etsy already supports instant-download products and has a simple marketplace model for discovery-led purchases. Etsy states that core seller fees include a listing fee, a transaction fee, and a payment processing fee. On Etsy Canada, those are presented as roughly **CA$0.27 per listing**, **6.5% transaction fee**, and **3%–4% + CA$0.25** payment processing, with additional fees possible for services such as Offsite Ads. Etsy also supports digital download listings and allows up to **five files** per listing with a **20MB maximum per file**.

The second channel is **Gumroad** for larger bundles and a backup storefront, but not as the primary discovery engine because Gumroad's current pricing is **10% + $0.50** for profile/direct-link sales and **30%** for sales sourced through Gumroad Discover.

The third channel, after product-market fit is visible, is **KDP** for printed activity-book derivatives. KDP requires disclosure of **AI-generated** text, images, or translations, and notes that **activity books** such as puzzle books or coloring books are **generally not treated as low-content books**.

This is not a brand-first business. It is a **catalog-first business** optimized for passive income through platform discovery, low support burden, and SKU multiplication.

## The business

### Business thesis

Parents and caregivers frequently need quick, printable, screen-free ways to keep children occupied during:

- airplane travel
- road trips
- restaurants
- hotel downtime
- waiting rooms
- camping trips
- beach days
- destination travel

These are urgent, highly practical, low-ticket purchase moments. The buyer does not need to know a brand. They need a fast solution.

### Core offer

Downloadable PDF activity packs that can be printed at home in minutes.

### Core promise

**Download in minutes, print at home, keep kids occupied anywhere.**

## Why this niche

### Why it fits the architecture

The architecture is strongest where it can:

- generate large numbers of derivative SKUs from reusable templates
- create bundled assets automatically
- publish across marketplaces
- store and track catalog items with metadata
- identify winners and produce sequels or variants

This niche fits that perfectly because each core product can be multiplied across:

- situation: airplane, road trip, restaurant, waiting room
- age band: 3–5, 4–6, 6–8
- theme: dinosaurs, space, animals, ocean, nature, vehicles
- geography: Japan trip, beach trip, zoo trip, museum trip
- packaging: mini pack, standard pack, mega bundle, seasonal bundle

### Why not lead with kids books

Children's books have a higher perceived quality bar, more intense illustration consistency requirements, and weaker discovery economics for a catalog-first business. KDP is still valuable later for printed derivatives, but it is better used after discovering which themes and mechanics already sell through digital downloads.

### Why not lead with Gumroad

Gumroad is useful, but its economics are worse for marketplace-driven discovery than Etsy if the sale originates on Gumroad Discover.

## Customer

### Primary customer

- parents of kids ages 3–8
- grandparents buying for trips or outings
- caregivers needing a fast, low-cost activity solution

### Purchase context

- imminent flight or drive
- restaurant visit
- appointment / waiting room
- vacation downtime
- school break / holiday travel

### Buying criteria

- instant delivery
- visually clean
- age-appropriate
- actually useful in the situation
- low price
- printable without hassle

## Product strategy

### Launch product shelf

1. Airplane Activity Pack
2. Road Trip Activity Pack
3. Restaurant Placemat Pack
4. Waiting Room Activity Pack
5. Hotel Quiet-Time Pack
6. Camping Activity Pack
7. Beach Day Activity Pack
8. Travel Journal for Kids
9. Airport Bingo Pack
10. Road Trip Scavenger Hunt Pack

### Variant strategy

Each family can be multiplied by:

- age band: 3–5, 4–6, 6–8
- theme overlay: dinosaurs, space, animals, fairy-like original themes, trucks, ocean
- bundle type: single, 3-pack, mega bundle

### Product contents

Typical pack components:

- mazes
- coloring pages
- picture search
- I Spy pages
- bingo
- scavenger hunts
- drawing prompts
- travel journals
- simple counting or matching games
- spot-the-difference
- checklists
- trivia/fact pages where relevant

### Packaging rules

Each product should include:

- printable PDF
- cover image
- preview images/mockups
- listing description
- keyword/tag set
- instructions page
- optional ZIP output if needed for multi-file delivery

## Channel strategy

### Phase 1 — Etsy

Etsy is the primary channel because:

- it supports digital instant downloads
- listing and transaction economics are manageable
- buyer discovery already exists for printable family and kids products
- the business can start with very low upfront cash

### Phase 2 — Gumroad

Use Gumroad for:

- larger bundles
- backup storefront
- direct-link sales if traffic ever comes from social, newsletters, or communities

### Phase 3 — KDP

Use KDP only when specific themes prove demand. Printed derivatives could include:

- travel activity books
- waiting room workbooks
- vacation journals
- theme-specific activity books

## Economics

### Price ladder

Suggested initial pricing:

- mini packs: **CA$2.99–4.49**
- standard packs: **CA$5.99–7.99**
- 3-pack bundles: **CA$12.99–15.99**
- mega bundles: **CA$16.99–18.99**

### Practical monthly outcome model

Use a blended contribution estimate of roughly **CA$5.50–8.50 per order** depending on product mix:

- 50 orders/month → roughly **CA$275–425**
- 100 orders/month → roughly **CA$550–850**
- 250 orders/month → roughly **CA$1,375–2,125**
- 500 orders/month → roughly **CA$2,750–4,250**

This should be treated as a **catalog side business**. The realistic first milestone is several hundred dollars a month, not immediate replacement income.

## What 1.0 includes

- 10 seeded product families
- 30 seeded SKUs
- 3 seeded bundles
- channel listing builders for Etsy, Gumroad, and KDP
- seeded performance snapshots
- derivative recommendation logic
- launch catalog dashboard views

## Repo structure

```text
src/
  core/
    catalog/
      derivatives.ts
      metrics.ts
      seed.ts
      types.ts
    listings/
      channels.ts
  niches/
    kidsTravel/
      strategy.ts
  App.tsx
  main.tsx
  styles.css
```

## Local development

```bash
npm install
npm run dev
```

## Next steps

- PDF rendering pipeline
- asset generation pipeline
- listing export pipeline
- Etsy CSV/export adapters
- Gumroad product export
- KDP derivative manuscript builder
- persistent storage
- operator authentication

## Source assumptions used in this plan

- Etsy fee policy and seller flow: https://www.etsy.com/legal/fees/ and https://www.etsy.com/ca/sell
- Etsy digital listing limits: https://help.etsy.com/hc/en-us/articles/115015628347-How-to-Manage-Your-Digital-Listings
- Gumroad pricing: https://gumroad.com/pricing
- KDP AI-generated content guidance: https://kdp.amazon.com/help/topic/G200672390
- KDP activity / low-content guidance: https://kdp.amazon.com/help/topic/GGE5T76TWKA85DJM
