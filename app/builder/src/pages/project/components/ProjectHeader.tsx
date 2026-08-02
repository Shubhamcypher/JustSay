import {
    ArrowLeft,
    MonitorPlay,
    Rocket,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
    projectId: string;
    projectName?: string;
};

export default function ProjectHeader({
    projectId,
    projectName,
}: Props) {
    const navigate = useNavigate();

    return (
        <header className="h-16 border-b border-white/10 bg-[#0b0b0b]/90 backdrop-blur-xl px-6 flex items-center justify-between">

            {/* Left */}

            <div className="flex items-center gap-5">

                <button
                    onClick={() => (window.location.href = "http://localhost:5173")}
                    className="group relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/5 transition"
                >
                    <ArrowLeft
                        size={18}
                        className="text-white/60 group-hover:text-white transition-all"
                    />

                    <span
                        className="
      pointer-events-none
      absolute
      left-full
      ml-3
      whitespace-nowrap
      rounded-full
      border
      border-white/10
      bg-[#161616]
      px-3
      py-1.5
      text-xs
      font-medium
      text-white/80
      opacity-0
      -translate-x-2
      transition-all
      duration-200
      group-hover:opacity-100
      group-hover:translate-x-0
    "
                    >
                        Back to Dashboard
                    </span>
                </button>

                <div className="flex items-center gap-4">

                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
                        J
                    </div>

                    <div>

                        <div className="flex items-center gap-3">

                            <h1 className="text-lg font-semibold text-white">
                                {projectName || "Untitled Project"}
                            </h1>

                            <span className="px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                                LIVE
                            </span>

                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-sm text-white/40">

                            <MonitorPlay size={13} />

                            <span>Live Preview</span>

                        </div>

                    </div>

                </div>

            </div>

            {/* Right */}

            <div className="flex items-center gap-3">

                {/* Edit */}

                <button
                    onClick={() => navigate(`/builder/${projectId}`)}
                    className="
    group
    inline-flex
    items-center
    gap-2
    h-10
    px-5
    rounded-full
    border
    border-violet-500/40
    bg-violet-700/[0.06]
    text-violet-300
    hover:bg-violet-500/[0.12]
    hover:border-violet-400/70
    hover:text-violet-200
    transition-all
    duration-300
    active:scale-95
  "
                >


                    <span className="text-sm font-medium">
                        Edit
                    </span>
                </button>

                {/* Deploy */}

                <button
                    className="
    group
    inline-flex
    items-center
    gap-2
    h-10
    px-5
    rounded-full
    border
    border-emerald-500/40
    bg-emerald-500/[0.06]
    text-emerald-300
    hover:bg-emerald-500/[0.12]
    hover:border-emerald-400/70
    hover:text-emerald-200
    transition-all
    duration-300
    active:scale-95
  "
                >
                    <Rocket
                        size={16}
                        className="transition-transform"
                    />

                    <span className="text-sm font-medium">
                        Deploy
                    </span>
                </button>

            </div>

        </header>
    );
}