
import { AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";

type ConfirmModalProps = {
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmModal({
    open,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                onClick={onCancel}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal */}
            <div className="relative w-[440px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-3xl shadow-[0_25px_80px_rgba(0,0,0,0.45)]">

                {/* Glow */}
                <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-red-500/20 blur-3xl pointer-events-none" />

                {/* Top gradient line */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                <div className="relative p-7">

                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10">
                            <div className="absolute inset-0 rounded-2xl bg-red-500/10 blur-xl" />
                            <AlertTriangle
                                size={30}
                                className="relative text-red-400"
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-center text-2xl font-semibold tracking-tight">
                        {title}
                    </h2>

                    <p className="mt-3 text-center text-sm leading-6 text-white/60">
                        {description}
                    </p>

                    {/* Buttons */}
                    <div className="mt-8 grid grid-cols-2 gap-3">

                        <button
                            onClick={onCancel}
                            className="
          rounded-xl
          border border-white/10
          bg-white/5
          py-3
          font-medium
          transition
          hover:bg-white/10
        "
                        >
                            {cancelText}
                        </button>

                        <button
                            disabled={loading}
                            onClick={onConfirm}
                            className={`
          rounded-xl
          py-3
          font-medium
          transition
          ${danger
                                    ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/20"
                                    : "bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400"
                                }
        `}
                        >
                            {loading ? "Logging out..." : confirmText}
                        </button>

                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}