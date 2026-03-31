import { useState } from "react";
import { cn } from "@/lib/utils";
import SidebarHeader from "./SidebarHeader";
import SidebarNav from "./SidebarNav";
import ProjectsSection from "./ProjectsSection";
import RecentSection from "./RecentSection";
import SidebarFooter from "./SidebarFooter";

import { useHoverPreview } from "@/hooks/useHoverPreview";
import SidebarWorkspace from "./SidebarWorkSpace";
import HoverPreview from "../common/HoverPreview";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Home");

  const { hovered, position } =
    useHoverPreview();

  return (
    <aside
      className={cn(
        "h-screen flex flex-col justify-between transition-all duration-300",
        "bg-black/40 backdrop-blur-xl border-r border-white/10",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* 🔹 TOP */}
      <div className="p-4 flex flex-col gap-6">

        <SidebarHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        <SidebarWorkspace collapsed={collapsed} />

        <SidebarNav
          collapsed={collapsed}
          active={active}
          setActive={setActive}
        />

        <ProjectsSection
          collapsed={collapsed}
          variant="desktop"
        />

        <RecentSection collapsed={collapsed} />
      </div>

      {/* 🔹 FOOTER */}
      <SidebarFooter collapsed={collapsed} />

      {/* 🔹 PREVIEW SYSTEM */}
      <HoverPreview
        visible={!!hovered}
        top={position.top}
        left={position.left}
        content={<div className="flex items-center justify-center h-full">{hovered}</div>}
      />
    </aside>
  );
}