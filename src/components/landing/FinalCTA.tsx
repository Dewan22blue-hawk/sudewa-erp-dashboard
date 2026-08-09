"use client";

import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white rounded-[2rem] sm:rounded-[3rem] mx-4 sm:mx-8 my-10 sm:my-20">
      
      {/* Intense glowing core in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[100px] pointer-events-none opacity-50" />
      
      <div className="relative z-10 px-6 py-28 sm:py-40 flex flex-col items-center text-center">
        <h2
          className="text-4xl min-[400px]:text-5xl sm:text-6xl md:text-7xl font-black tracking-[-0.04em] leading-[1.05] max-w-4xl"
        >
          Siap Meninggalkan Sistem Lama Anda?
        </h2>
        
        <p
          className="mt-8 text-xl sm:text-2xl text-slate-400 font-bold max-w-2xl"
        >
          Bergabung bersama puluhan enterprise masa depan. Akses penuh 14 hari. Tanpa komitmen. Tanpa stress.
        </p>
        
        <div
          className="mt-14"
        >
          <button className="flex items-center gap-3 px-10 py-5 rounded-full bg-white text-slate-900 font-black text-xl shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 transition-all group">
            Mulai Revolusi Sekarang
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
