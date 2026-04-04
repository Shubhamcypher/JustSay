import { useAuth } from "@/context/AuthContext";

export default function SessionHandler() {
  const { sessionStatus } = useAuth();

  if (sessionStatus === "checking") {
    return <Overlay text="Checking session..." />;
  }

  if (sessionStatus === "expired") {
    return <Overlay text="Session expired..." />;
  }

  if (sessionStatus === "refreshing") {
    return <Overlay text="Logging you in..." />;
  }

  return null;
}

function Overlay({ text }: { text: string }) {
  return (
    <div className="fixed inset-0 z-[999] bg-black/70 flex items-center justify-center text-white text-lg">
      {text}
    </div>
  );
}