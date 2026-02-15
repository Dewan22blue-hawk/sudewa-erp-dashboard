export type UserRole =
    | "Direksi"
    | "Accounting"
    | "Admin"
    | "Warehouse"

export interface User {
    id: string
    userId: string
    name: string
    role: UserRole
    companyId: string
    createdAt: string
    updatedAt: string
}

export interface CreateUserRequest {
    userId: string
    name: string
    password: string
    role: UserRole
    companyId: string
}

export interface UpdateUserRequest {
    id: string
    name: string
    password?: string
    role: UserRole
}
