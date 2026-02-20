export interface PembayaranHutang {
    id: string
    kodeBayar: string
    kodeBeli: string // No Pembelian / Invoice
    tanggal: string
    kasKeluar: string // e.g., "BCA - IDR"
    jumlahBayar: number
    namaSupplier: string // For detail view context
}

export interface PembayaranHutangDetail {
    id: string
    noPembelian: string
    tanggal: string
    namaSupplier: string
    totalBeli: number
    totalBayar: number
    amountHutang: number
    historyPembayaran: PembayaranHutang[]
}
