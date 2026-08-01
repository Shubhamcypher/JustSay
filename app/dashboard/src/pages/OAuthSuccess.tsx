import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const hasRun = useRef(false);
  const { toast } = useToast();
  const { setUserFromToken } = useAuth();


  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    (async () => {
      try {
        await setUserFromToken();

        toast({
          title: "Success",
          description: "Google Login successful",
          variant: "success",
        });

        navigate("/");
      } catch {
        navigate("/login");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600">
          <svg
            className="h-7 w-7 animate-pulse text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
  
        <h2 className="text-2xl font-semibold text-white">
          Welcome to JustSay
        </h2>
  
        <p className="mt-2 text-sm text-white/60">
          Authenticating your account...
        </p>
  
        <div className="mt-6 flex justify-center">
          <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-violet-500" />
          </div>
        </div>
      </div>
    </div>
  );
}