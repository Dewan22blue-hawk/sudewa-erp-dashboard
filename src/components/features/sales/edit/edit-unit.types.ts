/**
 * Edit Unit Types - EXACT dari Figma
 */

export interface EditUnitFormData {
    // Main fields
    tipeUnit: string
    qty?: number

    // Harga section
    harga: number

    // Satuan section (2 columns: Satuan | Total)
    hppSatuan: number
    totalHpp: number
    dppSatuan: number
    totalDpp: number
    ppnSatuan: number
    totalPpn: number

    // Biaya section
    biayaBbn: number
    biayaEkspedisi: number
    biayaLain: number
}

export interface ProductOption {
    value: string
    label: string
}

export interface EditUnitData extends EditUnitFormData {
    id: string
    invoiceNumber: string
}
