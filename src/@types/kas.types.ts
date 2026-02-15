export type KasType = "Cash" | "Bank"

export interface Kas {
    id: string
    code: string
    description: string
    type: KasType
    companyId: string
    createdAt: string
    updatedAt: string
}

export interface CreateKasRequest {
    code: string
    description: string
    type: KasType
    companyId: string
}

export interface UpdateKasRequest extends Partial<CreateKasRequest> { }

export interface KasListResponse {
    data: Kas[]
    meta: {
        page: number
        perPage: number
        total: number
    }
}
