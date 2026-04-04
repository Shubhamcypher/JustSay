import HomeVideoBackground from "@/components/customComponents/backgrounds/HomeVideoBackground";
import DesktopLayout from "@/components/customComponents/home/DesktopLayout";
import MobileLayout from "@/components/customComponents/home/MobileLayout";
import SessionHandler from "@/components/customComponents/SessionHandler";


export default function Home() {
  
  return (
    <HomeVideoBackground src="/videos/bg2.mp4">
      <SessionHandler />
      <div className="absolute inset-0 bg-black/60 -z-10" />

      <MobileLayout />
      <DesktopLayout />
    </HomeVideoBackground>
  );
}