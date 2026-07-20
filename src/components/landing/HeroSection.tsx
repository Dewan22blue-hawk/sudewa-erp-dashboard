"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Laugh, Gamepad2, Mic } from "lucide-react";

// Massive Type inspired by Honk
const AnimatedHeading = ({ text, delay = 0, colorClass = "text-slate-900" }: { text: string; delay?: number; colorClass?: string }) => (
  <motion.h1
    initial={{ opacity: 0, scale: 0.8, y: 60, filter: "blur(12px)" }}
    animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
    transition={{ type: "spring", stiffness: 110, damping: 25, delay }}
    className={`text-6xl sm:text-8xl md:text-[9rem] font-black tracking-[-0.04em] leading-[0.95] ${colorClass}`}
  >
    {text}
  </motion.h1>
);

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.75]);
  const yElement = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const rotateMockup = useTransform(scrollYProgress, [0, 1], [0, 5]);
  
  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[140vh] bg-[#FAFAFA] flex flex-col items-center justify-start pt-32 sm:pt-40 overflow-hidden"
    >
      {/* Amie Pastel Gradients combined with Honk Electric Blue */}
      <div className="absolute top-10 left-1/4 w-[600px] h-[600px] bg-blue-300/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[600px] h-[600px] bg-fuchsia-200/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob [animation-delay:2s] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-[600px] h-[600px] bg-amber-200/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob [animation-delay:4s] pointer-events-none" />

      <div className="z-10 text-center max-w-6xl mx-auto px-4 flex flex-col items-center mt-4">
        {/* Playful Floating Badges */}
        <motion.div 
          initial={{ opacity: 0, y: -20, rotate: -10 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-clay-sm border-2 border-slate-100 text-slate-800 font-bold text-sm tracking-wide"
        >
          <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          Lebih dari sekadar ERP
        </motion.div>

        <AnimatedHeading text="Kelola Kerja," delay={0.1} />
        <AnimatedHeading text="Lebih Ceria." delay={0.2} colorClass="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500" />

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 sm:mt-10 text-lg sm:text-2xl text-slate-500 max-w-3xl font-bold px-4 leading-relaxed"
        >
          Semua dalam satu aplikasi tangguh. Dashboard enterprise Anda dirancang ulang dengan widget natural, warna indah, dan tanpa spreadsheet yang membosankan.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full px-4 sm:w-auto"
        >
          <motion.a
            href="/dashboard"
            whileHover={{ scale: 1.05, rotate: -1 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 rounded-3xl bg-blue-600 shadow-[0_12px_24px_rgba(37,99,235,0.4)] text-white font-black text-xl 
                       transition-colors hover:bg-blue-500 flex justify-center items-center w-full sm:w-auto overflow-hidden group relative"
          >
            <span className="relative z-10">Mulai Gratis Sekarang</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </motion.a>
        </motion.div>
      </div>

      {/* Honk/Amie Animated Mockup Area */}
      <motion.div
        style={{ scale, opacity: useTransform(scrollYProgress, [0, 1], [1, 0.4]), y: yElement, rotate: rotateMockup }}
        className="mt-20 w-full max-w-6xl px-4 xl:px-0 relative z-20 origin-bottom"
      >
        <motion.div
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative rounded-[2rem] sm:rounded-[3.5rem] bg-white/50 backdrop-blur-xl shadow-clay-lg border-4 border-white p-4 sm:p-6"
        >
          {/* Floating Emoji Interactions (Honk style) */}
          <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -left-8 -top-8 w-16 h-16 bg-pink-100 rounded-3xl shadow-clay border-4 border-white flex items-center justify-center text-pink-500 z-30">
            <Laugh size={32} />
          </motion.div>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -right-6 top-20 w-14 h-14 bg-amber-100 rounded-2xl shadow-clay border-4 border-white flex items-center justify-center text-amber-500 z-30">
            <Gamepad2 size={24} />
          </motion.div>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -left-4 bottom-20 w-12 h-12 bg-blue-100 rounded-full shadow-clay border-4 border-white flex items-center justify-center text-blue-500 z-30">
            <Mic size={20} />
          </motion.div>

          <div className="w-full aspect-[4/3] sm:aspect-[16/9] bg-slate-100 rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-inner relative">
            <img 
              src="/wajira-footer-design.png" 
              alt="Dashboard Preview" 
              className="w-full h-full object-cover relative z-10 transition-transform duration-700 hover:scale-105"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
