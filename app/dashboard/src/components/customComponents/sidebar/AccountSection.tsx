import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  User,
  Bell,
  Palette,
} from "lucide-react";
import NavItem from "./NavItem";

export default function AccountSection({
  collapsed,
}: {
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(true);

  if (collapsed) return null;

  return (
    <div className="mt-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition"
      >
        <span className="text-[11px] uppercase tracking-wider text-white/35">
          ACCOUNT
        </span>

        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {open && (
        <div className="mt-1 flex flex-col gap-1">
          <NavItem
            icon={User}
            label="My Profile"
            collapsed={false}
            active={false}
            onClick={() => {}}
          />

          <NavItem
            icon={Bell}
            label="Notifications"
            collapsed={false}
            active={false}
            onClick={() => {}}
          />

          <NavItem
            icon={Palette}
            label="Appearance"
            collapsed={false}
            active={false}
            onClick={() => {}}
          />
        </div>
      )}
    </div>
  );
}