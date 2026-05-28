// injectImages.ts — semantic image resolver for WebContainer environments
// Strategy: map alt/context → curated Unsplash photo IDs (browser fetches directly, no server call)
// Falls back to SVG generator for avatars and anything unresolvable.

// ─── Curated Unsplash photo pool ─────────────────────────────────────────────
// Each entry: [photoId, tags[]]
// IDs are stable CDN assets: https://images.unsplash.com/photo-{id}?w=400&q=80&fit=crop&auto=format
// Grouped by semantic category for classifier

const PHOTO_POOL: [string, string[]][] = [
  // ── Technology / Software / AI ──
  ["1518770660439-4636190af475", ["tech", "technology", "code", "coding", "software", "developer", "programming", "keyboard", "computer", "laptop"]],
  ["1461749280684-dccba630e2f6", ["code", "programming", "developer", "ide", "screen", "monitor"]],
  ["1677442135703-1787eea5ce01", ["ai", "artificial intelligence", "machine learning", "ml", "neural", "robot"]],
  ["1593642632559-0c6d3fc62b89", ["server", "cloud", "infrastructure", "network", "hosting"]],
  ["1550751827-4bd374c3f58b", ["cybersecurity", "security", "hacking", "privacy", "data"]],
  ["1488229297570-58520851e68a", ["analytics", "dashboard", "metrics", "monitoring", "systems"]],

  // ── Business / Finance / Office ──
  ["1507003211169-0a1dd7228f2d", ["business", "office", "work", "professional", "corporate", "workspace"]],
  ["1454165804606-c3d57bc86b40", ["meeting", "team", "collaboration", "discussion", "conference"]],
  ["1611532736597-de2d4265fba3", ["finance", "money", "investment", "banking", "trading", "stocks", "economy"]],
  ["1434626881859-ed8b8ce98258", ["startup", "entrepreneur", "company", "brand", "growth"]],
  ["1497366216548-37526070297c", ["coworking", "open office", "modern office", "desk", "startup office"]],
  ["1556742049-0cfed4f6a45d", ["charts", "graphs", "data visualization", "reporting", "revenue"]],

  // ── People / Portraits / Team ──
  ["1472099645785-5658abf4ff4e", ["man", "male", "person", "portrait", "professional headshot"]],
  ["1438761681033-6461ffad8d80", ["woman", "female", "person", "portrait", "headshot"]],
  ["1573497019940-1c28c88b4f3e", ["team", "people", "group", "coworkers", "employees", "staff"]],
  ["1531746020798-e6953c6e8e04", ["mentor", "leader", "ceo", "executive", "speaker", "presenter"]],
  ["1507003211169-0a1dd7228f2d", ["profile", "bio", "author", "member", "account", "user"]],
  ["1494790108377-be9c29b29330", ["avatar", "user photo", "profile picture", "selfie"]],

  // ── Food & Drink ──
  ["1567620905732-2d1ec7ab7445", ["food", "meal", "dish", "plate", "eating", "restaurant", "dining"]],
  ["1546069901-ba9599a7e63c", ["healthy food", "salad", "vegetables", "nutrition", "vegan"]],
  ["1565299624946-b28f40a0ae38", ["pizza", "fast food", "italian", "junk food", "casual dining"]],
  ["1551782793-1eb6bfe91a28", ["coffee", "cafe", "espresso", "drink", "morning", "beverage"]],
  ["1565958011703-44f9829ba187", ["dessert", "cake", "sweet", "pastry", "bakery"]],
  ["1414235077428-338989a2e8c0", ["fine dining", "gourmet", "chef", "culinary", "upscale restaurant"]],

  // ── Travel / Places / Architecture ──
  ["1499856871958-5b9627545d1a", ["paris", "europe", "eiffel", "france", "city", "travel"]],
  ["1506905925346-21bda4d32df4", ["mountain", "nature", "landscape", "hiking", "outdoors", "adventure"]],
  ["1507525428034-b723cf961d3e", ["beach", "ocean", "sea", "tropical", "vacation", "summer"]],
  ["1480714378408-67cf0d13bc1b", ["city", "urban", "skyline", "architecture", "buildings", "downtown"]],
  ["1495562569060-2eec283d3618", ["hotel", "resort", "luxury", "accommodation", "travel"]],
  ["1436491865332-7a61a109cc05", ["airport", "flight", "plane", "travel", "transportation"]],

  // ── Health / Fitness / Wellness ──
  ["1571019613454-1cb2f99b2d8b", ["fitness", "gym", "workout", "exercise", "training", "sport"]],
  ["1512621776951-a57141f2eefd", ["health", "healthy", "wellness", "nutrition", "diet", "lifestyle"]],
  ["1544367567-0f2fcb009e0b", ["yoga", "meditation", "mindfulness", "zen", "calm", "relaxation"]],
  ["1559757148-5d9b8e534f96", ["running", "jogging", "marathon", "athlete", "cardio"]],
  ["1576091160399-112ba8d25d1d", ["medical", "hospital", "doctor", "healthcare", "clinic", "medicine"]],

  // ── Education / Learning ──
  ["1503676260728-1c00da094a0b", ["education", "school", "learning", "study", "university", "student"]],
  ["1456513080510-7bf3a84b82f8", ["books", "library", "reading", "knowledge", "research"]],
  ["1509062522246-3cade8b3ba1c", ["classroom", "teaching", "lecture", "course", "lesson"]],

  // ── E-commerce / Products / Shopping ──
  ["1523275335684-37898b6baf30", ["product", "watch", "luxury product", "ecommerce", "item"]],
  ["1491553895911-0055eca6402d", ["shoes", "sneakers", "footwear", "fashion product", "apparel"]],
  ["1526170375885-4d8ecf77b99f", ["polaroid", "product photography", "camera", "gadget", "photo"]],
  ["1585386959984-a4155224a1ad", ["beauty", "cosmetics", "perfume", "skincare", "product"]],
  ["1505740420928-5e560c06d30e", ["headphones", "electronics", "audio", "tech product", "gadget"]],
  ["1434056886845-dac89ffe9b56", ["furniture", "home", "interior", "decor", "design product"]],

  // ── Creative / Design / Art ──
  ["1558618666-fcd25c85cd64", ["design", "creative", "art", "illustration", "graphic", "ui ux"]],
  ["1513364776144-60967b0f800f", ["photography", "camera", "photo", "creative", "visual"]],
  ["1541701494587-cb58502866ab", ["art", "painting", "gallery", "creative", "artistic", "abstract"]],
  ["1558618047-3d3b2b5a0f89", ["music", "concert", "band", "audio", "studio", "recording"]],

  // ── Real Estate / Interior ──
  ["1560448204-e02f11c3d0e2", ["home", "house", "real estate", "property", "apartment"]],
  ["1586023492125-27b2c045efd7", ["interior", "room", "living room", "decor", "furniture", "home design"]],
  ["1505691938895-1758d7feb511", ["kitchen", "modern kitchen", "cooking space", "home"]],
  ["1540518614846-7eded433c457", ["bedroom", "bedroom design", "sleeping", "room"]],

  // ── Nature / Environment ──
  ["1441974231531-c6227db76b6e", ["forest", "nature", "trees", "environment", "green", "eco"]],
  ["1518173946687-a4c8892bbd9f", ["sunset", "sunrise", "sky", "clouds", "atmosphere", "golden hour"]],
  ["1504701954957-2010ec3bcec1", ["water", "lake", "reflection", "peaceful", "nature", "calm"]],

  // ── Social / Community / Events ──
  ["1511795409834-ef04bbd61622", ["event", "conference", "networking", "social", "gathering", "party"]],
  ["1528605248644-14a1e0a9a3e7", ["community", "friends", "social", "group", "people together"]],
  ["1540575467537-5e1f6e57c6a7", ["celebration", "success", "achievement", "award", "milestone"]],
];

