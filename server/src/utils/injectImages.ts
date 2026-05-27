// injectImages.ts — semantic SVG generator for WebContainer environments
// Drop-in replacement. No external deps. Works offline. Infinite variety.

// ─── Palette ────────────────────────────────────────────────────────────────
const PALETTES = [
  { bg: "#1e1b4b", accent: "#818cf8", text: "#e0e7ff", muted: "#6366f1", highlight: "#a5b4fc" }, // indigo night
  { bg: "#0f172a", accent: "#38bdf8", text: "#e0f2fe", muted: "#0ea5e9", highlight: "#7dd3fc" }, // sky dark
  { bg: "#064e3b", accent: "#34d399", text: "#d1fae5", muted: "#10b981", highlight: "#6ee7b7" }, // emerald forest
  { bg: "#1e1a16", accent: "#fbbf24", text: "#fef3c7", muted: "#d97706", highlight: "#fde68a" }, // amber ember
  { bg: "#3b0764", accent: "#c084fc", text: "#f3e8ff", muted: "#a855f7", highlight: "#d8b4fe" }, // violet deep
  { bg: "#1a1523", accent: "#f472b6", text: "#fce7f3", muted: "#ec4899", highlight: "#fbcfe8" }, // rose noir
  { bg: "#0c1a2e", accent: "#60a5fa", text: "#dbeafe", muted: "#3b82f6", highlight: "#93c5fd" }, // blue midnight
  { bg: "#1c1917", accent: "#fb923c", text: "#ffedd5", muted: "#ea580c", highlight: "#fdba74" }, // orange ember
  { bg: "#042f2e", accent: "#2dd4bf", text: "#ccfbf1", muted: "#14b8a6", highlight: "#5eead4" }, // teal abyss
  { bg: "#1a0a00", accent: "#ef4444", text: "#fee2e2", muted: "#dc2626", highlight: "#fca5a5" }, // crimson
];

// ─── Shape primitive builders ────────────────────────────────────────────────
type Palette = typeof PALETTES[number];

function encode(svg: string): string {
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function shimmer(p: Palette, x: number, y: number, w: number, h: number) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.muted}" opacity="0.08" rx="2"/>`;
}

function lines(p: Palette, cx: number, cy: number, count: number, spread: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((i / count) * Math.PI * 2);
    const x2 = cx + Math.cos(angle) * spread;
    const y2 = cy + Math.sin(angle) * spread;
    const op = 0.15 + (i % 3) * 0.1;
    return `<line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${p.accent}" stroke-width="0.8" opacity="${op}"/>`;
  }).join("");
}

function dots(p: Palette, count: number, w: number, h: number, seed: number) {
  return Array.from({ length: count }, (_, i) => {
    const x = ((seed * 37 + i * 73) % (w - 20)) + 10;
    const y = ((seed * 53 + i * 41) % (h - 20)) + 10;
    const r = 1 + (i % 3);
    const op = 0.2 + (i % 4) * 0.12;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.accent}" opacity="${op}"/>`;
  }).join("");
}

function grid(p: Palette, w: number, h: number, step = 30) {
  const lines: string[] = [];
  for (let x = step; x < w; x += step) {
    lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="${p.accent}" stroke-width="0.4" opacity="0.12"/>`);
  }
  for (let y = step; y < h; y += step) {
    lines.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${p.accent}" stroke-width="0.4" opacity="0.12"/>`);
  }
  return lines.join("");
}

// ─── Scene renderers ─────────────────────────────────────────────────────────

function scenePhoto(p: Palette, w: number, h: number, label: string): string {
  const mid = w / 2;
  const vmid = h / 2;
  // landscape: sky + ground + sun + horizon detail
  const horizon = h * 0.55;
  const sunX = w * 0.72;
  const sunY = h * 0.3;
  return `
    <rect width="${w}" height="${horizon}" fill="${p.bg}"/>
    <rect y="${horizon}" width="${w}" height="${h - horizon}" fill="${p.muted}" opacity="0.4"/>
    <circle cx="${sunX}" cy="${sunY}" r="${w * 0.12}" fill="${p.accent}" opacity="0.9"/>
    <circle cx="${sunX}" cy="${sunY}" r="${w * 0.18}" fill="${p.accent}" opacity="0.15"/>
    ${lines(p, sunX, sunY, 12, w * 0.32)}
    <rect x="0" y="${horizon}" width="${w}" height="2" fill="${p.accent}" opacity="0.3"/>
    ${dots(p, 12, w, h, 7)}
    ${shimmer(p, mid - 60, vmid - 10, 120, 8)}
    ${shimmer(p, mid - 40, vmid + 8, 80, 6)}
    <text font-family="sans-serif" font-size="${Math.max(11, w / 22)}px" fill="${p.text}" text-anchor="middle" dominant-baseline="middle" x="${mid}" y="${horizon - h * 0.1}" opacity="0.85" font-weight="500">${label}</text>
  `;
}

