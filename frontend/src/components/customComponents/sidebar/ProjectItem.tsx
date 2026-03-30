import { FileText } from "lucide-react";

type Props = {
  name: string;
  onHover: (e: React.MouseEvent, name: string) => void;
  onLeave: () => void;
};

export default function ProjectItem({ name, onHover, onLeave }: Props) {
  return (
    <div
      onMouseEnter={(e) => onHover(e, name)}
      onMouseLeave={onLeave}
      className="flex items-center gap-2 text-sm text-white/70 px-4 py-1 rounded-md hover:bg-white/10 cursor-pointer transition"
    >
      <FileText size={14} />
      <span>{name}</span>
    </div>
  );
}