import { cn } from "@/lib/utils"; // optional (for class merging)

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white font-semibold overflow-hidden border border-white/10 backdrop-blur-md",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}

      {/* 🟢 Online status */}
      {showStatus && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full" />
      )}
    </div>
  );
}