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
import { useHoverPreview } from "@/hooks/useHoverPreview";

type SectionKey = "created" | "shared" | "starred";

const sections = [
  { key: "created", label: "Created by me", icon: FolderOpen },
  { key: "shared", label: "Shared with me", icon: Users },
  { key: "starred", label: "Starred", icon: Star },
] as const;

type Props = {
  collapsed?: boolean;
  variant?: "desktop" | "mobile";
};

export default function ProjectsSection({
  collapsed = false,
  variant = "desktop",
}: Props) {
  const isMobile = variant === "mobile";

  const [projectsOpen, setProjectsOpen] = useState(true);
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    created: true,
    shared: false,
    starred: false,
  });

  const { hovered, position, handleEnter, handleLeave } =
    useHoverPreview();

  // ================= COLLAPSED (DESKTOP ONLY) =================
  if (!isMobile && collapsed) {
    return (
      <div className="flex flex-col items-center gap-3 mt-2">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <div key={section.key} className="relative group">
              <button className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition">
                <Icon size={16} />
              </button>

              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs bg-zinc-900 text-white rounded-md opacity-0 group-hover:opacity-100 transition">
                {section.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ================= MAIN =================
  return (
    <div className="flex flex-col">
      {/* Header */}
      <button
        onClick={() => setProjectsOpen(!projectsOpen)}
        className={cn(
          "flex items-center justify-between rounded-lg transition",
          isMobile
            ? "px-4 py-3 text-white text-sm"
            : "px-3 py-2 text-sm text-white/70 hover:bg-white/10"
        )}
      >
        <div className="flex items-center gap-2">
          <Folder size={16} />
          <span>Projects</span>
        </div>

        <ChevronRight
          size={16}
          className={cn(
            "transition-transform",
            projectsOpen && "rotate-90"
          )}
        />
      </button>

      {/* Container */}
      <div
        className={cn(
          "transition-all duration-300",
          projectsOpen
            ? isMobile
              ? "max-h-[490px] overflow-y-auto pb-6 mt-2"
              : "max-h-[170px] mt-2 ml-2"
            : "h-0"
        )}
      >
        <div
          className={cn(
            isMobile
              ? "flex flex-col gap-2 max-h-[65vh] overflow-y-auto pb-6"
              : "h-full overflow-y-auto custom-scrollbar pr-1"
          )}
        >
          {sections.map((section) => {
            const Icon = section.icon;

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
                  className={cn(
                    "w-full flex items-center justify-between transition",
                    isMobile
                      ? "px-4 py-2 text-sm text-white"
                      : "px-2 py-1 text-xs text-white/50 hover:text-white"
                  )}
                >
                  <div className="flex gap-2 items-center">
                    <Icon size={isMobile ? 16 : 14} />
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

                {/* Projects */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    openSections[section.key]
                      ? isMobile
                        ? "max-h-[500px] mt-1 ml-6"
                        : "max-h-[200px] mt-1 ml-3"
                      : "max-h-0"
                  )}
                >
                  {[
                    "Project A",
                    "Landing Page",
                    "looo",
                    "pooo",
                    "chooo",
                    "wooo",
                    "thoooo",
                  ].map((p) => (
                    <ProjectItem
                      key={p}
                      name={p}
                      onHover={!isMobile ? handleEnter : undefined}
                      onLeave={!isMobile ? handleLeave : undefined}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover Preview (DESKTOP ONLY) */}
      {!isMobile && hovered && (
        <div
          className="fixed z-50"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <div className="w-80 h-40 flex items-center justify-center px-4 rounded-lg bg-zinc-900 border border-white/10 shadow-xl">
            {hovered}
          </div>
        </div>
      )}
    </div>
  );
}