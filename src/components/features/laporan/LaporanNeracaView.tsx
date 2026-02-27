import Image from "next/image"

export default function LaporanNeracaView({ data }: any) {

    return (
        <div className="space-y-8 max-w-4xl mx-auto">

            {/* HALAMAN 1: AKTIVA */}
            <div className="bg-white border rounded-xl p-12 shadow-sm relative">

                {/* Header Section */}
                <div className="flex flex-col items-center justify-center mb-8 relative">
                    <Image
                        src="/wajira-logo.png"
                        alt="Wajira Logo"
                        width={80}
                        height={80}
                        className="absolute left-8 top-0 object-contain"
                    />

                    <div className="text-center space-y-1">
                        <h2 className="font-bold text-lg">Laporan Keuangan</h2>
                        <h3 className="font-bold text-base uppercase">PT WAJIRA JAGATRARA MORINDO</h3>
                        <p className="text-sm text-gray-500">Periode: Bulan Januari 2026</p>
                    </div>
                </div>

                <div className="w-full text-xs sm:text-sm">
                    {/* Header AKTIVA */}
                    <div className="bg-[#e6f4ea] text-center font-semibold py-2 w-full mb-2">
                        AKTIVA
                    </div>

                    <div className="px-2">
                        <div className="py-2 text-sm uppercase">AKTIVA LANCAR</div>

                        {/* KAS DAN SETARA KAS */}
                        <div className="py-1 uppercase text-gray-700">KAS DAN SETARA KAS</div>
                        <div className="flex justify-between py-1.5 px-4 text-gray-600 border-b border-gray-100">
                            <span>Kas</span>
                            <span>Rp 730,150,00</span>
                        </div>
                        <div className="flex justify-between py-1.5 px-4 text-gray-600 border-b border-gray-100">
                            <span>Bank BCA</span>
                            <span>Rp 730,150,00</span>
                        </div>
                        <div className="flex justify-between py-1.5 px-4 text-gray-600 border-b border-gray-100">
                            <span>Sub Total</span>
                            <span>Rp 730,150,00</span>
                        </div>

                        {/* PIUTANG */}
                        <div className="py-2 uppercase text-gray-700 mt-2">PIUTANG</div>
                        <div className="flex justify-between py-1.5 px-4 text-gray-600 border-b border-gray-100">
                            <span>Piutang Direksi</span>
                            <span>Rp 730,150,00</span>
                        </div>

                        {/* PERSEDIAAN BARANG DAGANG */}
                        <div className="py-2 uppercase text-gray-700 mt-2">PERSEDIAAN BARANG DAGANG</div>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex justify-between py-1 px-4 text-gray-600 border-b border-gray-50">
                                <span>Honda Vario XX</span>
                                <span>Rp 24,000,000</span>
                            </div>
                        ))}
                        <div className="flex justify-between py-1.5 px-4 text-gray-600 border-b border-gray-100">
                            <span>Sub Total</span>
                            <span>Rp 423,000,000</span>
                        </div>

                        {/* LAINNYA */}
                        <div className="py-2 uppercase text-gray-700 mt-2">LAINNYA</div>
                        <div className="flex justify-between py-1.5 px-4 text-gray-600 border-b border-gray-100">
                            <span>Sewa Gedung</span>
                            <span>Rp 24,000,000</span>
                        </div>
                        <div className="flex justify-between py-1.5 px-4 text-gray-600 border-b border-gray-100">
                            <span>PPn</span>
                            <span>Rp 423,000,000</span>
                        </div>
                        <div className="flex justify-between py-1.5 px-4 text-gray-600 border-b border-gray-100">
                            <span>PPn</span>
                            <span>Rp 423,000,000</span>
                        </div>

                        {/* JUMLAH AKTIVA LANCAR */}
                        <div className="flex justify-between py-2 px-4 bg-gray-200 font-semibold mt-2">
                            <span>JUMLAH AKTIVA LANCAR</span>
                            <span>Rp 730,150,00</span>
                        </div>

                        {/* AKTIVA TETAP */}
                        <div className="py-2 uppercase text-gray-700 mt-2">AKTIVA TETAP</div>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex justify-between py-1 px-4 text-gray-600 border-b border-gray-50">
                                <span>Inventaris Kantor</span>
                                <span>Rp 423,000,000</span>
                            </div>
                        ))}

                        {/* JUMLAH AKTIVA TETAP */}
                        <div className="flex justify-between py-2 px-4 bg-gray-200 font-semibold mt-2">
                            <span>JUMLAH AKTIVA TETAP</span>
                            <span>Rp 730,150,00</span>
                        </div>

                        {/* TOTAL AKTIVA */}
                        <div className="flex justify-between py-2 px-4 bg-[#1a1a1a] text-white font-semibold mt-1">
                            <span>TOTAL AKTIVA</span>
                            <span>Rp 11,200,231,000</span>
                        </div>

                    </div>
                </div>

                <div className="text-center mt-12 text-xs text-gray-400">
                    1
                </div>
            </div>

            {/* HALAMAN 2: PASIVA */}
            <div className="bg-white border rounded-xl p-12 shadow-sm relative">

                {/* Header Section */}
                <div className="flex flex-col items-center justify-center mb-8 relative">
                    <Image
                        src="/wajira-logo.png"
                        alt="Wajira Logo"
                        width={80}
                        height={80}
                        className="absolute left-8 top-0 object-contain"
                    />

                    <div className="text-center space-y-1">
                        <h2 className="font-bold text-lg">Laporan Keuangan</h2>
                        <h3 className="font-bold text-base uppercase">PT WAJIRA JAGATRARA MORINDO</h3>
                        <p className="text-sm text-gray-500">Periode: Bulan Januari 2026</p>
                    </div>
                </div>

                <div className="w-full text-xs sm:text-sm">
                    {/* Header PASIVA */}
                    <div className="bg-[#dbeafe] text-center font-semibold py-2 w-full mb-2">
                        PASIVA
                    </div>

                    <div className="px-2">
                        <div className="py-2 text-sm uppercase">KEWAJIBAN</div>

                        {/* Hutang Atas Usaha */}
                        <div className="py-1 text-gray-700">Hutang Atas Usaha</div>
                        <div className="flex justify-between py-1.5 px-4 text-gray-600 border-b border-gray-100">
                            <span className="pl-2">Pendanaan</span>
                            <span>-</span>
                        </div>
                        <div className="flex justify-between py-1.5 px-4 text-gray-600 border-b border-gray-100">
                            <span className="pl-2">Hutang XX</span>
                            <span>-</span>
                        </div>
                        <div className="flex justify-between py-1.5 px-4 text-gray-600 border-b border-gray-100">
                            <span className="pl-2">Hutang XX</span>
                            <span>Rp 730,150,00</span>
                        </div>

                        <div className="py-1 text-gray-700 border-b border-gray-100">Hutang Kendaraan</div>
                        <div className="py-1 text-gray-700 border-b border-gray-100">Hutang Dagang</div>
                        <div className="py-1 text-gray-700 border-b border-gray-100">Hutang Kendaraan</div>

                        <div className="flex justify-between py-2 px-2 bg-gray-200 font-semibold mt-2">
                            <span>Pendapatan Diterima Dimuka</span>
                            <span>Rp 730,150,00</span>
                        </div>

                        {/* Jumlah Kewajiban */}
                        <div className="py-2 text-gray-700 mt-2">Jumlah Kewajiban</div>
                        <div className="flex justify-between py-1.5 px-4 text-gray-600 border-b border-gray-100">
                            <span className="pl-2">Modal Disetor</span>
                            <span>Rp 24,000,000</span>
                        </div>
                        <div className="flex justify-between py-1.5 px-4 text-gray-600 border-b border-gray-100">
                            <span className="pl-2">Laba (Rugi) Ditahan</span>
                            <span>Rp 24,000,000</span>
                        </div>
                        <div className="flex justify-between py-1.5 px-4 text-gray-600 border-b border-gray-100">
                            <span className="pl-2">Laba (Rugi) Disetor</span>
                            <span>Rp 24,000,000</span>
                        </div>

                        {/* Jumlah Ekuitas */}
                        <div className="flex justify-between py-2 px-2 bg-gray-200 font-semibold mt-2">
                            <span>Jumlah Ekuitas</span>
                            <span>Rp 730,150,00</span>
                        </div>

                        {/* TOTAL PASIVA */}
                        <div className="flex justify-between py-2 px-2 bg-[#1a1a1a] text-white font-semibold mt-1">
                            <span>TOTAL PASIVA</span>
                            <span>Rp 11,200,231,000</span>
                        </div>

                    </div>
                </div>

                {/* Footer Signature */}
                <div className="mt-20 flex justify-end px-12 text-center text-sm">
                    <div className="space-y-24">
                        <p>Yogyakarta, 23 Februari 2026</p>
                        <div className="space-y-1">
                            <p>(ZAIFUDIN YUKRI)</p>
                            <p>Direktur</p>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-12 text-xs text-gray-400">
                    2
                </div>
            </div>

        </div>
    )
}