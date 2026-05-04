export function injectImages(files: Record<string, any>, prompt: string) {
    const newFiles = { ...files };
    const keywords = prompt.toLowerCase();
  
    const imagePool: Record<string, string[]> = {
      shoe: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400",
        "https://images.unsplash.com/photo-1584735175315-9d5df23be27b?w=400",
      ],
      food: [
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
      ],
      video: [
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400",
        "https://images.unsplash.com/photo-1536240478700-b869ad10e2f3?w=400",
        "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400",
      ],
      music: [
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
      ],
      travel: [
        "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400",
      ],
      fashion: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400",
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400",
      ],
      tech: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
      ],
      default: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
      ],
    };
  
    // Select pool based on prompt keywords
    let selected = imagePool.default;
    if (keywords.includes("shoe") || keywords.includes("sneaker")) selected = imagePool.shoe;
    else if (keywords.includes("food") || keywords.includes("restaurant") || keywords.includes("recipe")) selected = imagePool.food;
    else if (keywords.includes("video") || keywords.includes("youtube") || keywords.includes("stream")) selected = imagePool.video;
    else if (keywords.includes("music") || keywords.includes("song") || keywords.includes("playlist")) selected = imagePool.music;
    else if (keywords.includes("travel") || keywords.includes("hotel") || keywords.includes("booking")) selected = imagePool.travel;
    else if (keywords.includes("fashion") || keywords.includes("clothing") || keywords.includes("outfit")) selected = imagePool.fashion;
    else if (keywords.includes("tech") || keywords.includes("software") || keywords.includes("saas") || keywords.includes("dashboard")) selected = imagePool.tech;
  
    let index = 0;
  
    // Patterns that indicate small/icon images — don't replace these
    const SKIP_PATTERNS = [
      /avatar/i,
      /logo/i,
      /icon/i,
      /thumbnail.*small/i,
      /w-\d{1,2}\s/,   // small fixed widths like w-8, w-10
      /h-\d{1,2}\s/,   // small fixed heights
    ];
  
    for (const path in newFiles) {
      let content = newFiles[path]?.content;
      if (typeof content !== "string") continue;
  
      content = content.replace(
        /<img([^>]*?)src=(\{[^}]+\}|"[^"]*")([^>]*?)(?:\/?>)/g,
        (fullMatch, pre, _src, post) => {
          const combined = pre + post;
  
          // Skip small/icon images — preserve their original tag
          if (SKIP_PATTERNS.some(p => p.test(combined))) {
            return fullMatch;
          }
  
          const img = selected[index % selected.length];
          index++;
  
          // Preserve existing className if present, otherwise add default
          const hasClassName = /className=/.test(combined);
          const className = hasClassName
            ? combined.match(/className="([^"]*)"/)?.[1] || "rounded-xl object-cover w-full h-48"
            : "rounded-xl object-cover w-full h-48";
  
          // Rebuild tag preserving all attributes except src and className
          const otherAttrs = combined
            .replace(/className="[^"]*"/, "")
            .replace(/alt="[^"]*"/, "")
            .trim();
  
          const altMatch = combined.match(/alt="([^"]*)"/);
          const alt = altMatch ? `alt="${altMatch[1]}"` : 'alt=""';
  
          return `<img src="${img}" ${alt} className="${className}" ${otherAttrs}/>`;
        }
      );
  
      newFiles[path].content = content;
    }
  
    return newFiles;
  }