import { Home, Search, X, User, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ProjectsSection from "../sidebar/ProjectsSection";
import { useHoverPreview } from "@/hooks/useHoverPreview";
import HoverPreview from "../common/HoverPreview";

type Props = {
    onClose: () => void;
};

const items = [
    { label: "Home", icon: Home },
    { label: "Search", icon: Search },
];



export default function MobileMenu({ onClose }: Props) {
    const [active, setActive] = useState("Home");
    const { hovered, position, handleEnter, handleLeave } =
        useHoverPreview();

    return (
        <div className="w-80 h-full bg-black/70 backdrop-blur-2xl border-r border-white/10 flex flex-col shadow-2xl">

            {/* 🔹 Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
                <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    JustSay
                </span>

                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition"
                >
                    <X size={20} />
                </button>
            </div>

            {/* 🔹 Profile */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    S
                </div>
                <div>
                    <p className="text-sm font-medium">Shubham</p>
                    <p className="text-xs text-white/50">Free Plan</p>
                </div>
            </div>

            {/* 🔹 Navigation */}
            <div className="flex flex-col gap-2 px-3 py-4">

                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.label;

                    return (
                        <button
                            key={item.label}
                            onClick={() => setActive(item.label)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200",
                                "hover:bg-white/10",
                                isActive &&
                                "bg-white/10 text-white shadow-inner border border-white/10"
                            )}
                        >
                            <Icon size={18} className="opacity-80" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}

                <ProjectsSection
                    collapsed={onClose}
                    onHover={handleEnter}
                    onLeave={handleLeave}
                />

            </div>

            {/* 🔹 Secondary Actions */}
            <div className="px-3 mt-2 flex flex-col gap-2">

                <button className="flex items-center gap-3 px-4 py-2 text-sm rounded-lg hover:bg-white/10 text-white/70">
                    <User size={16} />
                    Profile
                </button>

                <button className="flex items-center gap-3 px-4 py-2 text-sm rounded-lg hover:bg-white/10 text-white/70">
                    <Settings size={16} />
                    Settings
                </button>

            </div>

            {/* 🔹 Upgrade Card */}
            <div className="mt-auto p-4">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 rounded-xl p-3 text-sm">
                    Upgrade to Pro 🚀
                </div>
            </div>

            <HoverPreview
                visible={!!hovered}
                top={position.top}
                left={position.left}
                content={<div className="flex items-center justify-center h-full">{hovered}</div>}
            />
        </div>
    );
}