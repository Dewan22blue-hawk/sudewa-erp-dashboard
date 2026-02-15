import { Kas, KasListResponse, CreateKasRequest, UpdateKasRequest } from "@/@types/kas.types"

// Initial Mock Data
let kasDB: Kas[] = [
    {
        id: "1",
        code: "BCA",
        description: "BCA IDR",
        type: "Bank",
        companyId: "1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
]

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function getKas(companyId: string): Promise<KasListResponse> {
    await delay(500) // Simulate network delay

    // Filter by companyId (Multi-tenant safety)
    const filtered = kasDB.filter(item => item.companyId === companyId)

    // Return cloned data to prevent mutation
    return {
        data: [...filtered],
        meta: {
            page: 1,
            perPage: 10,
            total: filtered.length,
        }
    }
}

export async function createKas(payload: CreateKasRequest): Promise<Kas> {
    await delay(500)

    const newKas: Kas = {
        id: Date.now().toString(),
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    // Immutable update
    kasDB = [newKas, ...kasDB]
    return { ...newKas }
}

export async function updateKas(id: string, payload: UpdateKasRequest): Promise<Kas> {
    await delay(500)

    const index = kasDB.findIndex(item => item.id === id)
    if (index === -1) {
        throw new Error("Data tidak ditemukan")
    }

    const updatedKas: Kas = {
        ...kasDB[index],
        ...payload,
        updatedAt: new Date().toISOString()
    }

    // Immutable update
    kasDB = [...kasDB.slice(0, index), updatedKas, ...kasDB.slice(index + 1)]
    return { ...updatedKas }
}

export async function deleteKas(id: string): Promise<void> {
    await delay(500)

    const exists = kasDB.find(item => item.id === id)
    if (!exists) {
        throw new Error("Data tidak ditemukan")
    }

    // Immutable update
    kasDB = kasDB.filter(item => item.id !== id)
}
