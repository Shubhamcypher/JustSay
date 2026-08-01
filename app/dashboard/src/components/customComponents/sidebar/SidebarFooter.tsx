import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { formatName } from "@/utils/formatName";


export default function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth();


  return (
    <div className="px-4 py-2 flex flex-col gap-4">

      <div className="flex items-center gap-3 border-t border-white/10 pt-4">
        <Avatar src={user?.img} name={user?.username} />
        {!collapsed && <span className="text-sm"> {formatName(user?.username)}</span>}
      </div>
    </div>
  );
}