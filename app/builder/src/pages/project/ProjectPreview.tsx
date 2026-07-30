import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SplashScreen from "@/components/SplashScreen";

import { useFiles } from "@/hooks/useFiles";
import { useSteps } from "@/pages/builder/hooks/useSteps";
import { useWebContainer } from "@/hooks/useWebContainer";

import PreviewPane from "@/pages/builder/components/PreviewPane";

import { getProject, getProjectFiles, } from "@/api/project.api";




export default function ProjectPreview() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const userSelectedRef = useRef(false);

    const fileSystem = useFiles(userSelectedRef);
    const { addStep, completeStep } = useSteps();

    const [projectMeta, setProjectMeta] = useState<any>(null);
    const [isReady, setIsReady] = useState(false);


    useEffect(() => {
        if (!projectId) return;

        getProject(projectId)
            .then(({ data }) => {
                setProjectMeta(data);
            })
            .catch(console.error);
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;

        getProjectFiles(projectId)
            .then(({ data }) => {
                const files = data.files;

                for (const [path, file] of Object.entries(files)) {
                    fileSystem.addFile({
                        path,
                        content: (file as any).content,
                    });
                }

                setTimeout(() => {
                    setIsReady(true);
                }, 150);
            })
            .catch(console.error);
    }, [projectId]);

    const { url: previewUrl } = useWebContainer(
        fileSystem.files,
        isReady,
        (msg, type) => {
            if (type === "start") {
                addStep(msg);
            }
        },
        addStep,
        completeStep
    );
    if (!previewUrl) {
        return (
            <SplashScreen message="Preparing your project..." />
        );
    }
    return (
        <div className="h-screen flex flex-col bg-[#0f1117]">

            <div className="h-14 border-b border-white/10 flex items-center justify-between px-6">

                <div className="text-white font-medium">
                    {projectMeta?.name}
                </div>

                <div className="px-28">
                    <button
                        onClick={() => navigate(`/builder/${projectId}`)}
                        className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500"
                    >
                        Edit in Builder
                    </button>
                </div>

            </div>

            <div className="flex-1">
                <PreviewPane
                    previewUrl={previewUrl}
                    hasFiles={Object.keys(fileSystem.files).length > 0}
                />
            </div>

        </div>
    );
}