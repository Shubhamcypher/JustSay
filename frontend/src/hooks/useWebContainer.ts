import { useEffect, useRef, useState } from "react";
import { getWebContainer } from "@/lib/webContainer";


const TEMPLATE_PACKAGE_JSON = JSON.stringify({
  name: "app",
  private: true,
  version: "1.0.0",
  type: "module",
  scripts: {
    dev: "vite",
    build: "vite build",
    preview: "vite preview"
  },
  dependencies: {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6.26.0"
  },
  devDependencies: {
    "vite": "^5",
    "typescript": "^5",
    "@vitejs/plugin-react": "^4",
    "tailwindcss": "^3.4.0",
    "postcss": "^8",
    "autoprefixer": "^10"
  }
}, null, 2);

export function useWebContainer(
  files: Record<string, any>,
  isReady: boolean,
  onLog?: (msg: string, type?: string) => void,
  addStep?: (text: string, type?: string) => any,
  completeStep?: (step: any) => void,


) {
  const [url, setUrl] = useState<string | null>(null);

  const wcRef = useRef<any>(null);
  const startedRef = useRef(false);

  const lastPkgRef = useRef<string | null>(null);

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



  //MAIN EXECUTION(Run once and then run on sync)
  useEffect(() => {
    if (!wcRef.current) return;
    if (!isReady) return;

    const wc = wcRef.current;

    const run = async () => {
      const pkgString = JSON.stringify(files["package.json"] || {});
      const pkgChanged = pkgString !== lastPkgRef.current;

      // 🚀 FIRST RUN
      if (!startedRef.current) {
        try {
          console.log("🚀 Initializing WebContainer");

          const s1 = addStep?.("Building file tree", "build");
          await wc.mount(buildTree(files));
          completeStep?.(s1);

          console.log("📦 PKG RAW:", files["package.json"]);

          // 🔥 FORCE package.json write (CRITICAL)
          // const pkgContent =
          //   typeof files["package.json"] === "string"
          //     ? files["package.json"]
          //     : files["package.json"]?.content;


          // console.log("📦 PKG CONTENT STRING:", pkgContent);

          // const s2 = addStep?.("Writing package.json", "build");
          // await wc.fs.writeFile("package.json", pkgContent);
          // console.log("📦 package.json written");
          // completeStep?.(s2);
          const s2 = addStep?.("Writing package.json", "build");
          await wc.fs.writeFile("package.json", TEMPLATE_PACKAGE_JSON);
          console.log("📦 package.json written from hardcoded template");
          completeStep?.(s2);

          // 🔍 VERIFY WRITE
          const readPkg = await wc.fs.readFile("package.json", "utf-8");
          console.log("📦 PKG ON DISK:", readPkg);


          const s3 = addStep?.("Installing dependencies", "build");
          const install = await wc.spawn("npm", ["install"]);

          // install.output.pipeTo(
          //   new WritableStream({
          //     write(data) {
          //       console.log("📦 npm install:", data.toString());
          //     },
          //   })
          // );

          await install.exit;
          console.log("📦 INSTALL DONE");
          completeStep?.(s3);


          const s4 = addStep?.("Checking dependencies", "build");
          const check = await wc.spawn("npm", ["ls", "react-router-dom"]);
          await check.exit;
          completeStep?.(s4);

          check.output.pipeTo(
            new WritableStream({
              write(data) {
                console.log("📦 CHECK RRD:", data.toString());
              },
            })
          );

          const s5 = addStep?.("Checking node modules", "build");
          const lsNodeModules = await wc.spawn("ls", ["node_modules"]);
          lsNodeModules.exit;
          completeStep?.(s5);

          lsNodeModules.output.pipeTo(
            new WritableStream({
              write(data) {
                console.log("📦 node_modules:", data.toString());
              },
            })
          );

          const s6 = addStep?.("Running dev server", "build");
          const dev = await wc.spawn("npm", ["run", "dev"]);
          completeStep?.(s6);

          dev.output.pipeTo(
            new WritableStream({
              write(data) {
                console.log(data.toString());
              },
            })
          );

          lastPkgRef.current = pkgString;
          startedRef.current = true;

        } catch (err) {
          console.error("❌ INIT ERROR:", err);
        }

        return;
      }

      // 🔁 PACKAGE CHANGED → reinstall
      if (pkgChanged) {
        try {
          const s1 = addStep?.("Change in package detected", "build");
          console.log("🔁 package.json changed → reinstall");
          completeStep?.(s1);

          const s2 = addStep?.("Stopping dev server", "build");
          await wc.spawn("pkill", ["node"]);
          completeStep?.(s2);

          const s3 = addStep?.("Rebuilding file tree", "build");
          await wc.mount(buildTree(files));
          completeStep?.(s3);

          console.log("🔁 PKG RAW:", files["package.json"]);

          // 🔥 FORCE package.json write again
          const s4 = addStep?.("Rewriting package.json", "build");
          await wc.fs.writeFile("package.json", TEMPLATE_PACKAGE_JSON);
          console.log("🔁 package.json rewritten from hardcoded template");
          completeStep?.(s4);

          // verify disk
          const readPkg = await wc.fs.readFile("package.json", "utf-8");
          console.log("🔁 PKG ON DISK:", readPkg);

          const s5 = addStep?.("Removing deprecated files from node modules", "build");
          const rm = await wc.spawn("rm", ["-rf", "node_modules"]);
          rm.exit;
          completeStep?.(s5);

          const s6 = addStep?.("Reinstalling dependencies", "build");
          const install = await wc.spawn("npm", ["install"]);

          // install.output.pipeTo(
          //   new WritableStream({
          //     write(data) {
          //       console.log("🔁 npm install:", data.toString());
          //     },
          //   })
          // );

          await install.exit;
          console.log("🔁 INSTALL DONE");
          completeStep?.(s6);


          const s7 = addStep?.("Checking package.json with new file updates", "build");
          const check = await wc.spawn("npm", ["ls", "react-router-dom"]);
          check.exit;
          completeStep?.(s7);

          check.output.pipeTo(
            new WritableStream({
              write(data) {
                console.log("🔁 CHECK RRD:", data.toString());
              },
            })
          );

          const s8 = addStep?.("Checking node modules", "build");
          const ls = await wc.spawn("ls", ["node_modules"]);
          ls.exit;
          completeStep?.(s8);

          ls.output.pipeTo(
            new WritableStream({
              write(data) {
                console.log("🔁 node_modules:", data.toString());
              },
            })
          );

          const s9 = addStep?.("Running dev server", "build");
          const dev = await wc.spawn("npm", ["run", "dev"]);
          completeStep?.(s9);

          dev.output.pipeTo(
            new WritableStream({
              write(data) {
                console.log(data.toString());
              },
            })
          );

          lastPkgRef.current = pkgString;

        } catch (err) {
          console.error("❌ REINSTALL ERROR:", err);
        }

        return;
      }

      // 🔄 NORMAL FILE SYNC
      try {
        for (const [filePath, file] of Object.entries(files)) {
          const content =
            typeof file === "string"
              ? file
              : (file as any)?.content || "";

          if (!content || content.length < 10) continue;

          await wc.fs.writeFile(filePath, content);
        }
      } catch (err) {
        console.error("❌ SYNC ERROR:", err);
      }
    };

    run();
  }, [files, isReady]);

  return url;
}