// ============================================================
// BUILDS DATA — Edit this file to add/update buildings
// ============================================================
// Each entry: { id, title, day, subtitle, body, image }
// image: path to your PNG file (e.g. "images/builds/mill.png")
// ============================================================

const BUILDS_DATA = [
  {
    id: 1,
    title: "The Old Watermill",
    day: "Day 14",
    subtitle: "Suggested by @skybuild99 • Inspired by 14th-century Flemish mills",
    body: "A working watermill sitting at the edge of the town river. The wheel was built entirely out of oak logs and slabs, with dark prismarine for the wet stones. Took about 3 hours to get the roof symmetry right!",
    image: "images/builds/watermill.png"
  },
  {
    id: 2,
    title: "The Blacksmith's Forge",
    day: "Day 21",
    subtitle: "Suggested by @medievalfan • Inspired by classic RPG blacksmiths",
    body: "Every medieval town needs a blacksmith! This one has a working furnace area, weapon racks made of item frames, and a little shed attached for storing iron blocks. The chimney smokes using barrier blocks + campfires.",
    image: "images/builds/blacksmith.png"
  },
  {
    id: 3,
    title: "The Town Library",
    day: "Day 28",
    subtitle: "Suggested by @bookworm_mc • Season 2 community pick",
    body: "A two-story library with bookshelves lining every wall. The stained glass windows took the longest — each one tells a different story from the town's history. Hidden underground is a secret room.",
    image: "images/builds/library.png"
  },
  {
    id: 4,
    title: "The Market Square",
    day: "Day 35",
    subtitle: "Suggested by @traderpete • Center of town life",
    body: "The bustling heart of the medieval town. Six market stalls, a central well, and cobblestone paths radiating outward. Each stall has a different theme — baker, fishmonger, jeweler, herbalist, and more.",
    image: "images/builds/market.png"
  },
  {
    id: 5,
    title: "The Town Gate",
    day: "Day 7",
    subtitle: "First major build • Season 2 opener",
    body: "The very first big build of Season 2 — the town's main gate. Two massive stone towers flanking an iron portcullis. This sets the tone for the entire medieval aesthetic of the season.",
    image: "images/builds/gate.png"
  },
  {
    id: 6,
    title: "The Tavern",
    day: "Day 42",
    subtitle: "Suggested by @alemaster • Most requested build",
    body: "The most-requested build from the community! A cozy two-story tavern with a bar, fireplace, and rooms upstairs. The sign out front reads 'The Potato & Flask' — yes, it's a reference.",
    image: "images/builds/tavern.png"
  },
  {
    id: 7,
    title: "The Chapel",
    day: "Day 49",
    subtitle: "Suggested by @gothic_builds • Gothic influence",
    body: "A small Gothic-inspired chapel with flying buttresses (first time attempting those!) and tall stained glass windows. The interior has pew rows, an altar, and candles everywhere.",
    image: "images/builds/chapel.png"
  },
  {
    id: 8,
    title: "The Herbalist's Cottage",
    day: "Day 56",
    subtitle: "Suggested by @witchycraft • Cozy vibes",
    body: "A wonky little cottage packed with hanging herbs, potion bottles (item frames + potions), and a tiny garden out back with every plant in the game. The chimney leans slightly — it's a feature, not a bug.",
    image: "images/builds/herbalist.png"
  }
];

// Utility: pick 5 random entries seeded by today's date (same 5 all day)
function getTodayBuilds() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const shuffled = [...BUILDS_DATA];
  // seeded shuffle (simple LCG)
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 5);
}
