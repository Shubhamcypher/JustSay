import Sidebar from "@/components/customComponents/sidebar/Sidebar";
import HomeHero from "@/components/customComponents/home/HomeHero";
import HomeContent from "@/components/customComponents/home/HomeContent";

export default function DesktopLayout() {
  return (
    <div className="hidden lg:flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <HomeHero />
        <HomeContent />
      </div>
    </div>
  );
}