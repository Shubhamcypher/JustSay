import { Clock } from "lucide-react";

export default function RecentSection({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return null;

  return (
    <div>
      <p className="text-xs text-white/40 mb-2 px-2">RECENT</p>
      {["Project A", "Landing Page"].map((item) => (
        <div
          key={item}
          className="flex items-center gap-2 px-3 py-1 text-sm text-white/70 hover:bg-white/10 rounded-md"
        >
          <Clock size={14} />
          {item}
        </div>
      ))}
    </div>
  );
}