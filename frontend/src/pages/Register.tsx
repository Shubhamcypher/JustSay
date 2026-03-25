import { useState } from 'react';
import { register } from '../api/auth.api';
import { setTokens } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import PasswordField from '@/components/customComponents/InputField/PasswordField';
import { useToast } from '@/components/ui/use-toast';
import Auth3DBackground from '@/components/customComponents/backgrounds/Auth3DBackground';
// import AuthBackground from '@/components/customComponents/InputField/backgrounds/AuthBackground';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const getStrength = (password: string) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score == 0)
      return {}

    if (score <= 2)
      return {
        label: "Weak",
        bar: "bg-red-500",
        text: "text-red-500",
        width: "w-1/3",
      };

    if (score === 3 || score === 4)
      return {
        label: "Medium",
        bar: "bg-yellow-400",
        text: "text-yellow-400",
        width: "w-2/3",
      };

    return {
      label: "Strong",
      bar: "bg-green-500",
      text: "text-green-500",
      width: "w-full",
    };
  };
  const strength = getStrength(password);

  const handleRegister = async () => {
    try {
      console.log(password, "Set Password\n", email, "Set Email");

      const res = await register({ email, password });

      setTokens(res.data.accessToken, res.data.refreshToken);
      toast({
        title: "Success 🎉",
        description: "Account created successfully",
      });
      navigate('/');
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleOAuth = (provider: string) => {
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  const handlePhoneLogin = () => {
    navigate("/phone-login");
  };

  const { toast } = useToast();


  return (
    <Auth3DBackground>
      <div className="animate-[fadeZoom_0.6s_ease-out] transition-transform duration-300 hover:-translate-y-1 h-full p-4 items-center flex">
        <Card
          className="w-[420px] relative rounded-2xl overflow-hidden h-full max-h-[1229px]
          backdrop-blur-3xl flex flex-col justify-between
          bg-gradient-to-br from-white/1 via-white/2 to-white/3 
          border border-white/10 
          shadow-[0_10px_40px_rgba(0,0,0,0.6)]">

          {/* 🔥 Step 1 → dark accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/30 pointer-events-none" />

          {/* 🔥 Step 2 → top light reflection */}
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

          {/* 🔥 Step 3 → glow + border */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none">
            <div className="absolute inset-0 rounded-2xl border border-white/10" />
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-30 animate-[pulse_8s_ease-in-out_infinite]" />
          </div>
          <CardHeader className="relative z-10 flex flex-col items-center gap-2 pb-2">
            <CardTitle className="text-4xl font-bold tracking-tight text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Account
            </CardTitle>

            <p className="text-sm text-white/50 text-center">
              Join and start your journey 🚀
            </p>
          </CardHeader>

          <CardContent className='flex flex-col gap-4'>
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
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 group">
                <Label className="text-white/60 group-focus-within:text-blue-600 transition-colors duration-300 backdrop-blur-sm bg-white/5 px-2 py-1 rounded-md w-fit border border-white/10">
                  Password
                </Label>

                <PasswordField onChange={(value: string) => setPassword(value)} />
                <p
                  className={`text-xs ${strength.text} transition-all duration-300 ${password.length === 0
                    ? "opacity-0  overflow-hidden"
                    : "opacity-100"
                    }`}
                >
                  Strength: {strength.label}
                </p>
              </div>
            </div>


            <Button onClick={handleRegister} className="w-full bg-white/90 text-black hover:bg-blue-500 hover:text-white transition-all duration-300">
              Register
            </Button>


          </CardContent>
          <div className='p-4 flex flex-col gap-4'>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/50">or continue with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="grid grid-cols-1 gap-6">

              {/* Google */}
              <button
                onClick={() => handleOAuth("google")}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg py-2 text-sm text-white transition"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" />
                Sign in with Google
              </button>

              {/* GitHub */}
              <button
                onClick={() => handleOAuth("github")}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg py-2 text-sm text-white transition"
              >
                <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-4 h-4 invert" />
                Sign in with GitHub
              </button>

              {/* Microsoft */}
              <button
                onClick={() => handleOAuth("microsoft")}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg py-2 text-sm text-white transition"
              >
                <img src="https://www.svgrepo.com/show/448239/microsoft.svg" className="w-4 h-4" />
                Sign in with Microsoft
              </button>

              {/* Phone */}
              <button
                onClick={() => handlePhoneLogin()}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg py-2 text-sm text-white transition"
              >
                📱 Sign in using Number
              </button>

            </div>


            <p className='text-sm text-center text-gray-100'>
              Already have an account?{' '}
              <span className='text-blue-500 font-bold cursor-pointer' onClick={() => navigate('/login')}>
                Login
              </span>
            </p>
          </div>
        </Card>
      </div>
    </Auth3DBackground>
  );
}