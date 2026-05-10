import { useRef, useState } from "react";

export function useFollowUp({
    files,
    originalPrompt,
    projectId,
    updateFileContent,
    setActiveFile,
    activeFile,
    userSelectedRef,
    addStep,
    completeStep,
}: any) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const filesRef = useRef(files);
    const activeFileRef = useRef<string | null>(null);

    // Keep refs in sync
    filesRef.current = files;
    activeFileRef.current = activeFile;

    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

    // Diff-aware patch animation — reused from useFileStreaming
    const streamPatch = async (path: string, newContent: string) => {
        const oldContent = filesRef.current[path]?.content || "";
        const oldLines = oldContent.split("\n");
        const newLines = newContent.split("\n");

        const changedIndices: number[] = [];
        const maxLen = Math.max(oldLines.length, newLines.length);
        for (let i = 0; i < maxLen; i++) {
            if (oldLines[i] !== newLines[i]) changedIndices.push(i);
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
                await sleep(30);
                continue;
            }

            let charBuffer = "";
            for (let i = 0; i < targetLine.length; i++) {
                charBuffer += targetLine[i];
                workingLines[lineIdx] = charBuffer;
                if (i % 3 === 0 || i === targetLine.length - 1) {
                    updateFileContent(path, workingLines.join("\n"), true);
                    await sleep(8);
                }
            }

            workingLines[lineIdx] = targetLine;
            await sleep(20);
        }

        updateFileContent(path, newContent, true);

        if (!userSelectedRef.current && previousFile && previousFile !== path) {
            await sleep(300);
            setActiveFile(previousFile);
        }
    };

    const sendFollowUp = async (followUpPrompt: string) => {
        if (!followUpPrompt.trim() || isProcessing) return;

        setIsProcessing(true);
        setError(null);

        const s1 = addStep("🤖 Analyzing your request...", "ai");

        try {
            // Serialize current files to send to backend
            const serializedFiles: Record<string, string> = {};
            for (const [path, file] of Object.entries(filesRef.current)) {
                serializedFiles[path] = typeof file === "string"
                    ? file
                    : (file as any)?.content || "";
            }

            const res = await fetch("http://localhost:5000/api/followup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify({
                    followUpPrompt,
                    originalPrompt,
                    projectId,
                    files: serializedFiles,
                }),
            });

            const reader = res.body?.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            completeStep(s1);

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

                    if (data.type === "plan") {
                        // Show which files will be updated
                        data.filesToChange.forEach((filePath: string) => {
                            const fileName = filePath.split("/").pop();
                            addStep(`Updating ${fileName}`, "file");
                        });
                    }

                    if (data.type === "patch") {
                        await streamPatch(data.path, data.content);
                        const fileName = data.path.split("/").pop();
                        completeStep(addStep(`✅ Updated ${fileName}`, "file"));
                    }

                    if (data.type === "done") {
                        addStep("✅ Changes applied!", "ai");
                        setIsProcessing(false);
                    }

                    if (data.type === "error") {
                        setError("Something went wrong. Please try again.");
                        setIsProcessing(false);
                    }
                }

                buffer = parts[parts.length - 1];
            }
        } catch (err) {
            console.error("Follow-up error:", err);
            setError("Failed to apply changes. Please try again.");
            setIsProcessing(false);
        }
    };

    return { sendFollowUp, isProcessing, error };
}