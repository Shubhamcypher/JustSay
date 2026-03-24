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
import Auth3DBackground from '@/components/customComponents/InputField/backgrounds/Auth3DBackground';
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

  const { toast } = useToast();


  return (
    <Auth3DBackground>
      <div className="animate-[fadeZoom_0.6s_ease-out]">
        <Card className="w-[420px] relative backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)] rounded-2xl overflow-hidden">
          <div className="absolute inset-0 rounded-2xl pointer-events-none">
            <div className="absolute inset-0 rounded-2xl border border-white/10" />

            {/* animated gradient glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-40 animate-[pulse_6s_ease-in-out_infinite]" />
          </div>
          <CardHeader>
            <CardTitle className="text-3xl text-center bg-gradient-to-r from-gray-900 via-blue-600 to-red-600 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
          </CardHeader>

          <CardContent className='flex flex-col gap-8'>
            <div className='flex flex-col gap-4'>

              <div className='flex flex-col gap-2'>
                <Label className='text-gray-200'>Email</Label>
                <Input placeholder='you@example.com' onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className='flex flex-col gap-2'>
                <PasswordField onChange={(value: string) => setPassword(value)} />
                <p className={`text-xs ${strength.text}`}>
                  Strength: {strength.label}
                </p>
              </div>
            </div>

            <Button onClick={handleRegister} className="w-full bg-white/90 text-black hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-blue-500/30">
              Register
            </Button>

            <p className='text-sm text-center text-zinc-400'>
              Already have an account?{' '}
              <span className='text-blue-500 cursor-pointer' onClick={() => navigate('/login')}>
                Login
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </Auth3DBackground>
  );
}