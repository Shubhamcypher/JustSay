import { FileText } from "lucide-react";
import type { HoveredProject } from "@/hooks/useHoverPreview";

type Props = {
  project: HoveredProject;
  onHover?: (e: React.MouseEvent, project: HoveredProject) => void;
  onLeave?: () => void;
};

export default function ProjectItem({ project, onHover, onLeave }: Props) {
  return (
    <div
      onMouseEnter={(e) => onHover?.(e, project)}
      onMouseLeave={onLeave}
      className="flex items-center gap-2 text-sm text-white/70 px-4 py-1 rounded-md hover:bg-white/10 cursor-pointer transition"
    >
      <FileText size={14} />
      <span>{project.name}</span>
    </div>
  );
}
