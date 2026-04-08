import { WebContainer } from "@webcontainer/api";
import { useEffect, useState } from "react";

export function useWebContainer(files: Record<string, any>) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let wc: WebContainer;

    const start = async () => {
      wc = await WebContainer.boot();

      // mount files
      await wc.mount(
        Object.fromEntries(
          Object.entries(files).map(([path, file]) => [
            path,
            { file: { contents: file.content } },
          ])
        )
      );

      // install deps
      const install = await wc.spawn("npm", ["install"]);
      await install.exit;

      // run dev server
      const dev = await wc.spawn("npm", ["run", "dev"]);

      dev.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log(data);
          },
        })
      );

      wc.on("server-ready", (_, url) => {
        setUrl(url);
      });
    };

    if (Object.keys(files).length > 0) {
      start();
    }
  }, [files]);

  return url;
}