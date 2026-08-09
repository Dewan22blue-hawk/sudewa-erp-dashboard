import Head from "next/head";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustedByMarquee from "@/components/landing/TrustedByMarquee";
import BentoFeatures from "@/components/landing/BentoFeatures";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ"; 
import FinalCTA from "@/components/landing/FinalCTA"; 
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Head>
        {/* Hati-hati: Jangan lupa hapus noindex ini saat rilis ke production */}
        <meta name="robots" content="noindex, nofollow" />
        <title>Deraly.id Dashboard</title>
      </Head>
      
      {/* Wrapper utama */}
      <div className="font-sans antialiased selection:bg-indigo-300 selection:text-indigo-900 bg-[#f8fafc] min-h-screen flex flex-col">
        
        {/* Sisipkan Navbar di sini. Set class sticky top-0 z-50 di dalam komponen Navbar */}
        <Navbar />
        
        {/* Gunakan tag main untuk semantik HTML5 yang baik */}
        <main className="flex-grow">
          <HeroSection />
          <TrustedByMarquee />
          <BentoFeatures />
          <HowItWorks />
          <Testimonials />
          <FAQ />
          <FinalCTA />
        </main>
        
        <Footer />
      </div>
    </>
  );
}