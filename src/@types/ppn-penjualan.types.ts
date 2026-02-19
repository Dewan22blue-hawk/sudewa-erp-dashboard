export interface PPNPenjualan {
    id: string
    kodeJual: string
    tanggalJual: string
    customer: string
    tanggalFPK: string
    masaNSFPK: string
    nsfpkKeluaran: string
    qty: number
    tipeUnit: string
    noMesin: string
    noRangka: string
    hargaJual: number
    biaya: number
    hargaUnit: number
    dppJual: number
    ppn: number
    paymentJual: number
}

export type CreatePPNPenjualanRequest = Omit<PPNPenjualan, "id">
export type UpdatePPNPenjualanRequest = PPNPenjualan
