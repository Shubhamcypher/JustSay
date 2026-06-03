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
  isPatchingRef?: React.RefObject<boolean>
) {
  const [url, setUrl] = useState<string | null>(null);

  // Track when wc is ready so we can re-trigger the main effect
  const [wcReady, setWcReady] = useState(false);

  const wcRef = useRef<any>(null);
  const startedRef = useRef(false);

  const lastPkgRef = useRef<string | null>(null);

  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


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
        (window as any).__wc = wc;  // Expose wc for snapshot access
      });
      setWcReady(true); // ← trigger the main effect to re-run
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
    if (Object.keys(files).length === 0) return;

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

          const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App</title>
    <script src="/screenshot-helper.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
          await wc.fs.writeFile("index.html", indexHtml);

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

          await wc.fs.mkdir("public", { recursive: true });
          await wc.fs.writeFile("public/screenshot-helper.js", `
  window.addEventListener('message', async function(e) {
      if (e.data?.type !== 'TAKE_SCREENSHOT') return;
      
      try {
          // Dynamically load html2canvas from CDN inside the preview
          if (!window.__html2canvas) {
              await new Promise((res, rej) => {
                  const s = document.createElement('script');
                  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                  s.onload = res;
                  s.onerror = rej;
                  document.head.appendChild(s);
              });
              window.__html2canvas = html2canvas;
          }
          const canvas = await window.__html2canvas(document.body, { scale: 0.5, useCORS: true });
          const data = canvas.toDataURL('image/jpeg', 0.6);
          window.parent.postMessage({ type: 'SCREENSHOT_RESULT', snapshot: data }, '*');
      } catch(err) {
          window.parent.postMessage({ type: 'SCREENSHOT_ERROR', error: err.message }, '*');
      }
  });
`);

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

      // 🔄 NORMAL FILE SYNC — debounced to prevent rapid re-triggers during patch animation
      try {
        if (isPatchingRef?.current) return;
        // Small debounce — if another sync is already pending, skip this one
        // The final sync after animation completes will have the correct content
        const syncFiles = Object.entries(files);
        for (const [filePath, file] of syncFiles) {
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

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      run();
    }, 100);
  }, [files, isReady, wcReady]);

  return { url, wcRef };
}