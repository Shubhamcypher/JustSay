import { useState } from 'react';
import { register } from '../api/auth.api';
import { setTokens } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/customComponents/InputField/PasswordField';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      console.log(password,"Set Password\n", email,"Set Email");
      
      const res = await register({ email, password });

      setTokens(res.data.accessToken, res.data.refreshToken);

      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className='flex items-center justify-center h-screen bg-gradient-to-br from-zinc-900 to-black'>
      <Card className='w-[400px] shadow-xl border-zinc-800'>
        <CardHeader>
          <CardTitle className='text-2xl text-center text-red-500'>Create Account</CardTitle>
        </CardHeader>

        <CardContent className='flex flex-col gap-8'>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <Label className='text-gray-200'>Email</Label>
              <Input placeholder='you@example.com' onChange={(e) => setEmail(e.target.value)} />
            </div>

              <PasswordInput onChange={setPassword} />
          </div>

          <Button onClick={handleRegister} className='w-full bg-slate-50'>
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
  );
}