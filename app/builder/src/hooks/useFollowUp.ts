import { useEffect, useRef, useState } from "react";

import { summarizeChanges } from "@/api/ai.api";
import { followUpProject } from "@/api/followup.api";

import type { ProjectFiles } from "@shared/types";
import type { RefObject } from "react";

interface UseFollowUpProps {
    files: ProjectFiles;
    originalPrompt: string;
    projectId: string;
    updateFileContent: (
        path: string,
        content: string,
        fromStream?: boolean
    ) => void;
    setActiveFile: (path: string) => void;
    userSelectedRef: RefObject<boolean>;
    addStep: (text: string, type?: string) => number;
    completeStep: (id: number) => void;
    addChatMessage: (
        role: "ai" | "user",
        message: string
    ) => void;
}


type FollowUpEvent =
    | {
        type: "plan";
        filesToChange: string[];
    }
    | {
        type: "patch";
        path: string;
        content: string;
    }
    | {
        type: "done";
    }
    | {
        type: "error";
        message?: string;
    };

export function useFollowUp({
    files,
    originalPrompt,
    projectId,
    updateFileContent,
    setActiveFile,
    userSelectedRef,
    addStep,
    completeStep,
    addChatMessage
}: UseFollowUpProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const filesRef = useRef(files);
    const isPatchingRef = useRef(false);

    //This effect helps mutating refs but ref changes only then
    useEffect(() => {
        filesRef.current = files;
    }, [files]);



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
                serializedFiles[path] = file.content;
            }

            const reader = await followUpProject({
                followUpPrompt,
                originalPrompt,
                projectId,
                files: serializedFiles,
            });

            completeStep(s1);

            const decoder = new TextDecoder("utf-8");
            let buffer = "";


            const beforeSnapshot: Record<string, string> = {};
            const patchedDiff: Record<string, { added: number; removed: number }> = {};
            const fileSteps: Record<string, number> = {};
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
                    let data: FollowUpEvent;
                    try {
                        data = JSON.parse(raw.replace("data: ", "").trim());
                    } catch (parseErr) {
                        console.warn("⚠️ SSE parse error, skipping chunk:", raw);
                        console.log('Parse error is: ', parseErr);

                        continue;
                    }

                    if (data.type === "plan") {
                        (data.filesToChange ?? []).forEach((filePath: string) => {
                            const fileName = filePath.split("/").pop();
                            fileSteps[filePath] =
                                addStep(`Updating ${fileName}`, "file");
                        });
                    }

                    if (data.type === "patch") {
                        // Capture before-state on first patch for this file
                        if (!beforeSnapshot[data.path]) {
                            beforeSnapshot[data.path] = filesRef.current[data.path]?.content ?? "";
                        }

                        completeStep(fileSteps[data.path]);

                        await streamPatch(data.path, data.content);

                        // Compute line diff
                        const oldArr = beforeSnapshot[data.path].split("\n");
                        const newArr = data.content.split("\n");
                        const added = Math.max(0, newArr.length - oldArr.length);
                        const removed = Math.max(0, oldArr.length - newArr.length);
                        patchedDiff[data.path] = { added, removed };

                    }

                    if (data.type === "done") {
                        try {
                            const summary = await summarizeChanges(
                                followUpPrompt,
                                patchedDiff
                            );

                            addChatMessage("ai", summary);
                        } catch {
                            addChatMessage(
                                "ai",
                                "Your changes have been applied successfully."
                            );
                        }
                        break;
                    }

                    if (data.type === "error") {
                        addChatMessage("ai", "Something went wrong. Please try again.");
                        break;
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