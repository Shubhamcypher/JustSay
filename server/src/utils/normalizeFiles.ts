export function normalizeFiles(files: Record<string, any>) {
    const normalized: Record<string, { content: string }> = {};
  
    for (const path in files) {
      const value = files[path];
  
      if (typeof value === "string") {
        normalized[path] = { content: value };
      } else if (value?.content) {
        normalized[path] = { content: value.content };
      } else {
        normalized[path] = { content: "" };
      }
    }
  
    return normalized;
  }