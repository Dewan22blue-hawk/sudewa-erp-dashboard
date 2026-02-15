import type {
    Customer,
    CreateCustomerRequest,
    UpdateCustomerRequest,
    CustomerListResponse,
} from "@/@types/customer.types"

const customers: Customer[] = [
    {
        id: "1",
        code: "SPL-001",
        name: "ELLA YOUNG WIDJAYANTO NUGRAHA",
        address: "Jl. Raya Kalimalang No, Rt 000, Rw 000, Duren Sawit, Duren Sawit, Kota Adm. Jakarta Timur, DKI Jakarta 00000",
        npwp: "123456789012345",
        pic: "Emilia Clarke",
        phone: "08xx xxxx xxxx",
        companyId: "1", // Default company
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
]

let nextId = 2

export async function getCustomers(companyId: string): Promise<CustomerListResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const filteredCustomers = customers.filter(c => c.companyId === companyId)

    return {
        data: filteredCustomers,
        meta: {
            total: filteredCustomers.length,
            page: 1,
            perPage: 10,
        },
    }
}

export async function createCustomer(
    payload: CreateCustomerRequest
): Promise<Customer> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newCustomer: Customer = {
        id: String(nextId++),
        code: `SPL-${String(nextId - 1).padStart(3, "0")}`,
        ...payload,
        companyId: payload.companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    customers.push(newCustomer)
    return newCustomer
}

export async function updateCustomer(
    id: string,
    payload: UpdateCustomerRequest
): Promise<Customer> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = customers.findIndex((c) => c.id === id)
    if (index === -1) {
        throw new Error("Customer tidak ditemukan")
    }

    customers[index] = {
        ...customers[index],
        ...payload,
        updatedAt: new Date().toISOString(),
    }

    return customers[index]
}

export async function deleteCustomer(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = customers.findIndex((c) => c.id === id)
    if (index === -1) {
        throw new Error("Customer tidak ditemukan")
    }

    customers.splice(index, 1)
}
