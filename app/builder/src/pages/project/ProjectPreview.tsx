import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { useFiles } from "@/hooks/useFiles";
import { useSteps } from "@/pages/builder/hooks/useSteps";
import { useWebContainer } from "@/hooks/useWebContainer";


import { getProject, getProjectFiles, } from "@/api/project.api";
import ProjectHeader from "./components/ProjectHeader";
import ProjectFrame from "./components/ProjectFrame";
import ProjectLoader from "./components/ProjectLoader";
import type { ProjectFile, ProjectMeta } from "@shared/types";




export default function ProjectPreview() {
    const { projectId } = useParams();


    const userSelectedRef = useRef(false);

    const fileSystem = useFiles(userSelectedRef);
    const { addStep, completeStep } = useSteps();

    

    const [projectMeta, setProjectMeta] = useState<ProjectMeta | null>(null);
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
                        content: (file as ProjectFile).content,
                    });
                }

                setTimeout(() => {
                    setIsReady(true);
                }, 150);
            })
            .catch(console.error);
    }, [projectId]);

    const { url: previewUrl, status, progress } = useWebContainer(
        fileSystem.files,
        isReady,
        addStep,
        completeStep
    );
    if (!previewUrl) {
        return (
            <ProjectLoader
                projectName={projectMeta?.name}
                status={status}
                progress={progress}
            />
        );
    }
    return (
        <div className="h-screen flex flex-col bg-[#0b0b0b]">

            <ProjectHeader
                projectId={projectId!}
                projectName={projectMeta?.name}
            />

            <ProjectFrame
                previewUrl={previewUrl}
            />

        </div>
    );
}