export interface PengeluaranUnit {
    id: string
    noPengeluaran: string
    tanggal: string
    customer: string
    supplier?: string
    keterangan?: string
}

export interface PengeluaranUnitDetail {
    id: string
    pengeluaranId: string
    kodeJual: string
    tipeUnit: string
    warna: string
    noMesin: string
    noRangka: string
    dikirim: boolean
}