export interface Customer {
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

export interface CreateCustomerRequest {
    name: string
    address: string
    npwp: string
    pic: string
    phone: string
    companyId: string
}

export interface UpdateCustomerRequest {
    name?: string
    address?: string
    npwp?: string
    pic?: string
    phone?: string
}

export interface CustomerListResponse {
    data: Customer[]
    meta: {
        total: number
        page: number
        perPage: number
    }
}
