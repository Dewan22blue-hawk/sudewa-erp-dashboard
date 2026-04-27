import type { AppProps } from "next/app"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { useRouter } from "next/router"
import { Toaster } from "@/components/ui/sonner"
import { useAuthCheck } from "@/features/auth/hooks/use-auth-check"

import "@/styles/globals.css"
import { CompanyProvider } from "@/contexts/CompanyContext"

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())
  const router = useRouter()

  useAuthCheck(router)

  return (
    <QueryClientProvider client={queryClient}>
      <CompanyProvider>
        <Component {...pageProps} />
        <Toaster position="bottom-center" />
      </CompanyProvider>
    </QueryClientProvider>
  )
}
