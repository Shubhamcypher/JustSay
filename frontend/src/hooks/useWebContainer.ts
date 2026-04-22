import { useEffect, useRef, useState } from "react";
import { getWebContainer } from "@/lib/webContainer";

export function useWebContainer(
  files: Record<string, any>,
  isReady: boolean,
  onLog?: (msg: string, type?: string) => void
) {
  const [url, setUrl] = useState<string | null>(null);

  const wcRef = useRef<any>(null);
  const startedRef = useRef(false);

  // 🚀 Boot WebContainer ONCE
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const wc = await getWebContainer();
      if (!mounted) return;

      wcRef.current = wc;

      wc.on("server-ready", (_: any, url: string) => {
        setUrl(url);
        onLog?.("🌐 Preview ready!");
      });
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // 🧱 Build file tree
  function buildTree(files: Record<string, any>) {
    const root: any = {};

    for (const [path, file] of Object.entries(files)) {
      const parts = path.split("/").filter(Boolean);
      let current = root;

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = {
            file: { contents: file.content || "" },
          };
        } else {
          current[part] = current[part] || { directory: {} };
          current = current[part].directory;
        }
      });
    }

    return root;
  }

  // 🔥 FIX 1: index.html paths
  function fixIndexHtml(files: Record<string, any>) {
    if (!files["index.html"]) return files;

    const newFiles = { ...files };
    let content = newFiles["index.html"].content;

    // Fix script
    content = content.replace(
      /<script type="module" src=".*?"><\/script>/,
      `<script type="module" src="/src/main.tsx"></script>`
    );

    // Remove wrong CSS links (we'll handle via JS import)
    content = content.replace(/<link rel="stylesheet".*?>/g, "");

    newFiles["index.html"] = {
      ...newFiles["index.html"],
      content,
    };

    return newFiles;
  }

  // 🔥 FIX 2: export/import mismatch
  function fixExports(files: Record<string, any>) {
    const newFiles = { ...files };

    for (const path in newFiles) {
      let content = newFiles[path].content;

      if (typeof content !== "string") {
        console.warn("Skipping non-string file:", path, content);
        continue;
      }

      // 🔥 FIX: export const hook → default export safely
      content = content.replace(
        /export const (\w+)\s*=\s*\(/g,
        "const $1 = ("
      );

      content = content.replace(
        /const (\w+)\s*=\s*\(/g,
        (match: any, fnName: any) => {
          if (path.includes("hooks")) {
            return `const ${fnName} = (`;
          }
          return match;
        }
      );

      // add default export at end if missing
      if (path.includes("hooks") && !content.includes("export default")) {
        const match = content.match(/const (\w+)/);
        if (match) {
          content += `\n\nexport default ${match[1]};`;
        }
      }

      // 🔥 Fix import mismatch
      content = content.replace(
        /import\s+{?\s*(\w+)\s*}?\s+from\s+['"](.*hooks\/.*)['"]/g,
        "import $1 from '$2'"
      );

      newFiles[path].content = content;
    }

    return newFiles;
  }

  // 🔥 FIX 3: CSS handling
  function fixCss(files: Record<string, any>) {
    const newFiles = { ...files };

    // Ensure CSS exists
    if (!newFiles["src/styles/global.css"]) {
      newFiles["src/styles/global.css"] = {
        content: "body { font-family: sans-serif; margin: 0; padding: 0; }",
      };
    }

    // Ensure CSS is imported in main.tsx
    if (newFiles["src/main.tsx"]) {
      let content = newFiles["src/main.tsx"].content;

      if (!content.includes("global.css")) {
        content = `import "./styles/global.css";\n` + content;
      }

      newFiles["src/main.tsx"].content = content;
    }

    return newFiles;
  }

  //CSS import got fixed like ./todoList.css instead of .styles/todoList.css
  //but in editor still shows wrong imports
  function fixRelativeCssImports(files: Record<string, any>) {
    const newFiles = { ...files };
  
    const cssFiles = Object.keys(files).filter((f) => f.endsWith(".css"));
  
    for (const filePath in newFiles) {
      if (!filePath.endsWith(".tsx") && !filePath.endsWith(".ts")) continue;
  
      let content = newFiles[filePath].content;
      if (typeof content !== "string") continue;
  
      content = content.replace(
        /import\s+['"](.+\.css)['"]/g,
        (match, importPath) => {
          const cssName = importPath.split("/").pop();
  
          // 🔥 find actual file in project
          const actualCssPath = cssFiles.find((f) =>
            f.endsWith(cssName as string)
          );
  
          if (!actualCssPath) {
            // 🔥 FORCE fallback to styles folder
            const cssName = importPath.split("/").pop();
          
            const fallbackPath = `src/styles/${cssName}`;
          
            const from = filePath.split("/");
            const to = fallbackPath.split("/");
          
            from.pop();
          
            while (from.length && to.length && from[0] === to[0]) {
              from.shift();
              to.shift();
            }
          
            const up = "../".repeat(from.length);
            const down = to.join("/");
          
            return `import '${up}${down}'`;
          }
  
          // 🔥 compute correct relative path
          const from = filePath.split("/");
          const to = actualCssPath.split("/");
  
          from.pop();
  
          while (from.length && to.length && from[0] === to[0]) {
            from.shift();
            to.shift();
          }
  
          const up = "../".repeat(from.length);
          const down = to.join("/");
  
          const correctPath = `${up}${down}`;
  
          // ✅ ONLY replace if different
          if (correctPath !== importPath) {
            return `import '${correctPath}'`;
          }
  
          return match;
        }
      );
  
      newFiles[filePath].content = content;
    }
  
    return newFiles;
  }

  function fixBrokenStyleImports(files: Record<string, any>) {
    const newFiles = { ...files };
  
    for (const filePath in newFiles) {
      let content = newFiles[filePath].content;
      if (typeof content !== "string") continue;
  
      // fix broken absolute style imports
      content = content.replace(
        /import\s+['"]styles\//g,
        `import './styles/`
      );
  
      newFiles[filePath].content = content;
    }
  
    return newFiles;
  }

  // 🧠 Detect dependencies
  function detectDependencies(files: Record<string, any>) {
    const deps = new Set<string>();

    const content = Object.values(files)
      .map((f: any) => f.content)
      .join("\n");

    if (/from ["']react-redux["']/.test(content)) deps.add("react-redux");
    if (/from ["']@reduxjs\/toolkit["']/.test(content)) deps.add("@reduxjs/toolkit");
    if (/from ["']axios["']/.test(content)) deps.add("axios");
    if (/from ["']react-router-dom["']/.test(content)) deps.add("react-router-dom");

    return Array.from(deps);
  }

  // 🔥 FIX 4: package.json
  function fixPackageJson(files: Record<string, any>) {
    const newFiles = { ...files };
    const detectedDeps = detectDependencies(files);

    const dependencies: Record<string, string> = {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    };

    detectedDeps.forEach((dep) => {
      dependencies[dep] = "latest";
    });

    newFiles["package.json"] = {
      path: "package.json",
      content: JSON.stringify(
        {
          name: "app",
          private: true,
          version: "0.0.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview",
          },
          dependencies,
          devDependencies: {
            vite: "^4.0.0",
            typescript: "^5.0.0",
            "@vitejs/plugin-react": "^4.0.0",
          },
        },
        null,
        2
      ),
    };

    return newFiles;
  }

  // 🚀 MAIN EXECUTION
  useEffect(() => {
    if (!wcRef.current) return;
    if (!isReady) return;
    if (startedRef.current) return;


    // if (Object.keys(files).length < 5) {
    //   console.log("⏳ Waiting for enough files...");
    //   return;
    // }


    const run = async () => {
        startedRef.current = true;
        const wc = wcRef.current;
        console.log("🚀 Running WebContainer with files:", Object.keys(files));

        try {
          console.log("In try block");

          onLog?.("🛠 Preparing project...");

          let stableFiles = JSON.parse(JSON.stringify(files));

          // 🔥 FULL FIX PIPELINE
          stableFiles = fixIndexHtml(stableFiles);
          console.log("HTML done");
          stableFiles = fixExports(stableFiles);
          console.log("exports done");
          stableFiles = fixCss(stableFiles);
          console.log("css done");
          stableFiles = fixRelativeCssImports(stableFiles);
          console.log("Relative css done");
          stableFiles = fixBrokenStyleImports(stableFiles);
          console.log("Broken Style Imports done");
          stableFiles = fixPackageJson(stableFiles);
          console.log("json done");


        onLog?.("📁 Mounting files...", "start");
        await wc.mount(buildTree(stableFiles));
        onLog?.("📁 Mounting files...", "end");

        onLog?.("📦 Installing dependencies...", "start");
        const install = await wc.spawn("npm", ["install"]);
        await install.exit;
        onLog?.("📦 Installing dependencies...", "end");

        onLog?.("🚀 Running dev server...", "start");
        const dev = await wc.spawn("npm", ["run", "dev"]);
        onLog?.("🚀 Running dev server...", "end");


        dev.output.pipeTo(
          new WritableStream({
            write(data) {
              // onLog?.(data.toString(), "info");
              console.log(data.toString());
            },
          })
        );
      } catch (err) {
        console.error("❌ WebContainer error:", err);
        startedRef.current = false;
      }
    };

    run();
  }, [isReady]);

  return url;
}