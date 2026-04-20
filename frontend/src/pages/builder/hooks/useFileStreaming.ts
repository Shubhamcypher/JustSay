import { useEffect, useRef, useState } from "react";

export function useFileStreaming({
    prompt,
    addFile,
    updateFileContent,
    setActiveFile,
    addStep,
    completeStep,
    completeStepByText,
    files,
    userSelectedRef
}: any) {
    const [isReady, setIsReady] = useState(false);        // true once all files are streamed and finalized
    const [finalFiles, setFinalFiles] = useState<any>(null); // snapshot of files when streaming completes

    const streamQueueRef = useRef<any[]>([]);       // queue of incoming files waiting to be streamed
    const isStreamingRef = useRef(false);           // prevents processQueue from running concurrently
    const hasStreamStartedRef = useRef(false);      // tracks if first file has arrived, used to trigger step completions
    const filesRef = useRef(files);                 // mirror of files state in a ref so waitForQueue can snapshot it without stale closure

    const sleep = (ms: number) =>
        new Promise((res) => setTimeout(res, ms));

    // Streams file content character by character for a typing effect
    // Batches every 5 chars to avoid thousands of re-renders
    const streamFile = async (path: string, fullContent: string) => {
        addFile({ path, content: "" }); // register file immediately with empty content

        let buffer = "";

        for (let i = 0; i < fullContent.length; i++) {
            buffer += fullContent[i];

            // Flush to state every 5 chars or on the last character
            if (i % 5 === 0 || i === fullContent.length - 1) {
                updateFileContent(path, buffer);
                await sleep(5);
            }
        }

        updateFileContent(path, fullContent); // ensure final content is exactly correct
    };

    // Extracts filename from path for display in steps e.g. "src/Button.tsx" → "Button.tsx"
    const getFileName = (path: string) =>
        path.split("/").pop();

    // Queue is done when it's empty and no file is currently being streamed
    const isQueueDone = () => {
        return streamQueueRef.current.length === 0 && !isStreamingRef.current;
    };

    // Drains the queue one file at a time — sequential so files don't stream simultaneously
    const processQueue = async () => {
        if (isStreamingRef.current) return; // already running, the active loop will pick up new items

        isStreamingRef.current = true;

        while (streamQueueRef.current.length > 0) {
            const file = streamQueueRef.current.shift();

            const step = addStep(`Generating ${getFileName(file.path)}`, "file");

            // Auto-focus incoming file unless user has manually selected one
            if (!userSelectedRef.current) {
                setActiveFile(file.path);
            }

            await streamFile(file.path, file.content);

            completeStep(step);
        }

        isStreamingRef.current = false;
    };

    // Main effect — fires when prompt changes, opens an SSE stream and processes events
    useEffect(() => {
        if (!prompt) return;

        const controller = new AbortController(); // used to cancel the fetch if component unmounts

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

            let buffer = ""; // accumulates raw chunks until we have complete SSE messages

            while (true) {
                const { value, done } = await reader!.read();
                if (done) break;
                if (!value) continue;

                buffer += decoder.decode(value, { stream: true });

                // SSE messages are separated by double newlines
                const parts = buffer.split("\n\n");

                // All parts except the last are complete messages — last may be a partial chunk
                for (let i = 0; i < parts.length - 1; i++) {
                    const line = parts[i].replace("data: ", "").trim();
                    if (!line) continue;

                    const data = JSON.parse(line);

                    if (data.type === "file") {
                        // Mark initial steps complete on first file received
                        if (!hasStreamStartedRef.current) {
                            hasStreamStartedRef.current = true;
                            completeStepByText("🤖 Understanding your idea...");
                            completeStepByText("🧠 Planning project structure...");
                        }

                        // Push to queue and kick off processor (no-op if already running)
                        streamQueueRef.current.push(data);
                        processQueue().catch(console.error);
                    }

                    if (data.type === "done") {
                        // Server says all files sent — wait for queue to fully drain before finalizing
                        const waitForQueue = async () => {
                            while (!isQueueDone()) {
                                await sleep(50); // poll every 50ms
                            }

                            const step = addStep("Finalizing project...");
                            await sleep(400); // brief pause so user sees the step
                            completeStep(step);

                            // Snapshot files via ref to avoid stale closure issue
                            const snapshot = JSON.parse(JSON.stringify(filesRef.current));
                            setFinalFiles(snapshot);
                            setIsReady(true);
                        };

                        waitForQueue();
                    }
                }

                buffer = parts[parts.length - 1]; // hold incomplete trailing chunk for next iteration
            }
        };

        start();

        return () => controller.abort(); // cleanup — cancels in-flight request on unmount or prompt change
    }, [prompt]);

    // Keep filesRef in sync with files state so waitForQueue snapshot is always fresh
    useEffect(() => {
        filesRef.current = files;
    }, [files]);

    return {
        isReady,    // consumer uses this to know when to show the final result
        finalFiles, // snapshot of all files at completion time
    };
}