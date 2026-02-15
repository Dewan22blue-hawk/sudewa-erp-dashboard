import type {
    Supplier,
    CreateSupplierRequest,
    UpdateSupplierRequest,
    SupplierListResponse,
} from "@/@types/supplier.types"

const suppliers: Supplier[] = [
    {
        id: "1",
        code: "SPL-001",
        name: "ABC KALASAN - DRG.YOUNG SANI SANTANU",
        address: "Jl. Raya Kalimalang No, Rt 000, Rw 000, Duren Sawit, Duren Sawit, Kota Adm. Jakarta Timur, DKI Jakarta 00000",
        npwp: "123456789012345",
        pic: "Emilia Clarke",
        phone: "08xx xxxx xxxx",
        companyId: "1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
]

let nextId = 2

export async function getSuppliers(companyId: string): Promise<SupplierListResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const filteredSuppliers = suppliers.filter(s => s.companyId === companyId)

    return {
        data: filteredSuppliers,
        meta: {
            total: filteredSuppliers.length,
            page: 1,
            perPage: 10,
        },
    }
}

export async function createSupplier(
    payload: CreateSupplierRequest
): Promise<Supplier> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newSupplier: Supplier = {
        id: String(nextId++),
        code: `SPL-${String(nextId - 1).padStart(3, "0")}`,
        ...payload,
        companyId: payload.companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    suppliers.push(newSupplier)
    return newSupplier
}

export async function updateSupplier(
    id: string,
    payload: UpdateSupplierRequest
): Promise<Supplier> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = suppliers.findIndex((s) => s.id === id)
    if (index === -1) {
        throw new Error("Supplier tidak ditemukan")
    }

    suppliers[index] = {
        ...suppliers[index],
        ...payload,
        updatedAt: new Date().toISOString(),
    }

    return suppliers[index]
}

export async function deleteSupplier(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = suppliers.findIndex((s) => s.id === id)
    if (index === -1) {
        throw new Error("Supplier tidak ditemukan")
    }

    suppliers.splice(index, 1)
}
