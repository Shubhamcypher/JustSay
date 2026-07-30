import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
    projectName?: string;
    status: string;
    progress: number;
};

export default function ProjectLoader({
    projectName,
    status,
    progress,
}: Props) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsed((s) => s + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#0b0b0b] flex items-start justify-center pt-28 px-6">

            <div className="w-full max-w-2xl">

                {/* Logo */}

                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl">
                        <span className="text-white text-2xl font-bold">
                            J
                        </span>
                    </div>
                </div>

                {/* Title */}

                <div className="mt-8 text-center">

                    <h1 className="text-3xl font-bold text-white">
                        Opening Project
                    </h1>

                    <p className="mt-3 text-white/60 text-lg">
                        {projectName || "Preparing your application"}
                    </p>

                </div>

                {/* Card */}

                <div className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-8">

                    {/* Current Status */}

                    <div className="flex items-center gap-4">

                        <Loader2
                            size={22}
                            className="animate-spin text-violet-500 shrink-0"
                        />

                        <div>

                            <p className="text-white font-medium text-lg">
                                {status}
                            </p>

                            <p className="text-white/50 text-sm mt-1">
                                Please wait while we prepare your project.
                            </p>

                        </div>

                    </div>

                    {/* Progress */}

                    <div className="mt-8">

                        <div className="flex justify-between mb-3 text-sm">

                            <span className="text-white/50">
                                Progress
                            </span>

                            <span className="text-white font-medium">
                                {progress}%
                            </span>

                        </div>

                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">

                            <div
                                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 transition-all duration-700 ease-out"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />

                        </div>

                    </div>

                    {/* Footer */}

                    <div className="mt-8 flex justify-between items-center text-sm">

                        <span className="text-white/40">
                            Elapsed time
                        </span>

                        <span className="text-white/70 font-medium">
                            {elapsed}s
                        </span>

                    </div>

                </div>

                {/* Bottom Message */}

                <p className="mt-8 text-center text-sm text-white/35 leading-6 max-w-xl mx-auto">
                    The first launch may take a little longer while dependencies are
                    installed and the development server is started.
                </p>

            </div>

        </div>
    );
}