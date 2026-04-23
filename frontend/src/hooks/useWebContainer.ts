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

 

  //MAIN EXECUTION(Run once and then run on sync)
  useEffect(() => {
    if (!wcRef.current) return;
    if (!isReady) return;
  
    const wc = wcRef.current;
  
    const init = async () => {
      try {
        console.log("Initializing WebContainer");
  
        onLog?.("📁 Mounting files...", "start");
        await wc.mount(buildTree(files));
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
              console.log(data.toString());
            },
          })
        );
  
        startedRef.current = true;
      } catch (err) {
        console.error("❌ INIT ERROR:", err);
        startedRef.current = false;
      }
    };
  
    const syncFiles = async () => {
      try {
        if (!startedRef.current) return;
  
        //update files live
        for (const [path, file] of Object.entries(files)) {
          await wc.fs.writeFile(path, file.content || "");
        }
  
      } catch (err) {
        console.error("❌ SYNC ERROR:", err);
      }
    };
  
    // 🚀 run init once
    if (!startedRef.current) {
      init();
    } else {
      // 🔥 run sync on every change
      syncFiles();
    }
  
  }, [files, isReady]);

  return url;
}