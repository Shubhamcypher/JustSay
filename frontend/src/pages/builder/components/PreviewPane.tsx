import { motion } from "framer-motion";
import StepsPanel from "./StepsPanel";
import { useState } from "react";




function PreviewLoading({ steps }: any) {


  return (
    <div className="w-full h-full bg-[#141414] flex flex-col items-center justify-center gap-6 p-4 rounded-xl">

      {/* Floating browser mockup */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-full max-w-[700px] lg:max-w-[900px] "
      >
        <div className="rounded-xl border border-white/[0.06] overflow-hidden h-[420px] lg:h-[320px]">

          {/* Browser chrome */}
          <div className="bg-white/[0.04] border-b border-white/[0.05] px-3 py-2.5 flex items-center gap-2">
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/10" />)}
            </div>
            <div className="flex-1 bg-white/[0.05] rounded px-2 h-[18px] flex items-center gap-1.5">
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
                <path d="M6 3v3l2 1" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span className="text-[9px] text-white/20 font-mono">localhost:5173</span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="ml-auto w-1.5 h-1.5 border border-blue-400/60 border-t-transparent rounded-full"
              />
            </div>
          </div>

          {/* Page skeleton */}
          <div className="bg-[#1a1a1a] p-6 lg:p-8 flex flex-col gap-2.5">
            <div className="flex items-center justify-between mb-1">
              <Shimmer className="w-16 h-3" />
              <div className="flex gap-1.5">
                <Shimmer className="w-9 h-2" delay={0.1} />
                <Shimmer className="w-9 h-2" delay={0.2} />
                <Shimmer className="w-9 h-2" delay={0.3} />
              </div>
            </div>
            <Shimmer className="w-full h-28 rounded-lg" />
            <div className="grid grid-cols-3 gap-2">
              <Shimmer className="h-11 rounded-md" delay={0.1} />
              <Shimmer className="h-11 rounded-md" delay={0.2} />
              <Shimmer className="h-11 rounded-md" delay={0.3} />
            </div>
            <Shimmer className="w-[90%] h-2" delay={0.1} />
            <Shimmer className="w-[65%] h-2" delay={0.2} />
          </div>
        </div>
      </motion.div>

      {/* Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[320px] flex flex-col gap-3.5"
      >
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {[0, 0.2, 0.4].map((delay, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.4, repeat: Infinity, delay }}
                className="w-1 h-1 rounded-full bg-white/40"
              />
            ))}
          </div>
        </div>

        {/* Steps */}
        <StepsPanel steps={steps} />
      </motion.div>

    </div>
  );
}

// Shimmer skeleton helper
function Shimmer({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 2, repeat: Infinity, delay }}
      className={`bg-white/[0.06] ${className}`}
    />
  );
}

export default function PreviewPane({ previewUrl, hasFiles, steps }: any) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  return (
    <div
      className={`p-2 transition-all duration-300 ${isFullscreen
        ? "fixed inset-0 z-50 bg-[#141414]"
        : "w-[50%]"
        }`}
    >
      {hasFiles && previewUrl ? (
        <div className="w-full h-full flex flex-col gap-2 relative">

          {/* FULLSCREEN BUTTON */}
          {!isFullscreen && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-2 right-2 z-50 px-3 py-1 bg-black/60 text-xs rounded"
            >
              Fullscreen
            </button>
          )}

          {/* EXIT BUTTON */}
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-2 right-2 z-50 px-3 py-1 bg-black/60 text-xs rounded"
            >
              Exit
            </button>
          )}

          <iframe
            src={previewUrl}
            className="w-full h-full bg-gray-500 rounded-lg"
          />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col justify-center items-center gap-6">
          <PreviewLoading steps={steps} />
        </div>
      )}
    </div>
  );
}

