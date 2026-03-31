import { useState } from "react";
import { cn } from "@/lib/utils";
import HomeHero from "@/components/customComponents/home/HomeHero";
import HomeContent from "@/components/customComponents/home/HomeContent";
import MobileNavbar from "@/components/customComponents/mobileNavbar/MobileNavbar";
import MobileMenu from "@/components/customComponents/mobileNavbar/MobileMenu";

export default function MobileLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden flex flex-col h-screen">
      {/* Navbar */}
      <MobileNavbar onMenuClick={() => setIsOpen(true)} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <HomeHero />
        <HomeContent />
      </div>

      {/* Drawer */}
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
  );
}