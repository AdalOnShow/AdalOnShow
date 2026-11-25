// Draws the profile README cards as SVGs (dark + light) into ../assets.
// Run: node scripts/generate.mjs
// With GITHUB_TOKEN set it refreshes data/stats.json from the GitHub GraphQL API;
// without it, it redraws from the cached numbers.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = join(ROOT, "assets");
const STATS_FILE = join(ROOT, "data", "stats.json");
const LOGIN = "AdalOnShow";
const icons = JSON.parse(readFileSync(join(ROOT, "scripts", "icons.json"), "utf8"));
mkdirSync(ASSETS, { recursive: true });

/* ------------------------------------------------------------------ content */

const PROFILE = {
  name: "Sharif Hossain Adal",
  handle: "~/adalonshow",
  tagline: "Full stack developer building scalable web apps with Next.js & NestJS.",
  pills: ["full stack", "scalable backends", "real-time apps", "AI tooling"],
  status: "building in public",
};

const SKILLS = [
  { icon: "nextjs", name: "Next.js", role: "frontend" },
  { icon: "nestjs", name: "NestJS", role: "backend" },
  { icon: "typescript", name: "TypeScript", role: "language" },
  { icon: "postgresql", name: "PostgreSQL", role: "database" },
];

const WHOAMI = {
  host: "adal@dev: ~",
  who: ["sharif hossain adal", "full stack developer"],
  bio: "Next.js, NestJS, TypeScript, PostgreSQL & Prisma. I turn complex problems into simple, scalable systems.",
  now: [
    "Shipping MessMate: meal & expense accounting for shared messes",
    "Building WorkNest as a single Cloudflare Worker",
    "Learning AI agents, RAG and tool calling",
  ],
};

const PROJECTS = [
  {
    slug: "messmate",
    name: "MessMate",
    status: "live",
    desc: "Meal, bazaar and expense accounting for shared bachelor messes. No more month-end spreadsheet math.",
    tags: ["Next.js", "NestJS", "Prisma", "Turborepo"],
    icon: "turborepo",
    footer: "messmate.sadal.dev",
  },
  {
    slug: "worknest",
    name: "WorkNest",
    status: "live",
    desc: "Team collaboration for projects, tasks and real-time project chat, running as one Cloudflare Worker.",
    tags: ["TanStack Start", "React 19", "Cloudflare D1"],
    icon: "cloudflare",
    footer: "worknest.sadal.dev",
  },
  {
    slug: "itemhub",
    name: "ItemHub",
    status: "full stack",
    desc: "A digital book collection management platform with a React frontend and an Express API.",
    tags: ["React", "Express", "MongoDB"],
    icon: "react",
    footer: "itemhub-frontend.vercel.app",
  },
  {
    slug: "company-chatbot",
    name: "Company Chatbot",
    status: "AI",
    desc: "An AI chatbot that answers questions about a company, written in TypeScript on the Bun runtime.",
    tags: ["Bun", "TypeScript", "LLM"],
    icon: "bun",
    footer: "github.com/AdalOnShow",
  },
];

/* ------------------------------------------------------------------- themes */

const THEMES = {
  dark: {
    bg: "#0b1116", card: "#0f171d", tile: "#131e25", line: "#1e2b33", line2: "#27363f",
    text: "#e6edf3", muted: "#8b98a5", faint: "#5d6b76",
    accent: "#2dd4bf", accent2: "#22d3ee", accentInk: "#04211d", accentSoft: "#2dd4bf1f",
    heat: ["#16212a", "#0f4c45", "#13776b", "#1fa896", "#2dd4bf"],
    heatInk: ["#5d6b76", "#d7f5ef", "#e9fbf7", "#04211d", "#04211d"],
  },
  light: {
    bg: "#f6f8fa", card: "#ffffff", tile: "#f4f8f9", line: "#dbe4e8", line2: "#cbd7dc",
    text: "#0f1a20", muted: "#56656f", faint: "#8695a0",
    accent: "#0d9488", accent2: "#0891b2", accentInk: "#ffffff", accentSoft: "#0d948814",
    heat: ["#ebf0f2", "#b3e6dd", "#6fcfbf", "#22a897", "#0d7f74"],
    heatInk: ["#8695a0", "#0b3b35", "#06302b", "#ffffff", "#ffffff"],
  },
};

