import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react"; // ← add useEffect
import { Eye, Code2, Sparkles } from "lucide-react";
import { useFiles } from "@/hooks/useFiles";
import { useSteps } from "./hooks/useSteps";
import { useFileTree } from "./hooks/useFileTree";
import { useFileStreaming } from "./hooks/useFileStreaming";
import { useFollowUp } from "@/hooks/useFollowUp";
import { useWebContainer } from "@/hooks/useWebContainer";
import CodeEditor from "./components/CodeEditor";
import PreviewPane from "./components/PreviewPane";
import FileSidebar from "./components/FileSidebar";
import { FollowUpBar } from "./components/FollowUpBar";
import { TabButton, type RightTab } from "./components/TabButton";
import BuilderAgent from "./components/BuilderAgent";
import { useResizable } from "./hooks/useResizable";
import ResizeHandle from "@/components/resizeHandle";
import { motion } from "framer-motion";
import { getProjectFiles } from "@/api/project.api";

export type ChatMessage = {
    id: string;
    role: "user" | "ai";
    text: string;
    timestamp: Date;
};

export default function Builder() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const prompt = state?.prompt;
    const projectId = state?.projectId;
    const mode = state?.mode;

    const userSelectedRef = useRef(false);
    const [rightTab, setRightTab] = useState<RightTab>("preview");
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const chatBottomRef = useRef<HTMLDivElement>(null); // ← auto-scroll ref

    const fileSystem = useFiles(userSelectedRef);
    const { steps, addStep, completeStep } = useSteps();
    const fileTree = useFileTree(fileSystem.filePaths);

    const leftPanel = useResizable(400, 280, 600);
    const sidebarPanel = useResizable(220, 160, 400);

    const streaming = useFileStreaming({
        prompt,
        ...fileSystem,
        addStep,
        completeStep,
        userSelectedRef,
    });

    // ── Must be defined BEFORE useFollowUp ──────────────────────────────────
    const addChatMessage = (role: "user" | "ai", text: string) => {
        setChatHistory(prev => [...prev, {
            id: crypto.randomUUID(),
            role,
            text,
            timestamp: new Date()
        }]);
    };

    const { sendFollowUp, isProcessing, isPatchingRef } = useFollowUp({
        files: fileSystem.files,
        originalPrompt: prompt,
        projectId,
        updateFileContent: fileSystem.updateFileContent,
        setActiveFile: fileSystem.setActiveFile,
        activeFile: fileSystem.activeFile,
        userSelectedRef,
        addStep,
        completeStep,
        addChatMessage,
    });

    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const activeStepRef = useRef<number | null>(null);

    const handleSetActiveFile = (file: string) => {
        userSelectedRef.current = true;
        fileSystem.setActiveFile(file);
    };

    const previewUrl = useWebContainer(
        fileSystem.files,
        streaming.isReady,
        (msg, type) => {
            if (type === "start") activeStepRef.current = addStep(msg);
            if (type === "end") {
                if (activeStepRef.current !== null) {
                    completeStep(activeStepRef.current);
                    activeStepRef.current = null;
                }
            }
        },
        addStep,
        completeStep,
        isPatchingRef
    );

    const handleFollowUp = (text: string) => {
        addChatMessage("user", text);
        sendFollowUp(text);
    };

    // ── Auto-scroll when new messages arrive ────────────────────────────────
    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, isProcessing]);

    // ── Load saved project files when navigating from Home ──────────────
    useEffect(() => {
        if (mode !== "load" || !projectId) return;

        getProjectFiles(projectId)
            .then(({ data }) => {
                const fileMap = data.files as Record<string, { content: string }>;

                // Must use addFile (not updateFileContent) so filePaths gets populated
                for (const [path, file] of Object.entries(fileMap)) {
                    fileSystem.addFile({ path, content: file.content });
                }

                // Give React a tick to flush all addFile state updates
                setTimeout(() => {
                    streaming.markReady();
                }, 150);
            })
            .catch((err) => console.error("Failed to load project files:", err));
    }, []); // runs once on mount

    return (
        <div className="h-screen flex bg-[#0f1117] text-white overflow-hidden">

            {/* ── LEFT: Chat column ───────────────────────────────────────── */}
            <div
                style={{ width: leftPanel.size }}
                className="flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-[#13151c]"
            >
                {/* Logo header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] shrink-0 cursor-pointer">
                    <div className="w-5 h-5 rounded bg-violet-500 flex items-center justify-center">
                        <span className="text-[10px] font-bold">J</span>
                    </div>
                    <span className="text-sm font-semibold text-white/70 tracking-wide" onClick={()=>navigate('/')}>Justsay</span>
                </div>

                {/* ── Scrollable chat area ─────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">

                    {/* Initial user prompt bubble */}
                    {prompt && (
                        <div className="flex justify-end">
                            <div className="bg-violet-600/80 text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[85%] leading-relaxed">
                                {prompt}
                            </div>
                        </div>
                    )}

                    {/* Initial AI response with steps */}
                    <BuilderAgent
                        isReady={streaming.isReady}
                        isProcessing={isProcessing}
                        steps={steps}
                        url={previewUrl}
                        prompt={prompt}
                        files={streaming.finalFiles}
                        chatHistory={[]}
                    />

                    {/* ── Follow-up chat history ───────────────────────────── */}
                    {chatHistory.map(msg => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex items-start gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "ai" && (
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shrink-0 mt-1">
                                    <Sparkles size={12} className="text-white" />
                                </div>
                            )}
                            <div className={`text-sm px-4 py-2.5 rounded-2xl max-w-[85%] leading-relaxed ${msg.role === "user"
                                ? "bg-violet-600/80 text-white rounded-br-sm"
                                : "bg-white/[0.05] border border-white/[0.08] text-white/80 rounded-bl-sm"
                                }`}>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}

                    {/* ── Processing indicator (typing dots) ──────────────── */}
                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shrink-0">
                                <Sparkles size={12} className="text-white" />
                            </div>
                            <div className="flex gap-1 px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-bl-sm">
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ y: [0, -3, 0], opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                                        className="w-1.5 h-1.5 rounded-full bg-violet-400"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Auto-scroll anchor ───────────────────────────────── */}
                    <div ref={chatBottomRef} />

                </div>{/* ── end scrollable area ── */}

                {/* Follow-up input bar */}
                <FollowUpBar
                    isReady={previewUrl}
                    isProcessing={isProcessing}
                    onFollowUp={handleFollowUp}
                />
            </div>

            {/* ── Drag handle ─────────────────────────────────────────────── */}
            <ResizeHandle onMouseDown={leftPanel.onMouseDown} />

            {/* ── RIGHT: Tabbed panel ──────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">

                <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.06] bg-[#0f1117] shrink-0">
                    <TabButton
                        active={rightTab === "preview"}
                        icon={<Eye size={13} />}
                        label="Preview"
                        onClick={() => setRightTab("preview")}
                    />
                    <TabButton
                        active={rightTab === "code"}
                        icon={<Code2 size={13} />}
                        label="Code"
                        onClick={() => setRightTab("code")}
                    />
                </div>

                <div className="flex-1 min-h-0 flex flex-col">

                    <div className={`flex-1 min-h-0 ${rightTab === "preview" ? "flex" : "invisible absolute inset-0 -z-10"}`}>
                        <PreviewPane
                            previewUrl={previewUrl}
                            hasFiles={Object.keys(fileSystem.files).length > 0}
                        />
                    </div>

                    <div className={`flex-1 min-h-0 flex w-full overflow-hidden ${rightTab === "code" ? "visible" : "invisible absolute inset-0 -z-10"}`}>
                        <div
                            style={{ width: sidebarPanel.size }}
                            className="flex-shrink-0 overflow-hidden h-full"
                        >
                            <FileSidebar
                                fileTree={fileTree}
                                activeFile={fileSystem.activeFile}
                                setActiveFile={handleSetActiveFile}
                                isProcessing={isProcessing}
                                isReady={streaming.isReady}
                            />
                        </div>

                        <ResizeHandle onMouseDown={sidebarPanel.onMouseDown} />

                        <div className="flex-1 min-w-0 h-full overflow-hidden">
                            <CodeEditor
                                {...fileSystem}
                                editorRef={editorRef}
                                monacoRef={monacoRef}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}