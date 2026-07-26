
export type RightTab = "preview" | "code";

export function TabButton({
    active,
    icon,
    label,
    onClick,
}: {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${active
                ? "bg-white/[0.08] text-white shadow-sm"
                : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
        >
            {icon}
            {label}
        </button>
    );
}