// ─── Palette for SVG fallbacks ────────────────────────────────────────────────
const PALETTES = [
  { bg: "#1e1b4b", accent: "#818cf8", text: "#e0e7ff", muted: "#6366f1" },
  { bg: "#0f172a", accent: "#38bdf8", text: "#e0f2fe", muted: "#0ea5e9" },
  { bg: "#064e3b", accent: "#34d399", text: "#d1fae5", muted: "#10b981" },
  { bg: "#1e1a16", accent: "#fbbf24", text: "#fef3c7", muted: "#d97706" },
  { bg: "#3b0764", accent: "#c084fc", text: "#f3e8ff", muted: "#a855f7" },
  { bg: "#1a1523", accent: "#f472b6", text: "#fce7f3", muted: "#ec4899" },
  { bg: "#0c1a2e", accent: "#60a5fa", text: "#dbeafe", muted: "#3b82f6" },
  { bg: "#042f2e", accent: "#2dd4bf", text: "#ccfbf1", muted: "#14b8a6" },
];

type Palette = typeof PALETTES[number];

// ─── Unsplash URL builder ────────────────────────────────────────────────────
function unsplashUrl(photoId: string, w = 400, h = 300): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&q=80&fit=crop&auto=format`;
}

// ─── Semantic classifier ──────────────────────────────────────────────────────
// Returns best-matching photo ID from PHOTO_POOL given alt + prompt context
function findBestPhoto(
  alt: string,
  prompt: string,
  w: number,
  h: number,
  index: number
): string {
  const text = (alt + " " + prompt).toLowerCase();

  let bestId = "";
  let bestScore = 0;

  for (const [id, tags] of PHOTO_POOL) {
    const score = tags.reduce((acc, tag) => {
      if (text.includes(tag)) return acc + tag.split(" ").length; // multi-word tags score higher
      // partial word match
      const words = tag.split(" ");
      const partials = words.filter(w => text.includes(w)).length;
      return acc + partials * 0.5;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  // If no semantic match, rotate through pool deterministically
  if (!bestId || bestScore === 0) {
    const hash = [...(alt + prompt)].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const poolIndex = (hash + index) % PHOTO_POOL.length;
    bestId = PHOTO_POOL[poolIndex][0];
  }

  return unsplashUrl(bestId, w, h);
}

// ─── SVG avatar generator (avatars stay as SVG — no real face needed) ────────
let _avatarIndex = 0;

function encode(svg: string): string {
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function generateAvatarSVG(label: string): string {
  const p = PALETTES[_avatarIndex % PALETTES.length];
  _avatarIndex++;
  const size = 150;
  const initials = label
    .split(/\s+/)
    .map((w) => w[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  const dotsArr = Array.from({ length: 20 }, (_, i) => {
    const x = ((i * 73 + label.length * 37) % (size - 20)) + 10;
    const y = ((i * 41 + label.length * 53) % (size - 20)) + 10;
    const op = 0.15 + (i % 4) * 0.1;
    return `<circle cx="${x}" cy="${y}" r="${1 + (i % 3)}" fill="${p.accent}" opacity="${op}"/>`;
  }).join("");

  return encode(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${p.bg}" rx="${size / 2}"/>
    ${dotsArr}
    <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.32}" fill="${p.muted}" opacity="0.35"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.32}" fill="none" stroke="${p.accent}" stroke-width="1.5" opacity="0.5"/>
    <text font-family="sans-serif" font-size="${size * 0.3}px" fill="${p.text}" text-anchor="middle" dominant-baseline="central" x="${size / 2}" y="${size / 2}" font-weight="600" opacity="0.9">${initials}</text>
  </svg>`);
}

