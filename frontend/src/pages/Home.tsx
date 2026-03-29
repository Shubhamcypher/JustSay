import { useState } from "react";
import { cn } from "@/lib/utils";
import HomeVideoBackground from "@/components/customComponents/backgrounds/HomeVideoBackground";
import HomeContent from "@/components/customComponents/home/HomeContent";
import HomeHero from "@/components/customComponents/home/HomeHero";
import Sidebar from "@/components/customComponents/sidebar/Sidebar";
import MobileNavbar from "@/components/customComponents/mobileNavbar/MobileNavbar";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HomeVideoBackground src="/videos/bg2.mp4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 -z-10" />

      {/* Mobile Navbar */}
      <MobileNavbar onMenuClick={() => setIsOpen(true)} />

      <div className="flex h-full">

        {/* Sidebar / Drawer */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar />
        </div>

        {/* Overlay */}
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <HomeHero />
          <HomeContent />
        </div>
      </div>
    </HomeVideoBackground>
  );
}