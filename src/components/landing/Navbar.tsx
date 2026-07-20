"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { Sparkles, Box, Zap, User } from "lucide-react";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 120) {
      setHidden(true); 
    } else {
      setHidden(false); 
    }
    setScrolled(latest > 30);
  });

  return (
    <>
      {/* DESKTOP NAVBAR (Hidden on mobile) */}
      <motion.nav
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-100%", opacity: 0 }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className={`hidden md:flex fixed top-0 left-0 right-0 z-[999] justify-center w-full px-4 transition-all duration-300 ${
          scrolled ? "pt-3" : "pt-8"
        }`}
      >
        <div 
          className={`flex items-center justify-between w-full max-w-5xl px-4 py-2 transition-all duration-500 rounded-full ${
            scrolled 
              ? "bg-white/70 backdrop-blur-2xl shadow-clay-sm border-2 border-white" 
              : "bg-transparent"
          }`}
        >
          {/* Desktop LOGO */}
          <div className="flex items-center gap-2 px-2 hover:scale-105 transition-transform cursor-pointer">
            <img 
              src="/assets/login_banner.png" 
              alt="Deraly Logo" 
              className="w-10 h-10 object-contain rounded-[12px] shadow-sm drop-shadow-md"
              onError={(e) => { e.currentTarget.src = '/wajira-logo.png' }}
            />
            <span className="text-2xl font-black tracking-tight text-slate-900 ml-1">
              Deraly.id
            </span>
          </div>

          {/* Desktop Links */}
          <div className="flex items-center gap-8 font-bold text-slate-500 text-[15px]">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Fitur</Link>
            <Link href="#productivity" className="hover:text-blue-600 transition-colors">Produktivitas</Link>
            <Link href="#pricing" className="hover:text-blue-600 transition-colors">Harga</Link>
          </div>

          {/* Desktop CTA */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-500 font-bold text-[15px] hover:text-slate-900 transition-colors px-2">
              Masuk
            </Link>
            <Link href="/dashboard">
              <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-bold text-[15px] shadow-[0_8px_16px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:-translate-y-1 hover:rotate-2 transition-all active:translate-y-0 active:rotate-0 duration-200">
                <Sparkles className="w-4 h-4 fill-white" />
                Mulai Sekarang
              </button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE TOP FLOATING LOGO (Sticky Minimal) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[990] flex p-4 sm:p-6 pointer-events-none transition-transform duration-500 ease-out" style={{ transform: scrolled ? 'translateY(-100%)' : 'translateY(0)' }}>
        <div className="flex items-center gap-2 pointer-events-auto bg-white/80 backdrop-blur-xl px-4 py-3 rounded-full shadow-clay-sm border-2 border-white/50">
          <img src="/assets/login_banner.png" alt="Logo" className="w-8 h-8 rounded-lg object-contain drop-shadow" onError={(e) => e.currentTarget.src = '/wajira-logo.png'} />
          <span className="font-extrabold tracking-tight text-slate-900 text-lg">Deraly.id</span>
        </div>
      </div>

      {/* MOBILE BOTTOM DOCK (Floating Tudder Bar) */}
      <motion.div 
        variants={{
          visible: { y: 0, opacity: 1, scale: 1 },
          hidden: { y: "150%", opacity: 0, scale: 0.85 }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="md:hidden fixed bottom-6 left-4 right-4 z-[999] flex justify-center pb-safe"
      >
        <div className="bg-white/80 backdrop-blur-3xl px-8 py-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15),_inset_0_2px_4px_rgba(255,255,255,1)] border-2 border-white/60 flex items-center justify-between w-full max-w-sm">
          
          <Link href="#features" className="flex flex-col items-center text-slate-400 hover:text-blue-600 transition-colors">
            <Box size={24} className="mb-0.5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Fitur</span>
          </Link>
          
          <Link href="#howitworks" className="flex flex-col items-center text-slate-400 hover:text-pink-500 transition-colors">
            <Zap size={24} className="mb-0.5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Cara</span>
          </Link>

          <Link href="/login" className="flex flex-col items-center text-slate-400 hover:text-slate-900 transition-colors">
            <User size={24} className="mb-0.5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Masuk</span>
          </Link>
          
          {/* Mobile Glowing CTA */}
          <Link href="/dashboard" className="ml-2">
            <button className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.4)] hover:scale-110 active:scale-95 transition-all">
              <Sparkles size={24} className="fill-white" />
            </button>
          </Link>
          
        </div>
      </motion.div>
    </>
  );
}
