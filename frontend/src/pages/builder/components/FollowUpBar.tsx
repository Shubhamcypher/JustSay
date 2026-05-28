import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { useRef, useState } from "react";
import AddMenu from "@/components/customComponents/home/AddMenu";




export function FollowUpBar({
    isReady,
    isProcessing,
    onFollowUp,
}: {
    isReady: string | null;
    isProcessing: boolean;
    onFollowUp: (text: string) => void;
}) {
    const [text, setText] = useState("");
    const [focused, setFocused] = useState(false);
    const taRef = useRef<HTMLTextAreaElement>(null);

    const CHIPS = [
        "Add dark mode", "Make responsive", "Fix layout",
    ];

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        const ta = taRef.current;
        if (ta) {
            ta.style.height = "auto";
            ta.style.height = Math.min(ta.scrollHeight, 130) + "px";
        }
    };

    const handleSubmit = () => {
        if (!text.trim() || !isReady || isProcessing) return;
        onFollowUp(text.trim());
        setText("");
        if (taRef.current) taRef.current.style.height = "auto";
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const canSend = text.trim() && isReady && !isProcessing;

    return (
        <div className="px-3 py-4 shrink-0">
            <motion.div
                animate={{
                    borderColor: focused && canSend
                        ? ["rgba(139,92,246,.25)", "rgba(139,92,246,.55)", "rgba(139,92,246,.25)"]
                        : "rgba(139,92,246,.18)",
                }}
                transition={{ duration: 3, repeat: focused ? Infinity : 0 }}
                className="rounded-[20px] border bg-gradient-to-br from-[#13141f] to-[#0f1019] overflow-hidden relative"
            >

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-white/[0.04]">
                        <div className="flex items-center gap-2">
                            <motion.div
                                animate={{
                                    scale: [1, 1.4, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`w-2 h-2 rounded-full ${isProcessing
                                    ? "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,.6)]"
                                    : isReady
                                        ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,.5)]"
                                        : "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,.5)]"
                                    }`}
                            />
                            <span className="text-[11px] text-white/35 font-mono tracking-[0.04em]">
                                {isProcessing ? "APPLYING…" : isReady ? "READY" : "GENERATING…"}
                            </span>
                        </div>
                        {text.length > 0 && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-[10px] font-mono text-violet-400/70 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full"
                            >
                                {text.length} chars
                            </motion.span>
                        )}
                    </div>

                    {/* Textarea */}
                    <div className="px-4 py-3">
                        <textarea
                            ref={taRef}
                            value={text}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            disabled={!isReady || isProcessing}
                            placeholder="Describe what to change, add, or fix…"
                            rows={2}
                            className="w-full bg-transparent text-sm text-white/88 placeholder-white/[0.16]
                                       resize-none outline-none custom-scrollbar leading-relaxed
                                       [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-violet-500/30 [&::-webkit-scrollbar-thumb]:rounded"
                            style={{ maxHeight: "130px" }}
                        />
                    </div>

                    {/* Chips */}
                    <div className="flex gap-1.5 px-3.5 pb-3.5 overflow-x-auto scrollbar-none">
                        {CHIPS.map((chip, i) => (
                            <motion.button
                                key={chip}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setText(chip);
                                    taRef.current?.focus();
                                    setFocused(true);
                                }}
                                disabled={!isReady || isProcessing}
                                className="flex-shrink-0 px-3 py-1 rounded-full border border-white/[0.07]
                                           bg-white/[0.02] text-[11px] text-white/30 whitespace-nowrap
                                           hover:border-violet-500/45 hover:text-violet-400/85 hover:bg-violet-500/[0.07]
                                           transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {chip}
                            </motion.button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-3 pb-3 pt-1">

                        {/* Left Side */}
                        <div className="flex items-center gap-2">
                            {/* Add Menu */}
                            <AddMenu />
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-2">

                            {/* Mic */}
                            <button className="p-2 rounded-lg hover:bg-white/5 transition">
                                <Mic size={18} className="text-white/50" />
                            </button>

                            {/* Send */}
                            <motion.button
                                onClick={handleSubmit}
                                disabled={!canSend}
                                whileHover={canSend ? { y: -1 } : {}}
                                whileTap={canSend ? { scale: 0.96 } : {}}
                                className={`p-2.5 rounded-xl border transition-colors duration-150 ${canSend
                                    ? "bg-violet-500/18 text-violet-300 border-violet-500/25 hover:bg-violet-500/30 hover:border-violet-500/50 hover:text-violet-200"
                                    : "bg-white/[0.03] text-white/[0.15] border-white/[0.06] cursor-not-allowed opacity-40"
                                    }`}
                            >
                                <motion.svg
                                    animate={canSend ? { x: [0, 1, 0], y: [0, -1, 0] } : {}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    style={{ transform: "rotate(0deg)" }}
                                >
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </motion.svg>
                            </motion.button>
                        </div>
                    </div>


                </div>
            </motion.div>
        </div>
    );
}