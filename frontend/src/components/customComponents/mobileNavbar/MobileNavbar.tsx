import { Menu } from "lucide-react";

export default function MobileNavbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <button onClick={onMenuClick}>
        <Menu size={22} />
      </button>

      <span className="font-semibold text-white">JustSay</span>

      <div /> {/* spacer */}
    </div>
  );
}