function sceneProduct(p: Palette, w: number, h: number, label: string): string {
  const cx = w / 2;
  const cy = h / 2;
  const box = Math.min(w, h) * 0.38;
  return `
    ${grid(p, w, h, 24)}
    <rect x="${cx - box}" y="${cy - box}" width="${box * 2}" height="${box * 2}" rx="12" fill="${p.accent}" opacity="0.12" stroke="${p.accent}" stroke-width="1" stroke-opacity="0.4"/>
    <rect x="${cx - box + 10}" y="${cy - box + 10}" width="${box * 2 - 20}" height="${box * 2 - 20}" rx="8" fill="${p.muted}" opacity="0.1"/>
    <circle cx="${cx}" cy="${cy - box * 0.2}" r="${box * 0.28}" fill="${p.accent}" opacity="0.25"/>
    <circle cx="${cx}" cy="${cy - box * 0.2}" r="${box * 0.18}" fill="${p.accent}" opacity="0.4"/>
    ${dots(p, 8, w, h, 3)}
    <text font-family="sans-serif" font-size="${Math.max(11, w / 22)}px" fill="${p.text}" text-anchor="middle" dominant-baseline="middle" x="${cx}" y="${cy + box * 0.55}" opacity="0.9" font-weight="500">${label}</text>
  `;
}

function sceneAvatarCard(p: Palette, w: number, h: number, label: string): string {
  const cx = w / 2;
  const cy = h * 0.38;
  const r = Math.min(w, h) * 0.3;
  // initials from label
  const initials = label.split(/\s+/).map(w => w[0] || "").slice(0, 2).join("").toUpperCase() || "U";
  return `
    ${dots(p, 20, w, h, 11)}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.muted}" opacity="0.35"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.accent}" stroke-width="1.5" opacity="0.5"/>
    <text font-family="sans-serif" font-size="${r * 0.7}px" fill="${p.text}" text-anchor="middle" dominant-baseline="central" x="${cx}" y="${cy}" font-weight="600" opacity="0.9">${initials}</text>
    ${shimmer(p, cx - 50, cy + r + 14, 100, 8)}
    ${shimmer(p, cx - 30, cy + r + 28, 60, 6)}
    <text font-family="sans-serif" font-size="${Math.max(10, w / 24)}px" fill="${p.text}" text-anchor="middle" dominant-baseline="middle" x="${cx}" y="${h * 0.82}" opacity="0.75">${label}</text>
  `;
}

