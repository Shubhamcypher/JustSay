import { Clock } from "lucide-react";

const recent = [
  "Project A",
  "Landing Page",
];

export default function RecentSection({
  collapsed,
}: {
  collapsed: boolean;
}) {
  if (collapsed) return null;

  return (
    <div className="mt-5">
      <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">
        Recent
      </div>

      <div className="flex flex-col gap-1">
        {recent.map((item) => (
          <button
            key={item}
            className="
              group
              flex
              w-full
              items-center
              gap-2
              rounded-lg
              px-2
              py-1.5
              text-sm
              text-white/65
              transition-all
              hover:bg-white/8
              hover:text-white
            "
          >
            <Clock
              size={14}
              className="shrink-0 text-white/40 group-hover:text-violet-300"
            />

            <span className="truncate text-left">
              {item}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}