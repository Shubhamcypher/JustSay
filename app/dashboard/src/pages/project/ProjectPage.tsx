import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProject } from "@/api/project.api";

type Project = {
    id: string;
    name: string;
    prompt: string;
    snapshot?: string;
    stack: string;
    created_at: string;
    updated_at: string;
};

export default function ProjectPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        getProject(id)
            .then(({ data }) => {
                setProject(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));

    }, [id]);

    const handleEdit = () => {
        if (!id) return;

        window.location.href = `http://localhost:5174/builder/${id}`;
    };

    return (
        <div className="h-screen bg-[#0f1117] text-white flex flex-col">

            {/* Header */}
            <div className="border-b border-white/10 px-8 py-5 flex items-center justify-between">

                <div>
                    <button
                        onClick={() => navigate("/")}
                        className="text-sm text-white/50 hover:text-white"
                    >
                        ← Back
                    </button>

                    <h1 className="text-3xl font-semibold mt-3">
                        {loading ? "Loading..." : project?.name}
                    </h1>

                    <p className="text-white/40 mt-1">
                        {project?.prompt}
                    </p>
                </div>

                <button
                    onClick={handleEdit}
                    className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 transition"
                >
                    Edit in Builder
                </button>

            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-hidden">

            <div className="h-full rounded-2xl border border-white/10 bg-[#181b22] flex items-center justify-center p-6 overflow-hidden">

                    {project?.snapshot ? (
                        <img
                        src={project.snapshot}
                        alt={project.name}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        draggable={false}
                    />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 text-xl">
                            No Preview Available
                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}