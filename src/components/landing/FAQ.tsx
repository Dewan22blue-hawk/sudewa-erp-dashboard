"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Apakah Deraly.id aman untuk data finansial perusahaan saya?",
    answer: "Sangat aman. Kami menggunakan standar enkripsi bank (AES-256) baik saat penyimpanan maupun transmisi data. Selain itu, kami melakukan audit keamanan secara reguler dengan pihak ketiga."
  },
  {
    question: "Berapa lama waktu implementasi secara rata-rata?",
    answer: "Berbeda dengan ERP tradisional yang membutuhkan waktu berbulan-bulan, integrasi Deraly.id memakan waktu kurang dari seminggu. Antarmuka yang intuitif juga menghilangkan kebutuhan training panjang untuk staf Anda."
  },
  {
    question: "Apakah saya bisa mengintegrasikan aplikasi lain?",
    answer: "Tentu. Deraly.id lahir dari semangat ekosistem modern. Kami memilki konektor API untuk ratusan tools populer seperti Slack, Google Workspace, SAP, dan Xero dalam satu klik."
  },
  {
    question: "Apa model pembayarannya didasarkan per pengguna?",
    answer: "Kami percaya produktivitas harus tumbuh tanpa batasan penalti. Kami menerapkan skema pembayaran yang disesuaikan berdasarkan volume data dan modul aktif, bukan membebankan biaya per ekstensi jumlah karyawan."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 sm:py-32 bg-[#FAFAFA] font-sans">
      <div className="max-w-4xl mx-auto px-6">
        
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-[-0.02em]">
            Ada Pertanyaan?
          </h2>
          <p className="mt-4 text-xl text-slate-500 font-bold">
            Transparansi penuh tentang bagaimana platform kami bekerja.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div 
                key={index}
                className={`overflow-hidden rounded-3xl border-2 transition-colors duration-300 ${isOpen ? 'bg-white border-blue-500/20 shadow-clay-sm' : 'bg-transparent border-slate-200 hover:border-slate-300 hover:bg-white/50'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 sm:p-8 text-left focus:outline-none"
                >
                  <span className={`text-lg sm:text-xl font-extrabold tracking-tight transition-colors duration-300 ${isOpen ? 'text-blue-600' : 'text-slate-900'}`}>
                    {faq.question}
                  </span>
                  <motion.div 
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex-shrink-0 ml-4 rounded-full bg-slate-100 p-2 text-slate-500"
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    >
                      <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                        <p className="text-lg text-slate-500 leading-relaxed font-semibold">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
