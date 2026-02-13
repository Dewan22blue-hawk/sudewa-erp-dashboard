import {
    Account,
    AccountListResponse,
    CreateAccountRequest,
    UpdateAccountRequest,
    AccountType,
} from "@/@types/account.types"

// Dummy data storage untuk development
let dummyAccounts: Account[] = [
    {
        id: "1",
        code: "1000",
        group: "1",
        description: "AKTIVA",
        category: "DEBET",
        cashFlow: "DEBET",
        accountType: "AKTIVA",
        parentId: null,
        isActive: true,
        companyId: "1",
        createdAt: new Date("2026-01-01").toISOString(),
        updatedAt: new Date("2026-01-01").toISOString(),
    },
    {
        id: "2",
        code: "1100",
        group: "1",
        description: "Aktiva Lancar",
        category: "DEBET",
        cashFlow: "DEBET",
        accountType: "AKTIVA",
        parentId: "1",
        isActive: true,
        companyId: "1",
        createdAt: new Date("2026-01-01").toISOString(),
        updatedAt: new Date("2026-01-01").toISOString(),
    },
    {
        id: "3",
        code: "1110",
        group: "1",
        description: "Kas",
        category: "DEBET",
        cashFlow: "DEBET",
        accountType: "AKTIVA",
        parentId: "2",
        isActive: true,
        companyId: "1",
        createdAt: new Date("2026-01-05").toISOString(),
        updatedAt: new Date("2026-01-05").toISOString(),
    },
    {
        id: "4",
        code: "2000",
        group: "2",
        description: "PASIVA",
        category: "KREDIT",
        cashFlow: "KREDIT",
        accountType: "PASIVA",
        parentId: null,
        isActive: true,
        companyId: "1",
        createdAt: new Date("2026-01-01").toISOString(),
        updatedAt: new Date("2026-01-01").toISOString(),
    },
    {
        id: "5",
        code: "2100",
        group: "2",
        description: "Kewajiban Lancar",
        category: "KREDIT",
        cashFlow: "KREDIT",
        accountType: "PASIVA",
        parentId: "4",
        isActive: true,
        companyId: "1",
        createdAt: new Date("2026-01-01").toISOString(),
        updatedAt: new Date("2026-01-01").toISOString(),
    },
]

/**
 * Get accounts dengan filter optional
 */
export async function getAccounts(
    companyId: string,
    filter?: AccountType
): Promise<AccountListResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filteredAccounts = dummyAccounts.filter(
        (acc) => acc.companyId === companyId && acc.isActive
    )

    // Apply type filter if provided
    if (filter) {
        filteredAccounts = filteredAccounts.filter(
            (acc) => acc.accountType === filter
        )
    }

    return Promise.resolve({
        data: filteredAccounts,
        meta: {
            page: 1,
            perPage: 25,
            total: filteredAccounts.length,
        },
    })
}

/**
 * Get single account by ID
 */
export async function getAccountById(id: string): Promise<Account | null> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const account = dummyAccounts.find((acc) => acc.id === id && acc.isActive)
    return Promise.resolve(account || null)
}

/**
 * Get account hierarchy untuk dropdown parent
 */
export async function getAccountHierarchy(
    companyId: string
): Promise<Account[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const accounts = dummyAccounts.filter(
        (acc) => acc.companyId === companyId && acc.isActive
    )

    return Promise.resolve(accounts)
}

/**
 * Create new account
 */
export async function createAccount(
    payload: CreateAccountRequest
): Promise<Account> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check code uniqueness per company
    const codeExists = dummyAccounts.some(
        (acc) =>
            acc.code === payload.code &&
            acc.companyId === payload.companyId &&
            acc.isActive
    )

    if (codeExists) {
        throw new Error("Kode akun sudah digunakan")
    }

    const newAccount: Account = {
        id: Date.now().toString(),
        code: payload.code,
        group: payload.group,
        description: payload.description,
        category: payload.category,
        cashFlow: payload.category, // Cash flow sama dengan category
        accountType: payload.accountType,
        parentId: payload.parentId || null,
        isActive: payload.isActive ?? true,
        companyId: payload.companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    dummyAccounts = [newAccount, ...dummyAccounts]

    return Promise.resolve(newAccount)
}

/**
 * Update existing account
 */
export async function updateAccount(
    id: string,
    payload: UpdateAccountRequest
): Promise<Account> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const currentAccount = dummyAccounts.find((acc) => acc.id === id)

    if (!currentAccount) {
        throw new Error("Akun tidak ditemukan")
    }

    // Check code uniqueness (exclude current account)
    if (payload.code) {
        const codeExists = dummyAccounts.some(
            (acc) =>
                acc.code === payload.code &&
                acc.companyId === currentAccount.companyId &&
                acc.id !== id &&
                acc.isActive
        )

        if (codeExists) {
            throw new Error("Kode akun sudah digunakan")
        }
    }

    dummyAccounts = dummyAccounts.map((acc) =>
        acc.id === id
            ? {
                ...acc,
                ...payload,
                cashFlow: payload.category ?? acc.cashFlow,
                updatedAt: new Date().toISOString(),
            }
            : acc
    )

    const updatedAccount = dummyAccounts.find((acc) => acc.id === id)!
    return Promise.resolve(updatedAccount)
}

/**
 * Soft delete account
 */
export async function deleteAccount(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    dummyAccounts = dummyAccounts.map((acc) =>
        acc.id === id
            ? {
                ...acc,
                isActive: false,
                updatedAt: new Date().toISOString(),
            }
            : acc
    )

    return Promise.resolve()
}
