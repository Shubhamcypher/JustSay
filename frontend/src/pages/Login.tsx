import { useState } from "react";
import { login } from "../api/auth.api";
import { setTokens } from "../utils/auth";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordField from "@/components/customComponents/InputField/PasswordField";
import { useToast } from "@/components/ui/use-toast";
import Auth3DBackground from "@/components/customComponents/backgrounds/Auth3DBackground";
import AuthCard from "@/components/customComponents/cards/AuthCard";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (loading)
      return;
    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Email and password are required",
        variant: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password });

      setTokens(res.data.accessToken, res.data.refreshToken);

      toast({
        title: "Welcome back",
        description: "Logged in successfully",
        variant: "success"
      });

      setEmail("");
      setPassword("");
      navigate("/");
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.response?.data?.message || "Invalid credentials",
        variant: "error",
      });
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  return (
    <Auth3DBackground>
      <div className="flex items-center justify-center h-full p-4">
        <AuthCard
          title="Login to Justsay"
          subtitle="Enter the world of possibilities"
          showOAuth
          providers={[
            { name: "Google", icon: "https://www.svgrepo.com/show/475656/google-color.svg", onClick: () => handleOAuth("google") },
            { name: "GitHub", icon: "https://www.svgrepo.com/show/512317/github-142.svg", onClick: () => handleOAuth("github") },
            { name: "Microsoft", icon: "https://www.svgrepo.com/show/448239/microsoft.svg", onClick: () => handleOAuth("microsoft") },
            { name: "Phone", icon: "https://www.svgrepo.com/show/452085/phone.svg", onClick: () => handleOAuth("phone") },
          ]}
          footer={
            <>
              Don't have an account?{" "}
              <span onClick={() => navigate("/register")} className="text-blue-400 cursor-pointer">
                Register
              </span>
            </>
          }
        >
          <div className='flex flex-col gap-4'>

            <div className='flex flex-col gap-2'>
              <div className="flex flex-col gap-2 group">
                <Label className="text-white/60 group-focus-within:text-blue-600 transition-colors duration-300 backdrop-blur-sm bg-white/5 px-2 py-1 rounded-md w-fit border border-white/10">
                  Email
                </Label>

                <Input
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-blue-400"
                  value={email}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 group">
              <Label className="text-white/60 group-focus-within:text-blue-600 transition-colors duration-300 backdrop-blur-sm bg-white/5 px-2 py-1 rounded-md w-fit border border-white/10">
                Password
              </Label>

              <PasswordField value={password} onChange={(inputValue: string) => setPassword(inputValue)} />
            </div>
          </div>


          <Button onClick={handleLogin} className="w-full bg-white/90 text-black hover:bg-blue-500 hover:text-white transition-all duration-300">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </AuthCard>
      </div>
    </Auth3DBackground>
  );
}