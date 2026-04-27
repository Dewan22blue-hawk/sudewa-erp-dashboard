import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useLogin } from '@/features/auth/hooks/use-login';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error } = useLogin();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await login({ login: userId, email: userId, password });
      if (response?.status) {
        // Successfully logged in
        router.push('/select-company');
      }
    } catch (err) {
      // Error is handled by useLogin and accessible via `error` state
      console.error('Login Error:', err);
    }
  }

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Side - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white">
        <div className="flex flex-col items-start bg-white rounded-lg border border-[#E5E5E5] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6 gap-6" style={{ width: '400px' }}>
          {/* Header */}
          <div className="flex flex-col gap-2 w-full">
            <h1 className="text-[16px] font-semibold leading-6 text-[#0A0A0A]">Login to your account</h1>
            <p className="text-[14px] font-normal leading-5 text-[#737373]">Enter your user ID below to login to your account</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
            {/* Error Message Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* User ID Field */}
            <div className="flex flex-col gap-[6px] w-full">
              <label htmlFor="userId" className="text-[14px] font-medium leading-5 text-[#0A0A0A]">
                User ID
              </label>
              <Input
                id="userId"
                type="text"
                placeholder="Enter your user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full h-[36px] px-3 py-[7.5px] border border-[#E5E5E5] rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[14px]"
                required
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-[6px] w-full">
              <div className="flex items-center justify-between w-full">
                <label htmlFor="password" className="text-[14px] font-medium leading-5 text-[#0A0A0A]">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[14px] font-normal leading-5 text-[#0A0A0A] text-right">
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[36px] px-3 py-[7.5px] pr-10 border border-[#E5E5E5] rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[14px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-[#737373] hover:text-[#0A0A0A]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <div className="flex flex-col gap-3 w-full mt-2">
              <Button type="submit" disabled={isLoading} className="w-full h-[36px] bg-[#B0160D] hover:bg-[#991B1B] text-[#FAFAFA] text-[14px] font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Aurora Gradient & Logo */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden bg-[#F5F6F8]">
        {/* Aurora Gradient Background */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_85%_10%,#f64c0e_0%,#f47233_20%,#f08d5c_35%,#a85f71_55%,transparent_70%),radial-gradient(circle_at_80%_90%,#64a5db_0%,#7993c4_25%,#5a6d9f_45%,#4c6697_65%,transparent_75%)]" />

        {/* Centered Logo */}
        <div className="relative z-10 w-[400px] h-[400px] animate-fade-in">
          <Image src="/wajira-logo.png" alt="Wajira Logo" fill className="object-contain drop-shadow-lg" priority />
        </div>
      </div>
    </div>
  );
}
