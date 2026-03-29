import { useEffect, useRef, useState } from "react";
import { Plus, Image, Paperclip } from "lucide-react";

export default function AddMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 🔒 Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>

      {/* ➕ Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 hover:bg-white/10 rounded-2xl transition"
      >
        <Plus
          size={20}
          className={`transition-transform duration-300 ${
            open ? "rotate-45" : "rotate-0"
          }`}
        />
      </button>

      {/* 🔽 Dropdown */}
      {open && (
        <div className="absolute bottom-12 left-0 w-40 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-2 flex flex-col gap-1 z-50">

          <MenuItem icon={<Image size={16} />} label="Upload Image" />

          <MenuItem icon={<Paperclip size={16} />} label="Attach File" />

        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label }: any) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer text-sm">
      {icon}
      <span>{label}</span>
    </div>
  );
}