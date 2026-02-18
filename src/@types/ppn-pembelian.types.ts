export interface PPNPembelian {
    id: string
    kodeBeli: string
    tanggalBeli: string
    supplier: string
    tanggalFPM: string
    masaNSFPM: string
    nsfpmMasukan: string
    qty: number
    tipeUnit: string
    noMesin: string
    noRangka: string
    hargaBeli: number
    biaya: number
    hargaUnit: number
    dppBeli: number
    ppn: number
    paymentBeli: number
}

export type CreatePPNPembelianRequest = Omit<PPNPembelian, "id">
export type UpdatePPNPembelianRequest = PPNPembelian
