import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { getToken } from "@/lib/auth";
import { LoadingState } from "@/components/ui/loading-state";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <title>Redirecting...</title>
      </Head>
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <LoadingState variant="page" text="Mengalihkan..." />
      </div>
    </>
  );
}