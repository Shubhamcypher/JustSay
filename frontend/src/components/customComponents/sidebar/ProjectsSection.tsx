import { useState } from "react";
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
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    created: true,
    shared: false,
    starred: false,
  });

  return (
    <div className="flex flex-col">

      {/* Header */}
      <button
        onClick={() => setProjectsOpen(!projectsOpen)}
        className="flex items-center justify-between px-3 py-2 text-sm text-white/70 hover:bg-white/10 rounded-lg transition"
      >
        <div className="flex items-center gap-2">
          <Folder size={16} />
          <span>Projects</span>
        </div>

        <ChevronRight
          size={16}
          className={cn(projectsOpen && "rotate-90")}
        />
      </button>

      {/* Content */}
      {projectsOpen && !collapsed && (
        <div className="mt-2 ml-2">
          <div className="max-h-40 overflow-y-auto space-y-2">

            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <div key={section.key}>
                  {/* Section header */}
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
                      className={cn(openSections[section.key] && "rotate-90")}
                    />
                  </button>

                  {/* Items */}
                  {openSections[section.key] && (
                    <div className="ml-3 mt-1 flex flex-col gap-1">
                      {["Project A", "Landing Page"].map((p) => (
                        <ProjectItem
                          key={p}
                          name={p}
                          onHover={onHover}
                          onLeave={onLeave}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>
      )}
    </div>
  );
}