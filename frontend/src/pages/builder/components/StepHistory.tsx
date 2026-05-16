import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

type Step = {
    id: number;
    text: string;
    status: "loading" | "done";
};

export default function StepHistory({ steps }: { steps: Step[] }) {
    const [open, setOpen] = useState(false);

    const done = steps.filter(s => s.status === "done").length;

    return (
        <div className="border-t border-white/[0.06] pt-3">

            {/* Toggle */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className="flex items-center justify-between w-full text-left"
            >
                <span className="text-[11px] text-white/30">
                    {done} steps completed
                </span>
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={12} className="text-white/25" />
                </motion.div>
            </button>

            {/* Accordion */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col gap-2 pt-3 max-h-[200px] overflow-y-auto pr-1">
                            {steps.map(step => (
                                <div key={step.id} className="flex items-center gap-2">
                                    {step.status === "done" ? (
                                        <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0">
                                            <circle cx="6" cy="6" r="5" fill="rgba(59,130,246,0.2)" />
                                            <path d="M3.5 6l2 2 3-3" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <div className="w-3 h-3 rounded-full border border-white/20 shrink-0" />
                                    )}
                                    <span className="text-[11px] text-white/30 truncate">
                                        {step.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}