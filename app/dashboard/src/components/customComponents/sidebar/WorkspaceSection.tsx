import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CreditCard,
  Crown,
  KeyRound,
  Users,
} from "lucide-react";
import NavItem from "./NavItem";

export default function WorkspaceSection({
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
          WORKSPACE
        </span>

        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {open && (
        <div className="mt-1 flex flex-col gap-1">
          <NavItem
            icon={CreditCard}
            label="Billing"
            collapsed={false}
            active={false}
            onClick={() => {}}
          />

          <NavItem
            icon={Crown}
            label="Subscription"
            collapsed={false}
            active={false}
            onClick={() => {}}
          />

          <NavItem
            icon={KeyRound}
            label="API Keys"
            collapsed={false}
            active={false}
            onClick={() => {}}
          />

          <NavItem
            icon={Users}
            label="Team Members"
            collapsed={false}
            active={false}
            onClick={() => {}}
          />
        </div>
      )}
    </div>
  );
}