const SANS = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

/* ------------------------------------------------------------------ helpers */

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmt = (n) => (n == null ? "—" : Number(n).toLocaleString("en-US"));
const monoW = (s, size) => s.length * size * 0.6; // monospace advance ≈ 0.6em
const sansW = (s, size) => s.length * size * 0.53; // rough average for the sans stack

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

function svg(w, h, label, t, body, extraStyle = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title>
<defs><style>
.sans{font-family:${SANS}}.mono{font-family:${MONO}}
.t{fill:${t.text}}.m{fill:${t.muted}}.f{fill:${t.faint}}.a{fill:${t.accent}}
${extraStyle}
</style>
<linearGradient id="ag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accent2}"/></linearGradient>
<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="${t.line2}"/></pattern>
<radialGradient id="glow" cx="1" cy="0" r="0.9"><stop offset="0" stop-color="${t.accent}" stop-opacity="0.22"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
<linearGradient id="fade" x1="0" x2="1"><stop offset="0.35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
<mask id="dotmask"><rect width="${w}" height="${h}" fill="url(#fade)"/></mask>
</defs>
${body}
</svg>
`;
}

const cardFrame = (w, h, t, { dots = false, glow = false } = {}) =>
  `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="18" fill="${t.card}" stroke="${t.line}"/>` +
  (dots ? `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="18" fill="url(#dots)" mask="url(#dotmask)"/>` : "") +
  (glow ? `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="18" fill="url(#glow)"/>` : "") +
  `<rect x="24" y="0" width="64" height="2" rx="1" fill="url(#ag)"/>`;

const logo = (key, x, y, size, color) => {
  const i = icons[key];
  const s = size / 24;
  return `<path transform="translate(${x} ${y}) scale(${s})" d="${i.path}" fill="${color}"/>`;
};

// Brand colours that are near-black would vanish on dark: fall back to text colour.
const brand = (key, t) => {
  const hex = "#" + icons[key].hex;
  const lum = parseInt(icons[key].hex.slice(0, 2), 16) + parseInt(icons[key].hex.slice(2, 4), 16) + parseInt(icons[key].hex.slice(4, 6), 16);
  return lum < 160 ? t.text : hex;
};

function pill(x, y, label, t, { filled = false, size = 13 } = {}) {
  const w = monoW(label, size) + 24;
  return {
    w,
    out: `<rect x="${x}" y="${y}" width="${w}" height="28" rx="14" fill="${filled ? t.accent : t.accentSoft}" stroke="${filled ? t.accent : t.line2}"/>` +
      `<text x="${x + w / 2}" y="${y + 18.5}" text-anchor="middle" class="mono" font-size="${size}" fill="${filled ? t.accentInk : t.text}">${esc(label)}</text>`,
  };
}

/* -------------------------------------------------------------------- cards */

function hero(t) {
  const W = 880, H = 236;
  let b = cardFrame(W, H, t, { dots: true, glow: true });
  // monogram
  b += `<rect x="40" y="48" width="96" height="96" rx="24" fill="url(#ag)"/>`;
  b += `<rect x="43" y="51" width="90" height="90" rx="21" fill="${t.card}"/>`;
  b += `<text x="88" y="111" text-anchor="middle" class="sans" font-size="40" font-weight="800" fill="url(#ag)" letter-spacing="-1">SA</text>`;
  // text
  b += `<text x="164" y="66" class="mono f" font-size="14">${esc(PROFILE.handle)}</text>`;
  b += `<text x="162" y="112" class="sans t" font-size="42" font-weight="800" letter-spacing="-1.2">${esc(PROFILE.name)}</text>`;
  b += `<text x="164" y="144" class="sans m" font-size="17">${esc(PROFILE.tagline)}</text>`;
  let x = 164;
  for (const p of PROFILE.pills) { const r = pill(x, 168, p, t); b += r.out; x += r.w + 10; }
  // status chip
  const sw = monoW(PROFILE.status, 12) + 40;
  b += `<g transform="translate(${W - 32 - sw} 28)"><rect width="${sw}" height="28" rx="14" fill="${t.tile}" stroke="${t.line2}"/>` +
    `<circle cx="16" cy="14" r="4" fill="${t.accent}"><animate attributeName="opacity" values="1;0.25;1" dur="2s" repeatCount="indefinite"/></circle>` +
    `<text x="28" y="18.5" class="mono m" font-size="12">${esc(PROFILE.status)}</text></g>`;
  return svg(W, H, `Hi, I'm ${PROFILE.name}. ${PROFILE.tagline}`, t, b);
}

