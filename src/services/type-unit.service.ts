import type {
    TypeUnit,
    CreateTypeUnitRequest,
    UpdateTypeUnitRequest,
    TypeUnitListResponse,
} from "@/@types/type-unit.types"

let typeUnits: TypeUnit[] = [
    {
        id: "1",
        code: "HND-0011",
        merk: "HONDA",
        type: "Beat Deluxe SmartKey",
        jenis: "-",
        model: "-",
        companyId: "1", // Default company
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
]

let nextId = 2

export async function getTypeUnits(companyId: string): Promise<TypeUnitListResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const filteredTypeUnits = typeUnits.filter(t => t.companyId === companyId)

    return {
        data: filteredTypeUnits,
        meta: {
            total: filteredTypeUnits.length,
            page: 1,
            perPage: 10,
        },
    }
}

export async function getTypeUnitById(id: string): Promise<TypeUnit> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const typeUnit = typeUnits.find((t) => t.id === id)
    if (!typeUnit) {
        throw new Error("Tipe Unit tidak ditemukan")
    }
    return typeUnit
}

export async function createTypeUnit(
    payload: CreateTypeUnitRequest
): Promise<TypeUnit> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newTypeUnit: TypeUnit = {
        id: String(nextId++),
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    typeUnits.push(newTypeUnit)
    return newTypeUnit
}

export async function updateTypeUnit(
    id: string,
    payload: UpdateTypeUnitRequest
): Promise<TypeUnit> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = typeUnits.findIndex((t) => t.id === id)
    if (index === -1) {
        throw new Error("Tipe Unit tidak ditemukan")
    }

    typeUnits[index] = {
        ...typeUnits[index],
        ...payload,
        updatedAt: new Date().toISOString(),
    }

    return typeUnits[index]
}

export async function deleteTypeUnit(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = typeUnits.findIndex((t) => t.id === id)
    if (index === -1) {
        throw new Error("Tipe Unit tidak ditemukan")
    }

    typeUnits.splice(index, 1)
}
