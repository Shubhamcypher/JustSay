import { useState } from "react";

export function useHoverPreview() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handleEnter = (e: React.MouseEvent, id: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    setHovered(id);
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