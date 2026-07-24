import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { formatName } from "@/utils/formatName";


export default function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth();


  return (
    <div className="p-4 flex flex-col gap-4">

      {!collapsed && (
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-3 rounded-xl text-sm border border-white/10 cursor-pointer">
          Upgrade to Pro 🚀
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-white/10 pt-4">
        <Avatar src={user?.img} name={user?.username} />
        {!collapsed && <span className="text-sm"> {formatName(user?.username)}</span>}
      </div>
    </div>
  );
}