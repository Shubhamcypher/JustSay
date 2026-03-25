import { useToast } from "@/components/ui/use-toast";
import { setTokens } from "@/utils/auth";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const hasRun = useRef(false);
  const { toast } = useToast();


  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      toast({
        title: "Success",
        description: "Google Login successful",
        variant: "success",
      });
      setTimeout(() => {
        toast({
            title: "Welcome to JustSay",
            description: "Just say and create",
            variant: "info",
          });  
      }, 3000);
      
      navigate('/')
    } else {
      navigate("/login");
    }
  }, []);

  return <div>Logging you in...</div>;
}