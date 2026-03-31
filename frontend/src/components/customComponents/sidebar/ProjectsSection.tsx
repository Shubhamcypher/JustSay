import { useEffect, useState } from "react";
import { Folder, ChevronRight, FolderOpen, Users, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import ProjectItem from "./ProjectItem";

type SectionKey = "created" | "shared" | "starred";

const sections = [
  { key: "created", label: "Created by me", icon: FolderOpen },
  { key: "shared", label: "Shared with me", icon: Users },
  { key: "starred", label: "Starred", icon: Star },
] as const;



export default function ProjectsSection({
  collapsed,
  onHover,
  onLeave,
}: any) {
  const [projectsOpen, setProjectsOpen] = useState(collapsed);
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    created: true,
    shared: false,
    starred: false,
  });
  const [hovered, setHovered] = useState<string | null>(null);

  const isSmallScreen = window.innerWidth < 1024;
  const showProjects = (isSmallScreen && projectsOpen) || (projectsOpen && !collapsed);

  useEffect(() => {
    if (collapsed)
      setProjectsOpen(false)
  }, [collapsed])



  return (
    <div className="flex flex-col">

      {/* Header */}
      {!collapsed && <button
        onClick={() => setProjectsOpen(!projectsOpen)}
        className="flex items-center justify-between px-3 py-2 text-sm text-white/70 hover:bg-white/10 rounded-lg transition"
      >
        <div className="flex items-center gap-2">
          <Folder size={16} />
          {(isSmallScreen || !collapsed) && <span>Projects</span>}
        </div>

        <ChevronRight
          size={16}
          className={cn(projectsOpen && "rotate-90 transition-all")}
        />
      </button>}

      {/* Content */}
      {collapsed && !isSmallScreen && (
        <div className="flex flex-col items-center gap-3 mt-2">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <div className="relative group">
                <button
                  key={section.key}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
                >
                  <Icon size={16} />
                </button>

                {/* Tooltip */}
                <div
                  className={cn(
                    "absolute left-full ml-3 top-1/2 -translate-y-1/2",
                    "px-3 py-1.5 rounded-md text-xs",
                    "bg-black/80 text-white whitespace-nowrap",
                    "shadow-lg border border-white/10 backdrop-blur-md",
                    "pointer-events-none",
                    "opacity-0 translate-x-[-4px]",
                    "transition-all duration-200",
                    "group-hover:opacity-100 group-hover:translate-x-0"
                  )}
                >
                  {section.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hovered && (
        <div
          className="absolute left-full ml-3 top-0 z-50 pointer-events-none"
        >
          <div className="px-3 py-1.5 rounded-md text-xs bg-black/80 text-white whitespace-nowrap shadow-lg border border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-left-2 duration-200">
            {hovered}
          </div>
        </div>
      )}

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          showProjects
            ? "max-h-[300px] md:max-h-[640px] lg:max-h-40 overflow-y-scroll custom-scrollbar opacity-100 mt-2 ml-2"
            : "max-h-0 opacity-0"
        )}
      >
        <div className=" overflow-y-auto space-y-2  pr-1">

          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <div key={section.key}>
                <button
                  onClick={() =>
                    setOpenSections((prev) => ({
                      ...prev,
                      [section.key]: !prev[section.key],
                    }))
                  }
                  className="w-full flex items-center justify-between px-2 py-1 text-xs text-white/50 hover:text-white"
                >
                  <div className="flex gap-2 items-center">
                    <Icon size={14} />
                    {section.label}
                  </div>

                  <ChevronRight
                    size={14}
                    className={cn(
                      "transition-transform duration-200",
                      openSections[section.key] && "rotate-90"
                    )}
                  />
                </button>

                 <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    openSections[section.key]
                      ? "max-h-full opacity-100 mt-1 ml-3"
                      : "max-h-0 opacity-0"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    {["Project A", "Landing Page", "yoo", "looo", "pooo", "kooo", "chooo", "wooo", "thoooo"].map((p) => (
                      <ProjectItem
                        key={p}
                        name={p}
                        onHover={onHover}
                        onLeave={onLeave}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}