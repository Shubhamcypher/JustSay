import { motion } from "framer-motion";

type Step = {
    id: number;
    text: string;
    status: "loading" | "done";
    group?: string;
};


export default function StepsPanel({ steps }: { steps: Step[] }) {
  const visibleSteps = steps.slice(-3);

  const progress = Math.floor(
    (steps.filter((s) => s.status === "done").length /
      (steps.length || 1)) *
      100
  );

  return (
    <div className="w-full max-w-[320px] flex flex-col gap-3.5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-blue-500"
          />
          <span className="text-xs text-white/50">
            Building your app
          </span>
        </div>

        <div className="text-[10px] text-white/30">
          {progress}%
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
        />
      </div>

      {/* STEPS (🔥 SAME STYLE AS PreviewLoading) */}
      <div className="flex flex-col gap-2">
        {visibleSteps.map((step, i) => {
          const isDone = step.status === "done";

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-2"
            >
              {isDone ? (
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <circle
                    cx="6"
                    cy="6"
                    r="5"
                    fill="rgba(59,130,246,0.2)"
                  />
                  <path
                    d="M3.5 6l2 2 3-3"
                    stroke="#3b82f6"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-3 h-3 border border-indigo-400/50 border-t-transparent rounded-full"
                />
              )}

              <span
                className={`text-[11px] ${
                  isDone ? "text-white/30" : "text-white/50"
                }`}
              >
                {step.text}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}