export interface TypeUnit {
    id: string
    code: string
    merk: string
    type: string
    jenis?: string
    model?: string
    bruto?: number
    netto?: number
    companyId: string
    createdAt: string
    updatedAt: string
}

export interface CreateTypeUnitRequest {
    code: string
    merk: string
    type: string
    jenis?: string
    model?: string
    bruto?: number
    netto?: number
    companyId: string
}

export interface UpdateTypeUnitRequest {
    code?: string
    merk?: string
    type?: string
    jenis?: string
    model?: string
    bruto?: number
    netto?: number
}

export interface TypeUnitListResponse {
    data: TypeUnit[]
    meta: {
        total: number
        page: number
        perPage: number
    }
}
