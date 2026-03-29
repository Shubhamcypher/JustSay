import { useState } from "react";

export default function HomeContent() {
  const [tab, setTab] = useState("projects");

  const tabs = ["projects", "recent", "templates"];

  return (
    <div className="p-6">

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/10 pb-3">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`capitalize ${
              tab === t ? "text-white" : "text-white/50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
          >
            {tab} {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}