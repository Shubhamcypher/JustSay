import { useEffect, useRef, useState } from "react";
import { getWebContainer } from "@/lib/webContainer";

export function useWebContainer(
  files: Record<string, any>,
  isReady: boolean
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
        console.log("🌐 Server ready:", url);
        setUrl(url);
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

  // 🛠 Fix index.html (CRITICAL)
  function fixIndexHtml(files: Record<string, any>) {
    if (!files["index.html"]) return;

    let content = files["index.html"].content;

    // ❌ REMOVE any css link
    content = content.replace(/<link.*?>/g, "");

    // ✅ FORCE correct root div
    content = content.replace(/<div[^>]*>/, `<div id="root">`);

    // ✅ FORCE correct script
    content = content.replace(
      /<script.*<\/script>/,
      `<script type="module" src="/src/main.tsx"></script>`
    );

    files["index.html"].content = content;
  }

  function detectDependencies(files: Record<string, any>) {
    const deps = new Set<string>();

    const content = Object.values(files)
      .map((f: any) => f.content)
      .join("\n");

    // 🔥 Detect common libraries
    if (content.includes("react-redux")) deps.add("react-redux");
    if (content.includes("@reduxjs/toolkit")) deps.add("@reduxjs/toolkit");
    if (content.includes("axios")) deps.add("axios");
    if (content.includes("react-router-dom")) deps.add("react-router-dom");

    return Array.from(deps);
  }

  // 🛠 Fix package.json (minimal safe)
  function fixPackageJson(files: Record<string, any>) {
    const detectedDeps = detectDependencies(files);

    // base dependencies (always needed)
    const dependencies: Record<string, string> = {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    };

    // 🔥 add detected ones
    detectedDeps.forEach((dep) => {
      dependencies[dep] = "latest";
    });

    files["package.json"] = {
      path: "package.json",
      content: JSON.stringify({
        name: "app",
        private: true,
        version: "0.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview"
        },
        dependencies,
        devDependencies: {
          vite: "^4.0.0",
          typescript: "^5.0.0",
          "@vitejs/plugin-react": "^4.0.0"
        }
      }, null, 2)
    };
  }

  function autoFixFiles(files: Record<string, any>) {
    Object.keys(files).forEach((path) => {
      let content = files[path].content;
  
      // ❌ Remove Angular garbage
      content = content.replace(/@angular\/core/g, "");
  
      // ❌ Remove invalid CSS imports
      content = content.replace(/import\s+["']\.\/styles\/.*\.css["'];?/g, "");
  
      // ❌ Remove missing service imports
      if (!files["src/services/todo.service.ts"]) {
        content = content.replace(/import .*todo\.service.*;/g, "");
      }
  
      // ❌ Fix default export issues
      if (content.includes("export const")) {
        content = content.replace("export const", "const");
        content += "\nexport default App;";
      }
  
      files[path].content = content;
    });
  }

  // 🔄 MAIN EXECUTION (FIXED)
  useEffect(() => {
    if (!wcRef.current) return;
    if (!isReady) return;
    if (startedRef.current) return;

    // ✅ PREVENT MULTIPLE RUNS
    startedRef.current = true;

    const hasCoreFiles =
      files["package.json"] &&
      files["index.html"] &&
      files["src/main.tsx"] &&
      files["src/App.tsx"];

    if (!hasCoreFiles) {
      console.log("⏳ Waiting for core files...");
      startedRef.current = false;
      return;
    }

    const run = async () => {
      const wc = wcRef.current;

      try {
        const stableFiles = JSON.parse(JSON.stringify(files));
        console.log("🛠 Fixing project...");

        fixIndexHtml(stableFiles);
        fixPackageJson(stableFiles);
        autoFixFiles(stableFiles);

        console.log("📁 Mounting project...");
        await wc.mount(buildTree(stableFiles));

        console.log("📦 Installing dependencies...");
        const install = await wc.spawn("npm", ["install"]);
        await install.exit;

        console.log("🚀 Starting dev server...");
        const dev = await wc.spawn("npm", ["run", "dev"]);

        dev.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log(data);
            },
          })
        );
      } catch (err) {
        console.error("❌ WebContainer error:", err);
      }
    };

    run();
  }, [isReady]); // ✅ ONLY isReady (IMPORTANT)

  return url;
}