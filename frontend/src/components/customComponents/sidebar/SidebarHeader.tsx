import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SidebarHeader({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-2 py-2">
      {/* Logo / Title */}
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="text-lg font-semibold tracking-wide bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent cursor-pointer select-none"
        >
          JustSay
        </motion.span>
      )}

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand" : "Collapse"}
        className="p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all duration-200 flex items-center justify-center"
      >
        {collapsed ? (
          <ChevronRight size={18} className="opacity-80" />
        ) : (
          <ChevronLeft size={18} className="opacity-80" />
        )}
      </button>
    </div>
  );
}