import Image from "next/image"

export default function LaporanRugiLabaView({ data }: any) {

    return (
        <div className="bg-white border rounded-xl p-12 max-w-4xl mx-auto shadow-sm">

            {/* Header Section */}
            <div className="flex flex-col items-center justify-center mb-10 relative">
                {/* Logo */}
                <Image
                    src="/wajira-logo.png"
                    alt="Wajira Logo"
                    width={80}
                    height={80}
                    className="absolute left-8 top-0 object-contain"
                />

                <div className="text-center space-y-1">
                    <p className="text-xs uppercase tracking-wider text-gray-600">Koreksi Negatif</p>
                    <h2 className="font-bold text-lg">LAPORAN RUGI LABA</h2>
                    <p className="font-bold text-sm">PT WAJIRA JAGATRARA MORINDO</p>
                    <p className="text-xs text-gray-500">Periode: Bulan Januari 2026</p>
                </div>
            </div>

            {/* Table Section */}
            <div className="w-full text-xs sm:text-sm border-t border-gray-200 pt-6">

                {/* PENDAPATAN */}
                <div className="mb-6">
                    <div className="font-semibold py-2">PENDAPATAN</div>
                    <div className="flex justify-between py-1.5 px-4 text-gray-600">
                        <span>Penjualan Motor XX</span>
                        <span>Rp 13,200,231,000</span>
                    </div>
                    <div className="flex justify-between py-2 px-4 bg-gray-200 font-semibold mt-1">
                        <span>JUMLAH</span>
                        <span>Rp 13,200,231,000</span>
                    </div>
                </div>

                {/* HARGA POKOK PENJUALAN */}
                <div className="mb-6">
                    <div className="font-semibold py-2">HARGA POKOK PENJUALAN</div>
                    <div className="flex justify-between py-1.5 px-4 text-gray-600">
                        <span>Harga Pokok Penjualan Motor XX</span>
                        <span>Rp 730,150,000</span>
                    </div>
                    <div className="flex justify-between py-2 px-4 bg-gray-200 font-semibold mt-1">
                        <span>JUMLAH</span>
                        <span>Rp 730,150,000</span>
                    </div>
                    <div className="flex justify-between py-2 px-4 bg-[#1a1a1a] text-white font-semibold mt-1">
                        <span>LABA KOTOR</span>
                        <span>Rp 11,200,231,000</span>
                    </div>
                </div>

                {/* BEBAN ADMINISTRASI & UMUM */}
                <div className="mb-6">
                    <div className="flex justify-between font-semibold py-2 uppercase">
                        <span>Beban Administrasi & Umum</span>
                        <span>Rp 0</span>
                    </div>
                    <div className="flex justify-between py-2 px-4 bg-gray-200 font-semibold mt-1">
                        <span>JUMLAH</span>
                        <span>Rp 0</span>
                    </div>
                    <div className="flex justify-between py-2 px-4 bg-[#1a1a1a] text-white font-semibold mt-1">
                        <span>LABA (RUGI) OPERASIONAL</span>
                        <span>Rp 11,200,231,000</span>
                    </div>
                </div>

                {/* PENDAPATAN (BEBAN) DI LUAR USAHA */}
                <div className="mb-6">
                    <div className="flex justify-between font-semibold py-2 uppercase">
                        <span>Pendapatan (Beban) Di Luar Usaha</span>
                        <span>Rp 12,000,000</span>
                    </div>
                    <div className="flex justify-between py-2 px-4 bg-gray-200 font-semibold mt-1">
                        <span>JUMLAH</span>
                        <span>Rp 12,000,000</span>
                    </div>
                    <div className="flex justify-between py-2 px-4 bg-[#1a1a1a] text-white font-semibold mt-1">
                        <span>LABA (RUGI) BERSIH SEBELUM PAJAK</span>
                        <span>Rp 11,200,231,000</span>
                    </div>
                </div>

                {/* KOREKSI FISKAL */}
                <div className="mb-6">
                    <div className="font-semibold py-2">KOREKSI FISKAL</div>
                    <div className="flex justify-between py-1.5 px-4 border-b border-gray-100 text-gray-600">
                        <span>Koreksi Positif</span>
                        <span>0</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-4 text-gray-600">
                        <span className="pl-4">Biaya Administrasi Bank</span>
                        <span>Rp 30,000</span>
                    </div>
                    <div className="flex justify-between py-2 px-4 bg-gray-200 font-semibold mt-1">
                        <span>JUMLAH</span>
                        <span>Rp 30,000</span>
                    </div>

                    <div className="flex justify-between py-2 px-4 bg-gray-200 font-semibold mt-6">
                        <span>LABA (RUGI) BERSIH SEBELUM PAJAK</span>
                        <span>Rp 30,000,000</span>
                    </div>
                    <div className="flex justify-between py-2 px-4 bg-[#1a1a1a] text-white font-semibold mt-1">
                        <span>LABA (RUGI) BERSIH SETELAH PAJAK</span>
                        <span>Rp 300,000,000</span>
                    </div>
                </div>

            </div>

            {/* Pagination Footer */}
            <div className="text-center mt-12 text-xs text-gray-400">
                1
            </div>

        </div>
    )
}