import { useState } from "react";
// import { cn } from "@/lib/utils";

export default function SidebarWorkspace({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm"
      >
        {collapsed ? "WS" : "Workspace"}
      </button>

      {open && !collapsed && (
        <div className="absolute left-0 top-full mt-2 w-full bg-zinc-900 border border-white/10 rounded-xl p-3 shadow-xl z-10">
          <p className="text-sm text-white/70">Credits: 120</p>
          <p className="text-sm text-white/70">Workspace: Default</p>
        </div>
      )}
    </div>
  );
}