function sceneGraph(p: Palette, w: number, h: number, label: string): string {
  const pad = 28;
  const points: string[] = [];
  const seed = label.length;
  const n = 8;
  for (let i = 0; i < n; i++) {
    const x = pad + (i / (n - 1)) * (w - pad * 2);
    const noise = ((seed * 13 + i * 37) % 60) - 20;
    const y = h * 0.3 + noise + (i < n / 2 ? -i * 6 : (i - n / 2) * 8);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const poly = points.join(" ");
  // area fill
  const first = points[0].split(",");
  const last = points[n - 1].split(",");
  const area = `M${first[0]},${h - pad} L${poly.split(" ").join(" L")} L${last[0]},${h - pad} Z`;
  return `
    ${grid(p, w, h, 32)}
    <path d="${area}" fill="${p.accent}" opacity="0.12"/>
    <polyline points="${poly}" fill="none" stroke="${p.accent}" stroke-width="2" stroke-linejoin="round" opacity="0.8"/>
    ${points.map(pt => `<circle cx="${pt.split(",")[0]}" cy="${pt.split(",")[1]}" r="3" fill="${p.accent}" opacity="0.9"/>`).join("")}
    <text font-family="sans-serif" font-size="${Math.max(10, w / 24)}px" fill="${p.text}" text-anchor="middle" dominant-baseline="middle" x="${w / 2}" y="${h - 8}" opacity="0.65">${label}</text>
  `;
}

function sceneBanner(p: Palette, w: number, h: number, label: string): string {
  const cx = w / 2;
  const cy = h / 2;
  const r1 = Math.max(w, h) * 0.6;
  const r2 = Math.max(w, h) * 0.4;
  return `
    <circle cx="${cx * 0.2}" cy="${cy * 0.3}" r="${r1}" fill="${p.accent}" opacity="0.07"/>
    <circle cx="${w * 0.85}" cy="${h * 0.75}" r="${r2}" fill="${p.muted}" opacity="0.1"/>
    ${grid(p, w, h, 40)}
    ${dots(p, 18, w, h, label.length)}
    <text font-family="sans-serif" font-size="${Math.max(13, w / 18)}px" fill="${p.text}" text-anchor="middle" dominant-baseline="middle" x="${cx}" y="${cy}" opacity="0.9" font-weight="600">${label}</text>
    ${shimmer(p, cx - 80, cy + 22, 160, 6)}
    ${shimmer(p, cx - 50, cy + 34, 100, 5)}
  `;
}

function sceneTech(p: Palette, w: number, h: number, label: string): string {
  const cx = w / 2;
  const cy = h / 2;
  // hex grid pattern
  const hexes: string[] = [];
  const hr = 18, hh = hr * Math.sqrt(3) / 2;
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 9; col++) {
      const hx = col * hr * 1.5 - 10;
      const hy = row * hh * 2 + (col % 2 ? hh : 0) - 10;
      const op = 0.04 + ((row * 3 + col * 7) % 5) * 0.03;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (i * 60 - 30) * Math.PI / 180;
        return `${(hx + hr * Math.cos(a)).toFixed(1)},${(hy + hr * Math.sin(a)).toFixed(1)}`;
      }).join(" ");
      hexes.push(`<polygon points="${pts}" fill="none" stroke="${p.accent}" stroke-width="0.6" opacity="${op}"/>`);
    }
  }
  return `
    ${hexes.join("")}
    ${lines(p, cx, cy, 10, Math.min(w, h) * 0.42)}
    <circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) * 0.22}" fill="${p.accent}" opacity="0.12" stroke="${p.accent}" stroke-width="1" stroke-opacity="0.4"/>
    <circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) * 0.1}" fill="${p.accent}" opacity="0.3"/>
    <text font-family="sans-serif" font-size="${Math.max(11, w / 22)}px" fill="${p.text}" text-anchor="middle" dominant-baseline="middle" x="${cx}" y="${cy + Math.min(w, h) * 0.33}" opacity="0.85" font-weight="500">${label}</text>
  `;
}

function sceneMap(p: Palette, w: number, h: number, label: string): string {
  const cx = w / 2;
  const cy = h / 2;
  const seed = label.length;
  // draw irregular "continent" blobs
  const blobs = Array.from({ length: 4 }, (_, i) => {
    const bx = ((seed * 17 + i * 83) % (w - 80)) + 40;
    const by = ((seed * 31 + i * 57) % (h - 60)) + 30;
    const bw = 40 + (i * 29 % 60);
    const bh = 25 + (i * 41 % 40);
    return `<ellipse cx="${bx}" cy="${by}" rx="${bw}" ry="${bh}" fill="${p.muted}" opacity="0.2" stroke="${p.accent}" stroke-width="0.5" stroke-opacity="0.3"/>`;
  });
  // pin marker
  return `
    ${grid(p, w, h, 28)}
    ${blobs.join("")}
    <circle cx="${cx}" cy="${cy}" r="8" fill="${p.accent}" opacity="0.9"/>
    <circle cx="${cx}" cy="${cy}" r="14" fill="${p.accent}" opacity="0.2" stroke="${p.accent}" stroke-width="1" stroke-opacity="0.5"/>
    <circle cx="${cx}" cy="${cy}" r="20" fill="${p.accent}" opacity="0.08" stroke="${p.accent}" stroke-width="0.8" stroke-opacity="0.3"/>
    <text font-family="sans-serif" font-size="${Math.max(10, w / 24)}px" fill="${p.text}" text-anchor="middle" dominant-baseline="middle" x="${cx}" y="${h - 14}" opacity="0.75">${label}</text>
  `;
}

