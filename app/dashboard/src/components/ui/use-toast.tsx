import { toast as sonnerToast } from "sonner";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

type ToastOptions = {
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
};

export const useToast = () => {
  const toast = ({
    title,
    description,
    variant = "default",
  }: ToastOptions) => {

    const base =
      "relative flex items-start gap-3 rounded-2xl px-4 py-2 w-64 text-white shadow-xl backdrop-blur-xl border overflow-hidden";

    const variants = {
      success: {
        icon: <CheckCircle className="w-5 h-5" />,
        wrapper:
          "bg-gradient-to-br from-green-500/10 to-green-400/5 border-green-500/20",
        iconBg: "bg-green-500/20 text-green-400",
        glow: "from-green-500/20",
      },
      error: {
        icon: <XCircle className="w-5 h-5" />,
        wrapper:
          "bg-gradient-to-br from-red-500/10 to-red-400/5 border-red-500/20",
        iconBg: "bg-red-500/20 text-red-400",
        glow: "from-red-500/20",
      },
      warning: {
        icon: <AlertTriangle className="w-5 h-5" />,
        wrapper:
          "bg-gradient-to-br from-yellow-500/10 to-yellow-400/5 border-yellow-500/20",
        iconBg: "bg-yellow-500/20 text-yellow-400",
        glow: "from-yellow-500/20",
      },
      info: {
        icon: <Info className="w-5 h-5" />,
        wrapper:
          "bg-gradient-to-br from-blue-500/10 to-blue-400/5 border-blue-500/20",
        iconBg: "bg-blue-500/20 text-blue-400",
        glow: "from-blue-500/20",
      },
      default: {
        icon: null,
        wrapper: "bg-zinc-900/80 border-white/10",
        iconBg: "bg-white/10 text-white",
        glow: "from-white/10",
      },
    };

    const v = variants[variant];

    sonnerToast.custom(
      () => (
        <div className={`${base} ${v.wrapper}`}>

          {/* ✨ Glow effect */}
          <div
            className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${v.glow} to-transparent blur-xl opacity-30`}
          />

          {/* Content */}
          <div className="relative flex items-start gap-3">

            {/* Icon */}
            {v.icon && (
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-xl ${v.iconBg}`}
              >
                {v.icon}
              </div>
            )}

            {/* Text */}
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{title}</span>
              {description && (
                <span className="text-xs text-white/60 mt-0.5">
                  {description}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
      { duration: 3000 }
    );
  };

  return { toast };
};