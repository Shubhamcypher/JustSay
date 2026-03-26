import Avatar from "@/components/ui/Avatar";

export default function Navbar() {
    return (
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-md bg-black/30">

            {/* Logo */}
            <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                JustSay
            </div>

            {/* User */}
            <div className="flex items-center gap-3 cursor-pointer">
                <Avatar
                    name="Shubham"
                    src="" // or user.img from DB
                    size="md"
                    showStatus
                />
            </div>

        </div>
    );
}