export interface Sparepart {
    id: string
    code: string
    name: string
    group: string
    unit: string
    purchasePrice: number
    sellingPrice: number
    companyId: string
    createdAt: string
    updatedAt: string
}

export interface CreateSparepartRequest {
    code: string
    name: string
    group: string
    unit: string
    sellingPrice: number
    companyId: string
}

export interface UpdateSparepartRequest
    extends Partial<CreateSparepartRequest> { }

export interface SparepartListResponse {
    data: Sparepart[]
    meta: {
        page: number
        perPage: number
        total: number
    }
}
