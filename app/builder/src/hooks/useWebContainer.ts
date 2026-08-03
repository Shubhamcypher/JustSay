import { useEffect, useRef, useState } from "react";
import { getWebContainer } from "@/lib/webContainer";
import type { WebContainer } from "@webcontainer/api";

import type { ProjectFiles, ProjectFile } from "@shared/types";



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
  files: ProjectFiles,
  isReady: boolean,
  addStep?: (
    loadingText: string,
    completedText: string,
    group?: string
  ) => number,
  completeStep?: (id: number) => void,
  isPatchingRef?: React.RefObject<boolean>
) {
  const [url, setUrl] = useState<string | null>(null);

  // Track when wc is ready so we can re-trigger the main effect
  const [wcReady, setWcReady] = useState(false);

  //State for laoder to show progress and status
  const [status, setStatus] = useState("Preparing project...");
  const [progress, setProgress] = useState(0);

  const wcRef = useRef<WebContainer | null>(null);
  const startedRef = useRef(false);

  const lastPkgRef = useRef<string | null>(null);

  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  //Boot WebContainer ONCE

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setStatus("Starting WebContainer...");
      setProgress(0);
      const wc = await getWebContainer();
      if (!mounted) return;

      wcRef.current = wc;


      wc.on("server-ready", (_port: number, url: string) => {
        console.log("SERVER READY");
        setStatus("Launching application...");
        setProgress(99);
        setUrl(url);
        setStatus("Ready");
        setProgress(100);
        window.__wc = wc;  // Expose wc for snapshot access
      });
      setWcReady(true); // ← trigger the main effect to re-run
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  //Build file tree
  function buildTree(files: ProjectFiles) {
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

      //FIRST RUN
      if (!startedRef.current) {
        try {
          const s1 = addStep(
            "Building file tree...",
            "Built file tree.",
            "build"
          );
          setStatus("Preparing project files...");
          setProgress(1);
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

          const s2 = addStep(
            "Writing package.json...",
            "Wrote package.json.",
            "build"
          );
          await wc.fs.writeFile("package.json", TEMPLATE_PACKAGE_JSON);

          completeStep?.(s2);


          const s3 = addStep(
            "Installing dependencies...",
            "Installed dependencies.",
            "build"
          );
          setStatus("Installing dependencies...");
          setProgress(2);

          //progress increser of loading project
          let progressTimer: ReturnType<typeof setTimeout>;

          const increaseProgress = () => {
            setProgress((prev) => {
              if (prev >= 97) return prev;

              progressTimer = setTimeout(
                increaseProgress,
                Math.random() * 10000 + 1000 // 1–10 seconds
              );

              return prev + 1;
            });
          };

          increaseProgress();


          const install = await wc.spawn("npm", ["install"]);

          const exitCode = await install.exit;

          if (exitCode !== 0) {
            throw new Error("npm install failed");
          }
          completeStep?.(s3);


          const s4 = addStep(
            "Checking dependencies...",
            "Verified dependencies.",
            "build"
          );
          const check = await wc.spawn("npm", ["ls", "react-router-dom"]);
          await check.exit;
          completeStep?.(s4);



          const s5 = addStep(
            "Checking node modules...",
            "Verified node modules.",
            "build"
          );
          const lsNodeModules = await wc.spawn("ls", ["node_modules"]);
          await lsNodeModules.exit;
          completeStep?.(s5);


          const s6 = addStep(
            "Starting development server...",
            "Development server started.",
            "build"
          );
          setStatus("Starting development server...");
          clearTimeout(progressTimer);
          setProgress(90);
          await wc.spawn("npm", ["run", "dev"]);
          completeStep?.(s6);


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
          const s1 = addStep(
            "Package changes detected...",
            "Package changes detected.",
            "build"
          );
          completeStep?.(s1);

          const s2 = addStep(
            "Stopping development server...",
            "Stopped development server.",
            "build"
          );
          await wc.spawn("pkill", ["node"]);
          completeStep?.(s2);

          const s3 = addStep(
            "Rebuilding file tree...",
            "Rebuilt file tree.",
            "build"
          );
          await wc.mount(buildTree(files));
          completeStep?.(s3);


          //FORCE package.json write again
          const s4 = addStep(
            "Rewriting package.json...",
            "Rewrote package.json.",
            "build"
          );
          await wc.fs.writeFile("package.json", TEMPLATE_PACKAGE_JSON);
          completeStep?.(s4);

          // verify disk
          await wc.fs.readFile("package.json", "utf-8");

          const s5 = addStep(
            "Removing old dependencies...",
            "Removed old dependencies.",
            "build"
          );
          const rm = await wc.spawn("rm", ["-rf", "node_modules"]);
          await rm.exit;
          completeStep?.(s5);

          const s6 = addStep(
            "Reinstalling dependencies...",
            "Reinstalled dependencies.",
            "build"
          );
          const install = await wc.spawn("npm", ["install"]);

          await install.exit;
          console.log("🔁 INSTALL DONE");
          completeStep?.(s6);


          const s7 = addStep(
            "Checking updated dependencies...",
            "Verified updated dependencies.",
            "build"
          );
          const check = await wc.spawn("npm", ["ls", "react-router-dom"]);
          await check.exit;
          completeStep?.(s7);


          const s8 = addStep(
            "Checking node modules...",
            "Verified node modules.",
            "build"
          );
          const ls = await wc.spawn("ls", ["node_modules"]);
          await ls.exit;
          completeStep?.(s8);



          const s9 = addStep(
            "Starting development server...",
            "Development server started.",
            "build"
          );
          await wc.spawn("npm", ["run", "dev"]);
          completeStep?.(s9);
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
        const syncFiles = Object.entries(files) as [string, ProjectFile][];

        for (const [filePath, file] of syncFiles) {
          if (!file.content || file.content.length < 10) continue;

          await wc.fs.writeFile(filePath, file.content);
        }
      } catch (err) {
        console.error("❌ SYNC ERROR:", err);
      }
    };

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      run();
    }, 100);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, isReady, wcReady]);

  return { url, wcRef, status, progress };
}