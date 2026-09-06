// The stack, literally. Each entry becomes one physics tile in the pile.
//
// label    — printed on the tile. Short; the body is sized to the text.
// where    — must point at something real (a project in Projects.jsx, or the
//            Kida Studios entry). Evidence does the credibility work, which is
//            why there are no tiers or percentages anywhere in this section.
// truth    — the joke. Honest first, funny second.
// name     — title-case form, printed in the readable list. The tile label is
//            uppercase and cannot be lower-cased mechanically (BS4, SQL), so
//            the two spellings are stored separately. Asides carry none.
// group    — which block of the readable list the entry belongs to, or null
//            for the asides. The jokes are true, but they are not skills, so
//            they exist only in the pile.
// weight   — 'core' | 'tool' | 'aside'. Drives tile size only. Mixed sizes
//            settle into a natural heap instead of a flat brick wall, and it
//            implies importance without ever printing a rating.
// projects — ids used to draw the constellation links. Tiles that shipped in
//            the same project get connected. Asides carry none, so they sit in
//            the pile unlinked, which is the correct visual joke.

export const PROJECT_IDS = ['unifetch', 'budgetmate', 'autoquote', 'kida', 'site']

// Blocks of the readable list, in reading order. Backend leads because that is
// where the work actually is — the ordering is the claim. Each `evidence` line
// must name something checkable in the Projects section or the Kida Studios
// entry; it is what stands in for the ratings this section refuses to print.
export const GROUPS = [
  { id: 'backend',  heading: 'BACKEND',
    evidence: 'Kida Studios · UniFetch · production' },
  { id: 'mobile',   heading: 'MOBILE',
    evidence: 'AutoQuote · Kida Studios · the App Store' },
  { id: 'frontend', heading: 'FRONTEND',
    evidence: 'UniFetch · BudgetMate · this site' },
  { id: 'cloud',    heading: 'CLOUD & DATA',
    evidence: 'Kida Studios · at scale' },
  { id: 'tooling',  heading: 'TOOLING & AUTOMATION',
    evidence: 'UniFetch · BudgetMate · AutoQuote' },
]

