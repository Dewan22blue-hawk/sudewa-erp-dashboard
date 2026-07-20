"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { Sparkles } from "lucide-react";

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
    <motion.nav
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-[999] flex justify-center w-full px-4 transition-all duration-300 ${
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
        {/* LOGO */}
        <div className="flex items-center gap-2 px-2 hover:scale-105 transition-transform cursor-pointer">
          <div className="w-10 h-10 rounded-[14px] bg-blue-600 shadow-clay flex items-center justify-center text-white font-black text-xl rotate-3">
            D
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 ml-1">
            Deraly.id
          </span>
        </div>

        {/* Desktop Links - Amie Clean Style */}
        <div className="hidden md:flex items-center gap-8 font-bold text-slate-500 text-[15px]">
          <Link href="#features" className="hover:text-blue-600 transition-colors">Fitur</Link>
          <Link href="#productivity" className="hover:text-blue-600 transition-colors">Produktivitas</Link>
          <Link href="#pricing" className="hover:text-blue-600 transition-colors">Harga</Link>
        </div>

        {/* CTA - Electric Blue Honk Style */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-slate-500 font-bold text-[15px] hover:text-slate-900 transition-colors px-2">
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
  );
}
