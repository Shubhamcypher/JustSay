import { Menu } from "lucide-react";

export default function MobileNavbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/80 transparent backdrop-blur-xl">
      <button onClick={onMenuClick}>
        <Menu size={22} />
      </button>
    </div>
  );
}