function skillBadge(s, t) {
  const W = 206, H = 52;
  let b = `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="${t.card}" stroke="${t.line}"/>`;
  b += `<rect x="8" y="8" width="36" height="36" rx="10" fill="${t.tile}" stroke="${t.line2}"/>`;
  b += logo(s.icon, 15, 15, 22, brand(s.icon, t));
  b += `<text x="56" y="25" class="sans t" font-size="16" font-weight="700">${esc(s.name)}</text>`;
  b += `<text x="56" y="41" class="mono a" font-size="11.5">${esc(s.role)}</text>`;
  return svg(W, H, `${s.name} (${s.role})`, t, b);
}

function statsCard(st, t) {
  const W = 880, H = 372;
  let b = cardFrame(W, H, t);
  b += `<text x="32" y="56" class="sans t" font-size="24" font-weight="800">On GitHub</text>`;
  b += `<text x="${W - 32}" y="54" text-anchor="end" class="mono f" font-size="12.5">updated nightly · ${esc(st.updated || "pending")}</text>`;

  const tiles = [
    { v: fmt(st.contributionsYear), l: "contributions", s: "in the last year" },
    { v: st.currentStreak == null ? "—" : `${st.currentStreak}d`, l: "current streak", s: st.streakSince ? `since ${st.streakSince}` : "days in a row" },
    { v: st.longestStreak == null ? "—" : `${st.longestStreak}d`, l: "longest streak", s: "best run ever" },
    { v: fmt(st.publicRepos), l: "public repos", s: `${fmt(st.stars)} ${st.stars === 1 ? "star" : "stars"} earned` },
  ];
  const tw = (W - 64 - 3 * 16) / 4;
  tiles.forEach((tile, i) => {
    const x = 32 + i * (tw + 16), y = 80;
    b += `<rect x="${x}" y="${y}" width="${tw}" height="104" rx="14" fill="${t.tile}" stroke="${t.line}"/>`;
    b += `<rect x="${x + 18}" y="${y + 18}" width="18" height="3" rx="1.5" fill="url(#ag)"/>`;
    b += `<text x="${x + 18}" y="${y + 58}" class="sans t" font-size="32" font-weight="800" letter-spacing="-0.8">${esc(tile.v)}</text>`;
    b += `<text x="${x + 18}" y="${y + 78}" class="mono m" font-size="12.5">${esc(tile.l)}</text>`;
    b += `<text x="${x + 18}" y="${y + 94}" class="mono f" font-size="11.5">${esc(tile.s)}</text>`;
  });

  // heatmap: last 53 weeks
  const days = st.days || [];
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const cols = 53, gap = 3, cell = (W - 64 - (cols - 1) * gap) / cols;
  const hx = 32, hy = 214;
  const max = Math.max(1, ...days.map((d) => d.c));
  const lvl = (c) => (c === 0 ? 0 : Math.min(4, Math.ceil((c / max) * 4)));
  const shown = weeks.slice(-cols);
  for (let wi = 0; wi < cols; wi++) {
    const wk = shown[wi - (cols - shown.length)];
    for (let d = 0; d < 7; d++) {
      const day = wk && wk[d];
      const fill = day ? t.heat[lvl(day.c)] : t.heat[0];
      b += `<rect x="${(hx + wi * (cell + gap)).toFixed(2)}" y="${(hy + d * (cell + gap)).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" rx="2.5" fill="${fill}"${day ? "" : ' opacity="0.6"'}/>`;
    }
  }
  const ly = hy + 7 * (cell + gap) + 22;
  b += `<text x="32" y="${ly}" class="mono f" font-size="12">${days.length ? "last 12 months" : "contribution graph fills in after the first nightly run"}</text>`;
  const lx = W - 32 - 5 * 15 - 34 - 36;
  b += `<text x="${lx}" y="${ly}" class="mono f" font-size="12">less</text>`;
  t.heat.forEach((c, i) => (b += `<rect x="${lx + 36 + i * 15}" y="${ly - 10}" width="11" height="11" rx="2.5" fill="${c}"/>`));
  b += `<text x="${W - 32}" y="${ly}" text-anchor="end" class="mono f" font-size="12">more</text>`;

  const label = `On GitHub: ${fmt(st.contributionsYear)} contributions in the last year, current streak ${st.currentStreak ?? "—"} days, longest streak ${st.longestStreak ?? "—"} days, ${fmt(st.publicRepos)} public repos, ${fmt(st.stars)} stars.`;
  return svg(W, H, label, t, b);
}

