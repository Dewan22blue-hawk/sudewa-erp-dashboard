export interface Company {
    id: string
    name: string
}

export async function fetchUserCompanies(): Promise<Company[]> {
    // dummy, backend-ready
    return Promise.resolve([
        { id: "1", name: "PT Wajira Morindo" },
        { id: "2", name: "PT Wajira International" },
        { id: "3", name: "PT Wajira Transindo" },
        { id: "4", name: "PT Wajira Yanotama" },
        { id: "5", name: "PT Adhiyas Agradasata" },
    ])
}
