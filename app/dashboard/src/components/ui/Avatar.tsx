import { cn } from "@/lib/utils";
import { getInitials, formatName } from "@/utils/formatName";

type AvatarProps = {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showStatus?: boolean;
};

export default function Avatar({
  src,
  name = "User",
  size = "md",
  className,
  showStatus = false,
}: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  const formattedName = formatName(name);

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center",
        "bg-gradient-to-br from-blue-500/20 to-purple-500/20",
        "text-white font-semibold border border-white/10 backdrop-blur-md",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={formattedName}
          className="w-full h-full object-cover rounded-full"
          draggable={false}
        />
      ) : (
        <span>{getInitials(formattedName)}</span>
      )}

      {/* 🟢 Online status */}
      {showStatus && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full" />
      )}
    </div>
  );
}