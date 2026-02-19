export interface Company {
    id: string
    name: string
    slug: string
}

export async function fetchUserCompanies(): Promise<Company[]> {
    // dummy, backend-ready
    return Promise.resolve([
        { id: "1", name: "PT Wajira Morindo", slug: "wajira-morindo" },
        { id: "2", name: "PT Wajira International", slug: "wajira-international" },
        { id: "3", name: "PT Wajira Transindo", slug: "wajira-transindo" },
        { id: "4", name: "PT Wajira Yanotama", slug: "wajira-yanotama" },
        { id: "5", name: "PT Adhiyas Agradasata", slug: "adhiyas-agradasata" },
    ])
}
