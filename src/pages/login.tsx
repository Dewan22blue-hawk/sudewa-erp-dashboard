import { useState } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        // Dummy login - simpan token ke localStorage
        localStorage.setItem("token", "dummy-token-12345")
        router.push("/select-company")
    }

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Login Form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-8 py-12">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                            Login to your account
                        </h1>
                        <p className="text-sm text-gray-600">
                            Enter your email below to login to your account
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-gray-700 block"
                            >
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
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
                                className="w-full"
                                required
                            />
                        </div>

                        {/* Login Button */}
                        <Button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5"
                        >
                            Login
                        </Button>
                    </form>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-100 items-center justify-center relative overflow-hidden">
                <div className="relative w-full h-full">
                    <Image
                        src="/assets/auth.png"
                        alt="Wajira Office"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>
        </div>
    )
}
