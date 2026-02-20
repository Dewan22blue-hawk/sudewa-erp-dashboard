export interface PenerimaanPiutang {
    id: string
    kodeTerima: string
    kodeJual: string
    tanggalTerima: string
    kasMasuk: string
    jumlahTerima: number
}

export interface PenerimaanPiutangDetail {
    id: string
    kodeJual: string
    tanggal: string
    customer: string
    totalJual: number
    totalTerima: number
    totalPiutang: number
    payments: PenerimaanPiutang[]
}
