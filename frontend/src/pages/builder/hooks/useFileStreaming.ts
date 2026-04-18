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
    const [isReady, setIsReady] = useState(false);
    const [finalFiles, setFinalFiles] = useState<any>(null);

    const streamQueueRef = useRef<any[]>([]);
    const isStreamingRef = useRef(false);
    const hasStreamStartedRef = useRef(false);
    const filesRef = useRef(files);

    const sleep = (ms: number) =>
        new Promise((res) => setTimeout(res, ms));

    // 🔥 stream single file (typing effect)
    const streamFile = async (path: string, fullContent: string) => {
        addFile({ path, content: "" });

        let buffer = "";

        for (let i = 0; i < fullContent.length; i++) {
            buffer += fullContent[i];

            if (i % 5 === 0 || i === fullContent.length - 1) {
                updateFileContent(path, buffer);
                await sleep(5);
            }
        }

        updateFileContent(path, fullContent);
    };

    const getFileName = (path: string) =>
        path.split("/").pop();

    const isQueueDone = () => {
        return (
            streamQueueRef.current.length === 0 &&
            !isStreamingRef.current
        );
    };

    // 🚀 process queue sequentially
    const processQueue = async () => {
        if (isStreamingRef.current) return;

        isStreamingRef.current = true;

        while (streamQueueRef.current.length > 0) {
            const file = streamQueueRef.current.shift();

            const step = addStep(`Generating ${getFileName(file.path)}`);

            if (!userSelectedRef.current) {
                setActiveFile(file.path);
            }

            await streamFile(file.path, file.content);

            completeStep(step);
        }

        isStreamingRef.current = false;
    };

    // 🌊 main streaming effect
    useEffect(() => {
        if (!prompt) return;

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

                            completeStepByText("🤖 Understanding your idea...");
                            completeStepByText("🧠 Planning project structure...");
                        }

                        streamQueueRef.current.push(data);
                        processQueue().catch(console.error);
                    }

                    if (data.type === "done") {
                        const waitForQueue = async () => {
                            while (!isQueueDone()) {
                                await sleep(50);
                            }

                            const step = addStep("Finalizing project...");
                            await sleep(400);
                            completeStep(step);

                            const snapshot = JSON.parse(JSON.stringify(filesRef.current));
                            setFinalFiles(snapshot);
                            setIsReady(true);
                        };

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

    return {
        isReady,
        finalFiles,
    };
}