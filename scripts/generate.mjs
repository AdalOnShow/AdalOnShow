// Draws the profile README cards as SVGs into ../assets and rewrites the
// yearly-graph block of README.md. Every card comes in four versions:
// desktop/phone × dark/light (phone cards are 440 wide instead of 880).
// Run: npm ci && node scripts/generate.mjs
// With GITHUB_TOKEN set it refreshes data/stats.json from the GitHub GraphQL API;
// without it, it redraws from the cached numbers.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = join(ROOT, "assets");
const STATS_FILE = join(ROOT, "data", "stats.json");
const README = join(ROOT, "README.md");
const LOGIN = "AdalOnShow";
const icons = JSON.parse(readFileSync(join(ROOT, "scripts", "icons.json"), "utf8"));
const FONTS = {
  head: readFileSync(join(ROOT, "scripts", "fonts", "Fredoka-700.woff2")),
  mono: readFileSync(join(ROOT, "scripts", "fonts", "DMMono-400.woff2")),
  monoB: readFileSync(join(ROOT, "scripts", "fonts", "DMMono-500.woff2")),
};
mkdirSync(ASSETS, { recursive: true });

/* ------------------------------------------------------------------ content */

const PROFILE = {
  hi: "Hi, I'm",
  name: "Adal",
  full: "Sharif Hossain Adal",
  tagline: "Full stack developer building scalable web apps with Next.js & NestJS.",
  pills: ["full stack", "NestJS APIs", "real-time apps", "AI tooling"],
  sticker: "@AdalOnShow",
};

// Two rows of four on desktop, four rows of two on phones.
const SKILLS = [
  { icon: "nextjs", name: "Next.js", role: "frontend", tone: 0 },
  { icon: "nestjs", name: "NestJS", role: "backend", tone: 5 },
  { icon: "typescript", name: "TypeScript", role: "language", tone: 3 },
  { icon: "postgresql", name: "PostgreSQL", role: "database", tone: 4 },
  { icon: "react", name: "React", role: "UI", tone: 1 },
  { icon: "node", name: "Node.js", role: "runtime", tone: 2 },
  { icon: "prisma", name: "Prisma", role: "ORM", tone: 5 },
  { icon: "tailwind", name: "Tailwind", role: "styling", tone: 0 },
];

const WHOAMI = {
  host: "adal@dev: ~",
  who: ["adal", "full stack developer"],
  bio: "I build web apps with Next.js, NestJS, TypeScript, PostgreSQL and Prisma.",
  now: [
    "Shipping MessMate: meal & expense accounting for shared messes",
    "Building WorkNest as a single Cloudflare Worker",
    "Learning AI agents, RAG and tool calling",
  ],
};

const PROJECTS = [
  {
    slug: "messmate", name: "MessMate", status: "live", tone: 0, icon: "turborepo",
    desc: "Meal, bazaar and expense accounting for shared bachelor messes. No more month-end spreadsheet math.",
    tags: ["Next.js", "NestJS", "Prisma"], footer: "messmate.sadal.dev",
  },
  {
    slug: "worknest", name: "WorkNest", status: "live", tone: 3, icon: "cloudflare",
    desc: "Team collaboration for projects, tasks and real-time project chat, running as one Cloudflare Worker.",
    tags: ["TanStack", "React 19", "D1"], footer: "worknest.sadal.dev",
  },
  {
    slug: "itemhub", name: "ItemHub", status: "full stack", tone: 4, icon: "react",
    desc: "A digital book collection management platform with a React frontend and an Express API.",
    tags: ["React", "Express", "MongoDB"], footer: "itemhub-frontend.vercel.app",
  },
  {
    slug: "company-chatbot", name: "Company Chatbot", status: "AI", tone: 2, icon: "bun",
    desc: "An AI chatbot that answers questions about a company, written in TypeScript on the Bun runtime.",
    tags: ["Bun", "TypeScript", "LLM"], footer: "github.com/AdalOnShow",
  },
];

/* ------------------------------------------------------------------- themes */

const THEMES = {
  dark: {
    frame: "#14182b", dot: "#262c4a", card: "#1e2340", line: "#2e355c", shadow: "#0a0c18",
    text: "#f2f3f8", muted: "#aab0cf", faint: "#6d749c",
    accent: "#2dd4bf", accentInk: "#04211d", hot: "#ff8a5c",
    // blue, green, amber, purple, teal, red
    tones: ["#284a86", "#1f6040", "#81501a", "#4c3c8e", "#1d5b66", "#83293d"],
    toneText: "#f2f3f8", toneMuted: "#d6dbef",
    heat: ["#2a3058", "#1d5a37", "#2a8a4d", "#3cbd66", "#63e38b"],
    heatInk: ["#6d749c", "#d9f5e2", "#ecfbf1", "#0b2414", "#0b2414"],
  },
  light: {
    frame: "#eef0f7", dot: "#d7dbea", card: "#ffffff", line: "#d3d8ea", shadow: "#c3c9e0",
    text: "#1b1f36", muted: "#555c7d", faint: "#8a90ad",
    accent: "#0f9488", accentInk: "#ffffff", hot: "#e8590c",
    tones: ["#d9e5ff", "#d3f1dd", "#fde6c4", "#e5ddff", "#cdeff0", "#fcd9df"],
    toneText: "#1b1f36", toneMuted: "#4a5070",
    heat: ["#e6e9f3", "#bfe9cc", "#7fd49c", "#38b764", "#1e8545"],
    heatInk: ["#9aa0bb", "#0e3a1f", "#0b3019", "#ffffff", "#ffffff"],
  },
};

