import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#FAFAFA] border-t-2 border-slate-100 py-12 sm:py-20 mt-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-8">
        
        {/* Brand Area */}
        <div className="md:col-span-1">
           <div className="flex items-center gap-2 mb-4">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">
               D
             </div>
             <span className="text-xl font-black tracking-tight text-slate-900">
               Deraly.id
             </span>
           </div>
           <p className="text-slate-500 font-bold max-w-xs text-sm">
             Arsitektur ERP tingkat selanjutnya untuk startup dan enterprise hyper-growth modern.
           </p>
        </div>

        {/* Links Area */}
        <div>
          <h4 className="font-extrabold text-slate-900 mb-4 tracking-tight">Produk</h4>
          <ul className="space-y-3 font-semibold text-slate-500 text-sm">
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Fitur</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Integrasi</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Harga</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Changelog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-extrabold text-slate-900 mb-4 tracking-tight">Perusahaan</h4>
          <ul className="space-y-3 font-semibold text-slate-500 text-sm">
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Tentang Kami</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Blog</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Karir</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Kontak</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-extrabold text-slate-900 mb-4 tracking-tight">Legal</h4>
          <ul className="space-y-3 font-semibold text-slate-500 text-sm">
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Kebijakan Privasi</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Syarat Ketentuan</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Keamanan</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t-2 border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-slate-400 font-bold text-sm">
          &copy; {new Date().getFullYear()} Deraly.id. Hak Cipta Dilindungi Undang-Undang.
        </p>
        <div className="flex gap-4">
          {/* Socials placeholder */}
          <div className="w-8 h-8 rounded-full bg-slate-200 hover:bg-blue-600 transition-colors cursor-pointer" />
          <div className="w-8 h-8 rounded-full bg-slate-200 hover:bg-blue-600 transition-colors cursor-pointer" />
          <div className="w-8 h-8 rounded-full bg-slate-200 hover:bg-blue-600 transition-colors cursor-pointer" />
        </div>
      </div>
    </footer>
  );
}
