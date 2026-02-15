export interface Transaction {
    id: string
    companyId: string
    date: string
    name: string

    debitUSD: number
    creditUSD: number

    debitIDR: number
    creditIDR: number

    debitCash: number
    creditCash: number

    description?: string

    createdAt: string
    updatedAt: string
}

export interface CreateTransactionRequest {
    companyId: string
    date: string
    name: string
    debitUSD?: number
    creditUSD?: number
    debitIDR?: number
    creditIDR?: number
    debitCash?: number
    creditCash?: number
    description?: string
}

export interface TransactionAudit {
    id: string
    transactionId: string
    companyId: string
    action: "CREATE" | "UPDATE" | "DELETE"
    timestamp: string
    userId: string
    details: string
    payload?: any
}

export interface TransactionSummary {
    totalBcaUsd: number
    totalBcaIdr: number
    totalCashIdr: number
}
