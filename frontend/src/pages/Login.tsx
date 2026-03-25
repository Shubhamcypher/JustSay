import { useState } from "react";
import { login } from "../api/auth.api";
import { setTokens } from "../utils/auth";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import PasswordField from "@/components/customComponents/InputField/PasswordField";
import { useToast } from "@/components/ui/use-toast";
import Auth3DBackground from "@/components/customComponents/backgrounds/Auth3DBackground";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async () => {
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
        title: "Welcome back 👋",
        description: "Logged in successfully",
      });

      navigate("/");
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.response?.data?.message || "Invalid credentials",
        variant: "error",
      });
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
        <Card className="w-[420px] rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl">

          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <p className="text-sm text-white/50">
              Login to continue to Justsay
            </p>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">

            {/* Email + Password */}
            <div className="flex flex-col gap-4">

              <div className="flex flex-col gap-2">
                <Label className="text-white/60">Email</Label>
                <Input
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-blue-400"
                />
              </div>

              <PasswordField onChange={(value: string) => setPassword(value)} />

            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-white/90 text-black hover:bg-blue-500 hover:text-white transition-all"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/50">or continue with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* OAuth Buttons */}
            <div className="flex flex-col gap-3">

              <button
                onClick={() => handleOAuth("google")}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg py-2 text-sm text-white transition"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" />
                Continue with Google
              </button>

              <button
                onClick={() => handleOAuth("github")}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg py-2 text-sm text-white transition"
              >
                <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-4 h-4 invert" />
                Continue with GitHub
              </button>

            </div>

            {/* Redirect */}
            <p className="text-sm text-center text-white/60">
              Don’t have an account?{" "}
              <span
                className="text-blue-400 cursor-pointer font-semibold"
                onClick={() => navigate("/register")}
              >
                Register
              </span>
            </p>

          </CardContent>
        </Card>
      </div>
    </Auth3DBackground>
  );
}