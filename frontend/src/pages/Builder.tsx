import { useFiles } from "@/hooks/useFiles";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
// import { useFiles } from "@/hooks/useFiles";

export default function Builder() {
    const { state } = useLocation();
    const prompt = state?.prompt;

    const { addFile, files, activeFile, updateFileContent } = useFiles(); // ✅ from your hook
    const [logs, setLogs] = useState(""); // ✅ local state


    function generateHTML(files: Record<string, any>) {
        const app = files["src/App.tsx"]?.content || "";

        return `
    <html>
      <body>
        <div id="root"></div>
        <script type="module">
          ${app}
        </script>
      </body>
    </html>
  `;
    }

    useEffect(() => {
        if (!prompt) return;

        const controller = new AbortController();

        const startGeneration = async () => {
            const res = await fetch("http://localhost:5000/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify({ prompt }),
                signal: controller.signal,
            });

            const reader = res.body?.getReader();
            const decoder = new TextDecoder("utf-8");

            let buffer = "";

            while (true) {
                const { value } = await reader!.read();
                // if (done) break;

                buffer += decoder.decode(value, { stream: true });

                const parts = buffer.split("\n\n");

                for (let i = 0; i < parts.length - 1; i++) {
                    const line = parts[i].replace("data: ", "").trim();
                    if (!line) continue;

                    const data = JSON.parse(line);

                    if (data.type === "file") {
                        addFile(data); // ✅ now works
                    }

                    if (data.type === "status") {
                        setLogs((prev) => prev + data.message);
                    }
                }

                buffer = parts[parts.length - 1];
            }
        };

        startGeneration();

        return () => controller.abort();
    }, [prompt]);


    return (
        <div className="h-screen flex bg-black text-white">

            {/* LEFT: Logs */}
            <div className="w-[20%] border-r border-white/10 p-4 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-2">Logs</h2>
                <pre className="text-sm whitespace-pre-wrap">{logs}</pre>
            </div>

            {/* CENTER: Editor */}
            <div className="w-[50%] border-r border-white/10 p-4">
                <h2 className="text-lg mb-2">{activeFile}</h2>

                <textarea
                    value={files[activeFile!]?.content || ""}
                    onChange={(e) =>
                        updateFileContent(activeFile!, e.target.value)
                    }
                    className="w-full h-full bg-black outline-none text-sm"
                />
            </div>

            {/* RIGHT: Preview */}
            <div className="w-[30%] p-4">
                <iframe
                    title="preview"
                    className="w-full h-full bg-white"
                    srcDoc={generateHTML(files)}
                />
            </div>
        </div>
    );
}