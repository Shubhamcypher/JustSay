import { useState } from "react";
import { cn } from "@/lib/utils";

export default function HomeContent() {
  const [tab, setTab] = useState("projects");

  const tabs = ["projects", "recent", "templates"];

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">

      {/* 🔹 Tabs */}
      <div className="flex gap-4 md:gap-6 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">

        {tabs.map((t) => {
          const isActive = tab === t;

          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "capitalize text-sm md:text-base whitespace-nowrap px-1 pb-1 transition-all",
                isActive
                  ? "text-white border-b-2 border-blue-500"
                  : "text-white/50 hover:text-white"
              )}
            >
              {t}
            </button>
          );
        })}

      </div>

      {/* 🔹 Grid */}
      <div className="mt-4 md:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-36 md:h-40 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm md:text-base active:scale-[0.98] transition-transform"
          >
            {tab} {i + 1}
          </div>
        ))}

      </div>
    </div>
  );
}