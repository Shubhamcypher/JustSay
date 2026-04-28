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

          onLog?.("Building File Tree");
          await wc.mount(buildTree(files));

          console.log("📦 PKG RAW:", files["package.json"]);

          // 🔥 FORCE package.json write (CRITICAL)
          const pkgContent =
            typeof files["package.json"] === "string"
              ? files["package.json"]
              : files["package.json"]?.content;


          console.log("📦 PKG CONTENT STRING:", pkgContent);

          onLog?.("Writing package.json");
          await wc.fs.writeFile("package.json", pkgContent);
          console.log("📦 package.json written");

          // 🔍 VERIFY WRITE
          const readPkg = await wc.fs.readFile("package.json", "utf-8");
          console.log("📦 PKG ON DISK:", readPkg);


          onLog?.("Installing dependencies");
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

          onLog?.("Checking dedpendencies");
          const check = await wc.spawn("npm", ["ls", "react-router-dom"]);

          check.output.pipeTo(
            new WritableStream({
              write(data) {
                console.log("📦 CHECK RRD:", data.toString());
              },
            })
          );

          onLog?.("Checking node modules");
          const lsNodeModules = await wc.spawn("ls", ["node_modules"]);

          lsNodeModules.output.pipeTo(
            new WritableStream({
              write(data) {
                console.log("📦 node_modules:", data.toString());
              },
            })
          );

          onLog?.("Running dev server");
          const dev = await wc.spawn("npm", ["run", "dev"]);

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
          onLog?.("Package Updated reinstalling");
          console.log("🔁 package.json changed → reinstall");

          onLog?.("Stopping dev server");
          await wc.spawn("pkill", ["node"]);

          onLog?.("Rebuilding tree");
          await wc.mount(buildTree(files));

          console.log("🔁 PKG RAW:", files["package.json"]);

          // 🔥 FORCE package.json write again
          const pkgContent =
            typeof files["package.json"] === "string"
              ? files["package.json"]
              : files["package.json"]?.content;

          console.log("🔁 PKG CONTENT:", pkgContent);

          onLog?.("Rewriting package.json");
          await wc.fs.writeFile("package.json", pkgContent);

          // verify disk
          const readPkg = await wc.fs.readFile("package.json", "utf-8");
          console.log("🔁 PKG ON DISK:", readPkg);

          onLog?.("Removing node modules");
          await wc.spawn("rm", ["-rf", "node_modules"]);

          onLog?.("Reinstalling dependecies...");
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

          onLog?.("Checking package.json");
          const check = await wc.spawn("npm", ["ls", "react-router-dom"]);

          check.output.pipeTo(
            new WritableStream({
              write(data) {
                console.log("🔁 CHECK RRD:", data.toString());
              },
            })
          );

          onLog?.("Checking node modules");
          const ls = await wc.spawn("ls", ["node_modules"]);

          ls.output.pipeTo(
            new WritableStream({
              write(data) {
                console.log("🔁 node_modules:", data.toString());
              },
            })
          );

          onLog?.("Running dev server");
          const dev = await wc.spawn("npm", ["run", "dev"]);

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
        for (const [path, file] of Object.entries(files)) {
          const content =
            typeof file === "string"
              ? file
              : file?.content || "";

          await wc.fs.writeFile(path, content);
        }
      } catch (err) {
        console.error("❌ SYNC ERROR:", err);
      }
    };

    run();
  }, [files, isReady]);

  return url;
}