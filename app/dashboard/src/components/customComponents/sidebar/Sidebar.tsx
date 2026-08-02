import { useState } from "react";
import { cn } from "@/lib/utils";
import { useHoverPreview } from "@/hooks/useHoverPreview";

import SidebarHeader from "./SidebarHeader";
import SidebarNav from "./SidebarNav";
import ProjectsSection from "./ProjectsSection";
import RecentSection from "./RecentSection";
import SidebarFooter from "./SidebarFooter";
import SidebarWorkspace from "./SidebarWorkSpace";
import HoverPreview from "../common/HoverPreview";
import AccountSection from "./AccountSection";
import WorkspaceSection from "./WorkspaceSection";
import SupportSection from "./SupportSection";
import LogoutButton from "./LogoutButton";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Home");

  const { hovered, position, handleEnter, handleLeave } = useHoverPreview();


  return (
    <aside
      className={cn(
        "h-screen flex flex-col transition-all duration-300 z-[999]",
        "bg-black/40 backdrop-blur-xl border-r border-white/10",
        collapsed ? "w-20" : "w-64"
      )}
    >

      {/* Fixed */}
      <div className="p-4 flex flex-col gap-6">
        <SidebarHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        <SidebarWorkspace collapsed={collapsed} />
      </div>

      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">

        <SidebarNav
          collapsed={collapsed}
          active={active}
          setActive={setActive}
        />

        <ProjectsSection
          collapsed={collapsed}
          variant="desktop"
          onHover={handleEnter}
          onLeave={handleLeave}
        />

        <RecentSection collapsed={collapsed} />

        <AccountSection collapsed={collapsed} />

        <WorkspaceSection collapsed={collapsed} />

        <SupportSection collapsed={collapsed} />

      </div>


      {/* Fixed Sections */}
      <LogoutButton collapsed={collapsed} />

      <SidebarFooter collapsed={collapsed} />

      {/* 🔹 PREVIEW */}

      <HoverPreview
        visible={!!hovered}
        top={position.top}
        left={position.left}
        project={hovered}
      />

    </aside>
  );
}
