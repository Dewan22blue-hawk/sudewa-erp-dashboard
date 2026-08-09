"use client";

import { useRef } from "react";
import { Network, Zap, ShieldCheck } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Benang Kusut Terurai",
    desc: "Singkirkan integrasi manual dan puluhan spreadsheet paralel. Sistem cerdas secara otomatis menyerap data dari berbagai sumber API bisnis Anda dalam sekejap.",
    icon: Network,
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.6)]", // blue
    color: "text-blue-400",
  },
  {
    id: 2,
    title: "Otomatisasi Berbasis AI",
    desc: "Machine Learning bekerja dalam hitungan logis yang presisi. Menemukan anomali keuangan, memprediksi cashflow, dan memberikan notifikasi sebelum krisis terjadi.",
    icon: Zap,
    glow: "shadow-[0_0_30px_rgba(236,72,153,0.6)]", // pink
    color: "text-pink-400",
  },
  {
    id: 3,
    title: "Keamanan Tanpa Friksi",
    desc: "Sistem Single Sign-On (SSO) tingkat enterprise memastikan hanya orang yang tepat, di waktu yang tepat, memiliki akses kritis. Mulus tanpa mengganggu produktivitas.",
    icon: ShieldCheck,
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.6)]", // emerald/green
    color: "text-emerald-400",
  }
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  

  return (
    <section 
      ref={containerRef} 
      className="relative w-full bg-[#030712] py-32 sm:py-48 overflow-hidden z-10" // Pitch black/deep navy (slate-950)
    >
      {/* Dark Vibrant Background Accents */}
      <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-fuchsia-900/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-20">
        
        <div className="text-center mb-24 lg:mb-40">
          <h2
            className="text-4xl sm:text-6xl font-black text-white tracking-[-0.03em]"
          >
            Visi Masa Depan. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-fuchsia-500">
              Satu Kesatuan.
            </span>
          </h2>
          <p className="mt-8 text-xl text-slate-400 font-bold max-w-2xl mx-auto">
            Garis waktu bagaimana kami mendefinisikan ulang batas kemustahilan produktivitas operasional.
          </p>
        </div>

        <div className="relative">
          {/* Tracking Background Line (Dim) */}
          <div className="absolute left-[39px] sm:left-[47px] top-0 bottom-0 w-1 bg-slate-800 rounded-full" />
          
          {/* Glowing Animated Scroll Line connecting steps vertically */}
          <div
            className="absolute left-[39px] sm:left-[47px] top-0 w-1 bg-gradient-to-b from-blue-500 via-pink-500 to-emerald-500 rounded-full origin-top shadow-[0_0_15px_rgba(59,130,246,0.8)]" 
          />

          <div className="flex flex-col gap-24 sm:gap-40">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div 
                  key={step.id}
                  className="relative pl-24 sm:pl-32"
                >
                  {/* Glowing Icon Point */}
                  <div 
                     className={`absolute left-4 sm:left-6 -translate-x-1/2 top-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0a0a0a] border-4 border-slate-800 flex items-center justify-center z-10 
                                transition-all duration-700 ease-out`}
                  >
                    <div className="w-full h-full rounded-full flex items-center justify-center relative">
                      {/* Active inner glow */}
                      <div className={`absolute inset-0 rounded-full blur-md opacity-0 transition-opacity duration-300`} />
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${step.color} relative z-20`} />
                    </div>
                  </div>

                  <div className="pt-2 sm:pt-3">
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">{step.title}</h3>
                    <p className="text-xl text-slate-400 leading-relaxed font-semibold max-w-xl">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
