"use client";

import { motion, Variants } from "framer-motion";
import { Layers, CalendarCheck, BoxSelect, PartyPopper, CheckCircle2 } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 18 
    } 
  },
};

export default function BentoFeatures() {
  return (
    <section className="relative py-24 sm:py-32 bg-[#FAFAFA] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        
        <div className="text-center mb-16 sm:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-[4rem] font-black text-slate-900 tracking-[-0.03em] leading-tight"
          >
            Produktivitas,<br className="sm:hidden"/> Meningkat Drastis.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mt-6 text-xl sm:text-2xl text-slate-500 max-w-2xl mx-auto font-bold px-4"
          >
            Widget visual indah. Alur kerja natural. Kecepatan tanpa tanding.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px] sm:auto-rows-[300px]"
        >

          {/* CARD 1: Amie Soft Pink */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, rotate: -1 }}
            className="relative md:col-span-2 md:row-span-2 rounded-[2.5rem] sm:rounded-[3.5rem] bg-[#FFF0F4] border-4 border-white shadow-clay-sm p-8 flex flex-col justify-between overflow-hidden group cursor-pointer transition-transform duration-300"
          >
            <div className="z-10 bg-white/40 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center text-pink-500 shadow-inner mb-4">
              <CalendarCheck className="w-8 h-8" />
            </div>
            <div className="z-10 mt-auto">
              <h3 className="text-3xl sm:text-4xl font-black text-pink-950 tracking-tight leading-tight mb-3">
                Penjadwalan <br/>Otomatis
              </h3>
              <p className="text-pink-900/70 font-bold text-lg max-w-sm">
                Ketik apa yang ingin Anda lakukan, dan kami akan menyusunnya rapi di kalender Anda. Ajaib.
              </p>
            </div>
            {/* Decal */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-pink-200/50 rounded-full blur-3xl opacity-70 group-hover:scale-125 transition-transform duration-700" />
          </motion.div>

          {/* CARD 2: Pastel Sky Blue */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, rotate: 1 }}
            className="relative md:col-span-2 row-span-1 rounded-[2.5rem] sm:rounded-[3.5rem] bg-[#F0F8FF] border-4 border-white shadow-clay-sm p-8 flex flex-col justify-center cursor-pointer transition-transform duration-300 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 z-10 w-full h-full relative">
              <div className="bg-white/60 backdrop-blur-md w-14 h-14 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-blue-950 mb-2 tracking-tight">Tumpukan Fokus</h3>
                <p className="text-blue-900/60 font-bold text-[17px]">
                  Tumpuk tugas Anda secara visual dan selesaikan satu per satu tanpa distraksi.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CARD 3: Soft Amber/Orange */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative md:col-span-1 row-span-1 rounded-[2.5rem] sm:rounded-[3.5rem] bg-[#FFF8EB] border-4 border-white shadow-clay-sm p-8 flex flex-col justify-between cursor-pointer transition-transform duration-300"
          >
            <div className="bg-white/60 backdrop-blur-md w-14 h-14 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner mb-4">
              <PartyPopper className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-amber-950 tracking-tight">Rayakan</h3>
              <p className="text-amber-900/60 font-bold mt-2">Konfeti untuk setiap target dicapai.</p>
            </div>
          </motion.div>

          {/* CARD 4: Soft Purple */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative md:col-span-1 row-span-1 rounded-[2.5rem] sm:rounded-[3.5rem] bg-[#F6F2FF] border-4 border-white shadow-clay-sm p-8 flex flex-col justify-between cursor-pointer transition-transform duration-300"
          >
            <div className="bg-white/60 backdrop-blur-md w-14 h-14 rounded-2xl flex items-center justify-center text-purple-500 shadow-inner mb-4">
              <BoxSelect className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-purple-950 tracking-tight">Widget Cerdas</h3>
              <p className="text-purple-900/60 font-bold mt-2">Data penting selalu dalam genggaman.</p>
            </div>
          </motion.div>

          {/* CARD 5: Electric Blue (Honk Vibe) Bottom Wide Card */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-3 lg:col-span-4 row-span-1 min-h-[auto] sm:min-h-[140px] rounded-[2.5rem] sm:rounded-[3.5rem] bg-blue-600 border-4 border-blue-500 shadow-[0_20px_40px_rgba(37,99,235,0.2)] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between text-white overflow-hidden relative"
          >
            {/* Playful background texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1.5px)] bg-[size:12px_12px]" />

            <div className="flex items-center gap-4 mb-6 md:mb-0 text-center sm:text-left z-10">
               <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">
                 <CheckCircle2 className="w-8 h-8 text-white fill-white/20" />
               </div>
               <h3 className="text-3xl sm:text-4xl font-black tracking-[-0.03em]">Siap melesat cepat?</h3>
            </div>
            
            <div className="z-10 text-center md:text-right">
              <button className="px-8 py-4 sm:px-10 sm:py-5 rounded-3xl bg-white text-blue-600 hover:scale-105 hover:bg-slate-50 transition-all font-black text-xl shadow-xl hover:rotate-1">
                Coba Sekarang
              </button>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
