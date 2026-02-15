import {
    Sparepart,
    SparepartListResponse,
    CreateSparepartRequest,
    UpdateSparepartRequest,
} from "@/@types/sparepart.types"

let dummySpareparts: Sparepart[] = [
    {
        id: "1",
        code: "12000000KAJAH20",
        name: "HEAD COMP CYLINDER",
        group: "HGP",
        unit: "PCS",
        purchasePrice: 4550000,
        sellingPrice: 4550000,
        companyId: "1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
]

export async function getSpareparts(
    companyId: string
): Promise<SparepartListResponse> {
    const filtered = dummySpareparts.filter(
        (item) => item.companyId === companyId
    )

    return {
        data: filtered,
        meta: {
            page: 1,
            perPage: 10,
            total: filtered.length,
        },
    }
}

export async function createSparepart(
    payload: CreateSparepartRequest
): Promise<Sparepart> {
    const newData: Sparepart = {
        id: Date.now().toString(),
        purchasePrice: payload.sellingPrice,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    dummySpareparts = [newData, ...dummySpareparts]
    return newData
}

export async function updateSparepart(
    id: string,
    payload: UpdateSparepartRequest
): Promise<Sparepart> {
    dummySpareparts = dummySpareparts.map((item) =>
        item.id === id
            ? { ...item, ...payload, updatedAt: new Date().toISOString() }
            : item
    )

    return dummySpareparts.find((item) => item.id === id)!
}

export async function deleteSparepart(id: string): Promise<void> {
    dummySpareparts = dummySpareparts.filter((item) => item.id !== id)
}

export async function importSparepart(): Promise<void> {
    return Promise.resolve()
}
