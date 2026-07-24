import { motion } from "framer-motion";

function S({ w, delay = 0, className = "", style }: { w?: string; delay?: number; className?: string; style?: React.CSSProperties }) {
    return (
        <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, delay, ease: "easeInOut" }}
            className={`bg-white/[0.08] rounded-[4px] ${className}`}
            style={{ ...(w ? { width: w } : {}), ...style }}
        />
    );
}

function SD({ w, delay = 0, className = "", style }: { w?: string; delay?: number; className?: string; style?: React.CSSProperties }) {
    return (
        <motion.div
            animate={{ opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 2, repeat: Infinity, delay, ease: "easeInOut" }}
            className={`bg-white/[0.04] rounded-[6px] ${className}`}
            style={{ ...(w ? { width: w } : {}), ...style }}
        />
    );
}

export default function PreviewLoading() {
    return (
        <div className="h-full w-full rounded-lg bg-black/30 flex flex-col items-center justify-center gap-16 px-8 py-12 overflow-hidden">

            {/* Browser frame */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-full max-w-[660px]"
            >
                <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-[#111216]">

                    {/* Title bar */}
                    <div className="bg-white/[0.03] border-b border-white/[0.05] px-4 py-[11px] flex items-center gap-3">
                        <div className="flex gap-[7px]">
                            {[
                                "rgba(255,90,90,0.25)",
                                "rgba(255,190,50,0.2)",
                                "rgba(50,210,100,0.2)"
                            ].map((bg, i) => (
                                <div key={i} className="w-[11px] h-[11px] rounded-full" style={{ background: bg }} />
                            ))}
                        </div>
                        <div className="flex-1 bg-white/[0.04] rounded-[7px] h-[22px] flex items-center px-2.5 gap-[7px]">
                            <div className="w-[7px] h-[7px] rounded-full border border-white/[0.12] shrink-0" />
                            <S w="120px" className="h-2" delay={0.1} />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
                                className="ml-auto w-[13px] h-[13px] border-[1.5px] border-violet-400/55 border-t-transparent rounded-full shrink-0"
                            />
                        </div>
                        <S className="w-[22px] h-[22px] rounded-md" />
                        <S className="w-[22px] h-[22px] rounded-md" delay={0.15} />
                    </div>

                    {/* Body */}
                    <div className="flex h-[340px] overflow-hidden">

                        {/* Icon sidebar */}
                        <div className="w-11 bg-white/[0.02] border-r border-white/[0.04] flex flex-col items-center py-3.5 gap-2.5 shrink-0">
                            <S className="w-5 h-5 rounded-[5px]" />
                            <S className="w-5 h-5 rounded-[5px]" delay={0.2} />
                            <S className="w-5 h-5 rounded-[5px]" delay={0.1} />
                            <div className="mt-auto" />
                            <S className="w-5 h-5 rounded-[5px]" delay={0.3} />
                        </div>

                        {/* File tree */}
                        <div className="w-40 bg-white/[0.015] border-r border-white/[0.04] px-2.5 py-3 flex flex-col gap-[7px] shrink-0 overflow-hidden">
                            <S className="h-[9px] w-[90%]" delay={0.05} />
                            <SD className="h-2 w-[70%] ml-3" delay={0.1} />
                            <SD className="h-2 w-[80%] ml-3" delay={0.15} />
                            <SD className="h-2 w-[60%] ml-3" delay={0.2} />
                            <S className="h-[9px] w-[85%] mt-1" delay={0.1} />
                            <SD className="h-2 w-[75%] ml-3" delay={0.15} />
                            <SD className="h-2 w-1/2 ml-3" delay={0.25} />
                            <S className="h-[9px] w-[90%] mt-1" delay={0.2} />
                            <SD className="h-2 w-[65%] ml-3" delay={0.1} />
                        </div>

                        {/* Code area */}
                        {/* Code area */}
                        <div className="flex-1 p-5 flex flex-col gap-3 relative overflow-hidden">
                            {/* scan line */}
                            <motion.div
                                animate={{ y: ["-100%", "900%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-x-0 h-10 pointer-events-none"
                                style={{ background: "linear-gradient(transparent, rgba(139,92,246,.04), transparent)" }}
                            />

                            {/* Nav bar skeleton */}
                            <div className="flex items-center justify-between mb-1">
                                <S className="w-16 h-3" delay={0} />
                                <div className="flex gap-2">
                                    <S className="w-9 h-2.5" delay={0.1} />
                                    <S className="w-9 h-2.5" delay={0.2} />
                                    <S className="w-9 h-2.5" delay={0.3} />
                                    <S className="w-16 h-5 rounded-md" delay={0.15} />
                                </div>
                            </div>

                            {/* Hero block */}
                            <SD className="w-full h-20 rounded-xl" delay={0.05} />

                            {/* Three cards */}
                            <div className="grid grid-cols-3 gap-2">
                                <SD className="h-14 rounded-lg" delay={0.1} />
                                <SD className="h-14 rounded-lg" delay={0.2} />
                                <SD className="h-14 rounded-lg" delay={0.3} />
                            </div>

                            {/* Text lines with violet/blue accent dots */}
                            <div className="flex flex-col gap-2 mt-1">
                                {[
                                    { dot: "rgba(139,92,246,.4)", w: "85%" },
                                    { dot: "rgba(59,130,246,.3)", w: "70%" },
                                    { dot: "rgba(139,92,246,.4)", w: "90%" },
                                    { dot: "rgba(16,185,129,.3)", w: "60%" },
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: row.dot }} />
                                        <S className="h-2 rounded-sm" style={{ width: row.w }} delay={i * 0.08} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Status bar */}
                    <div className="bg-white/[0.02] border-t border-white/[0.04] px-4 py-2 flex items-center gap-2.5">
                        <div className="flex gap-1.5">
                            <S className="w-10 h-3.5 rounded-[3px]" />
                            <S className="w-14 h-3.5 rounded-[3px]" delay={0.1} />
                            <S className="w-12 h-3.5 rounded-[3px]" delay={0.2} />
                        </div>
                        <div className="ml-auto flex gap-2 items-center">
                            <S className="w-3.5 h-3.5 rounded-full" />
                            <S className="w-3.5 h-3.5 rounded-full" delay={0.15} />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Pulse dots */}
            <div className="flex flex-col items-center gap-4">
                <div className="flex gap-1.5">
                    {[0, 0.2, 0.4].map((d, i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }}
                            transition={{ duration: 1.4, repeat: Infinity, delay: d }}
                            className="w-[5px] h-[5px] rounded-full bg-violet-400/90"
                        />
                    ))}
                </div>
                <span className="text-xs text-white/20 font-bold tracking-[0.08em]">
                    Loading up your app
                </span>
            </div>

        </div>
    );
}