// ─── SVG placeholder for when we truly have nothing (rare fallback) ──────────
function generatePlaceholderSVG(label: string, w: number, h: number, index: number): string {
  const p = PALETTES[index % PALETTES.length];
  const cx = w / 2;
  const cy = h / 2;
  // Simple grid + centered label — minimal, not distracting
  const gridLines: string[] = [];
  for (let x = 30; x < w; x += 30) {
    gridLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="${p.accent}" stroke-width="0.4" opacity="0.1"/>`);
  }
  for (let y = 30; y < h; y += 30) {
    gridLines.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${p.accent}" stroke-width="0.4" opacity="0.1"/>`);
  }
  const clean = (label || "Image").replace(/[<>&"]/g, "").slice(0, 28);
  return encode(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="${p.bg}"/>
    ${gridLines.join("")}
    <circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) * 0.15}" fill="${p.accent}" opacity="0.15" stroke="${p.accent}" stroke-width="1" stroke-opacity="0.3"/>
    <text font-family="sans-serif" font-size="${Math.max(11, w / 24)}px" fill="${p.text}" text-anchor="middle" dominant-baseline="middle" x="${cx}" y="${cy}" opacity="0.7" font-weight="500">${clean}</text>
  </svg>`);
}

// ─── URL replacement helpers ─────────────────────────────────────────────────

// Domains that are definitively broken in WebContainer / CORS-blocked
const BROKEN_DOMAINS = [
  "via.placeholder.com",
  "picsum.photos",
  "source.unsplash.com",   // redirect API — unreliable in WebContainer
  "placeholder.com",
  "dummyimage.com",
  "lorempixel.com",
  "placeimg.com",
  "placekitten.com",
  "loremflickr.com",
];

// NOTE: images.unsplash.com is NOT in this list — it's a direct CDN and works fine.

const brokenUrlRegex = new RegExp(
  `(['"\`])https?:\\/\\/(${BROKEN_DOMAINS.map((d) => d.replace(/\./g, "\\.")).join("|")})[^'"\`]*\\1`,
  "g"
);

// Detect if an <img> tag is an avatar (circular, small, user-related)
function isAvatarImg(attrs: string): boolean {
  return /rounded-full|w-\d{1,2}[\s"']|h-\d{1,2}[\s"']|avatar|profile-pic/i.test(attrs);
}

// ─── Main export ─────────────────────────────────────────────────────────────
let _imgIndex = 0;

export function injectImages(
  files: Record<string, any>,
  prompt: string
): Record<string, any> {
  const newFiles = { ...files };

  for (const path in newFiles) {
    let content = newFiles[path]?.content;
    if (typeof content !== "string") continue;

    // ── 1. Replace <img src="..."> tags ────────────────────────────────────
    content = content.replace(
      /<img([^>]*?)src=(\{[^}]+\}|"[^"]*"|'[^']*')([^>]*?)(?:\/?>)/g,
      (fullMatch: string, pre: string, srcAttr: string, post: string) => {
        const combined = pre + " " + post;
        const index = _imgIndex++;

        // Extract existing alt text for semantic matching
        const altMatch = combined.match(/alt=["']([^"']*)["']/);
        const alt = altMatch ? altMatch[1] : "";

        // Avatars → SVG (no real face needed, keeps it clean)
        if (isAvatarImg(combined)) {
          const svgSrc = generateAvatarSVG(alt || "User");
          const existingClass = combined.match(/className=["']([^"']*)["']/)?.[1];
          const cls = existingClass || "rounded-full object-cover";
          const otherAttrs = combined
            .replace(/className=["'][^"']*["']/, "")
            .replace(/alt=["'][^"']*["']/, "")
            .trim();
          return `<img src="${svgSrc}" alt="${alt || "User"}" className="${cls}" ${otherAttrs}/>`;
        }

        // Check if existing src is already a good Unsplash CDN URL — keep it
        const srcValue = srcAttr.replace(/^['"`]|['"`]$/g, "");
        if (
          srcValue.startsWith("https://images.unsplash.com/photo-") &&
          !srcValue.includes("source.unsplash.com")
        ) {
          return fullMatch; // Already a valid real image — don't touch
        }

        // Determine dimensions from className hints
        let w = 400;
        let h = 300;
        const classStr = combined.match(/className=["']([^"']*)["']/)?.[1] || "";
        if (/h-48|h-\[12|h-\[14/.test(classStr)) h = 200;
        if (/h-64|h-\[16|h-\[18/.test(classStr)) h = 256;
        if (/h-96|h-\[24|h-\[28/.test(classStr)) h = 384;
        if (/w-full|w-screen/.test(classStr)) w = 800;

        // Get real Unsplash photo
        const newSrc = findBestPhoto(alt, prompt, w, h, index);

        const existingClass = combined.match(/className=["']([^"']*)["']/)?.[1];
        const cls = existingClass || "rounded-xl object-cover w-full h-48";
        const otherAttrs = combined
          .replace(/className=["'][^"']*["']/, "")
          .replace(/alt=["'][^"']*["']/, "")
          .trim();

        return `<img src="${newSrc}" alt="${alt || ""}" className="${cls}" ${otherAttrs}/>`;
      }
    );

    // ── 2. Replace broken placeholder URLs in JS strings / template literals ─
    content = content.replace(
      brokenUrlRegex,
      (_match: string, quote: string) => {
        const index = _imgIndex++;
        const url = findBestPhoto("", prompt, 400, 300, index);
        return `${quote}${url}${quote}`;
      }
    );

    // ── 3. Fix malformed Unsplash URLs (wrong subdomain, no params) ──────────
    // source.unsplash.com/category/WxH → replace with pool photo
    content = content.replace(
      /(['"`])https?:\/\/source\.unsplash\.com\/[^'"`]+(['"`])/g,
      (_match: string, q1: string, q2: string) => {
        const index = _imgIndex++;
        return `${q1}${findBestPhoto("", prompt, 400, 300, index)}${q2}`;
      }
    );

    // Unsplash URLs missing quality params — add them
    content = content.replace(
      /(https:\/\/images\.unsplash\.com\/photo-[\w-]+)(?!\?)/g,
      "$1?w=400&h=300&q=80&fit=crop&auto=format"
    );

    newFiles[path] = { ...newFiles[path], content };
  }

  return newFiles;
}

// ─── Re-export SVG generator for places that still need offline fallback ─────
export { generatePlaceholderSVG as generateSemanticSVG };