import { FileText } from "lucide-react";
import type { HoveredProject } from "@/hooks/useHoverPreview";

type Props = {
  project: HoveredProject;
  onHover?: (e: React.MouseEvent, project: HoveredProject) => void;
  onLeave?: () => void;
};

export default function ProjectItem({
  project,
  onHover,
  onLeave,
}: Props) {
  return (
    <button
      onClick={() =>
        (window.location.href = `http://localhost:5174/project/${project.id}`)
      }
      onMouseEnter={(e) => onHover?.(e, project)}
      onMouseLeave={onLeave}
      className="
        group
        flex
        w-full
        items-center
        gap-2
        rounded-lg
        px-2
        py-1.5
        text-sm
        text-white/70
        transition-all
        hover:bg-white/8
        hover:text-white
      "
    >
      <FileText
        size={14}
        className="shrink-0 text-white/40 group-hover:text-violet-300"
      />

      <span
        className="flex-1 truncate text-left"
        title={project.name}
      >
        {project.name}
      </span>
    </button>
  );
}