export interface Supplier {
    id: string
    code: string
    name: string
    address: string
    npwp: string
    pic: string
    phone: string
    companyId: string
    createdAt: string
    updatedAt: string
}

export interface CreateSupplierRequest {
    name: string
    address: string
    npwp: string
    pic: string
    phone: string
    companyId: string
}

export interface UpdateSupplierRequest {
    name?: string
    address?: string
    npwp?: string
    pic?: string
    phone?: string
}

export interface SupplierListResponse {
    data: Supplier[]
    meta: {
        total: number
        page: number
        perPage: number
    }
}
