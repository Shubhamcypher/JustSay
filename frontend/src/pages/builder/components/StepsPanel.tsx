import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef } from "react";

type Step = {
    id: number;
    text: string;
    status: "loading" | "done";
    group?: string;
};

export default function StepsPanel({ steps }: { steps: Step[] }) {
    const containerRef = useRef<HTMLDivElement>(null);

    const visibleSteps = useMemo(() => {
        return steps.slice(-3); // 🔥 last 3 steps only
    }, [steps]);

    // 🔥 progress %
    const progress = useMemo(() => {
        const total = steps.length || 1;
        const done = steps.filter((s) => s.status === "done").length;
        return Math.floor((done / total) * 100);
    }, [steps]);

    // 🔥 auto scroll
    useEffect(() => {
        const el = containerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [steps]);

    return (
        <div className="h-[200px] mt-3 border-t border-white/10 pt-3 flex flex-col">

            {/* 🔥 PROGRESS BAR */}
            <div className="mb-2">
                <div className="text-xs text-white/40 mb-1">
                    Progress • {progress}%
                </div>
                <div className="h-1 bg-white/10 rounded overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div
                ref={containerRef}
                className="flex flex-col gap-2 overflow-y-auto pr-1"
            >
                {visibleSteps.map((step) => {
                    const isActive = step.status === "loading";

                    return (
                        <div
                            key={step.id}
                            className={`
        flex items-center gap-3 px-3 py-2 rounded-lg
        transition-all duration-300
        ${isActive
                                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                                    : "bg-white/5 opacity-40"
                                }
      `}
                        >
                            {/* ICON */}
                            {isActive ? (
                                <Icon
                                    icon="svg-spinners:180-ring"
                                    className="text-blue-400"
                                    width={16}
                                />
                            ) : (
                                <Icon
                                    icon="mdi:check-circle"
                                    className="text-green-400 scale-110"
                                    width={14}
                                />
                            )}

                            {/* TEXT */}
                            <span
                                className={`
          text-sm
          ${isActive
                                        ? "text-white"
                                        : "line-through text-white/40"
                                    }
        `}
                            >
                                {step.text}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}