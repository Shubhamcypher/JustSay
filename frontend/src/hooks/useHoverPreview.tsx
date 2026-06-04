import { useState } from "react";

export type HoveredProject = {
  id: string;
  name: string;
  snapshot?: string;
};

export function useHoverPreview() {
  const [hovered, setHovered] = useState<HoveredProject | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handleEnter = (e: React.MouseEvent, project: HoveredProject) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHovered(project);
    setPosition({
      top: rect.top,
      left: rect.right + 12,
    });
  };

  const handleLeave = () => {
    setHovered(null);
  };

  return {
    hovered,
    position,
    handleEnter,
    handleLeave,
  };
}