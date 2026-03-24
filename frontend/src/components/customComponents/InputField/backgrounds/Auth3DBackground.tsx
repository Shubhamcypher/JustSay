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
        <source src="/videos/bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay (VERY IMPORTANT) */}
      <div className="absolute inset-0 bg-black/20 " />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        {children}
      </div>
    </div>
  );
}