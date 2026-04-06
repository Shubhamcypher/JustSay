import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SidebarHeader({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      {!collapsed && (
        <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          JustSay
        </span>
      )}

      <button
        onClick={onToggle}
        className="p-2 rounded-lg hover:bg-white/10 transition"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </div>
  );
}