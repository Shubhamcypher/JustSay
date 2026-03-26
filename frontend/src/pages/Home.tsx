import HomeContent from "@/components/customComponents/HomeContent";
import HomeHero from "@/components/HomeHero";
import Sidebar from "@/components/ui/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen  text-white">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        {/* 🎥 Video Background */}
        <video
          autoPlay
          loop
          muted
          className="absolute w-full h-full object-cover"
        >
          <source src="/videos/bg2.mp4" type="video/mp4" />
        </video>
        <HomeHero />
        <HomeContent />
      </div>
    </div>
  );
}