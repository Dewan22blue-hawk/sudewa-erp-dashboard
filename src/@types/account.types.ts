export type AccountCategory = "DEBET" | "KREDIT"
export type AccountType = "AKTIVA" | "PASIVA"

export interface Account {
    id: string
    code: string
    group: string
    description: string
    category: AccountCategory
    cashFlow: AccountCategory
    accountType: AccountType // Klasifikasi Aktiva/Pasiva
    parentId: string | null // Hierarchy support
    isActive: boolean // Status (untuk soft delete)
    companyId: string // Multi-tenant support
    createdAt: string
    updatedAt: string
}

export interface CreateAccountRequest {
    code: string
    group: string
    description: string
    category: AccountCategory
    accountType: AccountType
    parentId?: string
    isActive?: boolean
    companyId: string
}

export interface UpdateAccountRequest {
    code?: string
    group?: string
    description?: string
    category?: AccountCategory
    accountType?: AccountType
    parentId?: string | null
    isActive?: boolean
}

export interface AccountListResponse {
    data: Account[]
    meta: {
        page: number
        perPage: number
        total: number
    }
}
