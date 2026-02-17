export interface UnitItem {
    id: string
    color: string
    engineNumber: string
    chassisNumber: string
}

export interface SalesDetail {
    id: string
    kodeJual: string // Invoice Number
    tanggal: string
    customer: string
    tipeUnit: string

    // Pricing
    hargaSatuan: number
    qty: number
    totalDpp: number

    // Additional Costs
    biayaBbn: number
    biayaEkspedisi: number
    biayaLain: number
    totalHpp: number
    totalPpn: number

    // Grand Total
    totalJual: number

    // Units
    units: UnitItem[]
}
