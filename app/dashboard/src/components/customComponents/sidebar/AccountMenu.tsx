import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, ChevronRight } from "lucide-react";
import NavItem from "./NavItem";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AccountMenu({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const { logoutUser } = useAuth();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative mt-2" ref={ref}>
      <NavItem
        icon={User}
        label="Account"
        collapsed={collapsed}
        active={false}
        rightIcon={ChevronRight}
        onClick={() => setOpen(v => !v)}
      />

      {open && !collapsed && (
        <div className="mt-2 rounded-xl border border-white/10 bg-[#111318]/95 backdrop-blur-xl overflow-hidden shadow-xl">

          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition"
          >
            <User size={16} />
            <span>Profile</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition"
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>

          <div className="border-t border-white/10" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

        </div>
      )}
    </div>
  );
}