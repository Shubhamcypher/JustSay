import { useState } from "react";
import {
    Home,
    Search,
    Share2,
    ChevronLeft,
    ChevronRight,
    Folder,
    FolderOpen,
    Star,
    Users,
    Clock
} from "lucide-react";
import Avatar from "./Avatar";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useHoverPreview } from "@/hooks/useHoverPreview";
import ProjectItem from "../ProjectItem";
import HoverPreview from "../customComponents/common/HoverPreview";



type NavItemType = {
    label: string;
    icon: React.ElementType;
};

const navItems: NavItemType[] = [
    { label: "Home", icon: Home },
    { label: "Search", icon: Search },
    { label: "Shared", icon: Share2 },
];

type NavItemProps = {
    icon: React.ElementType;
    label: string;
    collapsed: boolean;
    active: boolean;
    onClick: () => void;
};

function NavItem({
    icon: Icon,
    label,
    collapsed,
    active,
    onClick,
}: NavItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200",
                "hover:bg-white/10",
                active && "bg-white/10 text-white shadow-inner"
            )}
        >
            <Icon size={18} className="opacity-80" />
            {!collapsed && <span className="text-sm">{label}</span>}
        </button>
    );
}

export default function Sidebar() {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [workspaceOpen, setWorkspaceOpen] = useState(false);
    const [active, setActive] = useState("Home");


    const {
        hovered,
        position,
        handleEnter,
        handleLeave,
    } = useHoverPreview();


    const [projectsOpen, setProjectsOpen] = useState(false);

    type SectionKey = "created" | "shared" | "starred";

    const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
        created: true,
        shared: false,
        starred: false,
    });

    const sections: { key: SectionKey; label: string; icon: React.ElementType }[] = [
        { key: "created", label: "Created by me", icon: FolderOpen },
        { key: "shared", label: "Shared with me", icon: Users },
        { key: "starred", label: "Starred", icon: Star },
    ];

    return (
        <aside
            className={cn(
                "h-screen flex flex-col justify-between transition-all duration-300",
                "bg-black/40 backdrop-blur-xl border-r border-white/10",
                collapsed ? "w-20" : "w-64"
            )}

        >


            {/* 🔹 Top */}
            <div className="p-4 flex flex-col gap-6">

                {/* Logo + Toggle */}
                <div className="flex items-center justify-between">
                    {!collapsed && (
                        <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            JustSay
                        </span>
                    )}

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Workspace */}
                <div className="relative">
                    <button
                        onClick={() => setWorkspaceOpen(!workspaceOpen)}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl transition",
                            "bg-white/5 hover:bg-white/10 text-sm"
                        )}
                    >
                        {collapsed ? "WS" : "Workspace"}
                    </button>

                    {workspaceOpen && !collapsed && (
                        <div className="absolute left-0 top-full mt-2 w-full bg-zinc-900 border border-white/10 rounded-xl p-3 shadow-xl z-10">
                            <p className="text-sm text-white/70">Credits: 120</p>
                            <p className="text-sm text-white/70">Workspace: Default</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            collapsed={collapsed}
                            active={active === item.label}
                            onClick={() => {
                                setActive(item.label);
                                if (item.label === "Home") navigate("/");
                            }
                            }
                        />
                    ))}
                </nav>

                {/* 🔹 Projects Section */}
                <div className="flex flex-col">

                    <button
                        onClick={() => setProjectsOpen(!projectsOpen)}
                        className="flex items-center justify-between px-3 py-2 text-sm text-white/70 hover:bg-white/10 rounded-lg transition"
                    >
                        <div className="flex items-center gap-2">
                            <Folder size={16} />
                            <span>Projects</span>
                        </div>
                        <ChevronRight
                            size={16}
                            className={cn(
                                "transition-transform",
                                projectsOpen && "rotate-90"
                            )}
                        />
                    </button>

                    {projectsOpen && !collapsed && (
                        <div className="mt-2 ml-2 flex flex-col">
                            {/* 🔥 Scrollable Area ONLY */}
                            <div className="max-h-40 overflow-y-auto pr-1 space-y-2">

                                {/* Section Component */}
                                {sections.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <div key={section.key}>

                                            {/* Section Header */}
                                            <button
                                                onClick={() =>

                                                    setOpenSections((prev) => ({
                                                        ...prev,
                                                        [section.key]: !prev[section.key],
                                                    }))
                                                }
                                                className="w-full flex items-center justify-between px-2 py-1 text-xs text-white/50 hover:text-white transition"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Icon size={14} className="opacity-70" />
                                                    <span>{section.label}</span>
                                                </div>

                                                <ChevronRight
                                                    size={14}
                                                    className={cn(
                                                        "transition-transform",
                                                        openSections[section.key as keyof typeof openSections] && "rotate-90"
                                                    )}
                                                />
                                            </button>



                                            {/* Projects List */}
                                            {openSections[section.key as keyof typeof openSections] && (
                                                <div className="ml-3 mt-1 flex flex-col gap-1">
                                                    {["Project A", "Landing Page", "Dashboard UI"].map((p) => (
                                                        <ProjectItem
                                                            key={p}
                                                            name={p}
                                                            onHover={handleEnter}
                                                            onLeave={handleLeave}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                        </div>
                                    )
                                })}

                            </div>
                        </div>
                    )}
                </div>

                <HoverPreview
                    visible={!!hovered}
                    top={position.top}
                    left={position.left}
                    content={
                        <div className="w-full h-full flex items-center justify-center text-white/50">
                            {hovered} Preview
                        </div>
                    }
                />

                {/* Recent */}

                {!collapsed && (
                    <div>
                        <p className="text-xs text-white/40 mb-2 px-2">RECENT</p>
                        <div className="flex flex-col gap-1">
                            {["Project A", "Landing Page"].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-2 px-3 py-1 rounded-md text-sm text-white/70 hover:bg-white/10 cursor-pointer transition"
                                >
                                    <Clock size={14} className="opacity-60" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 🔹 Bottom */}
            <div className="p-4 flex flex-col gap-4">

                {/* Upgrade */}
                {!collapsed && (
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-3 rounded-xl text-sm border border-white/10 cursor-pointer">
                        Upgrade to Pro
                    </div>
                )}

                {/* Avatar */}
                <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                    <Avatar name="Shubham" />
                    {!collapsed && <span className="text-sm">Shubham</span>}
                </div>
            </div>
        </aside>
    );
}