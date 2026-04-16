import { useFiles } from "@/hooks/useFiles";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useWebContainer } from "@/hooks/useWebContainer";
import { Icon } from "@iconify/react";




export default function Builder() {
    const { state } = useLocation();
    const prompt = state?.prompt;
    const { addFile, files, activeFile, updateFileContent, setActiveFile } = useFiles(); // ✅ from your hook
    // const [logs, setLogs] = useState(""); // ✅ local state
    // const [stableFiles, setStableFiles] = useState(files);
    const [isReady, setIsReady] = useState(false);


    //Log state and function
    type Step = {
        id: number;
        text: string;
        status: "loading" | "done";
    };

    const [steps, setSteps] = useState<Step[]>([]);

    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    function addStep(text: string) {
        const id = stepIdRef.current++;

        setSteps((prev) => [
            ...prev.slice(-3), // keep last 3
            { id, text, status: "loading" },
        ]);

        return id;
    }

    function completeStep(id: number) {
        setSteps((prev) =>
            prev.map((s) =>
                s.id === id ? { ...s, status: "done" } : s
            )
        );

        // remove after animation
        setTimeout(() => {
            setSteps((prev) => prev.filter((s) => s.id !== id));
        }, 1200);
    }


    // folder toggle state
    const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});


    //Streaming fiiles ref
    const streamQueueRef = useRef<any[]>([]);
    const isStreamingRef = useRef(false);

    //editor ref
    const editorRef = useRef<any>(null);

    //editor ref
    const monacoRef = useRef<any>(null);

    //Step id ref
    const stepIdRef = useRef(0);

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
        addFile({ path, content: "" });

        let buffer = "";
        let cursor = true;

        for (let i = 0; i < fullContent.length; i++) {
            buffer += fullContent[i];

            // update every few chars (reduce renders)
            if (i % 50 === 0 || i === fullContent.length - 1) {
                updateFileContent(
                    path,
                    buffer 
                );

                cursor = !cursor;

                // 🔥 auto scroll
                const lineCount = buffer.split("\n").length;
                editorRef.current?.revealLine(lineCount);

                // slight delay for smooth feel
                await new Promise((r) => setTimeout(r, 20));
            }
        }

        // ✅ FINAL CLEAN STATE (remove cursor)
        updateFileContent(path, fullContent);
    };

    const getFileName = (path: string) => path.split("/").pop();
    const processQueue = async () => {
        if (isStreamingRef.current) return;

        isStreamingRef.current = true;

        while (streamQueueRef.current.length > 0) {
            const file = streamQueueRef.current.shift();


            const step = addStep(`Generating ${getFileName(file.path)}`);

            setActiveFile(file.path);

            await streamFile(file.path, file.content);

            completeStep(step);
        }

        isStreamingRef.current = false;
    };



    // useEffect(() => {
    //     const timeout = setTimeout(() => {
    //         setStableFiles(files);
    //     }, 1000); // wait for stream to settle

    //     return () => clearTimeout(timeout);
    // }, [files]);
    // useEffect(() => {
    //     if (!isReady) return;

    //     setStableFiles(files);
    // }, [isReady]);

    const fixedFiles = fixIndexHtml(files);


    const activeStepRef = useRef<number | null>(null);

    const previewUrl = useWebContainer(fixedFiles, isReady, (msg, type) => {
        if (type === "start") {
            activeStepRef.current = addStep(msg);
        }

        if (type === "end" && activeStepRef.current !== null) {
            completeStep(activeStepRef.current);
            activeStepRef.current = null;
        }
    });


    const hasFiles = Object.keys(files).length > 0;


    useEffect(() => {
        if (!prompt) return;

        const controller = new AbortController();

        const startGeneration = async () => {
            const s1 = addStep("Understanding your idea...");
            await sleep(400);
            completeStep(s1);

            const s2 = addStep("Planning project structure...");
            await sleep(500);
            completeStep(s2);
            await new Promise(r => setTimeout(r, 500));
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
                        if (!isStreamingRef.current) {
                            processQueue();
                        }
                    }

                    // if (data.type === "status") {
                    //     setLogs((prev) => prev + data.message);
                    // }

                    if (data.type === "done") {
                        const step = addStep("Finalizing project...");
                        await sleep(400);
                        completeStep(step);

                        setIsReady(true);
                    }
                }

                buffer = parts[parts.length - 1];
            }
        };

        startGeneration();

        return () => controller.abort();
    }, [prompt]);


    useEffect(() => {
        const folders: any = {};

        Object.keys(files).forEach((path) => {
            const parts = path.split("/");
            let current = "";

            parts.slice(0, -1).forEach((part) => {
                current = current ? `${current}/${part}` : part;
                folders[current] = true;
            });
        });

        setOpenFolders(folders);
    }, [files]);


    function getFileIcon(name: string) {
        if (name.endsWith(".tsx")) return "logos:react";
        if (name.endsWith(".ts")) return "logos:typescript-icon";
        if (name.endsWith(".js")) return "logos:javascript";
        if (name.endsWith(".json")) return "vscode-icons:file-type-json";
        if (name.endsWith(".html")) return "vscode-icons:file-type-html";
        if (name.endsWith(".css")) return "vscode-icons:file-type-css";
        return "vscode-icons:default-file";
    }

    //function to build folder trees
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

    const fileTree = buildFileTree({ ...files });


    function FileTree({ tree, parentPath = "", level = 0 }: any) {
        return (
            <div>
                {Object.entries(tree).map(([name, node]: any) => {
                    const fullPath = parentPath ? `${parentPath}/${name}` : name;
                    const isOpen = openFolders[fullPath];
                    // const Icon = getFileIcon(name);

                    if (node.type === "file") {
                        const iconName = getFileIcon(name);

                        return (
                            <div
                                key={fullPath}
                                onClick={() => setActiveFile(node.path)}
                                className={`flex items-center gap-2 px-2 py-1 text-sm cursor-pointer rounded
                                    ${activeFile === node.path ? "bg-white/10" : "hover:bg-white/5"}
                                `}
                                style={{ paddingLeft: level * 12 }}
                            >
                                <Icon icon={iconName} width={16} />
                                <span>{name}</span>
                            </div>
                        );
                    }


                    return (
                        <div key={fullPath}>
                            {/* Folder Header */}
                            <div
                                onClick={() =>
                                    setOpenFolders((prev) => ({
                                        ...prev,
                                        [fullPath]: !prev[fullPath],
                                    }))
                                }
                                className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-white/5 rounded"
                                style={{ paddingLeft: level * 12 }}
                            >
                                <Icon icon={isOpen ? "mdi:chevron-down" : "mdi:chevron-right"} width={16} />
                                <span>{name}</span>
                            </div>

                            {/* Children */}
                            {isOpen && (
                                <FileTree
                                    tree={node.children}
                                    parentPath={fullPath}
                                    level={level + 1}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-gray-900 text-white p-4 gap-4">

            {/* LEFT: Logs */}
            <div className="w-[35%] border border-white/10 p-3 flex flex-col">

                {/* FILES */}
                <div className="flex-1 overflow-y-auto">
                    <h2 className="text-sm mb-2 text-white/60">FILES</h2>
                    <FileTree tree={fileTree} />
                </div>

                {/* LOGS */}
                <div className="h-[160px] mt-3 border-t border-white/10 pt-3 overflow-hidden">
                    <div className="flex flex-col gap-2">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    bg-white/5 backdrop-blur
                    transition-all duration-500
                    ${step.status === "done" ? "opacity-50 scale-95" : "scale-100"}
                `}
                            >
                                {/* ICON */}
                                {step.status === "loading" ? (
                                    <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <div className="text-green-400">✔</div>
                                )}

                                {/* TEXT */}
                                <span className="text-sm text-white/80">
                                    {step.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>


            {/* CENTER: Editor */}
            <Editor
                height="100%"
                theme="vs-dark"
                path="file.tsx"
                value={typeof files[activeFile!]?.content === "string" ? files[activeFile!]?.content : ""}
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