import { useState } from "react";
import {
    Home,
    Search,
    Folder,
    Share2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Avatar from "./Avatar";

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [workspaceOpen, setWorkspaceOpen] = useState(false);

    return (
        <div
            className={`h-full border-r border-white/10 bg-gray-950 backdrop-blur-xl transition-all duration-300 flex flex-col ${collapsed ? "w-20" : "w-64 md:w-72 lg:w-80 xl:w-96"
                }`}
        >
            {/* 🔹 Top */}
            <div className="p-4 flex flex-col gap-4">

                {/* Logo + Toggle */}
                <div className="flex items-center justify-between">
                    {!collapsed && <span className="font-bold text-lg">JustSay</span>}

                    <button onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <ChevronRight /> : <ChevronLeft />}
                    </button>
                </div>

                {/* Workspace Dropdown */}
                <div className="relative">
                    <div
                        onClick={() => setWorkspaceOpen(!workspaceOpen)}
                        className="cursor-pointer p-2 rounded-lg bg-white/5 hover:bg-white/10"
                    >
                        {collapsed ? "WS" : "Workspace ▼"}
                    </div>

                    {workspaceOpen && (
                        <div className="absolute left-0 top-full mt-2 w-56 bg-zinc-900 border border-white/10 rounded-xl p-3 z-50 shadow-xl">
                            <p className="text-sm text-white/70">Credits: 120</p>
                            <p className="text-sm text-white/70">Workspace: Default</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔹 Navigation */}
            <div className="px-2 flex flex-col gap-1">
                <NavItem icon={<Home />} label="Home" collapsed={collapsed} />
                <NavItem icon={<Search />} label="Search" collapsed={collapsed} />
                <NavItem icon={<Folder />} label="My Projects" collapsed={collapsed} />
                <NavItem icon={<Share2 />} label="Shared" collapsed={collapsed} />
            </div>

            {/* 🔹 Recent */}
            {!collapsed && (
                <div className="mt-6 px-4">
                    <p className="text-xs text-white/50 mb-2">Recent</p>
                    <div className="text-sm text-white/70">Project A</div>
                    <div className="text-sm text-white/70">Landing Page</div>
                </div>
            )}

            {/* 🔹 Upgrade */}
            <div className="mt-auto p-4">
                {!collapsed && (
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-3 rounded-xl text-sm">
                        Upgrade to Pro 🚀
                    </div>
                )}
            </div>

            {/* 🔹 Avatar */}
            <div className="p-4 flex items-center gap-3 border-t border-white/10">
                <Avatar name="Shubham" />
                {!collapsed && <span className="text-sm">Shubham</span>}
            </div>
        </div>
    );
}

function NavItem({ icon, label, collapsed }: any) {
    return (
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer">
            {icon}
            {!collapsed && <span>{label}</span>}
        </div>
    );
}