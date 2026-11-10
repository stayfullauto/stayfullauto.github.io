/*
 * full auto — work.
 * Sample projects: replace the text and images here; the work list on the home page
 * and every project page are built from this one list.
 *   slug    the address of the page (work.html#slug), lowercase, no spaces
 *   lines   the big title, split over lines the way it should break
 *   images  one entry per picture; set src to a file in /work/ when you have it,
 *           ratio is width/height (16/9, 4/5, 1, ...), wide:true makes it full width
 */
window.FA_PROJECTS = [
  {
    slug: 'ops', title: 'ops', lines: ['ops'],
    client: 'full auto', year: '2026', type: 'to-do app',
    services: ['product design', 'android app', 'illustration'],
    url: '',
    intro: 'a to-do list that does one thing and gets out of the way.',
    body: [
      'type, tick, done. no account, no sync, no streaks to guilt you. a black focus ball bounces around the list until you need it, then fills the screen as a timer.',
      'everything is lowercase and set in the pixel serif that became the full auto look. when the list is empty it drops to the floor.'
    ],
    images: [{ ratio: 16 / 9, wide: true }, { ratio: 4 / 5 }, { ratio: 4 / 5 }, { ratio: 16 / 9, wide: true }]
  },
  {
    slug: 'payload', title: 'payload', lines: ['pay', 'load'],
    client: 'full auto', year: '2026', type: 'expense tracker',
    services: ['product design', 'android app', 'sms parsing'],
    url: '',
    intro: 'an expense tracker that can’t go online.',
    body: [
      'payload reads bank and upi texts on the phone and turns them into what you spent today, where it went and what to cut.',
      'it has no internet permission at all, so your money never leaves your phone. categories fall into the screen as balls you can throw around.'
    ],
    images: [{ ratio: 16 / 9, wide: true }, { ratio: 4 / 5 }, { ratio: 4 / 5 }, { ratio: 21 / 9, wide: true }]
  },
  {
    slug: 'full-auto', title: 'full auto', lines: ['full', 'auto'],
    client: 'full auto', year: '2025', type: 'daily tracker',
    services: ['product design', 'android app', 'brand'],
    url: '',
    intro: 'the first app, and the name everything else runs under.',
    body: [
      'sample text: describe the app here. what it tracks, who it is for and the one idea behind it.',
      'sample text: a second paragraph on how it looks and feels, and what you would do differently next time.'
    ],
    images: [{ ratio: 16 / 9, wide: true }, { ratio: 1 }, { ratio: 1 }]
  },
  {
    slug: 'koji-coffee', title: 'kōji coffee', lines: ['kōji', 'coffee'],
    client: 'kōji coffee co. (sample)', year: '2026', type: 'brand identity',
    services: ['naming', 'wordmark', 'packaging'],
    url: '',
    intro: 'sample project: a small-batch roaster, named and branded from scratch.',
    body: [
      'sample text: replace with the brief, what you made and why. keep it to a few short lines.',
      'sample text: a note on the outcome, like the launch, the shelf or the first order.'
    ],
    images: [{ ratio: 16 / 9, wide: true }, { ratio: 4 / 5 }, { ratio: 4 / 5 }, { ratio: 16 / 9, wide: true }]
  },
  {
    slug: 'atlas-run-club', title: 'atlas run club', lines: ['atlas', 'run club'],
    client: 'atlas (sample)', year: '2025', type: 'website',
    services: ['web design', 'development', 'copy'],
    url: '',
    intro: 'sample project: a site for a running club that only meets at 5am.',
    body: [
      'sample text: replace with the brief, what you made and why.',
      'sample text: a line on results, like sign-ups, speed or the one thing people mention.'
    ],
    images: [{ ratio: 16 / 9, wide: true }, { ratio: 1 }, { ratio: 1 }, { ratio: 21 / 9, wide: true }]
  }
];
