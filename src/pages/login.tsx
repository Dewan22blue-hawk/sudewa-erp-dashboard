import { useState } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const [userId, setUserId] = useState("")
    const [password, setPassword] = useState("")

    function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        // Dummy login - simpan token ke localStorage
        localStorage.setItem("token", "dummy-token-12345")
        router.push("/select-company")
    }

    return (
        <div className="flex min-h-screen font-sans">
            {/* Left Side - Login Form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center bg-white">
                <div
                    className="flex flex-col items-start bg-white rounded-lg border border-[#E5E5E5] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6 gap-6"
                    style={{ width: '400px' }}
                >
                    {/* Header */}
                    <div className="flex flex-col gap-2 w-full">
                        <h1 className="text-[16px] font-semibold leading-6 text-[#0A0A0A]">
                            Login to your account
                        </h1>
                        <p className="text-[14px] font-normal leading-5 text-[#737373]">
                            Enter your user ID below to login to your account
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
                        {/* User ID Field */}
                        <div className="flex flex-col gap-[6px] w-full">
                            <label
                                htmlFor="userId"
                                className="text-[14px] font-medium leading-5 text-[#0A0A0A]"
                            >
                                User ID
                            </label>
                            <Input
                                id="userId"
                                type="text"
                                placeholder="Enter your User ID"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full h-[36px] px-3 py-[7.5px] border border-[#E5E5E5] rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[14px]"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-[6px] w-full">
                            <div className="flex items-center justify-between w-full">
                                <label
                                    htmlFor="password"
                                    className="text-[14px] font-medium leading-5 text-[#0A0A0A]"
                                >
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-[14px] font-normal leading-5 text-[#0A0A0A] text-right"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-[36px] px-3 py-[7.5px] border border-[#E5E5E5] rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[14px]"
                                required
                            />
                        </div>

                        {/* Login Button */}
                        <div className="flex flex-col gap-3 w-full mt-2">
                            <Button
                                type="submit"
                                className="w-full h-[36px] bg-[#B0160D] hover:bg-[#991B1B] text-[#FAFAFA] text-[14px] font-medium rounded-lg"
                            >
                                Login
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Side - Aurora Gradient & Logo */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden bg-[#F5F6F8]">
                {/* Aurora Gradient Background */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_85%_10%,#f64c0e_0%,#f47233_20%,#f08d5c_35%,#a85f71_55%,transparent_70%),radial-gradient(circle_at_80%_90%,#64a5db_0%,#7993c4_25%,#5a6d9f_45%,#4c6697_65%,transparent_75%)]"
                />

                {/* Centered Logo */}
                <div className="relative z-10 w-[400px] h-[400px] animate-fade-in">
                    <Image
                        src="/wajira-logo.png"
                        alt="Wajira Logo"
                        fill
                        className="object-contain drop-shadow-lg"
                        priority
                    />
                </div>
            </div>
        </div>
    )
}
