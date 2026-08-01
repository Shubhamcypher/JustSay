import { cn } from "@/lib/utils";

type Props = {
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  active?: boolean;
  onClick: () => void;
  rightIcon?: React.ElementType;
};

export default function NavItem({
  icon: Icon,
  label,
  collapsed,
  active = false,
  onClick,
  rightIcon: RightIcon,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 w-full",
        "hover:bg-white/10",
        active && "bg-white/10 text-white shadow-inner"
      )}
    >
      <Icon size={18} className="opacity-80 shrink-0" />

      {!collapsed && (
        <>
          <span className="text-sm truncate flex-1 text-left">
            {label}
          </span>

          {RightIcon && (
            <RightIcon
              size={15}
              className="opacity-50"
            />
          )}
        </>
      )}
    </button>
  );
}