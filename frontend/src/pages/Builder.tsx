import { useFiles } from "@/hooks/useFiles";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useWebContainer } from "@/hooks/useWebContainer";




export default function Builder() {
    const { state } = useLocation();
    const prompt = state?.prompt;
    const { addFile, files, activeFile, updateFileContent, setActiveFile } = useFiles(); // ✅ from your hook
    // const [logs, setLogs] = useState(""); // ✅ local state
    const [stableFiles, setStableFiles] = useState(files);
    const [isReady, setIsReady] = useState(false);

    function fixIndexHtml(files: Record<string, any>) {
        const indexFile = files["index.html"];
        if (!indexFile) return files;

        let content = indexFile.content;

        // detect actual entry file
        const hasTsx = !!files["src/main.tsx"];
        const hasJsx = !!files["src/main.jsx"];

        let correctPath = null;

        if (hasTsx) correctPath = "/src/main.tsx";
        else if (hasJsx) correctPath = "/src/main.jsx";

        if (!correctPath) return files;

        // replace ANY wrong entry
        content = content.replace(
            /<script type="module" src=".*?"><\/script>/,
            `<script type="module" src="${correctPath}"></script>`
        );

        files["index.html"] = {
            ...indexFile,
            content,
        };

        return files;
    }



    useEffect(() => {
        const timeout = setTimeout(() => {
            setStableFiles(files);
        }, 1000); // wait for stream to settle

        return () => clearTimeout(timeout);
    }, [files]);

    const fixedFiles = fixIndexHtml(stableFiles);
    const previewUrl = useWebContainer(fixedFiles, isReady);
    useEffect(() => {
        console.log("📦 CURRENT FILES:", Object.keys(files));
    }, [files]);

    const hasFiles = Object.keys(stableFiles).length > 0;


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
                const { value, done } = await reader!.read();
                if (done) break;
                if (!value) continue;
                buffer += decoder.decode(value, { stream: true });

                const parts = buffer.split("\n\n");

                for (let i = 0; i < parts.length - 1; i++) {
                    const line = parts[i].replace("data: ", "").trim();
                    if (!line) continue;

                    const data = JSON.parse(line);

                    if (data.type === "file") {
                        console.log("📁 FILE RECEIVED:", data.path);
                        addFile(data); // ✅ now works
                    }

                    // if (data.type === "status") {
                    //     setLogs((prev) => prev + data.message);
                    // }

                    if (data.type === "done") {
                        // setStableFiles(files);
                        setIsReady(true);
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
            <div className="w-[20%] border-r border-white/10 p-3 overflow-y-auto">
                <h2 className="text-sm mb-2 text-white/60">FILES</h2>

                {Object.keys(files).map((file) => (
                    <div
                        key={file}
                        onClick={() => setActiveFile(file)}
                        className={`cursor-pointer text-sm px-2 py-1 rounded ${activeFile === file ? "bg-white/10" : "hover:bg-white/5"
                            }`}
                    >
                        {file}
                    </div>
                ))}

                <div className="mt-4">
                    <h2 className="text-sm mb-2 text-white/60">LOGS</h2>
                    {/* <pre className="text-xs whitespace-pre-wrap">{logs}</pre> */}
                </div>
            </div>

            {/* CENTER: Editor */}
            <Editor
                height="100%"
                theme="vs-dark"
                path={activeFile || ""}
                value={activeFile ? files[activeFile]?.content || "" : ""}
                onChange={(value) => {
                    if (!activeFile) return;
                    updateFileContent(activeFile, value || "");
                }}
            />

            {/* RIGHT: Preview */}
            <div className="w-[30%] p-2">
                {hasFiles && previewUrl ? (
                    <iframe
                        src={previewUrl}
                        className="w-full h-full bg-white rounded-lg"
                    />
                ) : (
                    <div className="text-white/50 text-sm">Starting preview...</div>
                )}
            </div>
        </div>
    );
}