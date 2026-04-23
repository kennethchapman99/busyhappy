function byAge(ageBand) {
  if (ageBand === '3-5') return { lines: 1, words: 'very short', difficulty: 'simple' };
  if (ageBand === '4-6') return { lines: 2, words: 'short', difficulty: 'moderate' };
  return { lines: 3, words: 'short to medium', difficulty: 'more challenging' };
}

function makePage(pageNumber, type, title, instructions, body) {
  return { pageNumber, type, title, instructions, body };
}

export function generateMaterialPackage({ sku, family }) {
  const age = byAge(sku.ageBand);
  const theme = sku.theme || 'travel';
  const useCase = family.useCase || sku.useCase || 'travel';

  const pages = [
    makePage(1, 'cover', sku.title, `Create a strong printable cover for a ${useCase} pack themed around ${theme}.`, [
      `Ages ${sku.ageBand}`,
      sku.subtitle || 'Screen-free printable fun',
      `Made for ${useCase} time`,
    ]),
    makePage(2, 'instructions', 'How to use this pack', `Write instructions a tired parent can use in 10 seconds.`, [
      'Print only the pages you need',
      'Use the first page immediately',
      'Save a few pages for later in the trip or wait',
      'Use pencil, pen, or crayons',
    ]),
    makePage(3, 'search', `${theme} find and circle`, `Create a ${age.difficulty} picture-search page.`, [
      `Find and circle 8 ${theme} items`,
      'Color your favorite one',
      'Count how many you found',
    ]),
    makePage(4, 'maze', `${theme} maze`, `Create a ${age.difficulty} maze suitable for ages ${sku.ageBand}.`, [
      `Help the traveler get through the ${useCase}`,
      'Try again a second time',
    ]),
    makePage(5, 'draw', `Draw your ${useCase} moment`, `Create a drawing prompt page.`, [
      `Draw your favorite ${useCase} moment`,
      `Use ${age.words} captions`,
    ]),
    makePage(6, 'count', `${theme} count and color`, `Create a count-and-color page.`, [
      `Count the ${theme} items`,
      'Match each group to the right number',
    ]),
    makePage(7, 'prompt', `My favorite ${useCase} thing`, `Create a short reflection page.`, [
      `What was your favorite part of the ${useCase}?`,
      'What looked funny?',
      'What would you do again?',
    ]),
    makePage(8, 'mini-game', `${useCase} quiet game`, `Create a quiet printable game page.`, [
      'Spot differences',
      'Choose favorites',
      'Trace shapes or paths',
    ]),
  ];

  if ((family.useCase || '').includes('road trip') || (family.useCase || '').includes('scavenger')) {
    pages.push(makePage(9, 'scavenger', 'Road trip scavenger hunt', 'Create a useful road trip scavenger page.', [
      'Find a stop sign',
      'Find a truck or bus',
      'Find something red',
      'Find an animal or bird',
      'Find a funny-shaped cloud',
    ]));
  }

  if ((family.useCase || '').includes('airport') || (family.useCase || '').includes('airplane')) {
    pages.push(makePage(10, 'bingo', 'Travel bingo', 'Create an airport or airplane bingo page.', [
      'Window seat',
      'Backpack',
      'Boarding sign',
      'Snack',
      'Suitcase',
      'Pilot or flight crew',
      'Headphones',
      'Book or tablet',
      'Rolling suitcase',
    ]));
  }

  if ((sku.formatType || '').includes('journal')) {
    pages.push(makePage(11, 'journal', 'Trip memory page', 'Create a journal page with lines and a drawing area.', [
      'Where did you go?',
      'What did you see?',
      'What did you eat?',
      'Draw your favorite memory',
    ]));
  }

  return {
    title: sku.title,
    subtitle: sku.subtitle || '',
    buyerPromise: `A printable, screen-free ${useCase} pack that helps parents buy calm, useful time during ${useCase}.`,
    designNotes: [
      'black-and-white printer friendly',
      'first two pages should work instantly',
      'avoid filler',
      'make the pack feel genuinely useful',
    ],
    listing: {
      hook: `Screen-free printable fun for ${useCase} time`,
      bullets: [
        `Designed for ages ${sku.ageBand}`,
        `Useful during ${useCase}`,
        'Easy to print at home',
        'Quiet, low-mess activity',
      ],
      materials: 'PDF printable, pencil, pen, or crayons',
    },
    pages,
  };
}
