export interface TransaksiKas {
    id: number;
    tanggal: string; // "31/12/2026"
    notaReff: string; // "TRX-011"
    keterangan: string; // "Terima tagihan John Doe"
    pemasukan: number | null; // 25000000 or null
    pengeluaran: number | null; // 900000 or null
}

export const DUMMY_TRANSAKSI_KAS: TransaksiKas[] = [
    { id: 1, tanggal: '31/12/2026', notaReff: 'TRX-011', keterangan: 'Terima tagihan John Doe', pemasukan: 25000000, pengeluaran: null },
    { id: 2, tanggal: '31/12/2026', notaReff: 'TRX-011', keterangan: 'Pembayaran Jasa Tukang', pemasukan: null, pengeluaran: 900000 },
    { id: 3, tanggal: '31/12/2026', notaReff: 'TRX-011', keterangan: 'Pembayaran Listrik Bulanan', pemasukan: null, pengeluaran: 1500000 },
    { id: 4, tanggal: '31/12/2026', notaReff: 'TRX-011', keterangan: 'Pembayaran Listrik Bulanan', pemasukan: null, pengeluaran: 1500000 },
    { id: 5, tanggal: '31/12/2026', notaReff: 'TRX-011', keterangan: 'Terima tagihan John Doe', pemasukan: 25000000, pengeluaran: null },
    { id: 6, tanggal: '31/12/2026', notaReff: 'TRX-011', keterangan: 'Pembayaran Listrik Bulanan', pemasukan: null, pengeluaran: 1500000 },
];

export const DUMMY_NERACA: TransaksiKas[] = [
    { id: 1, tanggal: '05/01/2027', notaReff: 'NRC-101', keterangan: 'Pencairan Deposito Bank', pemasukan: 150000000, pengeluaran: null },
    { id: 2, tanggal: '06/01/2027', notaReff: 'NRC-102', keterangan: 'Pembelian Aset Fisik (Komputer)', pemasukan: null, pengeluaran: 35000000 },
    { id: 3, tanggal: '10/01/2027', notaReff: 'NRC-103', keterangan: 'Injeksi Modal Saham', pemasukan: 500000000, pengeluaran: null },
];

export const DUMMY_PPN_MASUKAN: TransaksiKas[] = [
    { id: 1, tanggal: '12/02/2027', notaReff: 'PM-990', keterangan: 'Faktur Pajak Pembelian Server', pemasukan: 4500000, pengeluaran: null },
    { id: 2, tanggal: '15/02/2027', notaReff: 'PM-991', keterangan: 'Faktur Pajak ATK Kantor', pemasukan: 110000, pengeluaran: null },
];

export const DUMMY_PPN_KELUARAN: TransaksiKas[] = [
    { id: 1, tanggal: '20/02/2027', notaReff: 'PK-010', keterangan: 'Faktur Pajak Penjualan Layanan Premium', pemasukan: null, pengeluaran: 11000000 },
    { id: 2, tanggal: '22/02/2027', notaReff: 'PK-011', keterangan: 'Faktur Pajak Maintenance', pemasukan: null, pengeluaran: 2200000 },
];

export const DUMMY_PPN_PERTAHUN: TransaksiKas[] = [
    { id: 1, tanggal: '31/12/2027', notaReff: 'SPT-Tahunan', keterangan: 'Rekapitulasi SPT Masa PPN Jan-Des 2027', pemasukan: 65000000, pengeluaran: 24000000 },
];
