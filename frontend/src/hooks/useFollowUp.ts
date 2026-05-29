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
    addChatMessage
}: any) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const filesRef = useRef(files);
    const activeFileRef = useRef<string | null>(null);
    const isPatchingRef = useRef(false);

    filesRef.current = files;
    activeFileRef.current = activeFile;

    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

    const streamPatch = async (path: string, newContent: string) => {
        isPatchingRef.current = true;

        const oldContent = filesRef.current[path]?.content || "";
        const oldLines = oldContent.split("\n");
        const newLines = newContent.split("\n");

        const changedIndices: number[] = [];
        const maxLen = Math.max(oldLines.length, newLines.length);
        for (let i = 0; i < maxLen; i++) {
            if (oldLines[i] !== newLines[i]) changedIndices.push(i);
        }

        // Always write the final content immediately — animation is best-effort
        updateFileContent(path, newContent, true);

        if (changedIndices.length === 0) {
            isPatchingRef.current = false;
            return;
        }

        // Only animate if user hasn't manually selected a file
        if (!userSelectedRef.current) {
            setActiveFile(path);
            await sleep(50);

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
                    workingLines[lineIdx] = charBuffer;
                    if (i % 5 === 0 || i === targetLine.length - 1) {
                        updateFileContent(path, workingLines.join("\n"), true);
                        await sleep(6);
                    }
                }

                workingLines[lineIdx] = targetLine;
                await sleep(15);
            }

            // Ensure final state is always correct
            updateFileContent(path, newContent, true);
        }

        isPatchingRef.current = false;
    };

    // Add this helper outside sendFollowUp:
    const summarizeChanges = async (
        followUpPrompt: string,
        patchedFiles: string[]
    ): Promise<string> => {
        try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-haiku-4-5-20251001",
                    max_tokens: 60,
                    messages: [{
                        role: "user",
                        content: `User asked: "${followUpPrompt}"
Files changed: ${patchedFiles.map(f => f.split("/").pop()?.replace(/\.(tsx|ts)$/, "")).join(", ")}

Write one short friendly sentence confirming what was done. No technical jargon. Max 15 words.`
                    }]
                })
            });
            const data = await res.json();
            return data.content?.[0]?.text?.trim() || "Done!";
        } catch {
            return "Done!";
        }
    };

    const sendFollowUp = async (followUpPrompt: string) => {
        if (!followUpPrompt.trim() || isProcessing) return;

        setIsProcessing(true);
        setError(null);

        // Safety net — always unlock after 60s regardless of what happens
        const safetyTimer = setTimeout(() => {
            setIsProcessing(false);
            console.warn("⚠️ Follow-up safety timeout fired — unlocking UI");
        }, 60_000);

        const s1 = addStep("🤖 Analyzing your request...", "ai");

        try {
            // Only send file paths + content — skip protected files to reduce payload
            const SKIP_FILES = new Set([
                "package.json", "vite.config.ts", "index.html",
                "src/main.tsx", "tailwind.config.js", "postcss.config.js"
            ]);

            const serializedFiles: Record<string, string> = {};
            for (const [path, file] of Object.entries(filesRef.current)) {
                if (SKIP_FILES.has(path)) continue;
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

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }

            const reader = res.body?.getReader();
            if (!reader) throw new Error("No response body");

            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            completeStep(s1);
            const patchedFiles: string[] = [];
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                if (!value) continue;

                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split("\n\n");

                for (let i = 0; i < parts.length - 1; i++) {
                    const raw = parts[i].trim();
                    if (!raw || !raw.startsWith("data: ")) continue;

                    // ── Safe parse — never let one bad event kill the stream ──
                    let data: any;
                    try {
                        data = JSON.parse(raw.replace("data: ", "").trim());
                    } catch (parseErr) {
                        console.warn("⚠️ SSE parse error, skipping chunk:", raw);
                        continue;
                    }

                    if (data.type === "plan") {
                        (data.filesToChange ?? []).forEach((filePath: string) => {
                            const fileName = filePath.split("/").pop();
                            addStep(`Updating ${fileName}`, "file");
                        });
                    }

                    if (data.type === "patch") {
                        patchedFiles.push(data.path);
                        await streamPatch(data.path, data.content);
                        const fileName = data.path.split("/").pop();
                        completeStep(addStep(`✅ Updated ${fileName}`, "file"));
                    }

                    if (data.type === "done") {
                        const summary = await summarizeChanges(followUpPrompt, patchedFiles);
                        addChatMessage("ai", summary); clearTimeout(safetyTimer);
                        setIsProcessing(false);
                    }

                    if (data.type === "error") {
                        addChatMessage("ai", "Something went wrong. Please try again.");
                        clearTimeout(safetyTimer);
                        setIsProcessing(false);
                    }
                }

                buffer = parts[parts.length - 1];
            }
        } catch (err) {
            console.error("Follow-up error:", err);
            setError("Failed to apply changes. Please try again.");
        } finally {
            // Always clean up — even if something above throws
            clearTimeout(safetyTimer);
            setIsProcessing(false);
        }
    };

    return { sendFollowUp, isProcessing, error, isPatchingRef };
}