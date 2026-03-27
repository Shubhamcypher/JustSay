import { useState } from 'react';
import { register } from '../api/auth.api';
import { setTokens } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordField from '@/components/customComponents/InputField/PasswordField';
import { useToast } from '@/components/ui/use-toast';
import Auth3DBackground from '@/components/customComponents/backgrounds/Auth3DBackground';
import AuthCard from '@/components/customComponents/cards/AuthCard';


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
        title: "Account created",
        description: "Account created successfully",
        variant: "success"
      });
      setEmail("")
      setPassword("")
      navigate('/login');
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.response?.data?.message || "Something went wrong",
        variant: "error",
      });
      setPassword("")
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
        <AuthCard
          title="Create Account"
          subtitle="Join and start your journey"
          showOAuth
          providers={[
            { name: "Google", icon: "https://www.svgrepo.com/show/475656/google-color.svg", onClick: () => handleOAuth("google") },
            { name: "GitHub", icon: "https://www.svgrepo.com/show/512317/github-142.svg", onClick: () => handleOAuth("github") },
            { name: "Microsoft", icon: "https://www.svgrepo.com/show/448239/microsoft.svg", onClick: () => handleOAuth("microsoft") },
            { name: "Phone", icon: "https://www.svgrepo.com/svg/show/474939/phone-android.svg", onClick: () => handlePhoneLogin() },
          ]}
          footer={
            <>
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="text-blue-400 cursor-pointer">
                Login
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
        </AuthCard>
      </div>
    </Auth3DBackground>
  );
}