import { useState } from "react";
import { ChevronDown, Sparkles, CreditCard, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SidebarWorkspace({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full px-3 py-2 rounded-xl flex items-center justify-between",
          "bg-gradient-to-br from-white/5 to-white/10",
          "hover:from-white/10 hover:to-white/20",
          "border border-white/10 backdrop-blur-md",
          "text-sm transition-all duration-300 group"
        )}
      >
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-white/70 group-hover:text-white" />
          {!collapsed && (
            <span className="text-white/80 group-hover:text-white">
              Workspace
            </span>
          )}
        </div>

        {!collapsed && (
          <ChevronDown
            size={16}
            className={cn(
              "transition-transform duration-300 text-white/50",
              open && "rotate-180 text-white"
            )}
          />
        )}
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute left-0 top-full mt-1 w-full z-20",
          "rounded-2xl border border-white/10",
          "bg-gradient-to-br from-gray-500 via-slate-700 to-gray-950",
          "backdrop-blur-xl shadow-2xl",
          "p-4 space-y-4",
          "overflow-hidden transition-[max-height,transform] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] origin-top",

          open && !collapsed
            ? "max-h-[300px] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"
        )}
      >
        {/* Workspace Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/50">Workspace</p>
            <p className="text-sm font-medium text-white">Default</p>
          </div>

          <div className="flex items-center gap-1 text-xs text-green-400">
            <Sparkles size={12} />
            Active
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Credits */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/70">
            <CreditCard size={14} />
            <span className="text-sm">Credits</span>
          </div>

          <span className="text-sm font-semibold text-white">
            120
          </span>
        </div>

        {/* Usage Bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-[60%] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </div>

        {/* Action */}
        <button className="w-full mt-2 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 transition text-white">
          Manage Workspace
        </button>
      </div>
    </div>
  );
}