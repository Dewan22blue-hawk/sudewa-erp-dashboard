// src/services/purchase.service.ts

import {
    Purchase,
    PurchaseUnit,
    CreatePurchaseRequest,
    UpdatePurchaseRequest,
    CreatePurchaseUnitRequest
} from "@/@types/purchase.types"

import { nanoid } from "nanoid"

let purchases: Purchase[] = [
    {
        id: "pch-001",
        code: "PBL-2024-0001",
        date: "2024-02-01",
        supplierName: "PT. Maju Jaya Motor",
        companyId: "1",
        totalDpp: 450000000,
        totalPpn: 49500000,
        totalBiaya: 502500000,
        totalPurchase: 502500000,
        totalPaid: 200000000,
        remainingPayment: 302500000,
        units: [
            {
                id: "unit-001-1",
                purchaseId: "pch-001",
                typeUnitId: "type-a",
                typeUnitName: "Honda CR-V 2023",
                qty: 1,
                price: 450000000,
                biayaBBN: 2000000,
                biayaEkspedisi: 1000000,
                biayaLain: 0,
                hpp: 502500000,
                dpp: 450000000,
                ppn: 49500000,
                total: 502500000
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "pch-002",
        code: "PBL-2024-0002",
        date: "2024-02-05",
        supplierName: "CV. Berkah Abadi",
        companyId: "1",
        totalDpp: 300000000,
        totalPpn: 33000000,
        totalBiaya: 335000000,
        totalPurchase: 335000000,
        totalPaid: 335000000,
        remainingPayment: 0,
        units: [
            {
                id: "unit-002-1",
                purchaseId: "pch-002",
                typeUnitId: "type-b",
                typeUnitName: "Toyota Raize GR",
                qty: 1,
                price: 300000000,
                biayaBBN: 1500000,
                biayaEkspedisi: 500000,
                biayaLain: 0,
                hpp: 335000000,
                dpp: 300000000,
                ppn: 33000000,
                total: 335000000
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "pch-003",
        code: "PBL-2024-0003",
        date: "2024-02-10",
        supplierName: "Pak Budi Santoso",
        companyId: "1",
        totalDpp: 150000000,
        totalPpn: 16500000,
        totalBiaya: 168000000,
        totalPurchase: 168000000,
        totalPaid: 0,
        remainingPayment: 168000000,
        units: [
            {
                id: "unit-003-1",
                purchaseId: "pch-003",
                typeUnitId: "type-c",
                typeUnitName: "Daihatsu Rocky",
                qty: 1,
                price: 150000000,
                biayaBBN: 1000000,
                biayaEkspedisi: 500000,
                biayaLain: 0,
                hpp: 168000000,
                dpp: 150000000,
                ppn: 16500000,
                total: 168000000
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "pch-004",
        code: "PBL-2024-0004",
        date: "2024-02-12",
        supplierName: "PT. Auto 2000",
        companyId: "1",
        totalDpp: 800000000,
        totalPpn: 88000000,
        totalBiaya: 893000000,
        totalPurchase: 893000000,
        totalPaid: 400000000,
        remainingPayment: 493000000,
        units: [
            {
                id: "unit-004-1",
                purchaseId: "pch-004",
                typeUnitId: "type-d",
                typeUnitName: "Toyota Fortuner VRZ",
                qty: 1,
                price: 550000000,
                biayaBBN: 3000000,
                biayaEkspedisi: 1000000,
                biayaLain: 0,
                hpp: 614500000,
                dpp: 550000000,
                ppn: 60500000,
                total: 614500000
            },
            {
                id: "unit-004-2",
                purchaseId: "pch-004",
                typeUnitId: "type-e",
                typeUnitName: "Toyota Innova Zenix",
                qty: 1,
                price: 250000000,
                biayaBBN: 500000,
                biayaEkspedisi: 500000,
                biayaLain: 0,
                hpp: 278500000,
                dpp: 250000000,
                ppn: 27500000,
                total: 278500000
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "pch-005",
        code: "PBL-2024-0005",
        date: "2024-02-15",
        supplierName: "Ibu Siti Aminah",
        companyId: "1",
        totalDpp: 120000000,
        totalPpn: 13200000,
        totalBiaya: 134000000,
        totalPurchase: 134000000,
        totalPaid: 134000000,
        remainingPayment: 0,
        units: [
            {
                id: "unit-005-1",
                purchaseId: "pch-005",
                typeUnitId: "type-f",
                typeUnitName: "Honda Brio Satya",
                qty: 1,
                price: 120000000,
                biayaBBN: 500000,
                biayaEkspedisi: 300000,
                biayaLain: 0,
                hpp: 134000000,
                dpp: 120000000,
                ppn: 13200000,
                total: 134000000
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "pch-006",
        code: "PBL-2024-0006",
        date: "2024-02-18",
        supplierName: "CV. Abadi Jaya",
        companyId: "1",
        totalDpp: 650000000,
        totalPpn: 71500000,
        totalBiaya: 725000000,
        totalPurchase: 725000000,
        totalPaid: 725000000,
        remainingPayment: 0,
        units: [
            {
                id: "unit-006-1",
                purchaseId: "pch-006",
                typeUnitId: "type-g",
                typeUnitName: "Mitsubishi Pajero Sport",
                qty: 1,
                price: 650000000,
                biayaBBN: 3500000,
                biayaEkspedisi: 0,
                biayaLain: 0,
                hpp: 725000000,
                dpp: 650000000,
                ppn: 71500000,
                total: 725000000
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "pch-007",
        code: "PBL-2024-0007",
        date: "2024-02-20",
        supplierName: "PT. Sinar Mas",
        companyId: "1",
        totalDpp: 280000000,
        totalPpn: 30800000,
        totalBiaya: 312000000,
        totalPurchase: 312000000,
        totalPaid: 100000000,
        remainingPayment: 212000000,
        units: [
            {
                id: "unit-007-1",
                purchaseId: "pch-007",
                typeUnitId: "type-h",
                typeUnitName: "Suzuki Jimny 5 Door",
                qty: 1,
                price: 280000000,
                biayaBBN: 1200000,
                biayaEkspedisi: 0,
                biayaLain: 0,
                hpp: 312000000,
                dpp: 280000000,
                ppn: 30800000,
                total: 312000000
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "pch-008",
        code: "PBL-2024-0008",
        date: "2024-02-22",
        supplierName: "Bpk. Hartono",
        companyId: "1",
        totalDpp: 1100000000,
        totalPpn: 121000000,
        totalBiaya: 1225000000,
        totalPurchase: 1225000000,
        totalPaid: 1225000000,
        remainingPayment: 0,
        units: [
            {
                id: "unit-008-1",
                purchaseId: "pch-008",
                typeUnitId: "type-i",
                typeUnitName: "Toyota Alphard HEV",
                qty: 1,
                price: 1100000000,
                biayaBBN: 4000000,
                biayaEkspedisi: 0,
                biayaLain: 0,
                hpp: 1225000000,
                dpp: 1100000000,
                ppn: 121000000,
                total: 1225000000
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "pch-009",
        code: "PBL-2024-0009",
        date: "2024-02-25",
        supplierName: "Ibu Ratna Sari",
        companyId: "1",
        totalDpp: 90000000,
        totalPpn: 9900000,
        totalBiaya: 101000000,
        totalPurchase: 101000000,
        totalPaid: 50000000,
        remainingPayment: 51000000,
        units: [
            {
                id: "unit-009-1",
                purchaseId: "pch-009",
                typeUnitId: "type-j",
                typeUnitName: "Daihatsu Ayla",
                qty: 1,
                price: 90000000,
                biayaBBN: 1100000,
                biayaEkspedisi: 0,
                biayaLain: 0,
                hpp: 101000000,
                dpp: 90000000,
                ppn: 9900000,
                total: 101000000
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "pch-010",
        code: "PBL-2024-0010",
        date: "2024-02-28",
        supplierName: "PT. Mega Mobil",
        companyId: "1",
        totalDpp: 400000000,
        totalPpn: 44000000,
        totalBiaya: 446000000,
        totalPurchase: 446000000,
        totalPaid: 0,
        remainingPayment: 446000000,
        units: [
            {
                id: "unit-010-1",
                purchaseId: "pch-010",
                typeUnitId: "type-k",
                typeUnitName: "Honda HR-V SE",
                qty: 1,
                price: 400000000,
                biayaBBN: 2000000,
                biayaEkspedisi: 0,
                biayaLain: 0,
                hpp: 446000000,
                dpp: 400000000,
                ppn: 44000000,
                total: 446000000
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
]

/* =====================================
   UTILITIES
===================================== */

function generatePurchaseCode(): string {
    const now = new Date()
    const year = now.getFullYear()
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")

    return `PBL-${year}-${random}`
}

function calculateUnitTotals(unit: CreatePurchaseUnitRequest): PurchaseUnit {
    const dpp = unit.price * unit.qty
    const ppn = dpp * 0.11
    const total =
        dpp +
        ppn +
        unit.biayaBBN +
        unit.biayaEkspedisi +
        unit.biayaLain

    return {
        id: nanoid(),
        purchaseId: unit.purchaseId,
        typeUnitId: unit.typeUnitId,
        typeUnitName: unit.typeUnitName,
        qty: unit.qty,
        price: unit.price,
        biayaBBN: unit.biayaBBN,
        biayaEkspedisi: unit.biayaEkspedisi,
        biayaLain: unit.biayaLain,
        hpp: total,
        dpp,
        ppn,
        total
    }
}

function recalculatePurchase(purchase: Purchase): Purchase {
    const totalDpp = purchase.units.reduce((acc, u) => acc + u.dpp, 0)
    const totalPpn = purchase.units.reduce((acc, u) => acc + u.ppn, 0)
    const totalBiaya = purchase.units.reduce((acc, u) => acc + u.total, 0)

    const remainingPayment = totalBiaya - purchase.totalPaid

    return {
        ...purchase,
        totalDpp,
        totalPpn,
        totalBiaya,
        totalPurchase: totalBiaya,
        remainingPayment
    }
}

/* =====================================
   SERVICE METHODS
===================================== */

export const purchaseService = {
    async getPurchases(companyId: string): Promise<Purchase[]> {
        return purchases.filter(p => p.companyId === companyId)
    },

    async getPurchaseById(id: string): Promise<Purchase | undefined> {
        return purchases.find(p => p.id === id)
    },

    async createPurchase(payload: CreatePurchaseRequest): Promise<Purchase> {
        const newPurchase: Purchase = {
            id: nanoid(),
            code: generatePurchaseCode(),
            date: payload.date,
            supplierName: payload.supplierName,
            companyId: payload.companyId,
            totalDpp: 0,
            totalPpn: 0,
            totalBiaya: 0,
            totalPurchase: 0,
            totalPaid: 0,
            remainingPayment: 0,
            units: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        // Handle initial unit creation if present
        if (payload.typeUnitId && payload.qty) {
            const calculatedUnit = calculateUnitTotals({
                purchaseId: newPurchase.id,
                typeUnitId: payload.typeUnitId,
                typeUnitName: payload.typeUnitName || payload.typeUnitId, // Fallback
                qty: payload.qty,
                price: payload.price || 0,
                biayaBBN: payload.biayaBBN || 0,
                biayaEkspedisi: payload.biayaEkspedisi || 0,
                biayaLain: payload.biayaLain || 0
            })

            newPurchase.units.push(calculatedUnit)

            // Recalculate purchase totals
            const totalDpp = newPurchase.units.reduce((acc: number, u: PurchaseUnit) => acc + u.dpp, 0)
            const totalPpn = newPurchase.units.reduce((acc: number, u: PurchaseUnit) => acc + u.ppn, 0)
            const totalBiaya = newPurchase.units.reduce((acc: number, u: PurchaseUnit) => acc + u.total, 0)

            newPurchase.totalDpp = totalDpp
            newPurchase.totalPpn = totalPpn
            newPurchase.totalBiaya = totalBiaya
            newPurchase.totalPurchase = totalBiaya
            newPurchase.remainingPayment = totalBiaya // Assuming no payment yet
        }

        purchases = [...purchases, newPurchase]
        return newPurchase
    },

    async updatePurchase(
        id: string,
        payload: UpdatePurchaseRequest
    ): Promise<Purchase> {
        purchases = purchases.map(p =>
            p.id === id
                ? {
                    ...p,
                    ...payload,
                    updatedAt: new Date().toISOString()
                }
                : p
        )

        const updated = purchases.find(p => p.id === id)
        if (!updated) throw new Error("Purchase not found")
        return updated
    },

    async deletePurchase(id: string): Promise<void> {
        purchases = purchases.filter(p => p.id !== id)
    },

    async addUnit(
        payload: CreatePurchaseUnitRequest
    ): Promise<Purchase> {
        const purchase = purchases.find(p => p.id === payload.purchaseId)
        if (!purchase) throw new Error("Purchase not found")

        const calculatedUnit = calculateUnitTotals(payload)

        const updatedPurchase = recalculatePurchase({
            ...purchase,
            units: [...purchase.units, calculatedUnit]
        })

        purchases = purchases.map(p =>
            p.id === purchase.id ? updatedPurchase : p
        )

        return updatedPurchase
    },

    async updatePayment(
        // Payment update logic
        id: string,
        payload: { bca: number; bcaUsd: number; cash: number }
    ): Promise<Purchase> {
        const purchase = purchases.find(p => p.id === id)
        if (!purchase) throw new Error("Purchase not found")

        const totalPaid =
            (payload.bca || 0) +
            (payload.bcaUsd || 0) +
            (payload.cash || 0)

        const updated = recalculatePurchase({
            ...purchase,
            totalPaid
        })

        purchases = purchases.map(p =>
            p.id === id ? updated : p
        )

        return updated
    },

    async deleteUnit(purchaseId: string, unitId: string): Promise<Purchase> {
        const purchase = purchases.find(p => p.id === purchaseId)
        if (!purchase) throw new Error("Purchase not found")

        const updatedUnits = purchase.units.filter((u: PurchaseUnit) => u.id !== unitId)

        const updatedPurchase = recalculatePurchase({
            ...purchase,
            units: updatedUnits
        })

        purchases = purchases.map(p =>
            p.id === purchaseId ? updatedPurchase : p
        )

        return updatedPurchase
    }
}
