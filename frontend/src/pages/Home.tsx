import HomeContent from "@/components/customComponents/HomeContent";
import HomeHero from "@/components/HomeHero";
import Sidebar from "@/components/ui/Sidebar";

export default function Home() {
  return (
    <div className="relative h-screen w-screen overflow-hidden text-white">

      {/* 🎥 Background Video (GLOBAL) */}
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover -z-10"
      >
        <source src="/videos/bg2.mp4" type="video/mp4" />
      </video>

      {/* 🌑 Overlay (important for readability) */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm -z-10" />

      {/* 🔥 Main Layout */}
      <div className="flex h-full">

        <Sidebar />

        <div className="flex-1 overflow-y-auto">
          <HomeHero />
          <HomeContent />
        </div>

      </div>
    </div>
  );
}