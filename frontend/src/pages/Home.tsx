import { useState } from "react";
import { cn } from "@/lib/utils";
import HomeVideoBackground from "@/components/customComponents/backgrounds/HomeVideoBackground";
import HomeContent from "@/components/customComponents/home/HomeContent";
import HomeHero from "@/components/customComponents/home/HomeHero";
import Sidebar from "@/components/customComponents/sidebar/Sidebar";
import MobileNavbar from "@/components/customComponents/mobileNavbar/MobileNavbar";
import MobileMenu from "@/components/customComponents/mobileNavbar/MobileMenu";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HomeVideoBackground src="/videos/bg2.mp4">
      <div className="absolute inset-0 bg-black/60 -z-10" />

      {/* ================= MOBILE ================= */}
      <div className="md:hidden flex flex-col h-screen">

        {/* Top Navbar */}
        <MobileNavbar onMenuClick={() => setIsOpen(true)} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <HomeHero />
          <HomeContent />
        </div>

        {/* Drawer Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <MobileMenu onClose={() => setIsOpen(false)} />
        </div>

        {/* Overlay */}
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:flex h-screen">

        {/* Sidebar */}
        <Sidebar />

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <HomeHero />
          <HomeContent />
        </div>
      </div>

    </HomeVideoBackground>
  );
}