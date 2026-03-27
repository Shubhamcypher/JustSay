export default function VideoBackground({
    children,
    src
  }: {
    children: React.ReactNode;
    src?: string;
  }) {
    return (
      <div className="relative h-screen w-screen overflow-hidden text-white">
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover -z-10"
        >
          <source src={src} type="video/mp4" />
        </video>
  
        {children}
      </div>
    );
  }