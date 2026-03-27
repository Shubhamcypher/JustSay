import HomeVideoBackground from "@/components/customComponents/backgrounds/HomeVideoBackground";
import HomeContent from "@/components/customComponents/HomeContent";
import HomeHero from "@/components/HomeHero";
import Sidebar from "@/components/ui/Sidebar";

export default function Home() {
  return (
    <HomeVideoBackground>
      {/* 🌑 Overlay (important for readability) */}
      <div className="absolute inset-0 bg-black/60  -z-10" />

      {/* 🔥 Main Layout */}
      <div className="flex h-full">

        <Sidebar />

        <div className="flex-1 overflow-y-auto">
          <HomeHero />
          <HomeContent />
        </div>
      </div>
    </HomeVideoBackground>
  );
}