function sceneFood(p: Palette, w: number, h: number, label: string): string {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.32;
  // plate with steam lines
  const steam = Array.from({ length: 3 }, (_, i) => {
    const sx = cx + (i - 1) * 22;
    const sy = cy - r - 5;
    return `<path d="M${sx} ${sy} Q${sx + 6} ${sy - 12} ${sx} ${sy - 24} Q${sx - 6} ${sy - 36} ${sx} ${sy - 48}"
      fill="none" stroke="${p.accent}" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>`;
  });
  return `
    ${dots(p, 15, w, h, 5)}
    <ellipse cx="${cx}" cy="${cy + r * 0.15}" rx="${r * 1.1}" ry="${r * 0.22}" fill="${p.muted}" opacity="0.25"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.accent}" opacity="0.18" stroke="${p.accent}" stroke-width="1.2" stroke-opacity="0.5"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.65}" fill="${p.muted}" opacity="0.15"/>
    ${steam.join("")}
    <text font-family="sans-serif" font-size="${Math.max(11, w / 22)}px" fill="${p.text}" text-anchor="middle" dominant-baseline="middle" x="${cx}" y="${cy + r + 18}" opacity="0.85" font-weight="500">${label}</text>
  `;
}

function sceneProfile(p: Palette, w: number, h: number, label: string): string {
  // Distinct from avatar card — rectangular "profile banner" style
  const initials = label.split(/\s+/).map(w => w[0] || "").slice(0, 2).join("").toUpperCase() || "U";
  const avatarR = Math.min(w, h) * 0.22;
  const cx = w * 0.35;
  const cy = h * 0.45;
  return `
    <rect width="${w}" height="${h * 0.45}" fill="${p.accent}" opacity="0.18"/>
    ${dots(p, 12, w, h * 0.45, 13)}
    <circle cx="${cx}" cy="${cy}" r="${avatarR + 3}" fill="${p.bg}"/>
    <circle cx="${cx}" cy="${cy}" r="${avatarR}" fill="${p.muted}" opacity="0.5"/>
    <text font-family="sans-serif" font-size="${avatarR * 0.65}px" fill="${p.text}" text-anchor="middle" dominant-baseline="central" x="${cx}" y="${cy}" font-weight="600" opacity="0.9">${initials}</text>
    ${shimmer(p, w * 0.55, h * 0.52, w * 0.35, 9)}
    ${shimmer(p, w * 0.55, h * 0.66, w * 0.25, 7)}
    <text font-family="sans-serif" font-size="${Math.max(10, w / 24)}px" fill="${p.text}" text-anchor="start" dominant-baseline="middle" x="${w * 0.55}" y="${h * 0.82}" opacity="0.7">${label}</text>
  `;
}

// ─── Classifier ──────────────────────────────────────────────────────────────
type SceneKey = "photo" | "product" | "avatar" | "graph" | "banner" | "tech" | "map" | "food" | "profile";

const KEYWORDS: Record<SceneKey, string[]> = {
  avatar:  ["avatar", "profile", "user", "person", "account", "member", "author", "team", "face", "photo of"],
  profile: ["banner", "cover", "card", "bio", "header"],
  photo:   ["photo", "image", "picture", "landscape", "nature", "background", "hero", "scene", "gallery"],
  product: ["product", "item", "goods", "price", "shop", "store", "buy", "cart", "listing", "thumbnail"],
  graph:   ["chart", "graph", "data", "analytics", "stats", "metric", "revenue", "sales", "growth", "trend"],
  banner:  ["banner", "ads", "promo", "offer", "campaign", "marketing", "featured"],
  tech:    ["code", "tech", "software", "app", "api", "server", "cloud", "system", "network", "ai", "ml"],
  map:     ["map", "location", "address", "place", "area", "region", "city", "route", "directions"],
  food:    ["food", "meal", "recipe", "dish", "restaurant", "cooking", "eat", "drink", "cuisine"],
};

