export default function HomeHero() {
    return (
      <div className="relative h-[70vh] flex flex-col items-center justify-center overflow-hidden">
  
        
  
        {/* Overlay */}
        <div className="absolute" />
  
        {/* Content */}
        <div className="relative text-center max-w-2xl px-4">
  
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Build anything with AI
          </h1>
  
          <p className="text-white/60 mt-4">
            Describe your idea and we’ll generate a full website.
          </p>
  
          {/* Input */}
          <div className="mt-8 flex gap-2 bg-white/5 border border-white/10 rounded-xl p-2 backdrop-blur-xl">
            <input
              className="flex-1 bg-transparent outline-none px-3"
              placeholder="Create a SaaS landing page..."
            />
            <button className="bg-blue-500 px-4 py-2 rounded-lg">
              Generate
            </button>
          </div>
        </div>
      </div>
    );
  }