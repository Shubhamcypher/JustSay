import { useLocation } from "react-router-dom";
import { useRef, useState } from "react";
import { Eye, Code2 } from "lucide-react";
import { useFiles } from "@/hooks/useFiles";
import { useSteps } from "./hooks/useSteps";
import { useFileTree } from "./hooks/useFileTree";
import { useFileStreaming } from "./hooks/useFileStreaming";
import { useFollowUp } from "@/hooks/useFollowUp";
import { useWebContainer } from "@/hooks/useWebContainer";
import CodeEditor from "./components/CodeEditor";
import PreviewPane from "./components/PreviewPane";
import FileSidebar from "./components/FileSidebar";
// import StepsPanel from "./components/StepsPanel";
import { FollowUpBar } from "./components/FollowUpBar";
import { TabButton, type RightTab } from "./components/TabButton";
import BuilderAgent from "./components/BuilderAgent";




export default function Builder() {
    const { state } = useLocation();
    const prompt = state?.prompt;
    const projectId = state?.projectId;

    const userSelectedRef = useRef(false);
    const [rightTab, setRightTab] = useState<RightTab>("preview");

    const fileSystem = useFiles(userSelectedRef);
    const { steps, addStep, completeStep } = useSteps();
    const fileTree = useFileTree(fileSystem.filePaths);

    const streaming = useFileStreaming({
        prompt,
        ...fileSystem,
        addStep,
        completeStep,
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
                        <span className="text-[10px] font-bold">J</span>
                    </div>
                    <span className="text-sm font-semibold text-white/70 tracking-wide">Justsay</span>
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
                    <BuilderAgent
                        isReady={streaming.isReady}
                        isProcessing={isProcessing}
                        steps={steps}
                        url={previewUrl}
                        prompt={prompt}
                        files={streaming.finalFiles}
                    />
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
                        active={rightTab === "code"}
                        icon={<Code2 size={13} />}
                        label="Code"
                        onClick={() => setRightTab("code")}
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
                        className={`absolute inset-0 flex transition-opacity duration-200 ${rightTab === "code"
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                            }`}
                    >
                        <FileSidebar
                            fileTree={fileTree}
                            activeFile={fileSystem.activeFile}
                            setActiveFile={handleSetActiveFile}
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
