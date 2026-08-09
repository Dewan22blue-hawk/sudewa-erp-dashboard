"use client";

import { motion } from "framer-motion";

const placeholderLogos = [
  "Acme Corp", "Lumina SaaS", "Nexus Logistics", "Velocity ERP", "Quantum Finance",
  "Acme Corp", "Lumina SaaS", "Nexus Logistics", "Velocity ERP", "Quantum Finance"
];

export default function TrustedByMarquee() {
  return (
    <section className="relative py-12 sm:py-16 overflow-hidden bg-slate-50 flex flex-col justify-center border-t border-b border-white/50">
      <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
      
      <p className="text-center text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 sm:mb-8 z-20">
        Dipercaya oleh Perusahaan Modern
      </p>

      <div className="flex w-fit overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          className="flex flex-nowrap items-center gap-10 sm:gap-16 md:gap-32 px-6 sm:px-8 min-w-max"
        >
          {placeholderLogos.map((logo, idx) => (
            <div 
              key={idx} 
              className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-300 opacity-60 mix-blend-multiply flex items-center justify-center shrink-0"
            >
              {logo}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
