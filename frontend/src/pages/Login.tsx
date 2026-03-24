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
        variant: "destructive",
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
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-zinc-900 to-black">
      <Card className="w-[400px] shadow-xl border-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-blue-500">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label className="text-gray-200">Email</Label>
              <Input
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <PasswordField onChange={(value: string) => setPassword(value)} />

          </div>

          {/* Button */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-slate-50 hover:bg-blue-500 hover:text-white transition-colors duration-300"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          {/* Redirect */}
          <p className="text-sm text-center text-zinc-400">
            Don’t have an account?{" "}
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}