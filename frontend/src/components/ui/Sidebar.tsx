import HoverPreview from "../customComponents/common/HoverPreview";
import { useHoverPreview } from "@/hooks/useHoverPreview";
import { useState } from "react";
import SidebarHeader from "../customComponents/sidebar/SidebarHeader";
import SidebarNav from "../customComponents/sidebar/SidebarNav";
import ProjectsSection from "../customComponents/sidebar/ProjectsSection";
import RecentSection from "../customComponents/sidebar/RecentSection";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Home");

  const { hovered, position, handleEnter, handleLeave } =
    useHoverPreview();

  return (
    <aside className="h-screen w-64 flex flex-col justify-between bg-black/40 border-r border-white/10">

      <div className="p-4 flex flex-col gap-6">
        <SidebarHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        <SidebarNav
          collapsed={collapsed}
          active={active}
          setActive={setActive}
        />

        <ProjectsSection
          collapsed={collapsed}
          onHover={handleEnter}
          onLeave={handleLeave}
        />

        <RecentSection collapsed={collapsed} />
      </div>

      <HoverPreview
        visible={!!hovered}
        top={position.top}
        left={position.left}
        content={<div>{hovered}</div>}
      />
    </aside>
  );
}