/* ------------------------------------------------------------------ helpers */

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmt = (n) => (n == null ? "—" : Number(n).toLocaleString("en-US"));
const monoW = (s, size) => s.length * size * 0.6;
// Rough Fredoka advance widths: narrow letters, wide letters, everything else.
const headW = (s, size) => [...s].reduce((a, c) => a + (/[il.,:;'!| ]/.test(c) ? 0.26 : /[ItfjrI1]/.test(c) ? 0.38 : /[mwMW]/.test(c) ? 0.8 : /[A-Z0-9]/.test(c) ? 0.6 : 0.53), 0) * size;
const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
const plural = (n, w) => `${w}${n === 1 ? "" : "s"}`;

function wrap(text, maxChars) {
  const lines = [];
  let cur = "";
  for (const w of text.split(" ")) {
    if ((cur + " " + w).trim().length > maxChars) { lines.push(cur); cur = w; }
    else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

// Text uses class "h" (Fredoka), "m" (DM Mono) or "mb" (DM Mono medium). The fonts are
// subset to the characters each SVG uses and embedded, so they render inside <img>.
async function svg(w, h, label, t, body) {
  const chars = { h: new Set(), m: new Set(), mb: new Set() };
  for (const m of body.matchAll(/<(?:text|tspan)[^>]*class="([^"]*)"[^>]*>([^<]*)/g)) {
    const cls = m[1].split(" ");
    const txt = m[2].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
    const key = cls.includes("h") ? "h" : cls.includes("mb") ? "mb" : cls.includes("m") ? "m" : null;
    if (key) for (const c of txt) chars[key].add(c);
  }
  let faces = "";
  const add = async (key, family, weight, buf) => {
    if (!chars[key].size) return;
    const sub = await subsetFont(buf, [...chars[key]].join("") + " ", { targetFormat: "woff2" });
    faces += `@font-face{font-family:${family};font-weight:${weight};src:url(data:font/woff2;base64,${sub.toString("base64")}) format('woff2')}`;
  };
  await add("h", "AH", 700, FONTS.head);
  await add("m", "AM", 400, FONTS.mono);
  await add("mb", "AM", 500, FONTS.monoB);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title>
<defs><style>${faces}
.h{font-family:AH,'Segoe UI',sans-serif;font-weight:700}.m{font-family:AM,ui-monospace,Menlo,Consolas,monospace;font-weight:400}.mb{font-family:AM,ui-monospace,Menlo,Consolas,monospace;font-weight:500}
</style>
<pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${t.dot}"/></pattern>
</defs>
${body}
</svg>
`;
}

// Outer dotted frame, optionally with an inner card that has a hard offset shadow.
function frame(W, H, t, inner = true) {
  let b = `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="22" fill="${t.frame}" stroke="${t.line}" stroke-opacity="0.6"/>`;
  b += `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="22" fill="url(#dots)"/>`;
  if (inner) b += box(24, 24, W - 54, H - 54, t.card, t, { r: 16 });
  return b;
}

function box(x, y, w, h, fill, t, { r = 14, shadow = 5 } = {}) {
  return `<rect x="${x + shadow}" y="${y + shadow}" width="${w}" height="${h}" rx="${r}" fill="${t.shadow}"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${t.shadow}" stroke-width="2"/>`;
}

const logo = (key, x, y, size, color) =>
  `<path transform="translate(${x} ${y}) scale(${size / 24})" d="${icons[key].path}" fill="${color}"/>`;

const brand = (key, mode) => {
  const hex = icons[key].hex;
  const lum = parseInt(hex.slice(0, 2), 16) * 0.3 + parseInt(hex.slice(2, 4), 16) * 0.59 + parseInt(hex.slice(4, 6), 16) * 0.11;
  if (lum < 60) return mode === "dark" ? "#ffffff" : "#111111";
  return "#" + hex;
};

// Small line icons on a 24x24 grid.
const ICON = {
  cal: "M4 7h16v13H4zM4 11h16M8 4v5M16 4v5",
  flame: "M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 2 1 3 3 3 5 1-1 1-3 0-8z",
  trophy: "M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4",
  bars: "M5 20V12M10 20V6M15 20V10M20 20V4",
  folder: "M3 7h6l2 2h10v10H3z",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14c2 .8 3 2.8 3 6",
  dl: "M12 4v11M7 10l5 5 5-5M5 20h14",
  arrow: "M8 16L16 8M10 8h6v6",
};
const icon = (k, x, y, size, color, sw = 2) =>
  `<path transform="translate(${x} ${y}) scale(${size / 24})" d="${ICON[k]}" fill="none" stroke="${color}" stroke-width="${(sw * 24) / size}" stroke-linecap="round" stroke-linejoin="round"/>`;

function chip(x, y, label, fill, t, { size = 13, h = 30, color } = {}) {
  const w = monoW(label, size) + 26;
  return {
    w,
    out: box(x, y, w, h, fill, t, { r: 9, shadow: 3 }) +
      `<text x="${x + w / 2}" y="${y + h / 2 + size * 0.36}" text-anchor="middle" class="mb" font-size="${size}" fill="${color || t.toneText}">${esc(label)}</text>`,
  };
}

// Pad a sorted list of {d,c} so it starts on a Sunday, then split into weeks.
function toWeeks(days) {
  if (!days.length) return [];
  const pad = new Date(days[0].d + "T00:00:00Z").getUTCDay();
  const cells = [...Array(pad).fill(null), ...days];
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function legend(right, y, t, fs = 13) {
  const sq = fs, step = fs + 4;
  let b = `<text x="${right}" y="${y}" text-anchor="end" class="m" font-size="${fs}" fill="${t.muted}">More</text>`;
  const sx = right - monoW("More", fs) - 8 - 5 * step;
  t.heat.forEach((c, i) => (b += `<rect x="${sx + i * step}" y="${y - sq + 2}" width="${sq}" height="${sq}" rx="3" fill="${c}"/>`));
  b += `<text x="${sx - 8}" y="${y}" text-anchor="end" class="m" font-size="${fs}" fill="${t.muted}">Less</text>`;
  return b;
}

/* -------------------------------------------------------------------- cards */

function hero(t, mode, phone) {
  const W = phone ? 440 : 880;
  const hs = phone ? 44 : 50;
  const hx = phone ? 52 : 176, hy = phone ? 196 : 118;
  // Lay out the tagline and pills first, so the card grows to fit them.
  const tag = phone ? wrap(PROFILE.tagline, 36) : [PROFILE.tagline];
  const pills = [];
  let px = hx + 2, py = hy + 42 + (tag.length - 1) * 22 + 18;
  PROFILE.pills.forEach((p, i) => {
    const w = monoW(p, 12.5) + 26;
    if (px + w > W - 48) { px = hx + 2; py += 42; }
    pills.push({ p, i, x: px, y: py });
    px += w + 14;
  });
  const H = Math.max(phone ? 0 : 250, py + 30 + 3 + 30 + 30);
  let b = frame(W, H, t);
  const mx = phone ? 52 : 56, my = phone ? 52 : 62, ms = phone ? 76 : 92;
  b += box(mx, my, ms, ms, mode === "dark" ? "#f6f1e7" : "#1b1f36", t, { r: 18, shadow: 6 });
  b += `<text x="${mx + ms / 2}" y="${my + ms * 0.69}" text-anchor="middle" class="h" font-size="${ms * 0.59}" fill="${mode === "dark" ? "#1b1f36" : "#f6f1e7"}">A</text>`;
  b += `<rect x="${mx + ms - 22}" y="${my + ms - 20}" width="11" height="11" rx="3" fill="${t.accent}"/>`;

  b += `<text x="${hx}" y="${hy}" class="h" font-size="${hs}" fill="${t.text}">${esc(PROFILE.hi)}</text>`;
  const nx = hx + headW(PROFILE.hi, hs) + 14, nw = headW(PROFILE.name, hs) + 22;
  b += `<g transform="rotate(-1.5 ${nx} ${hy - 44})"><rect x="${nx}" y="${hy - hs * 0.92}" width="${nw}" height="${hs * 1.24}" rx="10" fill="${t.tones[4]}" stroke="${t.shadow}" stroke-width="2"/>`;
  b += `<text x="${nx + 11}" y="${hy}" class="h" font-size="${hs}" fill="${t.toneText}">${esc(PROFILE.name)}</text></g>`;

  tag.forEach((s, i) => (b += `<text x="${hx + 2}" y="${hy + 42 + i * 22}" class="m" font-size="15.5" fill="${t.muted}">${esc(s)}</text>`));
  for (const { p, i, x, y } of pills) b += chip(x, y, p, t.tones[[0, 2, 3, 5][i]], t, { size: 12.5 }).out;
  const sw = monoW(PROFILE.sticker, 13) + 28, sx = W - 64 - sw, sy = phone ? 66 : 42;
  b += `<g transform="rotate(4 ${sx + sw / 2} ${sy + 17})">` + box(sx, sy, sw, 34, t.hot, t, { r: 9, shadow: 4 }) +
    `<text x="${sx + sw / 2}" y="${sy + 22}" text-anchor="middle" class="mb" font-size="13" fill="#1b1f36">${esc(PROFILE.sticker)}</text></g>`;
  return svg(W, H, `Hi, I'm ${PROFILE.full}. ${PROFILE.tagline}`, t, b);
}

function skillsCard(t, mode, phone) {
  const W = phone ? 440 : 880, cols = phone ? 2 : 4, gap = 16, bh = 46, rowGap = 18;
  const bw = (W - 8 - (cols - 1) * gap) / cols;
  const rows = Math.ceil(SKILLS.length / cols);
  const H = rows * bh + (rows - 1) * rowGap + 8;
  let b = "";
  SKILLS.forEach((s, i) => {
    const x = (i % cols) * (bw + gap) + 1, y = Math.floor(i / cols) * (bh + rowGap) + 1;
    b += box(x, y, bw, bh, t.tones[s.tone], t, { r: 11, shadow: 4 });
    b += `<rect x="${x + 10}" y="${y + 10}" width="26" height="26" rx="7" fill="${mode === "dark" ? "#0b0e1c66" : "#ffffff"}"/>`;
    b += logo(s.icon, x + 14, y + 14, 18, brand(s.icon, mode));
    b += `<text x="${x + 46}" y="${y + 29}" class="h" font-size="17" fill="${t.toneText}">${esc(s.name)}</text>`;
    if (x + 46 + headW(s.name, 17) + 10 < x + bw - 14 - monoW(s.role, 12))
      b += `<text x="${x + bw - 14}" y="${y + 28.5}" text-anchor="end" class="m" font-size="12" fill="${t.toneMuted}">${esc(s.role)}</text>`;
  });
  return svg(W, H, `Top skills: ${SKILLS.map((s) => s.name).join(", ")}`, t, b);
}

function statsCard(st, t, phone) {
  const W = phone ? 440 : 880;
  const big = [
    { tone: 0, ic: "cal", v: fmt(st.contributionsYear), l: ["contributions in", "the last year"] },
    { tone: 1, ic: "flame", v: st.currentStreak == null ? "—" : `${st.currentStreak} ${plural(st.currentStreak, "day")}`, l: ["current streak,", st.streakSince ? `since ${st.streakSince}` : "keep it going"] },
    { tone: 2, ic: "trophy", v: st.longestStreak == null ? "—" : `${st.longestStreak} ${plural(st.longestStreak, "day")}`, l: ["longest streak", "ever"] },
    { tone: 3, ic: "bars", v: fmt(st.total), l: ["contributions", st.since ? `since ${st.since}` : "all time"] },
  ];
  const third = st.downloads > 0
    ? { tone: 1, ic: "dl", v: fmt(st.downloads), l: "release downloads" }
    : { tone: 1, ic: "users", v: fmt(st.followers), l: "followers" };
  const small = [
    { tone: 4, ic: "folder", v: fmt(st.publicRepos), l: "public repos" },
    { tone: 5, ic: "star", v: fmt(st.stars), l: `${plural(st.stars, "star")} earned` },
    third,
  ];
  const gap = phone ? 18 : 20, inner = W - 80 - 6;
  const bigCols = phone ? 2 : 4, smallCols = phone ? 1 : 3;
  const tw = (inner - (bigCols - 1) * gap) / bigCols, th = 132;
  const sw = (inner - (smallCols - 1) * gap) / smallCols, sh = phone ? 62 : 70;
  const top = phone ? 106 : 88;
  const bigRows = Math.ceil(big.length / bigCols);
  const smallTop = top + bigRows * (th + gap) + (phone ? 6 : 8);
  const H = smallTop + Math.ceil(small.length / smallCols) * (sh + gap) - gap + 42;
  let b = frame(W, H, t, false);
  b += `<text x="40" y="62" class="h" font-size="28" fill="${t.text}">On GitHub</text>`;
  b += phone
    ? `<text x="40" y="86" class="m" font-size="12.5" fill="${t.muted}">redrawn every night · ${esc(st.updated || "soon")}</text>`
    : `<text x="${W - 40}" y="60" text-anchor="end" class="m" font-size="13" fill="${t.muted}">redrawn every night · ${esc(st.updated || "soon")}</text>`;
  big.forEach((it, i) => {
    const x = 40 + (i % bigCols) * (tw + gap), y = top + Math.floor(i / bigCols) * (th + gap);
    b += box(x, y, tw, th, t.tones[it.tone], t, { r: 14, shadow: 6 });
    b += icon(it.ic, x + tw - 38, y + 16, 22, t.hot);
    const size = it.v.length > 7 ? 29 : phone ? 33 : 36;
    b += `<text x="${x + 16}" y="${y + 72}" class="h" font-size="${size}" fill="${t.toneText}">${esc(it.v)}</text>`;
    it.l.forEach((s, k) => (b += `<text x="${x + 16}" y="${y + 98 + k * 19}" class="m" font-size="13" fill="${t.toneMuted}">${esc(s)}</text>`));
  });
  small.forEach((it, i) => {
    const x = 40 + (i % smallCols) * (sw + gap), y = smallTop + Math.floor(i / smallCols) * (sh + gap);
    b += box(x, y, sw, sh, t.tones[it.tone], t, { r: 14, shadow: 6 });
    b += icon(it.ic, x + 18, y + sh / 2 - 12, 24, t.hot);
    b += `<text x="${x + 54}" y="${y + sh / 2 + 11}" class="h" font-size="30" fill="${t.toneText}">${esc(it.v)}</text>`;
    b += `<text x="${x + 62 + headW(it.v, 30)}" y="${y + sh / 2 + 9}" class="m" font-size="14" fill="${t.toneMuted}">${esc(it.l)}</text>`;
  });
  const label = `On GitHub: ${fmt(st.contributionsYear)} contributions in the last year, current streak ${st.currentStreak ?? "—"} days, longest streak ${st.longestStreak ?? "—"} days, ${fmt(st.total)} contributions since ${st.since ?? "joining"}, ${fmt(st.publicRepos)} public repos, ${fmt(st.stars)} stars.`;
  return svg(W, H, label, t, b);
}

// Contribution grid. numbers=true writes each day's count in its square.
// chunks splits the weeks into stacked rows so the squares stay big enough for numbers.
function gridCard(days, title, t, { cols, numbers, phone, chunks = 1, calendarYear = false }) {
  const W = phone ? 440 : 880;
  const allWeeks = toWeeks(days).slice(-cols);
  const perChunk = Math.ceil(cols / chunks);
  const total = days.reduce((a, d) => a + d.c, 0);
  const gx = phone ? 44 : 52, right = W - 30 - (phone ? 14 : 22);
  const gap = numbers ? (phone ? 3 : 4) : 3;
  const cell = (right - gx - (perChunk - 1) * gap) / perChunk;
  const blockH = 26 + 7 * (cell + gap);
  const titleH = phone ? 106 : 98;
  const H = titleH + chunks * blockH + (chunks - 1) * 14 + (phone ? 70 : 80);
  let b = frame(W, H, t);
  const num = days.length ? fmt(total) : "—";
  if (phone) {
    b += `<text x="${gx}" y="70" class="h" font-size="26" fill="${t.text}">${num}</text>`;
    b += `<text x="${gx}" y="94" class="m" font-size="14" fill="${t.text}">${esc(title)}</text>`;
  } else {
    b += `<text x="${gx}" y="72" class="h" font-size="24" fill="${t.text}">${num}<tspan class="m" font-size="16" fill="${t.text}" dx="10">${esc(title)}</tspan></text>`;
  }
  const max = Math.max(1, ...days.map((d) => d.c));
  const lvl = (c) => (c === 0 ? 0 : Math.min(4, Math.max(1, Math.ceil((c / max) * 4))));
  // Rolling windows end in the last column; a calendar year starts in the first one.
  const pad = Array(Math.max(0, cols - allWeeks.length)).fill([]);
  const weeks = calendarYear ? [...allWeeks, ...pad] : [...pad, ...allWeeks];
  for (let ch = 0; ch < chunks; ch++) {
    const part = weeks.slice(ch * perChunk, (ch + 1) * perChunk);
    const gy = titleH + ch * (blockH + 14) + 26;
    let lastLabelX = -99, lastMonth = null;
    part.forEach((wk, wi) => {
      const x = gx + wi * (cell + gap);
      const real = wk.filter(Boolean);
      if (!real.length) return;
      const firstOfMonth = real.find((d) => d.d.endsWith("-01"));
      const pick = firstOfMonth || (wi === 0 ? real[0] : null);
      if (pick && pick.d.slice(0, 7) !== lastMonth && x - lastLabelX > 30) {
        b += `<text x="${x.toFixed(1)}" y="${gy - 10}" class="m" font-size="${phone ? 12 : 13}" fill="${t.muted}">${MONTHS[Number(pick.d.slice(5, 7)) - 1]}</text>`;
        lastLabelX = x;
        lastMonth = pick.d.slice(0, 7);
      }
      wk.forEach((day, d) => {
        if (!day) return;
        const y = gy + d * (cell + gap);
        const L = lvl(day.c);
        b += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" rx="${numbers ? (phone ? 4 : 5) : 2.5}" fill="${t.heat[L]}"/>`;
        if (numbers) {
          const fs = day.c >= 100 ? Math.min(10.5, cell * 0.42) : Math.min(12, cell * 0.48);
          b += `<text x="${(x + cell / 2).toFixed(2)}" y="${(y + cell / 2 + fs * 0.36).toFixed(2)}" text-anchor="middle" class="${L ? "mb" : "m"}" font-size="${fs.toFixed(1)}"${L ? "" : ' font-style="italic"'} fill="${t.heatInk[L]}">${day.c}</text>`;
        }
      });
    });
  }
  if (!days.length) b += `<text x="${W / 2}" y="${titleH + (H - titleH) / 2 - 20}" text-anchor="middle" class="m" font-size="14" fill="${t.faint}">fills in after the first nightly run</text>`;
  const ly = H - (phone ? 48 : 52);
  const fs = phone ? 12 : 13;
  b += `<text x="${gx}" y="${ly}" class="m" font-size="${fs}" fill="${t.muted}">${phone ? "per day" : "contributions per day"}</text>`;
  b += legend(right, ly, t, fs);
  return svg(W, H, `${num} ${title}`, t, b);
}

// Smooth line through the points, clamped so it never dips below the zero line.
function smooth(pts, floorY) {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const k = 0.18;
    const c1 = [p1[0] + (p2[0] - p0[0]) * k, Math.min(floorY, p1[1] + (p2[1] - p0[1]) * k)];
    const c2 = [p2[0] - (p3[0] - p1[0]) * k, Math.min(floorY, p2[1] - (p3[1] - p1[1]) * k)];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function lineCard(days, t, phone) {
  const W = phone ? 440 : 880, H = phone ? 380 : 420;
  let b = frame(W, H, t);
  const total = days.reduce((a, d) => a + d.c, 0);
  const num = days.length ? fmt(total) : "—";
  if (phone) {
    b += `<text x="44" y="70" class="h" font-size="26" fill="${t.text}">${num}</text>`;
    b += `<text x="44" y="94" class="m" font-size="14" fill="${t.text}">contributions in the last 30 days</text>`;
  } else {
    b += `<text x="52" y="72" class="h" font-size="24" fill="${t.text}">${num}<tspan class="m" font-size="16" fill="${t.text}" dx="10">contributions in the last 30 days</tspan></text>`;
  }
  const px0 = phone ? 74 : 96, px1 = W - (phone ? 50 : 62), py0 = phone ? 124 : 108, py1 = phone ? 282 : 312;
  const max = Math.max(...days.map((d) => d.c), 0);
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
  const step = steps.find((s) => max / s <= 4) || 1000;
  const top = Math.max(step, Math.ceil(max / step) * step);
  const Y = (v) => py1 - (v / top) * (py1 - py0);
  for (let v = 0; v <= top; v += step) {
    b += `<line x1="${px0}" y1="${Y(v).toFixed(1)}" x2="${px1}" y2="${Y(v).toFixed(1)}" stroke="${t.line}" stroke-width="1.5"${v ? ' stroke-dasharray="5 6"' : ""}/>`;
    b += `<text x="${px0 - 12}" y="${(Y(v) + 4.5).toFixed(1)}" text-anchor="end" class="m" font-size="13" fill="${t.muted}">${v}</text>`;
  }
  if (days.length > 1) {
    const X = (i) => px0 + (i / (days.length - 1)) * (px1 - px0);
    const pts = days.map((d, i) => [X(i), Y(d.c)]);
    const line = smooth(pts, py1);
    b += `<path d="${line} L${px1} ${py1} L${px0} ${py1} Z" fill="${t.accent}" fill-opacity="0.16"/>`;
    b += `<path d="${line}" fill="none" stroke="${t.shadow}" stroke-width="6" stroke-linejoin="round" transform="translate(2 3)"/>`;
    b += `<path d="${line}" fill="none" stroke="${t.accent}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    pts.forEach(([x, y]) => (b += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${phone ? 3.5 : 4.5}" fill="${t.accent}" stroke="${t.shadow}" stroke-width="1.5"/>`));
    const every = phone ? 5 : 1;
    days.forEach((d, i) => {
      const day = Number(d.d.slice(8));
      const last = i === days.length - 1;
      if (i % every === 0 || (phone && last && i % every > 2)) b += `<text x="${X(i).toFixed(1)}" y="${py1 + 26}" text-anchor="middle" class="m" font-size="12.5" fill="${t.muted}">${day}</text>`;
      if (i === 0 || (day === 1 && (!phone || i % every === 0))) b += `<text x="${X(i).toFixed(1)}" y="${py1 + 46}" text-anchor="middle" class="m" font-size="12.5" fill="${t.muted}">${MONTHS[Number(d.d.slice(5, 7)) - 1]}</text>`;
    });
  } else {
    b += `<text x="${(px0 + px1) / 2}" y="${(py0 + py1) / 2}" text-anchor="middle" class="m" font-size="14" fill="${t.faint}">fills in after the first nightly run</text>`;
  }
  return svg(W, H, `${num} contributions in the last 30 days`, t, b);
}

function whoami(t, phone) {
  const W = phone ? 440 : 880, lh = phone ? 24 : 28, fs = phone ? 14.5 : 17;
  const width = phone ? 40 : 72;
  const lines = [
    { k: "cmd", s: "whoami" }, { k: "who" }, ...wrap(WHOAMI.bio, width).map((s) => ({ k: "txt", s })),
    { k: "gap" }, { k: "cmd", s: "cat now.txt" },
    ...WHOAMI.now.flatMap((s) => wrap(s, width - 3).map((p, i) => ({ k: i ? "cont" : "now", s: p }))),
    { k: "gap" }, { k: "cursor" },
  ];
  const H = 24 + 52 + 40 + lines.reduce((a, l) => a + (l.k === "gap" ? 14 : lh), 0) + 30;
  const x0 = phone ? 44 : 52, ind = fs * 0.6 * 2 + 2;
  let b = frame(W, H, t);
  b += `<path d="M26 76 H${W - 32}" stroke="${t.line}" stroke-width="1.5"/>`;
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => (b += `<circle cx="${x0 + i * 20}" cy="50" r="6" fill="${c}"/>`));
  b += `<text x="${phone ? W - 52 : (W - 6) / 2}" y="55" text-anchor="${phone ? "end" : "middle"}" class="m" font-size="14" fill="${t.muted}">${esc(WHOAMI.host)}</text>`;
  let y = 76 + 42;
  for (const l of lines) {
    if (l.k === "gap") { y += 14; continue; }
    if (l.k === "cmd") b += `<text x="${x0}" y="${y}" class="mb" font-size="${fs}" fill="${t.hot}">$<tspan class="mb" dx="${fs * 0.7}" fill="${t.text}">${esc(l.s)}</tspan></text>`;
    if (l.k === "who") b += `<text x="${x0}" y="${y}" class="mb" font-size="${fs}" fill="${t.text}">${esc(WHOAMI.who[0])}<tspan class="m" fill="${t.faint}">  ·  </tspan><tspan class="m" fill="${t.muted}">${esc(WHOAMI.who[1])}</tspan></text>`;
    if (l.k === "txt") b += `<text x="${x0}" y="${y}" class="m" font-size="${fs}" fill="${t.muted}">${esc(l.s)}</text>`;
    if (l.k === "now") b += `<text x="${x0}" y="${y}" class="m" font-size="${fs}" fill="${t.accent}">→<tspan class="m" x="${x0 + ind}" fill="${t.text}">${esc(l.s)}</tspan></text>`;
    if (l.k === "cont") b += `<text x="${x0 + ind}" y="${y}" class="m" font-size="${fs}" fill="${t.text}">${esc(l.s)}</text>`;
    if (l.k === "cursor") b += `<text x="${x0}" y="${y}" class="mb" font-size="${fs}" fill="${t.hot}">$</text><rect x="${x0 + ind}" y="${y - fs * 0.88}" width="${fs * 0.58}" height="${fs * 1.1}" fill="${t.text}"><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/></rect>`;
    y += lh;
  }
  return svg(W, H, `whoami: ${WHOAMI.who.join(", ")}. ${WHOAMI.bio} Now: ${WHOAMI.now.join(". ")}.`, t, b);
}

function label(text, t, phone) {
  const W = phone ? 440 : 880, H = 72;
  let b = box(4, 12, headW(text, 26) + 40, 46, t.hot, t, { r: 11, shadow: 5 });
  b += `<text x="24" y="44" class="h" font-size="26" fill="#1b1f36">${esc(text)}</text>`;
  return svg(W, H, text, t, b);
}

// Desktop cards are 432 wide; phone cards are narrower and taller so the text stays
// readable when two of them sit side by side on a small screen.
function projectCard(p, t, mode, phone) {
  if (!phone) {
    const W = 432, H = 300;
    let b = frame(W, H, t, false);
    b += box(16, 16, W - 40, H - 40, t.tones[p.tone], t, { r: 16, shadow: 6 });
    b += box(36, 36, 58, 58, mode === "dark" ? "#141830" : "#ffffff", t, { r: 14, shadow: 4 });
    b += logo(p.icon, 50, 50, 30, brand(p.icon, mode));
    b += `<text x="110" y="62" class="h" font-size="25" fill="${t.toneText}">${esc(p.name)}</text>`;
    b += chip(110, 72, p.status, t.accent, t, { size: 11.5, h: 22, color: t.accentInk }).out;
    b += box(W - 76, 36, 30, 30, t.hot, t, { r: 8, shadow: 3 }) + icon("arrow", W - 74, 38, 26, "#1b1f36", 2.4);
    wrap(p.desc, 40).slice(0, 3).forEach((s, i) => (b += `<text x="36" y="${132 + i * 23}" class="m" font-size="14.5" fill="${t.toneText}">${esc(s)}</text>`));
    let x = 36;
    for (const tag of p.tags) {
      const w = monoW(tag, 12) + 18;
      b += `<rect x="${x}" y="206" width="${w}" height="24" rx="6" fill="${mode === "dark" ? "#0b0e1c66" : "#ffffffaa"}" stroke="${t.shadow}" stroke-opacity="0.6"/><text x="${x + w / 2}" y="222.5" text-anchor="middle" class="m" font-size="12" fill="${t.toneText}">${esc(tag)}</text>`;
      x += w + 8;
    }
    b += `<text x="36" y="256" class="m" font-size="13" fill="${t.toneMuted}">${esc(p.footer)}</text>`;
    return svg(W, H, `${p.name}: ${p.desc}`, t, b);
  }
  const W = 220;
  const desc = wrap(p.desc, 22).slice(0, 5);
  const descY = 112;
  const tagY = descY + desc.length * 17 + 6;
  const tagRows = [];
  let row = [], used = 0;
  for (const tag of p.tags) {
    const w = monoW(tag, 10) + 12;
    if (used + w > W - 44 && row.length) { tagRows.push(row); row = []; used = 0; }
    row.push({ tag, w }); used += w + 6;
  }
  if (row.length) tagRows.push(row);
  const footY = tagY + tagRows.length * 25 + 18;
  const H = footY + 28;
  let b = box(4, 4, W - 14, H - 14, t.tones[p.tone], t, { r: 14, shadow: 5 });
  b += box(18, 18, 40, 40, mode === "dark" ? "#141830" : "#ffffff", t, { r: 10, shadow: 3 });
  b += logo(p.icon, 27, 27, 22, brand(p.icon, mode));
  b += box(W - 44, 18, 24, 24, t.hot, t, { r: 7, shadow: 2 }) + icon("arrow", W - 43, 19, 22, "#1b1f36", 2.2);
  b += `<text x="18" y="86" class="h" font-size="20" fill="${t.toneText}">${esc(p.name)}</text>`;
  b += chip(18 + headW(p.name, 20) + 8, 70, p.status, t.accent, t, { size: 10, h: 20, color: t.accentInk }).out.replace(/rx="9"/g, 'rx="7"');
  desc.forEach((s, i) => (b += `<text x="18" y="${descY + i * 17}" class="m" font-size="12" fill="${t.toneText}">${esc(s)}</text>`));
  tagRows.forEach((r, ri) => {
    let x = 18;
    for (const { tag, w } of r) {
      const y = tagY + ri * 25;
      b += `<rect x="${x}" y="${y}" width="${w}" height="20" rx="5" fill="${mode === "dark" ? "#0b0e1c66" : "#ffffffaa"}" stroke="${t.shadow}" stroke-opacity="0.6"/><text x="${x + w / 2}" y="${y + 13.8}" text-anchor="middle" class="m" font-size="10" fill="${t.toneText}">${esc(tag)}</text>`;
      x += w + 6;
    }
  });
  b += `<text x="18" y="${footY}" class="m" font-size="10" fill="${t.toneMuted}">${esc(p.footer)}</text>`;
  return svg(W, H, `${p.name}: ${p.desc}`, t, b);
}

/* -------------------------------------------------------------------- data */

async function gql(query, variables) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${process.env.GITHUB_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  const j = await res.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
}

async function fetchStats() {
  const base = await gql(
    `query($login:String!){user(login:$login){createdAt followers{totalCount}
      repositories(ownerAffiliations:OWNER,privacy:PUBLIC,first:100,isFork:false){totalCount
        nodes{stargazerCount releases(first:20){nodes{releaseAssets(first:20){nodes{downloadCount}}}}}}
      contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`,
    { login: LOGIN },
  );
  const u = base.user;
  const cal = u.contributionsCollection.contributionCalendar;
  const lastYear = cal.weeks.flatMap((w) => w.contributionDays).map((d) => ({ d: d.date, c: d.contributionCount }));

  const today = new Date().toISOString().slice(0, 10);
  const years = {};
  const startYear = new Date(u.createdAt).getUTCFullYear();
  const nowYear = new Date().getUTCFullYear();
  for (let y = startYear; y <= nowYear; y++) {
    const r = await gql(
      `query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){contributionsCollection(from:$from,to:$to){contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}`,
      { login: LOGIN, from: `${y}-01-01T00:00:00Z`, to: `${y}-12-31T23:59:59Z` },
    );
    years[y] = r.user.contributionsCollection.contributionCalendar.weeks
      .flatMap((w) => w.contributionDays)
      .filter((d) => d.date.startsWith(String(y)) && d.date <= today)
      .map((d) => ({ d: d.date, c: d.contributionCount }));
  }
  const all = Object.values(years).flat().sort((a, b) => a.d.localeCompare(b.d));
  let longest = 0, run = 0;
  for (const { c } of all) { run = c > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  let i = all.length - 1;
  if (i >= 0 && all[i].c === 0) i--; // an empty today does not break the streak
  let cur = 0, since = null;
  while (i >= 0 && all[i].c > 0) { cur++; since = all[i].d; i--; }
  const firstActive = all.find((d) => d.c > 0);
  const pretty = (iso) => `${Number(iso.slice(8))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

  return {
    updated: `${pretty(today)} ${today.slice(0, 4)}`,
    contributionsYear: cal.totalContributions,
    currentStreak: cur,
    streakSince: cur > 0 ? pretty(since) : null,
    longestStreak: longest,
    total: all.reduce((a, d) => a + d.c, 0),
    since: firstActive ? firstActive.d.slice(0, 4) : String(startYear),
    publicRepos: u.repositories.totalCount,
    stars: u.repositories.nodes.reduce((a, n) => a + n.stargazerCount, 0),
    followers: u.followers.totalCount,
    downloads: u.repositories.nodes.reduce((a, n) => a + n.releases.nodes.reduce((s, r) => s + r.releaseAssets.nodes.reduce((c, x) => c + x.downloadCount, 0), 0), 0),
    days: lastYear,
    years,
  };
}

/* ------------------------------------------------------------------- readme */

// <picture> that serves the phone card below 600px and follows the colour scheme.
const pic = (name, alt) =>
  `<picture><source media="(prefers-color-scheme: dark) and (max-width: 600px)" srcset="assets/${name}-phone-dark.svg"><source media="(max-width: 600px)" srcset="assets/${name}-phone-light.svg"><source media="(prefers-color-scheme: dark)" srcset="assets/${name}-dark.svg"><img src="assets/${name}-light.svg" width="100%" alt="${esc(alt)}"></picture>`;

function yearsBlock(st) {
  const sum = (ds) => ds.reduce((a, d) => a + d.c, 0);
  const n12 = sum(st.days || []);
  if (!(st.days || []).length) return ""; // nothing to show until the first nightly run
  let out = `<details><summary>Last 12 months: ${fmt(n12)} ${plural(n12, "contribution")}</summary>\n\n${pic("graph-12m", "Contributions in the last 12 months")}\n\n</details>\n`;
  for (const y of Object.keys(st.years || {}).sort().reverse()) {
    const n = sum(st.years[y]);
    out += `\n<details><summary>${y}: ${fmt(n)} ${plural(n, "contribution")}</summary>\n\n${pic(`graph-${y}`, `${fmt(n)} contributions in ${y}`)}\n\n</details>\n`;
  }
  return out;
}

/* -------------------------------------------------------------------- main */

let stats = JSON.parse(readFileSync(STATS_FILE, "utf8"));
if (process.env.GITHUB_TOKEN) {
  try {
    stats = await fetchStats();
    writeFileSync(STATS_FILE, JSON.stringify(stats) + "\n");
    console.log("stats refreshed");
  } catch (e) {
    console.error("stats fetch failed, using cache:", e.message);
  }
}

const lastYearDays = stats.days || [];
const allDays = Object.values(stats.years || {}).flat().sort((a, b) => a.d.localeCompare(b.d));
const last30 = (allDays.length ? allDays : lastYearDays).slice(-30);
// last 26 weeks, starting on a Sunday
const cut = lastYearDays.findIndex((d, i) => i >= lastYearDays.length - 26 * 7 && new Date(d.d + "T00:00:00Z").getUTCDay() === 0);
const last6m = cut >= 0 ? lastYearDays.slice(cut) : lastYearDays;

for (const f of readdirSync(ASSETS)) if (f.endsWith(".svg")) unlinkSync(join(ASSETS, f));
for (const [mode, t] of Object.entries(THEMES)) {
  for (const phone of [false, true]) {
    const sfx = `${phone ? "-phone" : ""}-${mode}.svg`;
    const out = async (name, p) => writeFileSync(join(ASSETS, name + sfx), await p);
    await out("hero", hero(t, mode, phone));
    await out("skills", skillsCard(t, mode, phone));
    await out("github", statsCard(stats, t, phone));
    await out("graph-6m", gridCard(last6m, "contributions in the last 6 months", t, { cols: 26, numbers: true, phone, chunks: phone ? 2 : 1 }));
    const yearOpts = { cols: 53, numbers: true, phone, chunks: phone ? 4 : 2 };
    await out("graph-12m", gridCard(lastYearDays, "contributions in the last 12 months", t, yearOpts));
    for (const [y, ds] of Object.entries(stats.years || {})) await out(`graph-${y}`, gridCard(ds, `contributions in ${y}`, t, { ...yearOpts, calendarYear: true }));
    await out("line-30d", lineCard(last30, t, phone));
    await out("whoami", whoami(t, phone));
    await out("label-build", label("What I build", t, phone));
    for (const p of PROJECTS) await out(`project-${p.slug}`, projectCard(p, t, mode, phone));
  }
}

const readme = readFileSync(README, "utf8");
const next = readme.replace(/<!-- years:start -->[\s\S]*<!-- years:end -->/, `<!-- years:start -->\n${yearsBlock(stats)}<!-- years:end -->`);
if (next !== readme) writeFileSync(README, next);
console.log("assets written");
