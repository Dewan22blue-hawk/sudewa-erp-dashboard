"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white rounded-[2rem] sm:rounded-[3rem] mx-4 sm:mx-8 my-10 sm:my-20">
      
      {/* Intense glowing core in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[100px] pointer-events-none opacity-50" />
      
      <div className="relative z-10 px-6 py-28 sm:py-40 flex flex-col items-center text-center">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="text-5xl sm:text-7xl font-black tracking-[-0.04em] leading-[1.05] max-w-4xl"
        >
          Siap Meninggalkan Sistem Lama Anda?
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-8 text-xl sm:text-2xl text-slate-400 font-bold max-w-2xl"
        >
          Bergabung bersama puluhan enterprise masa depan. Akses penuh 14 hari. Tanpa komitmen. Tanpa stress.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mt-14"
        >
          <button className="flex items-center gap-3 px-10 py-5 rounded-full bg-white text-slate-900 font-black text-xl shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 transition-all group">
            Mulai Revolusi Sekarang
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
