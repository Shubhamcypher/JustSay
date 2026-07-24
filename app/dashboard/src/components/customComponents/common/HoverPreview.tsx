import { useState } from "react";
import type { HoveredProject } from "@/hooks/useHoverPreview";

type Props = {
  visible: boolean;
  top: number;
  left: number;
  project: HoveredProject | null;
};

export default function HoverPreview({ visible, top, left, project }: Props) {
  const [imgError, setImgError] = useState(false);

  if (!visible || !project) return null;

  const hasSnapshot = !!project.snapshot && !imgError;
  const hue = [...project.name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div
      style={{ top, left }}
      className="fixed z-[999] pointer-events-none transition-all duration-150"
    >
      <div className="w-[420px] h-[260px] bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden relative">
        {hasSnapshot ? (
          <img
            src={project.snapshot}
            alt={project.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{
              background: `radial-gradient(ellipse at 60% 40%, hsl(${hue},40%,20%) 0%, hsl(${(hue + 40) % 360},30%,10%) 100%)`,
            }}
          >
            <div className="w-16 h-12 rounded-md border border-white/20 bg-white/5 flex flex-col overflow-hidden">
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
        )}

        {/* Name strip */}
        <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <p className="text-white text-sm font-medium truncate">{project.name}</p>
        </div>
      </div>
    </div>
  );
}
