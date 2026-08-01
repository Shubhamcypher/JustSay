import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Shield,
  FileText,
} from "lucide-react";

import NavItem from "./NavItem";


export default function SupportSection({
  collapsed,
}: {
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);



  if (collapsed) return null;



  return (
    <div className="mt-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition"
      >
        <span className="text-[11px] uppercase tracking-wider text-white/35">
          SUPPORT
        </span>

        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {open && (
        <div className="mt-1 flex flex-col gap-1">
          <NavItem
            icon={HelpCircle}
            label="Help Center"
            collapsed={false}
            active={false}
            onClick={() => {}}
          />

          <NavItem
            icon={MessageSquare}
            label="Feedback"
            collapsed={false}
            active={false}
            onClick={() => {}}
          />

          <NavItem
            icon={Shield}
            label="Privacy Policy"
            collapsed={false}
            active={false}
            onClick={() => {}}
          />

          <NavItem
            icon={FileText}
            label="Terms of Service"
            collapsed={false}
            active={false}
            onClick={() => {}}
          />

          
        </div>
      )}
    </div>
  );
}