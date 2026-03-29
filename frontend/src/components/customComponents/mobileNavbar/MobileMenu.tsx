import { Home, Search, Folder, Share2, X } from "lucide-react";

type Props = {
  onClose: () => void;
};

const items = [
  { label: "Home", icon: Home },
  { label: "Search", icon: Search },
  { label: "Projects", icon: Folder },
  { label: "Shared", icon: Share2 },
];

export default function MobileMenu({ onClose }: Props) {
  return (
    <div className="w-72 h-full bg-zinc-900 border-r border-white/10 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <span className="text-lg font-semibold">Menu</span>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex flex-col p-4 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition"
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="mt-auto p-4 border-t border-white/10 text-sm text-white/60">
        Shubham
      </div>
    </div>
  );
}