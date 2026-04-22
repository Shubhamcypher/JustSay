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

          const stableFiles = files;


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
  }, [isReady, files]);

  return url;
}