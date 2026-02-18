export type KasType = "Cash" | "Bank"

export interface KasHarian {
    id: string
    tanggal: Date | string
    notaRef: string
    keterangan: string
    debit: number
    kredit: number
    akun: string
    companyId: string
}

export interface CreateKasHarianRequest {
    tanggal: Date
    akun: string
    keterangan: string
    nominal: number
    type: "debit" | "kredit"
}

export interface UpdateKasHarianRequest
    extends CreateKasHarianRequest {
    id: string
}
