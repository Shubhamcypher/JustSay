export default function HomeVideoBackground({ children }: { children: React.ReactNode }) {
    return (
      <div className="relative h-screen w-screen overflow-hidden text-white">
        
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover -z-10"
        >
          <source src="/videos/bg2.mp4" type="video/mp4" />
        </video>
  
        {children}
      </div>
    );
  }