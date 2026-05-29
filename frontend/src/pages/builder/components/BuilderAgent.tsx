import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import StepsPanel from "./StepsPanel";
import { useAppDescription } from "@/hooks/useAppDescription";
import StepHistory from "./StepHistory";
import type { ChatMessage } from "../Builder";

type Props = {
    isReady: boolean;
    isProcessing: boolean;
    steps: any[];
    url: string | null;
    prompt: string;
    files: Record<string, any>;
    chatHistory: ChatMessage[]; 
};



function humanizeStep(step: string) {
    const s = step.toLowerCase();

    if (s.includes("install"))
        return "Installing required dependencies...";

    if (s.includes("component"))
        return "Building UI components...";

    if (s.includes("preview"))
        return "Starting live preview environment...";

    if (s.includes("route"))
        return "Configuring application routing...";

    if (s.includes("tailwind"))
        return "Styling the interface...";

    if (s.includes("file"))
        return "Generating project files...";

    if (s.includes("webcontainer"))
        return "Booting development environment...";

    if (s.includes("editor"))
        return "Preparing code editor...";

    if (s.includes("patch"))
        return "Applying requested changes...";

    if (s.includes("dependency"))
        return "Resolving package dependencies...";

    return step;
}

export default function BuilderAgent({
    isReady,
    isProcessing,
    steps,
    url,
    prompt,
    files
}: Props) {

    const buildSummary = useAppDescription(url, prompt, files);

    // Latest unfinished step
    const activeStep =
        [...steps]
            .reverse()
            .find((step) => !step.completed);

    // Last completed step
    const completedStep =
        [...steps]
            .reverse()
            .find((step) => step.completed);

    const currentMessage = url
        ? "Preview is ready. You can now explore and iterate on your app."
        : activeStep
            ? humanizeStep(activeStep.text)
            : "Preparing your workspace...";

    return (
        <div className="flex items-start gap-3">

            {/* AI Avatar */}
            <motion.div
                animate={url ? { scale: 1 } : { scale: [1, 1.06, 1] }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                }}
                className="relative shrink-0"
            >
                <div
                    className="w-9 h-9 rounded-2xl
                               bg-gradient-to-br
                               from-violet-500
                               via-fuchsia-500
                               to-indigo-500
                               flex items-center justify-center
                               shadow-lg shadow-violet-500/20"
                >
                    <Sparkles size={16} className="text-white" />
                </div>

                {/* Pulse ring */}
                <motion.div
                    animate={{
                        opacity: [0.15, 0.35, 0.15],
                        scale: [1, 1.45, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: url ? 0 : Infinity,
                    }}
                    className="absolute inset-0 rounded-2xl bg-violet-500"
                />
            </motion.div>

            {/* Right content */}
            <div className="flex-1 min-w-0 space-y-3">

                {/* Main AI bubble */}
                <motion.div
                    layout
                    className="relative overflow-hidden
                               rounded-3xl rounded-tl-md
                               border border-white/[0.08]
                               bg-gradient-to-br
                               from-white/[0.05]
                               to-white/[0.03]
                               px-5 py-4"
                >

                    {/* subtle glow */}
                    <div
                        className="absolute inset-0 opacity-30
                                   bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_40%)]"
                    />

                    <div className="relative z-10">

                        {/* Header */}
                        <div className="flex flex-col justify-between mb-3">

                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{
                                        opacity: [0.5, 1, 0.5],
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                    }}
                                    className={`w-1.5 h-1.5 rounded-full ${isReady
                                        ? "bg-emerald-400"
                                        : isProcessing
                                            ? "bg-amber-400"
                                            : "bg-violet-400"
                                        }`}
                                />

                                <span
                                    className="text-[11px]
                                               uppercase tracking-[0.18em]
                                               text-white/35 font-medium"
                                >
                                    AI Builder
                                </span>
                            </div>

                            {/* Steps Panel OR History */}
                            {steps.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="border-t border-white/[0.06] pt-3"
                                >
                                    {url ? (
                                        <>
                                            {/* Summary */}
                                            <div className="flex flex-col gap-2 mb-3">
                                                {buildSummary.map((line, i) => (
                                                    <motion.p
                                                        key={i}
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="text-[13px] text-white/50 leading-relaxed"
                                                    >
                                                        {line}
                                                    </motion.p>
                                                ))}
                                            </div>

                                            {/* Step history accordion */}
                                            <StepHistory steps={steps} />
                                        </>
                                    ) : (
                                        <StepsPanel steps={steps} />
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Current activity */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentMessage}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.22 }}
                                className="text-[15px]
                                           leading-relaxed
                                           text-white/80"
                            >
                                {currentMessage}
                            </motion.div>
                        </AnimatePresence>

                        {/* Last completed step */}
                        {!isReady && completedStep && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-3 text-xs text-emerald-400/70"
                            >
                                ✓ {humanizeStep(completedStep.text)}
                            </motion.div>
                        )}

                        {/* Typing dots */}
                        {!isReady && (
                            <div className="flex gap-1 mt-4">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            y: [0, -3, 0],
                                            opacity: [0.3, 1, 0.3],
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            delay: i * 0.15,
                                        }}
                                        className="w-1.5 h-1.5 rounded-full bg-violet-400"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}