function classifyScene(alt: string, prompt: string): SceneKey {
  const text = (alt + " " + prompt).toLowerCase();
  const scores: Partial<Record<SceneKey, number>> = {};
  for (const [scene, keys] of Object.entries(KEYWORDS) as [SceneKey, string[]][]) {
    scores[scene] = keys.filter(k => text.includes(k)).length;
  }
  const best = (Object.entries(scores) as [SceneKey, number][]).sort((a, b) => b[1] - a[1])[0];
  if (best[1] > 0) return best[0];
  // fallback rotation based on hash
  const scenes: SceneKey[] = ["photo", "product", "banner", "tech", "graph"];
  const hash = [...(alt + prompt)].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return scenes[hash % scenes.length];
}

// ─── Main generator ───────────────────────────────────────────────────────────
let _globalIndex = 0;

export function generateSemanticSVG(
  alt: string,
  prompt: string,
  w = 400,
  h = 300,
  isAvatar = false
): string {
  const idx = _globalIndex++;
  const palette = PALETTES[idx % PALETTES.length];
  const label = (alt || "Image").replace(/[<>&"]/g, "").slice(0, 28);

  if (isAvatar) {
    const size = Math.min(w, h);
    return encode(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="${palette.bg}" rx="${size / 2}"/>
        ${sceneAvatarCard(palette, size, size, label)}
      </svg>`
    );
  }

  const scene = classifyScene(alt, prompt);
  const scenes: Record<SceneKey, (p: Palette, w: number, h: number, l: string) => string> = {
    photo:   scenePhoto,
    product: sceneProduct,
    avatar:  sceneAvatarCard,
    graph:   sceneGraph,
    banner:  sceneBanner,
    tech:    sceneTech,
    map:     sceneMap,
    food:    sceneFood,
    profile: sceneProfile,
  };

  const body = scenes[scene](palette, w, h, label);
  return encode(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <rect width="${w}" height="${h}" fill="${palette.bg}"/>
      ${body}
    </svg>`
  );
}

// ─── injectImages — drop-in replacement ─────────────────────────────────────
const BROKEN_DOMAINS = [
  "via.placeholder.com",
  "picsum.photos",
  "source.unsplash.com",
  "images.unsplash.com",
  "placeholder.com",
  "dummyimage.com",
  "lorempixel.com",
];

const brokenUrlRegex = new RegExp(
  `(['"\`])https?:\\/\\/(${BROKEN_DOMAINS.map(d => d.replace(/\./g, "\\.")).join("|")})[^'"\`]*\\1`,
  "g"
);

export function injectImages(files: Record<string, any>, prompt: string) {
  const newFiles = { ...files };

  for (const path in newFiles) {
    let content = newFiles[path]?.content;
    if (typeof content !== "string") continue;

    // ── 1. Replace <img src="..."> tags ─────────────────────────────────────
    content = content.replace(
      /<img([^>]*?)src=(\{[^}]+\}|"[^"]*")([^>]*?)(?:\/?>)/g,
      (fullMatch: string, pre: string, _src: string, post: string) => {
        const combined = pre + post;

        const isAvatar = /rounded-full|avatar|w-\d{1,2}[\s"]/i.test(combined);

        const altMatch = combined.match(/alt="([^"]*)"/);
        const alt = altMatch ? altMatch[1] : "";

        const [imgW, imgH] = isAvatar ? [150, 150] : [400, 300];
        const newSrc = generateSemanticSVG(alt, prompt, imgW, imgH, isAvatar);

        const hasClassName = /className=/.test(combined);
        const className = hasClassName
          ? combined.match(/className="([^"]*)"/)?.[1] || "rounded-xl object-cover w-full h-48"
          : isAvatar
          ? "rounded-full object-cover"
          : "rounded-xl object-cover w-full h-48";

        const otherAttrs = combined
          .replace(/className="[^"]*"/, "")
          .replace(/alt="[^"]*"/, "")
          .trim();

        const altAttr = altMatch ? `alt="${altMatch[1]}"` : 'alt=""';
        return `<img src="${newSrc}" ${altAttr} className="${className}" ${otherAttrs}/>`;
      }
    );

    // ── 2. Replace broken URLs in JS strings ────────────────────────────────
    content = content.replace(
      brokenUrlRegex,
      (_match: string, quote: string) => {
        const url = generateSemanticSVG("", prompt, 400, 300, false);
        return `${quote}${url}${quote}`;
      }
    );

    newFiles[path].content = content;
  }

  return newFiles;
}