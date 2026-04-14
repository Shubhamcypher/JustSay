import { useFiles } from "@/hooks/useFiles";
import { useEffect, useRef, useState } from "react";
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

    //Streaming fiiles ref
    const streamQueueRef = useRef<any[]>([]);
    const isStreamingRef = useRef(false);

    //editor ref
    const editorRef = useRef<any>(null);

    //editor ref
    const monacoRef = useRef<any>(null);

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

    const streamFile = async (path: string, fullContent: string) => {
        addFile({ path, content: "" }); // start empty

        let current = "";
        let cursor = true;


        for (let i = 0; i < fullContent.length; i++) {
            current += fullContent[i];

            updateFileContent(
                path,
                current + (cursor ? "▌" : "")
            );

            cursor = !cursor;

            // 🔥 auto scroll
            const lineCount = current.split("\n").length;
            editorRef.current?.revealLine(lineCount);


            // 🔥 SPEED CONTROL
            const speed = fullContent.length > 200 ? 3 : 8;
            await new Promise(r => setTimeout(r, speed));

            updateFileContent(path, fullContent); // remove cursor
        }
    };

    const processQueue = async () => {
        if (isStreamingRef.current) return;

        isStreamingRef.current = true;

        while (streamQueueRef.current.length > 0) {
            const file = streamQueueRef.current.shift();

            await streamFile(file.path, file.content); // 🔥 wait for completion
        }

        isStreamingRef.current = false;
    };



    useEffect(() => {
        const timeout = setTimeout(() => {
            setStableFiles(files);
        }, 1000); // wait for stream to settle

        return () => clearTimeout(timeout);
    }, [files]);

    const fixedFiles = fixIndexHtml(stableFiles);
    const previewUrl = useWebContainer(fixedFiles, isReady);


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
                        // addFile(data); // ✅ now works
                        streamQueueRef.current.push(data);
                        processQueue();
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


    //function to
    function buildFileTree(files: Record<string, any>) {
        const tree: any = {};

        Object.keys(files).forEach((path) => {
            const parts = path.split("/");

            let current = tree;

            parts.forEach((part, index) => {
                if (index === parts.length - 1) {
                    // file
                    current[part] = { type: "file", path };
                } else {
                    // folder
                    if (!current[part]) {
                        current[part] = { type: "folder", children: {} };
                    }
                    current = current[part].children;
                }
            });
        });

        return tree;
    }

    const fileTree = buildFileTree(files);

    function FileTree({ tree, level = 0 }: any) {
        return (
            <div>
                {Object.entries(tree).map(([name, node]: any) => {
                    if (node.type === "file") {
                        return (
                            <div
                                key={node.path}
                                style={{ paddingLeft: level * 10 }}
                                onClick={() => setActiveFile(node.path)}
                                className="cursor-pointer text-sm hover:bg-white/5"
                            >
                                📄 {name}
                            </div>
                        );
                    }

                    return (
                        <div key={name}>
                            <div style={{ paddingLeft: level * 10 }}>
                                📁 {name}
                            </div>
                            <FileTree tree={node.children} level={level + 1} />
                        </div>
                    );
                })}
            </div>
        );
    }


    return (
        <div className="h-screen flex bg-gray-900 text-white p-4 gap-4">

            {/* LEFT: Logs */}
            <div className="w-[35%] border border-white/10 p-3 overflow-y-auto flex flex-col gap-4">

                {/*Files div */}
                <div className="h-[65%] overflow-y-auto">
                    <h2 className="text-sm mb-2 text-white/60">FILES</h2>
                    <div className=" border-red-500">
                        <FileTree tree={fileTree} />
                    </div>
                </div>
                {/*Files div */}

                {/*logs div */}
                <div>
                    <h2 className="text-sm mb-2 text-white/60">LOGS</h2>
                    {/* <pre className="text-xs whitespace-pre-wrap">{logs}</pre> */}
                </div>
                {/*logs div */}

            </div>


            {/* CENTER: Editor */}
            <Editor
                height="100%"
                theme="vs-dark"
                path={activeFile || ""}
                value={activeFile ? files[activeFile]?.content || "" : ""}
                language={
                    activeFile?.endsWith(".tsx")
                        ? "typescript"
                        : activeFile?.endsWith(".ts")
                            ? "typescript"
                            : activeFile?.endsWith(".js")
                                ? "javascript"
                                : activeFile?.endsWith(".jsx")
                                    ? "javascript"
                                    : activeFile?.endsWith(".html")
                                        ? "html"
                                        : "plaintext"
                }
                beforeMount={(monaco) => {
                    monacoRef.current = monaco;
                    // monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                    //     target: monaco.languages.typescript.ScriptTarget.ESNext,
                    //     module: monaco.languages.typescript.ModuleKind.ESNext,
                    //     moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                    //     jsx: monaco.languages.typescript.JsxEmit.ReactJSX, // ✅ VERY IMPORTANT
                    //     baseUrl: "file:///",
                    //     allowNonTsExtensions: true,
                    //     esModuleInterop: true,
                    //     allowSyntheticDefaultImports: true,
                    //     resolveJsonModule: true,
                    //     noEmit: true,
                    //     typeRoots: ["node_modules/@types"],

                    // });

                    // monaco.languages.typescript.typescriptDefaults.addExtraLib(
                    //     `
                    //     declare module "react/jsx-runtime" {
                    //         export const jsx: any;
                    //         export const jsxs: any;
                    //         export const Fragment: any;
                    //     }
                    //     `,
                    //     "file:///node_modules/@types/react/jsx-runtime.d.ts"
                    // );


                    // 🚨 disable errors initially
                    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                        noSemanticValidation: true,
                        noSyntaxValidation: false,
                    });

                }}
                onMount={(editor) => {
                    editorRef.current = editor; // ✅ store editor
                }}
                onChange={(value) => {
                    if (!activeFile) return;
                    updateFileContent(activeFile, value || "");
                }}
            />

            {/* RIGHT: Preview */}
            <div className="w-[50%] p-2">
                {hasFiles && previewUrl ? (
                    <iframe
                        src={previewUrl}
                        className="w-full h-full bg-gray-500 rounded-lg"
                    />
                ) : (
                    <div className="text-white/50 text-sm">Starting preview...</div>
                )}
            </div>
        </div>
    );
}