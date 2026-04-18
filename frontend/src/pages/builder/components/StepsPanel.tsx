type Step = {
    id: number;
    text: string;
    status: "loading" | "done";
  };
  
  export default function StepsPanel({ steps }: { steps: Step[] }) {
    return (
      <div className="h-[160px] mt-3 border-t border-white/10 pt-3 overflow-hidden">
        <div className="flex flex-col gap-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                bg-white/5 backdrop-blur
                transition-all duration-500
                ${step.status === "done" ? "opacity-50 scale-95" : "scale-100"}
              `}
            >
              {/* ICON */}
              {step.status === "loading" ? (
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="text-green-400">✔</div>
              )}
  
              {/* TEXT */}
              <span className="text-sm text-white/80">
                {step.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }