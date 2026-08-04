import { useState } from "react";
import {
  Folder,
  ChevronRight,
  FolderOpen,
  Users,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProjectItem from "./ProjectItem";
import type { HoveredProject } from "@/hooks/useHoverPreview";
import { useProjects } from "@/context/ProjectContext";
import type { Project } from "@shared/types";

type SectionKey = "created" | "shared" | "starred";

const sections = [
  {
    key: "created",
    label: "Created by me",
    icon: FolderOpen,
  },
  {
    key: "shared",
    label: "Shared with me",
    icon: Users,
  },
  {
    key: "starred",
    label: "Starred",
    icon: Star,
  },
] as const;

type ProjectSectionProps = {
  collapsed?: boolean;
  variant?: "desktop" | "mobile";
  onHover?: (e: React.MouseEvent, project: HoveredProject) => void;
  onLeave?: () => void;
};

const INITIAL_COUNT = 3;

export default function ProjectsSection({
  collapsed = false,
  variant = "desktop",
  onHover,
  onLeave,
}: ProjectSectionProps) {
  const isMobile = variant === "mobile";

  const { projects } = useProjects();

  const [projectsOpen, setProjectsOpen] = useState(true);

  const [openSections, setOpenSections] = useState<
    Record<SectionKey, boolean>
  >({
    created: true,
    shared: false,
    starred: false,
  });

  const [expandedSections, setExpandedSections] = useState<
    Record<SectionKey, boolean>
  >({
    created: false,
    shared: false,
    starred: false,
  });

  if (!isMobile && collapsed) {
    return (
      <div className="flex flex-col items-center gap-3 mt-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <button
              key={section.key}
              className="p-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition"
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mt-5">

      {/* Header */}

      <button
        onClick={() => setProjectsOpen(!projectsOpen)}
        className="
          flex
          w-full
          items-center
          justify-between
          rounded-lg
          px-2
          py-2
          text-sm
          text-white/75
          hover:bg-white/10
          transition
        "
      >
        <div className="flex items-center gap-2">
          <Folder size={16} />
          <span className="font-medium">Projects</span>
        </div>

        <ChevronRight
          size={15}
          className={cn(
            "transition-transform duration-200",
            projectsOpen && "rotate-90"
          )}
        />
      </button>

      {/* Sections */}

      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          projectsOpen ? "max-h-[1200px] mt-2" : "max-h-0"
        )}
      >
        <div className="flex flex-col gap-2">

          {sections.map((section) => {
            const Icon = section.icon;

            const list = projects[section.key];

            const expanded = expandedSections[section.key];

            const visibleProjects = expanded
              ? list
              : list.slice(0, INITIAL_COUNT);

            return (
              <div key={section.key}>

                {/* Section Header */}

                <button
                  onClick={() =>
                    setOpenSections((prev) => ({
                      ...prev,
                      [section.key]: !prev[section.key],
                    }))
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-md
                    px-2
                    py-1.5
                    text-xs
                    uppercase
                    tracking-wide
                    text-white/45
                    hover:text-white
                    transition
                  "
                >
                  <div className="flex items-center gap-2">
                    <Icon size={14} />
                    {section.label}
                  </div>

                  <ChevronRight
                    size={14}
                    className={cn(
                      "transition-transform",
                      openSections[section.key] && "rotate-90"
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    openSections[section.key]
                      ? "max-h-[1000px] mt-1"
                      : "max-h-0"
                  )}
                >
                  <div className="flex flex-col gap-0.5 ml-3">

                    {visibleProjects.map((project: Project) => (
                      <ProjectItem
                        key={project.id}
                        project={{
                          id: project.id,
                          name: project.name,
                          snapshot: project.snapshot,
                        }}
                        onHover={!isMobile ? onHover : undefined}
                        onLeave={!isMobile ? onLeave : undefined}
                      />
                    ))}

                    {list.length > INITIAL_COUNT && (
                      <button
                        onClick={() =>
                          setExpandedSections((prev) => ({
                            ...prev,
                            [section.key]: !prev[section.key],
                          }))
                        }
                        className="
                          ml-2
                          mt-1
                          text-xs
                          text-violet-400
                          hover:text-violet-300
                          transition
                          text-left
                        "
                      >
                        {expanded
                          ? "Show less"
                          : `View all (${list.length})`}
                      </button>
                    )}

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