function whoami(t) {
  const W = 880;
  const bio = wrap(WHOAMI.bio, 84);
  const lh = 26;
  const lines = [];
  lines.push({ k: "cmd", s: "whoami" });
  lines.push({ k: "who" });
  bio.forEach((s) => lines.push({ k: "txt", s }));
  lines.push({ k: "gap" });
  lines.push({ k: "cmd", s: "cat now.txt" });
  WHOAMI.now.forEach((s) => lines.push({ k: "now", s }));
  lines.push({ k: "gap" });
  lines.push({ k: "cursor" });
  const H = 76 + lines.reduce((a, l) => a + (l.k === "gap" ? 12 : lh), 0) + 26;

  let b = cardFrame(W, H, t);
  b += `<line x1="1" y1="46" x2="${W - 1}" y2="46" stroke="${t.line}"/>`;
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => (b += `<circle cx="${28 + i * 18}" cy="24" r="5.5" fill="${c}"/>`));
  b += `<text x="${W / 2}" y="28.5" text-anchor="middle" class="mono f" font-size="12.5">${esc(WHOAMI.host)}</text>`;
  let y = 84;
  for (const l of lines) {
    if (l.k === "gap") { y += 12; continue; }
    if (l.k === "cmd") b += `<text x="32" y="${y}" class="mono" font-size="15.5"><tspan class="a">$</tspan><tspan class="t" dx="10">${esc(l.s)}</tspan></text>`;
    if (l.k === "who") b += `<text x="32" y="${y}" class="mono" font-size="15.5"><tspan class="t" font-weight="700">${esc(WHOAMI.who[0])}</tspan><tspan class="f"> · </tspan><tspan class="m">${esc(WHOAMI.who[1])}</tspan></text>`;
    if (l.k === "txt") b += `<text x="32" y="${y}" class="mono m" font-size="15.5">${esc(l.s)}</text>`;
    if (l.k === "now") b += `<text x="32" y="${y}" class="mono" font-size="15.5"><tspan class="a">→</tspan><tspan class="t" dx="10">${esc(l.s)}</tspan></text>`;
    if (l.k === "cursor") b += `<text x="32" y="${y}" class="mono a" font-size="15.5">$</text><rect x="50" y="${y - 14}" width="9" height="18" fill="${t.accent}"><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/></rect>`;
    y += lh;
  }
  const label = `whoami: ${WHOAMI.who.join(", ")}. ${WHOAMI.bio} Now: ${WHOAMI.now.join(". ")}.`;
  return svg(W, H, label, t, b);
}

