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

      // ✅ Inject Header if it exists in the project but isn't imported
      const hasHeader = Object.keys(newFiles).some(p =>
        p.endsWith("Header.tsx") || p.endsWith("Header.jsx")
      );
      const importsHeader = content.includes("import Header");

      if (hasHeader && !importsHeader) {
        content = `import Header from './components/Header';\n` + content;

        // Try to inject before AppRoutes inside a wrapper tag
        if (/<AppRoutes\s*\/>/.test(content)) {
          content = content.replace(
            /<AppRoutes\s*\/>/,
            `<Header />\n        <AppRoutes />`
          );
        }
        console.log(`🔧 fixCommonBugs: injected Header into App.tsx`);
      }

      // ✅ Inject Footer if it exists in the project but isn't imported
      const hasFooter = Object.keys(newFiles).some(p =>
        p.endsWith("Footer.tsx") || p.endsWith("Footer.jsx")
      );
      const importsFooter = content.includes("import Footer");

      if (hasFooter && !importsFooter) {
        content = `import Footer from './components/Footer';\n` + content;

        // Inject after AppRoutes
        if (/<AppRoutes\s*\/>/.test(content)) {
          content = content.replace(
            /<AppRoutes\s*\/>/,
            `<AppRoutes />\n        <Footer />`
          );
        }
        console.log(`🔧 fixCommonBugs: injected Footer into App.tsx`);
      }
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

    // ✅ Fix .toFixed() on potentially undefined values
    // e.g. product.price.toFixed(2) → (product?.price ?? 0).toFixed(2)
    content = content.replace(
      /(\w+(?:\??\.\w+)+)\.toFixed\(/g,
      "($1 ?? 0).toFixed("
    );

    // ✅ Fix .map() on potentially undefined arrays in JSX
    // e.g. {products.map( → {(products ?? []).map(
    content = content.replace(
      /\{(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\.map\(/g,
      (_: any, space: any, expr: any) => {
        // Don't double-wrap already safe expressions
        if (expr.startsWith("(") || expr.includes("??")) return `{${space}${expr}.map(`;
        return `{${space}(${expr} ?? []).map(`;
      }
    );

    // ✅ Fix direct numeric prop display without null guard
    // e.g. {product.price} → {product?.price ?? 0}
    // Only in JSX expression positions (inside {})
    content = content.replace(
      /\{([a-zA-Z_$][a-zA-Z0-9_$]*)\.price\}/g,
      "{$1?.price ?? 0}"
    );
    content = content.replace(
      /\{([a-zA-Z_$][a-zA-Z0-9_$]*)\.count\}/g,
      "{$1?.count ?? 0}"
    );
    content = content.replace(
      /\{([a-zA-Z_$][a-zA-Z0-9_$]*)\.quantity\}/g,
      "{$1?.quantity ?? 0}"
    );
    content = content.replace(
      /\{([a-zA-Z_$][a-zA-Z0-9_$]*)\.total\}/g,
      "{$1?.total ?? 0}"
    );
    content = content.replace(
      /\{([a-zA-Z_$][a-zA-Z0-9_$]*)\.amount\}/g,
      "{$1?.amount ?? 0}"
    );


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

    // ─── DATA HANDLING ────────────────────────────────────────────

    // 1. Strip fetch API calls inside useEffect
    content = content.replace(
      /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?fetch\s*\([^)]+\)[\s\S]*?\}\s*,\s*\[[^\]]*\]\s*\)/g,
      (match: any) => {
        const setterMatch = match.match(/\.(then|set)\s*\(?\s*(set[A-Z]\w*)/);
        const setter = setterMatch?.[2];
        return setter
          ? `// API call removed — ${setter} should use mock data from useState initial value`
          : `// API call removed — use mock data instead`;
      }
    );

    // 2. Strip standalone await fetch() calls
    content = content.replace(
      /const\s+\w+\s*=\s*await\s+fetch\s*\(['"]/g,
      "// const data = await fetch('"
    );

    // 3. Remove api utility imports
    content = content.replace(
      /import\s+\{[^}]+\}\s+from\s+['"][^'"]*\/utils\/api['"]\n?/g,
      ""
    );
    content = content.replace(
      /import\s+\{[^}]+\}\s+from\s+['"][^'"]*\/api\/[^'"]+['"]\n?/g,
      ""
    );

    // 4. Ensure list hooks default to empty array not null
    if (path.includes("hooks/") && content.includes("fetch(")) {
      content = content.replace(
        /const\s+\[(\w+),\s*set\1\]\s*=\s*useState\s*\(\s*(?:null|undefined)\s*\)/g,
        (match: any) => match.replace(/useState\s*\(\s*(?:null|undefined)\s*\)/, "useState([])")
      );
    }

    // ✅ Fix constants.ts — remove API_ENDPOINTS, ensure all needed exports exist
    if (path.includes("utils/constants") || path.endsWith("constants.ts")) {

      // Remove API_ENDPOINTS — no backend
      content = content.replace(
        /export\s+const\s+API_ENDPOINTS\s*=\s*\{[^}]*\};?\n?/g,
        "// API_ENDPOINTS removed — no backend\n"
      );

      // Scan ALL other files to find what they import from constants
      // and add any missing exports
      const neededExports = new Set<string>();

      for (const otherPath in newFiles) {
        if (otherPath === path) continue;
        const otherContent = newFiles[otherPath]?.content || "";

        // Find imports from constants in other files
        const importMatch = otherContent.match(
          /import\s+\{([^}]+)\}\s+from\s+['"][^'"]*constants['"]/
        );
        if (importMatch) {
          importMatch[1].split(",").forEach((imp: string) => {
            const name = imp.trim().split(" as ")[0].trim();
            if (name) neededExports.add(name);
          });
        }
      }

      // For each needed export, add it if missing from constants
      for (const exportName of neededExports) {
        if (content.includes(`export const ${exportName}`)) continue;

        console.log(`🔧 fixCommonBugs: adding missing export ${exportName} to constants`);

        if (exportName === "NAV_LINKS") {
          content += `
export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/browse', label: 'Browse' },
  { to: '/trending', label: 'Trending' },
  { to: '/library', label: 'Library' },
];
`;
        } else if (exportName === "MOCK_CATEGORIES" || exportName === "CATEGORIES") {
          content += `
export const ${exportName} = [
  'All', 'Trending', 'Music', 'Gaming', 'Education', 'Sports', 'Technology', 'Lifestyle'
];
`;
        } else if (exportName.startsWith("MOCK_") || exportName.startsWith("TRENDING_") ||
          exportName.startsWith("RECOMMENDED_") || exportName.startsWith("RELATED_") ||
          exportName.startsWith("CHANNEL_")) {
          // Generic video/item array
          const entityName = exportName.replace(/^(MOCK_|TRENDING_|RECOMMENDED_|RELATED_|CHANNEL_)/, "").toLowerCase();
          content += `
export const ${exportName} = [
  { id: '1', title: '${entityName} One', thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', views: 123456, duration: '12:34', channelName: 'Channel One', description: 'A great ${entityName}' },
  { id: '2', title: '${entityName} Two', thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400', views: 654321, duration: '08:20', channelName: 'Channel Two', description: 'Another great ${entityName}' },
  { id: '3', title: '${entityName} Three', thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400', views: 789012, duration: '15:45', channelName: 'Channel Three', description: 'Premium ${entityName} content' },
  { id: '4', title: '${entityName} Four', thumbnail: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400', views: 234567, duration: '05:30', channelName: 'Channel Four', description: 'Popular ${entityName}' },
];
`;
        } else {
          // Generic fallback for any other export name
          content += `
export const ${exportName} = [
  { id: '1', name: '${exportName} Item One', value: 'item-1' },
  { id: '2', name: '${exportName} Item Two', value: 'item-2' },
  { id: '3', name: '${exportName} Item Three', value: 'item-3' },
];
`;
        }
      }
    }

    // ✅ Remove commented-out import lines — Vite still resolves them
    content = content.replace(
      /\/\/\s*import\s+\w+\s+from\s+['"][^'"]+['"];?\n?/g,
      ""
    );

    // ✅ Fix invalid // comments inside JSX return blocks
    content = content.replace(
      /(\s*)\/\/\s*(<[A-Z][^>\n]*(?:\/?>|\n[^<]*\/>))/g,
      "$1{/* $2 */}"
    );

    newFiles[path].content = content;
  }


  // ✅ Fix files importing MOCK_ names not exported from constants
  const constantsFile = Object.keys(newFiles).find(p =>
    p.includes("utils/constants") || p.endsWith("constants.ts")
  );

  const exportedMocks = new Set<string>();
  if (constantsFile) {
    const constantsContent = newFiles[constantsFile]?.content || "";
    const mockMatches = [...constantsContent.matchAll(/export\s+const\s+(MOCK_\w+)/g)];
    for (const m of mockMatches) exportedMocks.add(m[1]);
  }


  // ✅ Remove imports of files that don't exist in the project
  const knownComponents = new Set(
    Object.keys(newFiles)
      .filter(p => p.endsWith(".tsx") || p.endsWith(".ts"))
      .map(p => p.split("/").pop()?.replace(/\.(tsx|ts)$/, ""))
      .filter(Boolean)
  );

  for (const p in newFiles) {
    let c = newFiles[p]?.content;
    if (typeof c !== "string") continue;

    const pendingInlineMocks: string[] = [];  // 👈 collect mocks here

    c = c.replace(
      /import\s+\{([^}]+)\}\s+from\s+['"][^'"]*constants['"]/g,
      (fullMatch: string, importList: string) => {
        const imports = importList.split(",").map((s: string) => s.trim()).filter(Boolean);
        const validImports: string[] = [];
        const missingMocks: string[] = [];

        for (const imp of imports) {
          const cleanImp = imp.split(" as ")[0].trim();
          if (cleanImp.startsWith("MOCK_") && !exportedMocks.has(cleanImp)) {
            missingMocks.push(cleanImp);
          } else {
            validImports.push(imp);
          }
        }

        if (missingMocks.length === 0) return fullMatch;

        // Collect inline mocks to prepend later
        missingMocks.forEach(mockName => {
          const entityName = mockName.replace("MOCK_", "").toLowerCase();
          pendingInlineMocks.push(`const ${mockName} = [
  { id: "1", name: "${entityName} One", price: 29.99, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400", description: "Quality ${entityName}" },
  { id: "2", name: "${entityName} Two", price: 49.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", description: "Premium ${entityName}" },
  { id: "3", name: "${entityName} Three", price: 19.99, image: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400", description: "Affordable ${entityName}" },
  { id: "4", name: "${entityName} Four", price: 39.99, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400", description: "Popular ${entityName}" },
];`);
        });

        console.log(`🔧 fixCommonBugs: inlined missing mocks [${missingMocks.join(", ")}] in ${p}`);

        if (validImports.length === 0) {
          return `// removed empty constants import`;
        }
        return `import { ${validImports.join(", ")} } from '../utils/constants'`;
      }
    );

    // Prepend collected mocks AFTER replace is done
    if (pendingInlineMocks.length > 0) {
      c = pendingInlineMocks.join("\n\n") + "\n\n" + c;
    }

    c = c.replace(
      /import\s+(\w+)\s+from\s+['"](\.[^'"]+)['"]/g,
      (fullMatch: string, importName: string, importPath: string) => {
        const fileName = importPath.split("/").pop()?.replace(/\.(tsx|ts)$/, "") || "";
        if (!knownComponents.has(fileName) && !knownComponents.has(importName)) {
          // ✅ Never strip imports from route files — pages arrive in later chunks
          // and will appear missing even when they exist
          if (/routes?\.(tsx|jsx)$/i.test(p) || importPath.includes("/pages/")) {
            return fullMatch;
          }
          console.warn(`🔧 Removed missing import: ${importName} from ${importPath} in ${p}`);
          return `// removed: import ${importName} — file not in project`;
        }
        return fullMatch;
      }
    );

    // Remove JSX usage of removed imports
    const removed = [...c.matchAll(/\/\/ removed: import (\w+)/g)].map((m: any) => m[1]);
    for (const name of removed) {
      // Inside .map() callbacks — return null (valid JSX, won't crash)
      c = c.replace(
        new RegExp(`\\.map\\([^)]*=>\\s*\\(\\s*<${name}[^>]*\\/\\s*>\\s*\\)`, "g"),
        `.map(() => null)`
      );
      // Inside .map() callbacks — open/close tag variant
      c = c.replace(
        new RegExp(`\\.map\\([^)]*=>\\s*\\(\\s*<${name}[^>]*>[\\s\\S]*?<\\/${name}>\\s*\\)`, "g"),
        `.map(() => null)`
      );
      // Standalone self-closing tag — wrap in div so element={} gets valid JSX
      c = c.replace(
        new RegExp(`<${name}[^>]*\\/\\s*>`, "g"),
        `<div />`
      );
      // Standalone open/close tag
      c = c.replace(
        new RegExp(`<${name}[^>]*>[\\s\\S]*?<\\/${name}>`, "g"),
        `<div />`
      );
    }

    newFiles[p].content = c;  // 👈 single assignment at the end
  }

  return newFiles;

}