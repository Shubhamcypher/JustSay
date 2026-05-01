export function fixCommonBugs(files: Record<string, any>) {
    const newFiles = { ...files };
  
    for (const path in newFiles) {
      let content = newFiles[path]?.content;
      if (typeof content !== "string") continue;
  
      // ✅ Arrow functions
      content = content.replace(/\(\)\s*=(?!>)\s*\{/g, "() => {");
      content = content.replace(/\(([^)]+)\)\s*=(?!>)\s*\{/g, "($1) => {");
  
      // ✅ Strip markdown links: [todo.id](http://todo.id) → todo.id
      content = content.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, "$1");
  
      // ✅ React Router v5 → v6
      content = content.replace(/<Switch>/g, "<Routes>");
      content = content.replace(/<\/Switch>/g, "</Routes>");
      content = content.replace(
        /<Route([^>]*?)\s+component=\{(\w+)\}/g,
        "<Route$1 element={<$2 />}"
      );
      content = content.replace(/\s+exact(?=[\s/>])/g, "");
  
      // ✅ Fix Switch import → Routes
      content = content.replace(
        /import\s+\{([^}]*)\bSwitch\b([^}]*)\}\s+from\s+['"]react-router-dom['"]/g,
        (_:any, before:any, after:any) => {
          const cleaned = (before + after)
            .replace(/,\s*,/g, ",")
            .replace(/^\s*,|,\s*$/g, "")
            .trim();
          const parts = cleaned.split(",").map((s: string )=> s.trim()).filter(Boolean);
          if (!parts.includes("Routes")) parts.push("Routes");
          return `import { ${parts.join(", ")} } from 'react-router-dom'`;
        }
      );
  
      // ✅ Fix component name collision: const Routes = → const AppRoutes =
      if (path.match(/routes?\.(tsx|jsx)$/i)) {
        content = content.replace(
          /const Routes(\s*):(\s*React\.FC[^=]*)?=/,
          "const AppRoutes$1:$2="
        );
        content = content.replace(
          /export default Routes(\s*;)/,
          "export default AppRoutes$1"
        );
      }
  
      // ✅ Named hook import → default import
      content = content.replace(
        /import\s+\{\s*(use\w+)\s*\}\s+from\s+(['"].*hooks\/.*['"])/g,
        "import $1 from $2"
      );
  
      // ✅ Remove BrowserRouter from App.tsx (main.tsx already has HashRouter)
      if (path.endsWith("App.tsx") || path.endsWith("App.jsx")) {
        content = content.replace(
          /import\s+\{[^}]*(?:BrowserRouter|HashRouter|MemoryRouter)[^}]*\}\s+from\s+['"]react-router-dom['"];\n?/g,
          ""
        );
        content = content.replace(
          /import\s+\{[^}]*as\s+Router[^}]*\}\s+from\s+['"]react-router-dom['"];\n?/g,
          ""
        );
        content = content.replace(/<(?:BrowserRouter|HashRouter|MemoryRouter|Router)[^>]*>\s*/g, "");
        content = content.replace(/\s*<\/(?:BrowserRouter|HashRouter|MemoryRouter|Router)>/g, "");
      }
  
      newFiles[path].content = content;
    }
  
    return newFiles;
  }