import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useLogin } from '@/features/auth/hooks/use-login';
import { useCompany } from '@/contexts/CompanyContext';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getAccessToken, checkTokenValidity, removeAccessToken } from '@/lib/auth/token';
import { clearStoredCompanyId, clearStoredPermissions } from '@/lib/session/storage';
import { LoadingState } from '@/components/ui/loading-state';

export default function LoginPage() {
  const router = useRouter();
  const { setCompanyId } = useCompany();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const { login, isLoading, error } = useLogin();

  useEffect(() => {
    async function checkAuth() {
      const token = getAccessToken();
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const status = await checkTokenValidity();
        if (status === 'valid') {
          router.back();
        } else {
          removeAccessToken();
          clearStoredCompanyId();
          clearStoredPermissions();
          setIsCheckingAuth(false);
        }
      } catch (err) {
        setIsCheckingAuth(false);
      }
    }

    checkAuth();
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await login({ login: userId, email: userId, password });
      if (response?.status) {
        // Successfully logged in
        setCompanyId('1');
        router.push('/dashboard/1');
      }
    } catch (err) {
      // Error is handled by useLogin and accessible via `error` state
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <LoadingState variant="page" text="Memeriksa sesi..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Side - Login Form */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 sm:p-8 overflow-hidden">
        {/* Animated background blobs for the left side */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-red-100/50 blur-[80px] mix-blend-multiply opacity-60 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-orange-100/50 blur-[80px] mix-blend-multiply opacity-60 animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />

        {/* The Form Card */}
        <div className="relative z-10 flex flex-col items-start bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] p-8 gap-6 w-full max-w-[400px] transition-all duration-500 hover:shadow-[0_16px_50px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-1">
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
                User ID / Email
              </label>
              <Input
                id="userId"
                type="text"
                placeholder="Enter your user ID or Email"
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
                  Forgot Password?
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
                {isLoading ? 'Memuat...' : 'Login'}
              </Button>
            </div>
          </form>
          </div>
        </div>

      {/* Right Side - Premium Modern Gradient & Banner */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden bg-slate-50">
        {/* Elegant Ambient Mesh Gradients */}
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-rose-400/40 blur-[120px] mix-blend-multiply opacity-80" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[70%] h-[70%] rounded-full bg-orange-400/30 blur-[120px] mix-blend-multiply opacity-80" />
        <div className="absolute top-[30%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 blur-[100px] mix-blend-multiply opacity-70" />
        
        {/* Subtle grid pattern overlay for texture */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Centered Banner with modern floating effect */}
        <div className="relative z-10 w-[75%] max-w-[550px] aspect-square animate-fade-in transition-all duration-700 ease-in-out hover:scale-[1.02] hover:-translate-y-2">
          <Image 
            src="/assets/login_banner.png" 
            alt="Login Banner" 
            fill 
            className="object-contain drop-shadow-[0_20px_50px_rgba(225,29,72,0.15)]" 
            priority 
            sizes="(max-width: 1024px) 100vw, 50vw" 
          />
        </div>
      </div>
      </div>
  );
}