export const STACK = [
  // ── core ───────────────────────────────────────────────────────
  { id: 'django', label: 'DJANGO REST', weight: 'core', group: 'backend', projects: ['kida'],
    name: 'Django REST',
    where: 'Kida Studios · production',
    truth: 'serializers are a lifestyle, not a library' },

  { id: 'react', label: 'REACT', weight: 'core', group: 'frontend', projects: ['unifetch', 'budgetmate', 'site'],
    name: 'React',
    where: 'UniFetch · BudgetMate · this site',
    truth: 'useEffect and I have an understanding' },

  { id: 'python', label: 'PYTHON', weight: 'core', group: 'backend', projects: ['unifetch', 'kida'],
    name: 'Python',
    where: 'UniFetch · Kida Studios',
    truth: 'indentation as a load-bearing structure' },

  { id: 'javascript', label: 'JAVASCRIPT', weight: 'core', group: 'frontend', projects: ['unifetch', 'budgetmate', 'site'],
    name: 'JavaScript',
    where: 'everything with a screen',
    truth: 'three equals signs, no exceptions, no negotiation' },

  { id: 'flutter', label: 'FLUTTER', weight: 'core', group: 'mobile', projects: ['autoquote', 'kida'],
    name: 'Flutter',
    where: 'AutoQuote · Kida Studios · App Store',
    truth: 'hot reload ruined every other framework for me' },

  { id: 'dart', label: 'DART', weight: 'core', group: 'mobile', projects: ['autoquote', 'kida'],
    name: 'Dart',
    where: 'AutoQuote · Kida Studios',
    truth: 'the language nobody asks about, doing all the work' },

  { id: 'swift', label: 'SWIFT', weight: 'core', group: 'mobile', projects: ['kida'],
    name: 'Swift',
    where: 'Kida Studios · App Store',
    truth: 'shipped it. still google what the "?" does.' },

  { id: 'firebase', label: 'FIREBASE', weight: 'core', group: 'cloud', projects: ['budgetmate', 'autoquote', 'kida'],
    name: 'Firebase',
    where: 'BudgetMate · AutoQuote · Kida Studios',
    truth: 'wonderful, right up until you open the billing page' },

  { id: 'firestore', label: 'FIRESTORE', weight: 'core', group: 'cloud', projects: ['budgetmate', 'autoquote', 'kida'],
    name: 'Firestore',
    where: 'Kida Studios · at scale',
    truth: 'denormalise everything. regret is a schema decision.' },

  { id: 'flask', label: 'FLASK', weight: 'core', group: 'backend', projects: ['unifetch'],
    name: 'Flask',
    where: 'UniFetch · scraping API',
    truth: 'Django, for when the job does not need Django' },

  { id: 'sql', label: 'SQL', weight: 'core', group: 'backend', projects: ['kida'],
    name: 'SQL',
    where: 'Kida Studios · schema design',
    truth: 'I know what a JOIN is. the query planner knows more.' },

  { id: 'rest', label: 'REST & AUTH', weight: 'core', group: 'backend', projects: ['kida'],
    name: 'REST & Auth',
    where: 'Kida Studios · token flows',
    truth: 'naming the endpoint takes longer than writing it' },

  // ── tools ──────────────────────────────────────────────────────
  { id: 'vite', label: 'VITE', weight: 'tool', group: 'frontend', projects: ['unifetch', 'site'],
    name: 'Vite',
    where: 'UniFetch · this site',
    truth: 'fast enough that I stopped having a coffee excuse' },

  { id: 'tailwind', label: 'TAILWIND', weight: 'tool', group: 'frontend', projects: ['unifetch'],
    name: 'Tailwind',
    where: 'UniFetch',
    truth: 'yes the class attribute is that long. yes it is fine.' },

  { id: 'framer', label: 'FRAMER MOTION', weight: 'tool', group: 'frontend', projects: ['unifetch', 'site'],
    name: 'Framer Motion',
    where: 'UniFetch · this site',
    truth: 'the reason this page moves at all' },

  { id: 'three', label: 'THREE.JS', weight: 'tool', group: 'frontend', projects: ['site'],
    name: 'Three.js',
    where: 'this site',
    truth: 'cameras, lights, and one very confused normal vector' },

  { id: 'matter', label: 'MATTER.JS', weight: 'tool', group: 'frontend', projects: ['site'],
    name: 'Matter.js',
    where: 'this section, right now',
    truth: 'you are currently holding it' },

  { id: 'leaflet', label: 'LEAFLET', weight: 'tool', group: 'frontend', projects: ['site'],
    name: 'Leaflet',
    where: 'this site · hero map',
    truth: 'maps are easy until someone says "offline"' },

  { id: 'selenium', label: 'SELENIUM', weight: 'tool', group: 'tooling', projects: ['unifetch'],
    name: 'Selenium',
    where: 'UniFetch · scraping API',
    truth: 'three hours waiting for an element already on screen' },

  { id: 'bs4', label: 'BS4', weight: 'tool', group: 'tooling', projects: ['unifetch'],
    name: 'BeautifulSoup',
    where: 'UniFetch · scraping API',
    truth: 'HTML is a suggestion. "soup" is the honest word for it.' },

  { id: 'ec2', label: 'EC2', weight: 'tool', group: 'cloud', projects: ['kida', 'unifetch'],
    name: 'EC2',
    where: 'Kida Studios · right-sizing',
    truth: 'the instance was always one size too big' },

  { id: 's3', label: 'S3', weight: 'tool', group: 'cloud', projects: ['kida'],
    name: 'S3',
    where: 'Kida Studios · media access patterns',
    truth: 'a bucket is a filesystem that bills you for feelings' },

  { id: 'lambda', label: 'LAMBDA', weight: 'tool', group: 'cloud', projects: ['kida'],
    name: 'Lambda',
    where: 'Kida Studios · cold start tuning',
    truth: 'cold starts are a personality trait' },

  { id: 'grafana', label: 'GRAFANA', weight: 'tool', group: 'cloud', projects: ['budgetmate'],
    name: 'Grafana',
    where: 'BudgetMate',
    truth: 'dashboards nobody asked for. charts I refuse to delete.' },

  { id: 'prometheus', label: 'PROMETHEUS', weight: 'tool', group: 'cloud', projects: ['budgetmate'],
    name: 'Prometheus',
    where: 'BudgetMate',
    truth: 'scraping my own app to find out how it feels' },

  { id: 'tesseract', label: 'TESSERACT OCR', weight: 'tool', group: 'tooling', projects: ['budgetmate'],
    name: 'Tesseract OCR',
    where: 'BudgetMate · receipt parsing',
    truth: 'reads receipts better than I do, most days' },

  { id: 'aivision', label: 'AI VISION', weight: 'tool', group: 'tooling', projects: ['budgetmate'],
    name: 'AI Vision',
    where: 'BudgetMate',
    truth: 'confidently wrong, but only about the total' },

  { id: 'fbauth', label: 'FIREBASE AUTH', weight: 'tool', group: 'cloud', projects: ['kida'],
    name: 'Firebase Auth',
    where: 'Kida Studios · Google Sign-In',
    truth: 'the login button is four hours of work in a trench coat' },

  { id: 'webhooks', label: 'WEBHOOKS', weight: 'tool', group: 'backend', projects: ['kida'],
    name: 'Webhooks',
    where: 'Kida Studios · integrations',
    truth: 'someone else’s server, calling at its convenience' },

  { id: 'jobs', label: 'BACKGROUND JOBS', weight: 'tool', group: 'backend', projects: ['kida'],
    name: 'Background Jobs',
    where: 'Kida Studios',
    truth: 'the queue is fine. the queue is always fine.' },

  { id: 'pdf', label: 'PDF GEN', weight: 'tool', group: 'tooling', projects: ['autoquote'],
    name: 'PDF Generation',
    where: 'AutoQuote · quotes',
    truth: 'a format from 1993 that still decides if you get paid' },

  { id: 'git', label: 'GIT', weight: 'tool', group: 'tooling', projects: ['unifetch', 'budgetmate', 'autoquote', 'kida', 'site'],
    name: 'Git',
    where: 'all of it',
    truth: 'I know enough rebase to be genuinely dangerous' },

  // ── asides — true, just not frameworks ─────────────────────────
  { id: 'consolelog', label: 'CONSOLE.LOG', weight: 'aside', group: null, projects: [],
    where: 'every project, every time',
    truth: 'my primary debugger. we have made peace.' },

  { id: 'stackoverflow', label: 'STACK OVERFLOW', weight: 'aside', group: null, projects: [],
    where: 'uncredited',
    truth: 'co-author on more of this than either of us admits' },

  { id: 'vimquit', label: ':Q!', weight: 'aside', group: null, projects: [],
    where: 'muscle memory',
    truth: 'the only vim command I fully trust' },

  { id: 'duck', label: 'RUBBER DUCK', weight: 'aside', group: null, projects: [],
    where: 'desk, left of monitor',
    truth: 'has solved more bugs than any profiler I have run' },

  { id: 'cors', label: 'CORS', weight: 'aside', group: null, projects: [],
    where: 'ongoing',
    truth: 'not a bug. a negotiation. it is winning.' },

  { id: 'timezones', label: 'TIMEZONES', weight: 'aside', group: null, projects: [],
    where: 'once, badly',
    truth: 'I no longer trust a date I did not store in UTC' },

  { id: 'regex', label: 'REGEX', weight: 'aside', group: null, projects: [],
    where: 'write-only',
    truth: 'write once. read never. rewrite from scratch.' },

  { id: 'cache', label: 'CACHE INVALIDATION', weight: 'aside', group: null, projects: [],
    where: 'unsolved',
    truth: 'one of the two hard problems. it remains hard.' },

  { id: 'worksonmine', label: 'WORKS ON MY MACHINE', weight: 'aside', group: null, projects: [],
    where: 'reproducible, locally',
    truth: 'a statement of fact, offered as a defence' },

  { id: 'node', label: 'NODE', weight: 'aside', group: null, projects: [],
    where: '—',
    truth: 'honestly? still on the list.' },
]
