import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/context/ProjectContext";
import { useNavigate } from "react-router-dom";

type TabType = "projects" | "recent" | "templates";
type ProjectType = "created" | "shared" | "starred";

export default function HomeContent() {
  const navigate = useNavigate();
  const { projects, refreshProjects } = useProjects();

  const [tab, setTab] = useState<TabType>("projects");
  const [projectType, setProjectType] = useState<ProjectType>("created");

  const tabs: TabType[] = ["projects", "recent", "templates"];
  const projectTypes: ProjectType[] = ["created", "shared", "starred"];

  const data = projects[projectType];

  useEffect(() => {
    refreshProjects(); // always fetch fresh on Home visit
  }, []);

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
            <div className="text-white/40 text-sm">No projects found</div>
          ) : (
            data.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onClick={() =>
                  navigate("/builder", {
                    state: { projectId: p.id, projectName: p.name, mode: "load" },
                  })
                }
              />
            ))
          )
        )}

        {/* 🕒 Recent */}
        {tab === "recent" && (
          <div className="text-white/40 text-sm">Recent items coming soon</div>
        )}

        {/* 📦 Templates */}
        {tab === "templates" && (
          <div className="text-white/40 text-sm">Templates coming soon</div>
        )}

      </div>
    </div>
  );
}

// ─── Project Card with Snapshot ──────────────────────────────────────────────

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    snapshot?: string;      // base64 data URL  OR  https:// URL — stored at save time
    updatedAt?: string;
  };
  onClick: () => void;
}

function ProjectCard({ project, onClick }: ProjectCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasSnapshot = !!project.snapshot && !imgError;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative h-40 md:h-44 rounded-xl overflow-hidden",
        "border border-white/10 cursor-pointer transition-all duration-200",
        "hover:border-white/30 hover:shadow-lg hover:shadow-black/30",
        "active:scale-[0.98]"
      )}
    >
      {/* ── Snapshot or Placeholder ── */}
      {hasSnapshot ? (
        <img
          src={project.snapshot}
          alt={project.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <SnapshotPlaceholder name={project.name} />
      )}

      {/* ── Bottom name strip (always visible) ── */}
      <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <p className="text-white text-sm font-medium truncate">{project.name}</p>
        {project.updatedAt && (
          <p className="text-white/40 text-xs mt-0.5">{formatDate(project.updatedAt)}</p>
        )}
      </div>
    </div>
  );
}

// ─── Placeholder when no snapshot exists ─────────────────────────────────────

function SnapshotPlaceholder({ name }: { name: string }) {
  // Generate a deterministic pastel gradient from the project name
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2 bg-white/5"
      style={{
        background: `radial-gradient(ellipse at 60% 40%, hsl(${hue},40%,20%) 0%, hsl(${(hue + 40) % 360},30%,10%) 100%)`,
      }}
    >
      {/* Mini "browser window" icon */}
      <div className="w-12 h-9 rounded-md border border-white/20 bg-white/5 flex flex-col overflow-hidden">
        <div className="flex items-center gap-1 px-1.5 py-1 border-b border-white/10 bg-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>
        <div className="flex-1 p-1 space-y-0.5">
          <div className="h-0.5 rounded bg-white/10 w-3/4" />
          <div className="h-0.5 rounded bg-white/10 w-1/2" />
          <div className="h-0.5 rounded bg-white/10 w-5/6" />
        </div>
      </div>
      <span className="text-white/30 text-xs">No preview</span>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}