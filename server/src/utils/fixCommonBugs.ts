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
      (_: any, before: any, after: any) => {
        const cleaned = (before + after)
          .replace(/,\s*,/g, ",")
          .replace(/^\s*,|,\s*$/g, "")
          .trim();
        const parts = cleaned.split(",").map((s: string) => s.trim()).filter(Boolean);
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

    // Single hook: import { useCart } from '../hooks/useCart' → import useCart from '../hooks/useCart'
    content = content.replace(
      /import\s+\{\s*(use[A-Z][a-zA-Z]*)\s*\}\s+from\s+(['"](?:[^'"]*\/)?hooks\/[^'"]+['"])/g,
      "import $1 from $2"
    );

    // Multiple hooks from same file: import { useCart, useWishlist } from '../hooks/useCart'
    // → split into separate default imports (rare but the model does it)
    content = content.replace(
      /import\s+\{([^}]*use[A-Z][^}]*)\}\s+from\s+(['"](?:[^'"]*\/)?hooks\/[^'"]+['"])/g,
      (_: any, imports: any, hookPath: any) => {
        const hooks = imports.split(",").map((s: string) => s.trim()).filter(Boolean);
        return hooks.map((h: string) => `import ${h} from ${hookPath}`).join("\n");
      }
    );

    // ✅ Remove BrowserRouter from App.tsx (main.tsx already has HashRouter)
    // ✅ REPLACE the existing App.tsx router removal block with this
    if (path.endsWith("App.tsx") || path.endsWith("App.jsx")) {

      // Remove router imports (including aliases like BrowserRouter as Router)
      content = content.replace(
        /import\s+\{[^}]*(?:BrowserRouter|HashRouter|MemoryRouter)(?:\s+as\s+\w+)?[^}]*\}\s+from\s+['"]react-router-dom['"];\n?/g,
        ""
      );
      // Remove: import { X as Router } pattern
      content = content.replace(
        /import\s+\{[^}]*\bas\s+Router\b[^}]*\}\s+from\s+['"]react-router-dom['"];\n?/g,
        ""
      );
      // Remove opening router tags — BrowserRouter, HashRouter, MemoryRouter, or Router alias
      content = content.replace(
        /<(?:BrowserRouter|HashRouter|MemoryRouter|Router)(?:\s[^>]*)?>[\s]*/g,
        ""
      );
      // Remove closing router tags
      content = content.replace(
        /\s*<\/(?:BrowserRouter|HashRouter|MemoryRouter|Router)>/g,
        ""
      );
    }


    // ✅ Fix missing exports in context files
if (path.includes("context/") || path.includes("Context.")) {

  // 1. Fix createContext — ensure named export exists
  const contextMatches = [...content.matchAll(
    /const\s+([A-Z][a-zA-Z]*Context)\s*=\s*createContext/g
  )];

  for (const match of contextMatches) {
    const contextName = match[1];

    const isNamedExported = new RegExp(
      `export\\s+const\\s+${contextName}|export\\s*\\{[^}]*${contextName}`
    ).test(content);

    const isDefaultExported = new RegExp(
      `export\\s+default\\s+${contextName}`
    ).test(content);

    if (!isNamedExported) {
      if (isDefaultExported) {
        content = content.replace(
          `export default ${contextName}`,
          `export { ${contextName} };\nexport default ${contextName}`
        );
      } else {
        content = content.replace(
          `const ${contextName} = createContext`,
          `export const ${contextName} = createContext`
        );
      }
      console.log(`🔧 fixCommonBugs: added named export for ${contextName} in ${path}`);
    }
  }

  // 2. Fix Provider components — ensure named export exists
  const providerMatches = [...content.matchAll(
    /const\s+([A-Z][a-zA-Z]*Provider)\s*=/g
  )];

  for (const match of providerMatches) {
    const providerName = match[1];
    const isExported = new RegExp(
      `export\\s+const\\s+${providerName}|export\\s+default\\s+${providerName}|export\\s*\\{[^}]*${providerName}`
    ).test(content);

    if (!isExported) {
      content = content.replace(
        `const ${providerName} =`,
        `export const ${providerName} =`
      );
      console.log(`🔧 fixCommonBugs: added export for ${providerName} in ${path}`);
    }
  }

  // 3. Fix useX hooks inside context files — ensure named export exists
  const hookMatches = [...content.matchAll(
    /const\s+(use[A-Z][a-zA-Z]*)\s*=/g
  )];

  for (const match of hookMatches) {
    const hookName = match[1];
    const isExported = new RegExp(
      `export\\s+const\\s+${hookName}|export\\s+default\\s+${hookName}|export\\s*\\{[^}]*${hookName}`
    ).test(content);

    if (!isExported) {
      content = content.replace(
        `const ${hookName} =`,
        `export const ${hookName} =`
      );
      console.log(`🔧 fixCommonBugs: added export for ${hookName} in ${path}`);
    }
  }
}


    // ✅ ADD — strip axios import and usage (axios not in package.json)
    if (content.includes("axios")) {
      // Remove axios import line entirely
      content = content.replace(
        /import\s+axios\s+from\s+['"]axios['"];\n?/g,
        ""
      );
      // Remove axios.create() instance — replace with a base URL constant
      content = content.replace(
        /const\s+\w+\s*=\s*axios\.create\(\{[^}]*\}\);?\n?/g,
        ""
      );
      // axios.get(url, config) → fetch(url)
      content = content.replace(
        /axios\.get\(([^,)]+)(?:,[^)]*)?\)/g,
        "fetch($1).then(r => r.json())"
      );
      // axios.post(url, data) → fetch(url, { method: 'POST', body: JSON.stringify(data) })
      content = content.replace(
        /axios\.post\(([^,)]+),\s*([^)]+)\)/g,
        "fetch($1, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify($2) }).then(r => r.json())"
      );
      // axios.put / axios.delete — generic fallback
      content = content.replace(
        /axios\.(put|delete|patch)\(([^)]+)\)/g,
        "fetch($2)"
      );
      // Any remaining axios.anything → fetch
      content = content.replace(/axios\.\w+/g, "fetch");
    }

    newFiles[path].content = content;
  }

  return newFiles;
}