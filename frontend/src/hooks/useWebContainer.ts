import { useEffect, useRef, useState } from "react";
import { getWebContainer } from "@/lib/webContainer";

export function useWebContainer(
  files: Record<string, any>,
  isReady: boolean
) {
  const [url, setUrl] = useState<string | null>(null);

  const wcRef = useRef<any>(null);
  const installedRef = useRef(false);
  const startedRef = useRef(false);

  function fixPackageJson(files: Record<string, any>) {
    if (!files["package.json"]) return;

    const pkg = JSON.parse(files["package.json"].content);

    pkg.dependencies = {
      ...(pkg.dependencies || {}),
      react: pkg.dependencies?.react || "^18.2.0",
      "react-dom": pkg.dependencies?.["react-dom"] || "^18.2.0",
    };

    pkg.devDependencies = {
      ...(pkg.devDependencies || {}),
      vite: pkg.devDependencies?.vite || "^4.0.0",
      typescript: pkg.devDependencies?.typescript || "^4.0.0",
      tailwindcss: pkg.devDependencies?.tailwindcss || "^3.0.0",
      postcss: pkg.devDependencies?.postcss || "^8.0.0",
      autoprefixer: pkg.devDependencies?.autoprefixer || "^10.0.0",
    };

    files["package.json"].content = JSON.stringify(pkg, null, 2);
  }

  function ensureTailwindSetup(files: Record<string, any>) {
    // ✅ Ensure index.css exists
    if (!files["src/index.css"]) {
      files["src/index.css"] = {
        path: "src/index.css",
        content: `
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
        `.trim(),
      };
    }

    // ✅ Ensure main.tsx imports CSS
    if (files["src/main.tsx"]) {
      let content = files["src/main.tsx"].content;

      if (!content.includes('import "./index.css"')) {
        files["src/main.tsx"].content =
          `import "./index.css";\n` + content;
      }
    }

    // ✅ Ensure tailwind.config.js content paths
    if (files["tailwind.config.js"]) {
      let content = files["tailwind.config.js"].content;

      if (!content.includes("./src/**/*")) {
        files["tailwind.config.js"].content = `
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
        `.trim();
      }
    }
  }

  function fixTailwindApply(files: Record<string, any>) {
    if (!files["src/index.css"]) return;

    let css = files["src/index.css"].content;

    // remove circular apply patterns
    css = css.replace(/\.([a-z0-9-]+)\s*{\s*@apply\s+\1;\s*}/g, "");

    files["src/index.css"].content = css;
  }

  function validateHTML(files: Record<string, any>) {
    const html = files["index.html"]?.content || "";

    if (html.includes("{") || html.includes("onClick")) {
      throw new Error("❌ Invalid HTML: JSX detected in index.html");
    }
  }

  function ensureReactImport(files: Record<string, any>) {
    ["src/main.tsx", "src/App.tsx"].forEach((filePath) => {
      if (!files[filePath]) return;

      let content = files[filePath].content;

      if (!content.includes('import React')) {
        files[filePath].content =
          `import React from "react";\n` + content;
      }
    });
  }

  function detectAndFixDependencies(files: Record<string, any>) {
    if (!files["package.json"]) return;

    const pkg = JSON.parse(files["package.json"].content);

    const allContent = Object.values(files)
      .map((f: any) => f.content)
      .join("\n");

    const deps = pkg.dependencies || {};

    // 🔥 detect react-router-dom
    if (allContent.includes("react-router-dom")) {
      deps["react-router-dom"] = "^6.0.0";
    }

    pkg.dependencies = deps;

    files["package.json"].content = JSON.stringify(pkg, null, 2);
  }

  function fixReactRouterImports(files: Record<string, any>) {
    Object.keys(files).forEach((path) => {
      if (!path.endsWith(".tsx") && !path.endsWith(".ts")) return;

      let content = files[path].content;

      // fix default import → named import
      content = content.replace(
        /import\s+(\w+)\s+from\s+["']react-router-dom["']/g,
        "import { $1 } from \"react-router-dom\""
      );

      files[path].content = content;
    });
  }

  // 🚀 Boot once
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const wc = await getWebContainer();
      if (!mounted) return;

      wcRef.current = wc;

      wc.on("server-ready", (_: any, url: string) => {
        setUrl(url);
      });
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // 🔥 Build tree
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

  // 🔄 MAIN EXECUTION
  useEffect(() => {
    if (!wcRef.current) return;
    if (!isReady) return;
    if (startedRef.current) return;

    // ✅ Ensure core files exist
    const hasCoreFiles =
      files["package.json"] &&
      files["index.html"] &&
      (files["src/main.tsx"] || files["src/main.jsx"]);

    if (!hasCoreFiles) {
      console.log("⏳ Waiting for core files...");
      return;
    }

    const run = async () => {
      const wc = wcRef.current;

      try {
        console.log("Fixing HTML");
        validateHTML(files);

        console.log("🛠 Fixing Tailwind...");
        ensureTailwindSetup(files);

        console.log("Fixing tailwind applies");
        fixTailwindApply(files);

        console.log("Fixing dependencies...");
        detectAndFixDependencies(files);

        console.log("📁 Fixing package.json...");
        fixPackageJson(files);

        console.log("📁 Mounting project...");
        await wc.mount(buildTree(files));

        console.log("Fixing React import...");
        ensureReactImport(files);

        console.log("Fixing router imports...");
        fixReactRouterImports(files);

        console.log("📦 Installing dependencies...");
        const install = await wc.spawn("npm", ["install", "--include=dev"]);
        await install.exit;

        installedRef.current = true;
        console.log("✅ Dependencies installed");

        console.log("🧹 Clearing Vite cache...");

        // remove vite cache
        await wc.spawn("rm", ["-rf", "node_modules/.vite"]);

        // optional: also clear dist
        await wc.spawn("rm", ["-rf", "dist"]);

        console.log("🚀 Starting dev server...");
        const dev = await wc.spawn("npm", ["run", "dev"]);

        dev.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log(data);
            },
          })
        );

        startedRef.current = true;
      } catch (err) {
        console.error("❌ WebContainer error:", err);
      }
    };

    run();
  }, [files, isReady]); // ✅ FIXED

  return url;
}