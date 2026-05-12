import { useLocation } from "react-router-dom";
import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Eye, Code2, Loader2 } from "lucide-react";

import { useFiles } from "@/hooks/useFiles";
import { useSteps } from "./hooks/useSteps";
import { useFileTree } from "./hooks/useFileTree";
import { useFileStreaming } from "./hooks/useFileStreaming";
import { useFollowUp } from "@/hooks/useFollowUp";
import { useWebContainer } from "@/hooks/useWebContainer";

import CodeEditor from "./components/CodeEditor";
import PreviewPane from "./components/PreviewPane";
import FileSidebar from "./components/FileSidebar";
import StepsPanel from "./components/StepsPanel";

type RightTab = "preview" | "builder";



// ── Follow-up bar (same logic/UI as FileSidebar's bottom section) ─────────────
function FollowUpBar({
    isReady,
    isProcessing,
    onFollowUp,
}: {
    isReady: boolean;
    isProcessing: boolean;
    onFollowUp: (text: string) => void;
}) {
    const [text, setText] = useState("");
    const taRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        const ta = taRef.current;
        if (ta) {
            ta.style.height = "auto";
            ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
        }
    };

    const handleSubmit = () => {
        if (!text.trim() || !isReady || isProcessing) return;
        onFollowUp(text.trim());
        setText("");
        if (taRef.current) taRef.current.style.height = "auto";
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="border-t border-white/[0.06] px-3 py-3 shrink-0">
            {/* Status dot */}
            <div className="flex items-center gap-1.5 mb-2">
                <div
                    className={`w-1.5 h-1.5 rounded-full ${isReady ? "bg-emerald-500" : "bg-yellow-500 animate-pulse"
                        }`}
                />
                <span className="text-[10px] text-white/30">
                    {isReady ? "Ready for follow-up" : "Generating…"}
                </span>
            </div>

            {/* Textarea box */}
            <div
                className={`relative rounded-xl border transition-colors ${isReady && !isProcessing
                        ? "border-white/10 focus-within:border-indigo-500/50"
                        : "border-white/5 opacity-50"
                    }`}
            >
                <textarea
                    ref={taRef}
                    value={text}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={!isReady || isProcessing}
                    placeholder={
                        !isReady
                            ? "Wait for generation to finish…"
                            : isProcessing
                                ? "Applying changes…"
                                : "Add a feature, fix a bug, change styling…"
                    }
                    rows={1}
                    className="w-full bg-transparent text-sm text-white placeholder-white/20
                               resize-none px-3 pt-3 pb-8 outline-none rounded-xl custom-scrollbar"
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                />

                <div className="absolute bottom-2 left-3 right-2 flex items-center justify-between">
                    <span className="text-[10px] text-white/20">
                        {text.length > 0 ? `${text.length} chars` : "Shift+Enter for new line"}
                    </span>
                    <button
                        onClick={handleSubmit}
                        disabled={!text.trim() || !isReady || isProcessing}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${text.trim() && isReady && !isProcessing
                                ? "bg-indigo-600 text-white hover:bg-indigo-500"
                                : "bg-white/5 text-white/20 cursor-not-allowed"
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={11} className="animate-spin" />
                                <span>Working…</span>
                            </>
                        ) : (
                            <>
                                <Icon icon="mdi:send" width={11} />
                                <span>Apply</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <p className="text-[10px] text-white/20 text-center mt-2">
                Only changed files are updated • Enter to apply
            </p>
        </div>
    );
}

// ── Tab button ─────────────────────────────────────────────────────────────────
function TabButton({
    active,
    icon,
    label,
    onClick,
}: {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${active
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

// ── Main Builder ───────────────────────────────────────────────────────────────
export default function Builder() {
    const { state } = useLocation();
    const prompt = state?.prompt;
    const projectId = state?.projectId;

    const userSelectedRef = useRef(false);
    const [rightTab, setRightTab] = useState<RightTab>("preview");

    const fileSystem = useFiles(userSelectedRef);
    const { steps, addStep, completeStep, completeStepByText } = useSteps();
    const fileTree = useFileTree(fileSystem.filePaths);

    const streaming = useFileStreaming({
        prompt,
        ...fileSystem,
        addStep,
        completeStep,
        completeStepByText,
        userSelectedRef,
    });

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

    return (
        <div className="h-screen flex bg-[#0f1117] text-white overflow-hidden">

            {/* ── LEFT: Chat column (40%) ─────────────────────────────────── */}
            <div className="w-[40%] min-w-[300px] max-w-[500px] flex flex-col border-r border-white/[0.06] bg-[#13151c]">

                {/* Logo header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] shrink-0">
                    <div className="w-5 h-5 rounded bg-violet-500 flex items-center justify-center">
                        <span className="text-[10px] font-bold">B</span>
                    </div>
                    <span className="text-sm font-semibold text-white/70 tracking-wide">bolt</span>
                </div>

                {/* Scrollable chat + steps */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">

                    {/* User prompt bubble */}
                    {prompt && (
                        <div className="flex justify-end">
                            <div className="bg-violet-600/80 text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[85%] leading-relaxed">
                                {prompt}
                            </div>
                        </div>
                    )}

                    {/* AI bubble + steps */}
                    <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[9px] font-bold">AI</span>
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                            <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-white/70 leading-relaxed">
                                I'll build this for you. Setting up files and booting your app…
                            </div>

                            {/* Steps inline — no separate component file needed */}
                            {steps.length > 0 && (
                                <div className="px-4 py-3 border-t border-white/[0.06] shrink-0">
                                    <StepsPanel steps={steps} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Follow-up bar — same UI as FileSidebar's bottom, calls same sendFollowUp */}
                <FollowUpBar
                    isReady={streaming.isReady}
                    isProcessing={isProcessing}
                    onFollowUp={sendFollowUp}
                />
            </div>

            {/* ── RIGHT: Tabbed panel (60%) ────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Tab bar */}
                <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.06] bg-[#0f1117] shrink-0">
                    <TabButton
                        active={rightTab === "preview"}
                        icon={<Eye size={13} />}
                        label="Preview"
                        onClick={() => setRightTab("preview")}
                    />
                    <TabButton
                        active={rightTab === "builder"}
                        icon={<Code2 size={13} />}
                        label="Builder"
                        onClick={() => setRightTab("builder")}
                    />
                </div>

                {/* Content area — both tabs mounted, toggled via opacity (no remount cost) */}
                <div className="flex-1 min-h-0 relative">

                    {/* PREVIEW tab */}
                    <div
                        className={`absolute inset-0 transition-opacity duration-200 ${rightTab === "preview"
                                ? "opacity-100 pointer-events-auto"
                                : "opacity-0 pointer-events-none"
                            }`}
                    >
                        <PreviewPane
                            previewUrl={previewUrl}
                            hasFiles={Object.keys(fileSystem.files).length > 0}
                        />
                    </div>
                    <div
                        className={`absolute inset-0 flex transition-opacity duration-200 ${rightTab === "builder"
                                ? "opacity-100 pointer-events-auto"
                                : "opacity-0 pointer-events-none"
                            }`}
                    >
                        <FileSidebar
                            fileTree={fileTree}
                            activeFile={fileSystem.activeFile}
                            setActiveFile={handleSetActiveFile}
                            onFollowUp={sendFollowUp}
                            isProcessing={isProcessing}
                            isReady={streaming.isReady}
                        />
                        <CodeEditor
                            {...fileSystem}
                            editorRef={editorRef}
                            monacoRef={monacoRef}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
