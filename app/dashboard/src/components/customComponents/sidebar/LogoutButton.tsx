import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ConfirmModal from "../common/ConfirmModal";
import { useState } from "react";

export default function LogoutButton({
    collapsed,
}: {
    collapsed: boolean;
}) {
    const navigate = useNavigate();
    const { logoutUser } = useAuth();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        try {
            setLoading(true);
            logoutUser();
            navigate("/login", { replace: true });
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <div className="mt-4 border-t border-white/10 pt-4">
            <button
                onClick={() => setOpen(true)}
                className="
          w-full
          flex items-center
          justify-center
          gap-2
          rounded-xl
          border border-red-500/20
          bg-red-500/10
          px-3
          py-2.5
          text-red-400
          transition-all
          duration-200
          hover:border-red-500/40
          hover:bg-red-500/20
          hover:text-red-300
          active:scale-[0.98]
        "
            >
                <LogOut size={18} />
                {!collapsed && (
                    <span className="text-sm font-medium">Logout</span>
                )}
            </button>

            <ConfirmModal
                open={open}
                title="Logout"
                description="Are you sure you want to logout from this device?"
                confirmText="Logout"
                cancelText="Cancel"
                danger
                loading={loading}
                onCancel={() => setOpen(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
}