import { useLocation } from "react-router-dom";
import { useFiles } from "@/hooks/useFiles";
import { useSteps } from "./hooks/useSteps";
import { useFileTree } from "./hooks/useFileTree";
import CodeEditor from "./components/CodeEditor";
import PreviewPane from "./components/PreviewPane";
import { useWebContainer } from "@/hooks/useWebContainer";
import { useRef } from "react";
import { useFileStreaming } from "./hooks/useFileStreaming";
import FileSidebar from "./components/FileSidebar";

export default function Builder() {
    const { state } = useLocation();
    const prompt = state?.prompt;
    
    const userSelectedRef = useRef(false);

    const fileSystem = useFiles(userSelectedRef);
    const { steps, addStep, completeStep, completeStepByText } = useSteps();

    const fileTree = useFileTree(fileSystem.filePaths);


    const streaming = useFileStreaming({
        prompt,
        ...fileSystem,
        addStep,
        completeStep,
        completeStepByText,
        userSelectedRef
    });

    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const activeStepRef = useRef<number | null>(null);

    const handleSetActiveFile = (file: string) => {
        userSelectedRef.current = true; // user took control
        fileSystem.setActiveFile(file);
    };

    const previewUrl = useWebContainer(
        streaming.finalFiles,
        streaming.isReady,
        (msg, type) => {
            if (type === "start") {
                activeStepRef.current = addStep(msg);
            }

            if (type === "end") {
                if (activeStepRef.current !== null) {
                    completeStep(activeStepRef.current);
                    activeStepRef.current = null;
                }
            }
        }
    );

    return (
        <div className="h-screen flex bg-gray-900 text-white p-4 gap-4">
            <FileSidebar
                fileTree={fileTree}
                activeFile={fileSystem.activeFile}
                setActiveFile={handleSetActiveFile}
                steps={steps}
            />

            <CodeEditor
                {...fileSystem}
                editorRef={editorRef}
                monacoRef={monacoRef}
            />

            <PreviewPane
                previewUrl={previewUrl}
                hasFiles={Object.keys(fileSystem.files).length > 0}
            />
        </div>
    );
}