function dailyCard(st, t) {
  const W = 880;
  const weeks = [];
  const days = st.days || [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const cols = 26, gap = 4;
  const shown = weeks.slice(-cols);
  const total = shown.flat().reduce((a, d) => a + d.c, 0);
  const cell = (W - 64 - (cols - 1) * gap) / cols;
  const gx = 32, gy = 104;
  const H = gy + 7 * (cell + gap) + 46;
  let b = cardFrame(W, H, t);
  b += `<text x="32" y="56" class="sans" font-size="24"><tspan class="t" font-weight="800">${days.length ? fmt(total) : "—"}</tspan><tspan class="m mono" font-size="15" dx="10">contributions in the last 6 months</tspan></text>`;
  b += `<text x="${W - 32}" y="54" text-anchor="end" class="mono f" font-size="12.5">one square = one day</text>`;
  const max = Math.max(1, ...shown.flat().map((d) => d.c));
  const lvl = (c) => (c === 0 ? 0 : Math.min(4, Math.ceil((c / max) * 4)));
  let lastMonth = null;
  for (let wi = 0; wi < cols; wi++) {
    const wk = shown[wi - (cols - shown.length)];
    const x = gx + wi * (cell + gap);
    if (wk && wk.length) {
      const m = wk[0].d.slice(0, 7);
      if (m !== lastMonth && (lastMonth !== null || Number(wk[0].d.slice(8)) <= 7)) {
        const name = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")[Number(wk[0].d.slice(5, 7)) - 1];
        b += `<text x="${x.toFixed(1)}" y="${gy - 12}" class="mono m" font-size="12.5">${name}</text>`;
      }
      lastMonth = m;
    }
    for (let d = 0; d < 7; d++) {
      const day = wk && wk[d];
      const y = gy + d * (cell + gap);
      if (!day) continue;
      const L = lvl(day.c);
      b += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" rx="5" fill="${t.heat[L]}"><title>${esc(day.d)}: ${day.c}</title></rect>`;
      const fs = day.c >= 100 ? 10 : 11.5;
      b += `<text x="${(x + cell / 2).toFixed(2)}" y="${(y + cell / 2 + fs * 0.36).toFixed(2)}" text-anchor="middle" class="mono" font-size="${fs}" font-weight="${L ? 700 : 400}"${L ? "" : ' font-style="italic"'} fill="${t.heatInk[L]}">${day.c}</text>`;
    }
  }
  if (!days.length) b += `<text x="${W / 2}" y="${gy + 3.5 * (cell + gap)}" text-anchor="middle" class="mono f" font-size="13">fills in after the first nightly run</text>`;
  const ly = H - 24;
  b += `<text x="32" y="${ly}" class="mono f" font-size="12">contributions per day</text>`;
  const lx = W - 32 - 5 * 15 - 34 - 36;
  b += `<text x="${lx}" y="${ly}" class="mono f" font-size="12">less</text>`;
  t.heat.forEach((c, i) => (b += `<rect x="${lx + 36 + i * 15}" y="${ly - 10}" width="11" height="11" rx="2.5" fill="${c}"/>`));
  b += `<text x="${W - 32}" y="${ly}" text-anchor="end" class="mono f" font-size="12">more</text>`;
  return svg(W, H, `${days.length ? fmt(total) : "—"} contributions in the last 6 months, with the count for each day`, t, b);
}

function label(text, sub, t) {
  const W = 880, H = 64;
  let b = `<rect x="0" y="30" width="5" height="22" rx="2.5" fill="url(#ag)"/>`;
  b += `<text x="18" y="49" class="sans t" font-size="24" font-weight="800">${esc(text)}</text>`;
  const x = 18 + sansW(text, 24) + 18;
  const end = sub ? W - 16 - monoW(sub, 12) - 14 : W - 8;
  b += `<line x1="${x}" y1="41" x2="${end}" y2="41" stroke="${t.line2}" stroke-dasharray="2 5"/>`;
  if (sub) b += `<text x="${W - 16}" y="45" text-anchor="end" class="mono f" font-size="12">${esc(sub)}</text>`;
  return svg(W, H, text, t, b, "");
}

function projectCard(p, t) {
  const W = 432, H = 252;
  let b = cardFrame(W, H, t, { glow: false });
  b += `<rect x="24" y="26" width="52" height="52" rx="14" fill="${t.tile}" stroke="${t.line2}"/>`;
  b += logo(p.icon, 36, 38, 28, brand(p.icon, t));
  b += `<text x="92" y="50" class="sans t" font-size="22" font-weight="800" letter-spacing="-0.4">${esc(p.name)}</text>`;
  const r = pill(92, 58, p.status, t, { filled: true, size: 11.5 });
  b += r.out.replace(/height="28"/, 'height="22"').replace(/rx="14"/, 'rx="11"').replace(/y="76.5"/, 'y="73.5"');
  // arrow
  b += `<g transform="translate(${W - 50} 26)"><rect width="26" height="26" rx="8" fill="${t.tile}" stroke="${t.line2}"/><path d="M9 17 L17 9 M11 9 H17 V15" stroke="${t.accent}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const d = wrap(p.desc, 46);
  d.slice(0, 3).forEach((s, i) => (b += `<text x="24" y="${112 + i * 22}" class="sans m" font-size="15.5">${esc(s)}</text>`));
  let x = 24;
  for (const tag of p.tags) {
    const w = monoW(tag, 11.5) + 18;
    b += `<rect x="${x}" y="178" width="${w}" height="24" rx="7" fill="${t.tile}" stroke="${t.line2}"/><text x="${x + w / 2}" y="194" text-anchor="middle" class="mono t" font-size="11.5">${esc(tag)}</text>`;
    x += w + 8;
  }
  b += `<line x1="24" y1="218" x2="${W - 24}" y2="218" stroke="${t.line}"/>`;
  b += `<text x="24" y="238" class="mono f" font-size="12">${esc(p.footer)}</text>`;
  return svg(W, H, `${p.name}: ${p.desc}`, t, b);
}

/* -------------------------------------------------------------------- data */

async function gql(query, variables) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${process.env.GITHUB_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const j = await res.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
}

async function fetchStats() {
  const base = await gql(
    `query($login:String!){user(login:$login){createdAt
      repositories(ownerAffiliations:OWNER,privacy:PUBLIC,first:100,isFork:false){totalCount nodes{stargazerCount}}
      contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`,
    { login: LOGIN },
  );
  const u = base.user;
  const cal = u.contributionsCollection.contributionCalendar;
  const days = cal.weeks.flatMap((w) => w.contributionDays).map((d) => ({ d: d.date, c: d.contributionCount }));

  // full history for streaks
  const all = new Map();
  const startYear = new Date(u.createdAt).getUTCFullYear();
  const nowYear = new Date().getUTCFullYear();
  for (let y = startYear; y <= nowYear; y++) {
    const r = await gql(
      `query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){contributionsCollection(from:$from,to:$to){contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}`,
      { login: LOGIN, from: `${y}-01-01T00:00:00Z`, to: `${y}-12-31T23:59:59Z` },
    );
    for (const w of r.user.contributionsCollection.contributionCalendar.weeks)
      for (const d of w.contributionDays) all.set(d.date, d.contributionCount);
  }
  const today = new Date().toISOString().slice(0, 10);
  const sorted = [...all.entries()].filter(([d]) => d <= today).sort(([a], [b]) => a.localeCompare(b));
  let longest = 0, run = 0;
  for (const [, c] of sorted) { run = c > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  // current streak: allow today to be empty without breaking it
  let i = sorted.length - 1;
  if (i >= 0 && sorted[i][1] === 0) i--;
  let cur = 0, since = null;
  while (i >= 0 && sorted[i][1] > 0) { cur++; since = sorted[i][0]; i--; }
  const pretty = (iso) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

  return {
    updated: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }),
    contributionsYear: cal.totalContributions,
    currentStreak: cur,
    streakSince: cur > 0 ? pretty(since) : null,
    longestStreak: longest,
    publicRepos: u.repositories.totalCount,
    stars: u.repositories.nodes.reduce((a, n) => a + n.stargazerCount, 0),
    days,
  };
}

/* -------------------------------------------------------------------- main */

let stats = JSON.parse(readFileSync(STATS_FILE, "utf8"));
if (process.env.GITHUB_TOKEN) {
  try {
    stats = await fetchStats();
    writeFileSync(STATS_FILE, JSON.stringify(stats, null, 1) + "\n");
    console.log("stats refreshed");
  } catch (e) {
    console.error("stats fetch failed, using cache:", e.message);
  }
}

for (const [mode, t] of Object.entries(THEMES)) {
  const out = (name, content) => writeFileSync(join(ASSETS, `${name}-${mode}.svg`), content);
  out("hero", hero(t));
  SKILLS.forEach((s) => out(`skill-${s.icon}`, skillBadge(s, t)));
  out("github", statsCard(stats, t));
  out("daily", dailyCard(stats, t));
  out("whoami", whoami(t));
  out("label-build", label("What I build", "selected projects", t));
  PROJECTS.forEach((p) => out(`project-${p.slug}`, projectCard(p, t)));
}
console.log("assets written");
