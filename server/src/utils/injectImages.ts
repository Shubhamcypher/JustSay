export function injectImages(files: Record<string, any>, prompt: string) {
  const newFiles = { ...files };

  // ── Inline SVG placeholders — work in any sandboxed environment ──────────
  const imagePool = [
      `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%234F46E5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='white'%3EImage%3C/text%3E%3C/svg%3E`,
      `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%236366F1'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='white'%3EImage%3C/text%3E%3C/svg%3E`,
      `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%238B5CF6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='white'%3EImage%3C/text%3E%3C/svg%3E`,
      `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%230EA5E9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='white'%3EImage%3C/text%3E%3C/svg%3E`,
      `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%2310B981'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='white'%3EImage%3C/text%3E%3C/svg%3E`,
  ];

  const avatarPool = [
      `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='150' height='150' fill='%234F46E5' rx='75'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='white'%3EU%3C/text%3E%3C/svg%3E`,
      `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='150' height='150' fill='%238B5CF6' rx='75'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='white'%3EU%3C/text%3E%3C/svg%3E`,
      `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='150' height='150' fill='%230EA5E9' rx='75'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='white'%3EU%3C/text%3E%3C/svg%3E`,
  ];

  // ── BROKEN URL DOMAINS ────────────────────────────────────────────────────
  const BROKEN_DOMAINS = [
      "via.placeholder.com",
      "picsum.photos",
      "source.unsplash.com",
      "images.unsplash.com",  // ← also broken in webcontainer
      "placeholder.com",
      "dummyimage.com",
      "lorempixel.com",
  ];

  const brokenUrlRegex = new RegExp(
      `(['"\`])https?:\\/\\/(${BROKEN_DOMAINS.map(d => d.replace(/\./g, "\\.")).join("|")})[^'"\`]*\\1`,
      "g"
  );

  let imgIndex = 0;
  let avatarIdx = 0;

  for (const path in newFiles) {
      let content = newFiles[path]?.content;
      if (typeof content !== "string") continue;

      // ── 1. Replace <img src="..."> tags ──────────────────────────────────
      content = content.replace(
          /<img([^>]*?)src=(\{[^}]+\}|"[^"]*")([^>]*?)(?:\/?>)/g,
          (fullMatch, pre, _src, post) => {
              const combined = pre + post;

              // Detect avatar/icon by className size hints
              const isAvatar = /rounded-full|avatar|w-\d{1,2}[\s"]/i.test(combined);

              const pool = isAvatar ? avatarPool : imagePool;
              const idx = isAvatar ? avatarIdx++ : imgIndex++;
              const img = pool[idx % pool.length];

              const hasClassName = /className=/.test(combined);
              const className = hasClassName
                  ? combined.match(/className="([^"]*)"/)?.[1] || "rounded-xl object-cover w-full h-48"
                  : isAvatar ? "rounded-full object-cover" : "rounded-xl object-cover w-full h-48";

              const otherAttrs = combined
                  .replace(/className="[^"]*"/, "")
                  .replace(/alt="[^"]*"/, "")
                  .trim();

              const altMatch = combined.match(/alt="([^"]*)"/);
              const alt = altMatch ? `alt="${altMatch[1]}"` : 'alt=""';

              return `<img src="${img}" ${alt} className="${className}" ${otherAttrs}/>`;
          }
      );

      // ── 2. Replace broken URLs in JS strings ─────────────────────────────
      content = content.replace(
          brokenUrlRegex,
          (_match:any, quote:any) => {
              const url = avatarPool[avatarIdx % avatarPool.length];
              avatarIdx++;
              return `${quote}${url}${quote}`;
          }
      );

      newFiles[path].content = content;
  }

  return newFiles;
}