import { useState } from "react";
import {
  Home,
  Search,
  Folder,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Avatar from "./Avatar";
import { cn } from "@/lib/utils";

type NavItemType = {
  label: string;
  icon: React.ElementType;
};

const navItems: NavItemType[] = [
  { label: "Home", icon: Home },
  { label: "Search", icon: Search },
  { label: "Projects", icon: Folder },
  { label: "Shared", icon: Share2 },
];

type NavItemProps = {
    icon: React.ElementType;
    label: string;
    collapsed: boolean;
    active: boolean;
    onClick: () => void;
  };
  
  function NavItem({
    icon: Icon,
    label,
    collapsed,
    active,
    onClick,
  }: NavItemProps) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200",
          "hover:bg-white/10",
          active && "bg-white/10 text-white shadow-inner"
        )}
      >
        <Icon size={18} className="opacity-80" />
        {!collapsed && <span className="text-sm">{label}</span>}
      </button>
    );
  }

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [active, setActive] = useState("Home");

  return (
    <aside
      className={cn(
        "h-screen flex flex-col justify-between transition-all duration-300",
        "bg-black/40 backdrop-blur-xl border-r border-white/10",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* 🔹 Top */}
      <div className="p-4 flex flex-col gap-6">

        {/* Logo + Toggle */}
        <div className="flex items-center justify-between">
          {!collapsed && (
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              JustSay
            </span>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Workspace */}
        <div className="relative">
          <button
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-xl transition",
              "bg-white/5 hover:bg-white/10 text-sm"
            )}
          >
            {collapsed ? "WS" : "Workspace"}
          </button>

          {workspaceOpen && !collapsed && (
            <div className="absolute left-0 top-full mt-2 w-full bg-zinc-900 border border-white/10 rounded-xl p-3 shadow-xl z-10">
              <p className="text-sm text-white/70">Credits: 120</p>
              <p className="text-sm text-white/70">Workspace: Default</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              collapsed={collapsed}
              active={active === item.label}
              onClick={() => setActive(item.label)}
            />
          ))}
        </nav>

        {/* Recent */}
        {!collapsed && (
          <div className="mt-4">
            <p className="text-xs text-white/40 mb-2 px-2">RECENT</p>
            <div className="flex flex-col gap-1">
              {["Project A", "Landing Page"].map((item) => (
                <div
                  key={item}
                  className="px-3 py-1 rounded-md text-sm text-white/70 hover:bg-white/10 cursor-pointer transition"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🔹 Bottom */}
      <div className="p-4 flex flex-col gap-4">

        {/* Upgrade */}
        {!collapsed && (
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-3 rounded-xl text-sm border border-white/10 cursor-pointer">
            Upgrade to Pro
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-3 border-t border-white/10 pt-4">
          <Avatar name="Shubham" />
          {!collapsed && <span className="text-sm">Shubham</span>}
        </div>
      </div>
    </aside>
  );
}