export interface PembayaranHutang {
    id: string
    kodeBayar: string
    kodeBeli: string
    tanggal: string
    kasKeluar: string
    jumlahBayar: number
}

export interface PembayaranHutangDetail {
    id: string
    kodeBeli: string
    tanggal: string
    supplier: string
    totalBeli: number
    totalBayar: number
    totalHutang: number
    payments: PembayaranHutang[]
}
