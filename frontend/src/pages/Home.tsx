import HomeVideoBackground from "@/components/customComponents/backgrounds/HomeVideoBackground";
import HomeContent from "@/components/customComponents/HomeContent";
import HomeHero from "@/components/HomeHero";
import Sidebar from "@/components/ui/Sidebar";

export default function Home() {
  return (
    <HomeVideoBackground>
      
      <HomeHero />
      <HomeContent />
    </HomeVideoBackground>
  );
}