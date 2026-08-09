"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    author: "Budi Susanto",
    role: "CEO, TechPrima Makmur",
    story: "Saya tidak pernah berpikir antarmuka ERP bisa sebaik ini. Deraly.id sepenuhnya mengurangi waktu training tim operasional kami hingga 80%.",
    color: "bg-blue-50 text-blue-900 border-white/60"
  },
  {
    author: "Rina Wijaya",
    role: "Direktur Keuangan",
    story: "Warna pastel dan micro-interactions seakan meredam stres setiap melihat angka laporan kompleks. Sangat Menyenangkan!",
    color: "bg-pink-50 text-pink-900 border-white/60"
  },
  {
    author: "Andi Permana",
    role: "Project Manager",
    story: "Benar-benar luar biasa. Saya bisa mengelola ratusan Purchase Order dari atas ranjang menggunakan iPad tanpa hambatan apapun.",
    color: "bg-amber-50 text-amber-900 border-white/60"
  },
  {
    author: "Sara Anggraeni",
    role: "Head of Operations",
    story: "Widget visual yang cerdas adalah game-changer. Saya mendapatkan apa yang saya butuhkan dalam sekilas tanpa harus melalui puluhan klik.",
    color: "bg-purple-50 text-purple-900 border-white/60"
  }
];

const displayData = [...testimonials, ...testimonials];

export default function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32 bg-[#FAFAFA] overflow-hidden border-t-2 border-white">
      <div className="absolute inset-y-0 left-0 w-16 sm:w-48 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 sm:w-48 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10 pointer-events-none" />

      <div className="text-center mb-16 sm:mb-20 px-4 relative z-20">
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-[-0.03em]">Kesan Mereka</h2>
        <p className="mt-4 text-xl sm:text-2xl text-slate-500 font-bold">Perusahaan modern beralih ke masa depan.</p>
      </div>

      <div className="flex w-fit overflow-hidden py-10">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
          className="flex flex-nowrap items-center gap-6 sm:gap-10 px-8 min-w-max"
        >
          {displayData.map((testi, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.05, y: -10 }}
              className={`w-[320px] sm:w-[400px] shrink-0 p-8 sm:p-10 rounded-[3rem] ${testi.color} shadow-clay-sm border-2 flex flex-col justify-between min-h-[300px] cursor-pointer`}
            >
              <p className="text-lg sm:text-xl font-bold leading-relaxed mb-8 opacity-80">&quot;{testi.story}&quot;</p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-inner flex items-center justify-center font-black text-xl sm:text-2xl opacity-60">
                  {testi.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-lg sm:text-xl tracking-tight">{testi.author}</h4>
                  <p className="text-sm sm:text-base font-bold opacity-60">{testi.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
