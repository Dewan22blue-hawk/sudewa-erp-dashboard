// src/@types/purchase.types.ts

export type Currency = "IDR" | "USD"

export interface PurchaseUnit {
    id: string
    purchaseId: string
    typeUnitId: string
    typeUnitName: string

    qty: number
    price: number

    biayaBBN: number
    biayaEkspedisi: number
    biayaLain: number

    hpp: number
    dpp: number
    ppn: number
    total: number
}

export interface Purchase {
    id: string
    code: string
    date: string
    supplierName: string
    companyId: string

    totalDpp: number
    totalPpn: number
    totalBiaya: number
    totalPurchase: number

    totalPaid: number
    remainingPayment: number

    units: PurchaseUnit[]

    createdAt: string
    updatedAt: string
}

/* ============================
   REQUEST TYPES
============================ */

export interface CreatePurchaseRequest {
    date: string
    supplierName: string
    companyId: string

    // Optional initial unit fields
    typeUnitId?: string
    typeUnitName?: string
    qty?: number
    price?: number
    biayaBBN?: number
    biayaEkspedisi?: number
    biayaLain?: number
}

export interface UpdatePurchaseRequest {
    date: string
    supplierName: string
}

export interface PurchaseFormValues {
    supplierName: string
    date: string
    code: string
}

export interface CreatePurchaseUnitRequest {
    purchaseId: string
    typeUnitId: string
    typeUnitName: string
    qty: number
    price: number
    biayaBBN: number
    biayaEkspedisi: number
    biayaLain: number
}

export interface PurchaseListResponse {
    data: Purchase[]
    total: number
}
