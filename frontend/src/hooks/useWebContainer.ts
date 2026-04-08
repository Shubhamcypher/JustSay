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
        console.log("📁 Fixing package.json...");
        fixPackageJson(files);
        
        console.log("📁 Mounting project...");
        await wc.mount(buildTree(files));

        console.log("📦 Installing dependencies...");
        const install = await wc.spawn("npm", ["install", "--include=dev"]);
        await install.exit;

        installedRef.current = true;
        console.log("✅ Dependencies installed");

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