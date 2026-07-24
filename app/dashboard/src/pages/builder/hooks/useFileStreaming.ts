import { useEffect, useRef, useState } from "react";

const CURSOR_CHAR = "█";

export function useFileStreaming({
    prompt,
    addFile,
    updateFileContent,
    setActiveFile,
    activeFile,
    addStep,
    completeStep,
    files,
    userSelectedRef
}: any) {
    const [isReady, setIsReady] = useState(false);
    const markReady = () => setIsReady(true);
    const [finalFiles, setFinalFiles] = useState<any>(null);

    const streamQueueRef = useRef<any[]>([]);
    const isStreamingRef = useRef(false);
    const hasStreamStartedRef = useRef(false);
    const filesRef = useRef(files);
    const activeFileRef = useRef<string | null>(null);

    const [projectId, setProjectId] = useState<string | null>(null);

    const sleep = (ms: number) =>
        new Promise((res) => setTimeout(res, ms));

    const stripCursor = (content: string) =>
        content.endsWith(CURSOR_CHAR) ? content.slice(0, -1) : content;

    const streamFile = async (path: string, fullContent: string) => {
        addFile({ path, content: "" });

        let buffer = "";

        for (let i = 0; i < fullContent.length; i++) {
            buffer += fullContent[i];

            if (i % 3 === 0 || i === fullContent.length - 1) {
                updateFileContent(path, buffer + CURSOR_CHAR, true);
                await sleep(2);
            }
        }

        // Final write — exact content, no cursor
        updateFileContent(path, fullContent, true);
    };

    const streamPatch = async (path: string, newContent: string) => {
        const oldContent = filesRef.current[path]?.content || "";
        const oldLines = oldContent.split("\n");
        const newLines = newContent.split("\n");

        const changedIndices: number[] = [];
        const maxLen = Math.max(oldLines.length, newLines.length);
        for (let i = 0; i < maxLen; i++) {
            if (oldLines[i] !== newLines[i]) {
                changedIndices.push(i);
            }
        }

        if (changedIndices.length === 0) return;

        const previousFile = activeFileRef.current;

        if (!userSelectedRef.current) {
            setActiveFile(path);
            await sleep(50);
        }

        const workingLines = [...oldLines];

        for (const lineIdx of changedIndices) {
            const targetLine = newLines[lineIdx] ?? "";

            if (lineIdx >= newLines.length) {
                workingLines.splice(lineIdx, 1);
                updateFileContent(path, workingLines.join("\n"), true);
                await sleep(20);
                continue;
            }

            let charBuffer = "";
            for (let i = 0; i < targetLine.length; i++) {
                charBuffer += targetLine[i];
                workingLines[lineIdx] = charBuffer + CURSOR_CHAR;

                if (i % 2 === 0 || i === targetLine.length - 1) {
                    updateFileContent(path, workingLines.join("\n"), true);
                    await sleep(4);
                }
            }

            workingLines[lineIdx] = targetLine;
            await sleep(10);
        }

        // Final write — exact content, no cursor
        updateFileContent(path, newContent, true);

        if (!userSelectedRef.current && previousFile && previousFile !== path) {
            await sleep(300);
            setActiveFile(previousFile);
        }
    };

    const getFileName = (path: string) =>
        path.split("/").pop();

    const isQueueDone = () =>
        streamQueueRef.current.length === 0 && !isStreamingRef.current;

    const processQueue = async () => {
        if (isStreamingRef.current) return;

        isStreamingRef.current = true;

        while (streamQueueRef.current.length > 0) {
            const file = streamQueueRef.current.shift();

            const step = addStep(`Generating ${getFileName(file.path)}`, "file");

            if (!userSelectedRef.current) {
                setActiveFile(file.path);
            }

            await streamFile(file.path, file.content);

            completeStep(step);
        }

        isStreamingRef.current = false;
    };

    useEffect(() => {
        if (!prompt) return;

        const s1 = addStep("🤖 Understanding your idea...", "ai");

        const controller = new AbortController();

        const start = async () => {
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
                        if (!hasStreamStartedRef.current) {
                            hasStreamStartedRef.current = true;
                            completeStep(s1);
                        }

                        streamQueueRef.current.push(data);
                        processQueue().catch(console.error);
                    }

                    if (data.type === "patch") {
                        streamPatch(data.path, data.content).catch(console.error);
                    }

                    if (data.type === "done") {
                        const waitForQueue = async () => {
                            while (!isQueueDone()) {
                                await sleep(50);
                            }

                            const step = addStep("Finalizing project...");
                            completeStep(step);

                            const snapshot = JSON.parse(JSON.stringify(filesRef.current));
                            Object.keys(snapshot).forEach((path) => {
                                if (snapshot[path]?.content) {
                                    snapshot[path].content = stripCursor(snapshot[path].content);
                                }
                            });
                            setFinalFiles(snapshot);
                            setIsReady(true);
                        };
                        if (data.projectId) {
                            setProjectId(data.projectId);
                        }
                        waitForQueue();
                    }
                }

                buffer = parts[parts.length - 1];
            }
        };

        start();

        return () => controller.abort();
    }, [prompt]);

    useEffect(() => {
        filesRef.current = files;
    }, [files]);

    useEffect(() => {
        activeFileRef.current = activeFile;
    }, [activeFile]);

    return {
        isReady,
        finalFiles,
        markReady,
        projectId,
    };
}