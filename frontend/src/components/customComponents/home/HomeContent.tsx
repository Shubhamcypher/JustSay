import { useState } from "react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/context/ProjectContext";

type TabType = "projects" | "recent" | "templates";
type ProjectType = "created" | "shared" | "starred";

export default function HomeContent() {
  const { projects } = useProjects();

  const [tab, setTab] = useState<TabType>("projects");
  const [projectType, setProjectType] =
    useState<ProjectType>("created");

  const tabs: TabType[] = ["projects", "recent", "templates"];
  const projectTypes: ProjectType[] = ["created", "shared", "starred"];

  const data = projects[projectType];

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">

      {/* 🔹 Main Tabs */}
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

      {/* 🔹 Project Type Tabs (ONLY for projects) */}
      {tab === "projects" && (
        <div className="flex gap-3 mt-4">
          {projectTypes.map((type) => {
            const isActive = projectType === type;

            return (
              <button
                key={type}
                onClick={() => setProjectType(type)}
                className={cn(
                  "text-xs md:text-sm px-3 py-1 rounded-md transition",
                  isActive
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white/60 hover:text-white"
                )}
              >
                {type}
              </button>
            );
          })}
        </div>
      )}

      {/* 🔹 Content */}
      <div className="mt-4 md:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

        {/* ✅ Projects */}
        {tab === "projects" && (
          data.length === 0 ? (
            <div className="text-white/40 text-sm">
              No projects found
            </div>
          ) : (
            data.map((p) => (
              <div
                key={p.id}
                className="h-36 md:h-40 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm md:text-base active:scale-[0.98] transition-transform"
              >
                {p.name}
              </div>
            ))
          )
        )}

        {/* 🕒 Recent (placeholder) */}
        {tab === "recent" && (
          <div className="text-white/40 text-sm">
            Recent items coming soon
          </div>
        )}

        {/* 📦 Templates (placeholder) */}
        {tab === "templates" && (
          <div className="text-white/40 text-sm">
            Templates coming soon
          </div>
        )}

      </div>
    </div>
  );
}