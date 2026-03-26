import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/ui/Navbar";



export default function Dashboard() {
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    console.log("Generating:", prompt);

    // 👉 later: API call
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* 🌌 Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/20 blur-[200px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/20 blur-[200px]" />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main */}
      <div className="relative flex flex-col items-center justify-center h-[80vh] px-4">

        {/* Heading */}
        <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Build Websites with AI
        </h1>

        <p className="text-white/50 mt-4 text-center max-w-xl">
          Describe your idea and watch it turn into a relaity.
        </p>

        {/* Input Box */}
        <div className="mt-10 w-full max-w-2xl flex gap-2 bg-white/5 border border-white/10 rounded-xl p-2 backdrop-blur-xl">

          <Input
            placeholder="e.g. Create a portfolio website for a developer..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-transparent border-none focus-visible:ring-0 text-white"
          />

          <Button
            onClick={handleGenerate}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Generate
          </Button>
        </div>

      </div>
    </div>
  );
}