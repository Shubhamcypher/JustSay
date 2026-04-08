import { getWebContainer } from "@/lib/webContainer";
import { useEffect, useRef, useState } from "react";


export function useWebContainer(files: Record<string, any>) {
  const [url, setUrl] = useState<string | null>(null);

  const installedRef = useRef(false);
  const startedRef = useRef(false);
  const wcRef = useRef<any>(null);

  // 🚀 boot once (singleton)
  useEffect(() => {
    const init = async () => {
      wcRef.current = await getWebContainer();

      wcRef.current.on("server-ready", (_: any, url: string) => {
        setUrl(url);
      });
    };

    init();
  }, []);

  // 🔥 convert flat paths → folder tree
  function buildTree(files: Record<string, any>) {
    const root: any = {};

    for (const [path, file] of Object.entries(files)) {
      const parts = path.split("/");
      let current = root;

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = {
            file: { contents: file.content },
          };
        } else {
          current[part] = current[part] || { directory: {} };
          current = current[part].directory;
        }
      });
    }

    return root;
  }

  // 🔄 mount files
  useEffect(() => {
    if (!wcRef.current || Object.keys(files).length === 0) return;

    const timeout = setTimeout(async () => {
      const wc = wcRef.current;

      // ✅ FIXED: correct FS structure
      await wc.mount(buildTree(files));

      // install once
      if (!installedRef.current) {
        const install = await wc.spawn("npm", ["install"]);
        await install.exit;
        installedRef.current = true;
      }

      // start once
      if (!startedRef.current) {
        const dev = await wc.spawn("npm", ["run", "dev"]);

        dev.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log(data);
            },
          })
        );

        startedRef.current = true;
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [files]);

  return url;
}