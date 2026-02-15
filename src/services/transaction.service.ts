import { Transaction, TransactionAudit, TransactionSummary } from "@/@types/transaction.types"
import { nanoid } from "nanoid"

// Mock Databases
let db: Transaction[] = [
    {
        id: "1",
        companyId: "1", // PT Wajira Morindo
        date: "2024-10-01",
        name: "Setoran Modal Awal",
        debitUSD: 0,
        creditUSD: 0,
        debitIDR: 0,
        creditIDR: 0,
        debitCash: 100000000,
        creditCash: 0,
        description: "Setoran modal awal tunai",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "2",
        companyId: "1",
        date: "2024-10-02",
        name: "Beli Perlengkapan Kantor",
        debitUSD: 0,
        creditUSD: 0,
        debitIDR: 0,
        creditIDR: 0,
        debitCash: 0,
        creditCash: 2500000,
        description: "Pembelian ATK dan kertas",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "3",
        companyId: "1",
        date: "2024-10-05",
        name: "Penerimaan Pembayaran Invoice #INV-001",
        debitUSD: 5000,
        creditUSD: 0,
        debitIDR: 0,
        creditIDR: 0,
        debitCash: 0,
        creditCash: 0,
        description: "Pembayaran dari Client A (USD)",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "4",
        companyId: "1",
        date: "2024-10-06",
        name: "Tukar Valas (USD ke IDR)",
        debitUSD: 0,
        creditUSD: 1000,
        debitIDR: 15500000,
        creditIDR: 0,
        debitCash: 0,
        creditCash: 0,
        description: "Konversi $1000 @ 15.500",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
]
const auditLog: TransactionAudit[] = []

// Delay simulation
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const getTransactions = async (
    companyId: string,
    page = 1,
    limit = 10,
    search = ""
) => {
    await delay(500)
    let filtered = db.filter((t) => t.companyId === companyId)

    if (search) {
        const lowerSearch = search.toLowerCase()
        filtered = filtered.filter(t =>
            t.name.toLowerCase().includes(lowerSearch) ||
            t.description?.toLowerCase().includes(lowerSearch)
        )
    }

    const start = (page - 1) * limit
    const end = start + limit

    return {
        data: filtered.slice(start, end),
        total: filtered.length,
        page,
        limit,
    }
}

export const getTransactionById = async (id: string): Promise<Transaction | undefined> => {
    await delay(300)
    return db.find((t) => t.id === id)
}

export const getTransactionSummary = async (companyId: string): Promise<TransactionSummary> => {
    await delay(300)
    const companyData = db.filter(t => t.companyId === companyId)

    // Simple calculation logic (Debit increases asset, Credit decreases asset for Asset accounts)
    // Assuming BCA USD, BCA IDR, Cash IDR are asset accounts.
    // Saldo = Initial + Debit - Credit. Assuming Initial is 0 for this mock.

    const totalBcaUsd = companyData.reduce((acc, curr) => acc + (curr.debitUSD || 0) - (curr.creditUSD || 0), 0)
    const totalBcaIdr = companyData.reduce((acc, curr) => acc + (curr.debitIDR || 0) - (curr.creditIDR || 0), 0)
    const totalCashIdr = companyData.reduce((acc, curr) => acc + (curr.debitCash || 0) - (curr.creditCash || 0), 0)

    return {
        totalBcaUsd,
        totalBcaIdr,
        totalCashIdr
    }
}

export const createTransaction = async (payload: Transaction, userId: string = "system") => {
    await delay(600)

    // Immutability
    db = [...db, payload]

    // Audit Logging
    const audit: TransactionAudit = {
        id: nanoid(),
        transactionId: payload.id,
        companyId: payload.companyId,
        action: "CREATE",
        timestamp: new Date().toISOString(),
        userId,
        details: `Created transaction "${payload.name}"`,
        payload: payload
    }
    auditLog.push(audit)
    console.log("AUDIT:", audit)

    return payload
}

export const updateTransaction = async (id: string, payload: Partial<Transaction>, userId: string = "system") => {
    await delay(600)

    const oldData = db.find(t => t.id === id)
    if (!oldData) throw new Error("Transaction not found")

    // Immutability
    db = db.map((t) => (t.id === id ? { ...t, ...payload } : t))

    // Audit Logging
    const audit: TransactionAudit = {
        id: nanoid(),
        transactionId: id,
        companyId: oldData.companyId,
        action: "UPDATE",
        timestamp: new Date().toISOString(),
        userId,
        details: `Updated transaction "${oldData.name}"`,
        payload: { before: oldData, after: payload }
    }
    auditLog.push(audit)
    console.log("AUDIT:", audit)

    return payload
}

export const deleteTransaction = async (id: string, userId: string = "system") => {
    await delay(600)

    const target = db.find(t => t.id === id)
    if (!target) return // or throw

    // Immutability
    db = db.filter((t) => t.id !== id)

    // Audit Logging
    const audit: TransactionAudit = {
        id: nanoid(),
        transactionId: id,
        companyId: target.companyId,
        action: "DELETE",
        timestamp: new Date().toISOString(),
        userId,
        details: `Deleted transaction "${target.name}"`
    }
    auditLog.push(audit)
    console.log("AUDIT:", audit)
}
