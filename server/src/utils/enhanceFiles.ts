export function enhanceFiles(files: Record<string, any>) {
    const newFiles = { ...files };
  
    for (const path in newFiles) {
        let content = newFiles[path]?.content;
        if (typeof content !== "string") continue;
  
      // ❌ Remove CDN injection here - fixTailwind handles it now
  
      content = content.replace(
        /<button(?![^>]*className)([^>]*)>/g,
        `<button$1 className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition">`
      );
  
      content = content.replace(
        /className="app-container"/g,
        `className="app-container max-w-6xl mx-auto p-6"`
      );
  
      newFiles[path].content = content;
    }
  
    return newFiles;
  }