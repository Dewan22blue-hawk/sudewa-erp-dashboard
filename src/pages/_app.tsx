import type { AppProps } from "next/app"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

import "@/styles/globals.css"
import { CompanyProvider } from "@/contexts/CompanyContext"

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <CompanyProvider>
        <Component {...pageProps} />
      </CompanyProvider>
    </QueryClientProvider>
  )
}
