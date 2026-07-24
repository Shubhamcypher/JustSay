export default function Auth3DBackground({ children }: any) {
  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-cover"
      >
        <source src="/videos/bg2.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay (VERY IMPORTANT) */}
      <div className="absolute inset-0 bg-black/20 " />

      {/* Content */}
      <div className="relative z-10 flex h-full">

        {/* LEFT SIDE (design area) */}
        <div className="hidden md:flex flex-1 flex-col justify-center px-20 text-white">

          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">JustSay</span>
          </h1>

          <p className="text-lg text-white/70 max-w-md">
            Build conversations, connect ideas, and express yourself in a whole new way.
          </p>

          {/* subtle floating decoration */}
          <div className="mt-10 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
        </div>

        {/* RIGHT SIDE (sidebar card) */}
        <div className="w-full md:w-[450px] h-full flex items-center justify-center px-6 relative">

          {/* actual content */}
          <div className="relative z-10 flex items-center justify-end h-full">
            {children}
          </div>

        </div>

      </div>
    </div>
  );
}