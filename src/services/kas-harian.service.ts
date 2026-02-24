import { KasHarian } from "@/@types/kas-harian.types"
import { v4 as uuid } from "uuid"

let kasHarianDB: KasHarian[] = [
    {
        id: "1",
        tanggal: "2026-12-31",
        notaRef: "TRX-011",
        keterangan: "Terima tagihan John Doe",
        debit: 0,
        kredit: 99000000,
        akun: "BCA USD",
        companyId: "1",
    },
]

export const kasHarianService = {
    getAll(companyId: string) {
        return Promise.resolve(
            kasHarianDB.filter(d => d.companyId === companyId)
        )
    },

    create(data: any) {
        const newItem: KasHarian = {
            id: uuid(),
            notaRef: "TRX-" + Math.floor(Math.random() * 10000),
            debit: data.type === "debit" ? data.nominal : 0,
            kredit: data.type === "kredit" ? data.nominal : 0,
            tanggal: data.tanggal, // Keep as Date object or format if needed, but type allows Date | string
            keterangan: data.keterangan,
            akun: data.akun,
            companyId: "1",
        }

        kasHarianDB = [newItem, ...kasHarianDB]
        return Promise.resolve(newItem)
    },

    update(id: string, data: any) {
        kasHarianDB = kasHarianDB.map(item =>
            item.id === id
                ? {
                    ...item,
                    debit: data.type === "debit" ? data.nominal : 0,
                    kredit: data.type === "kredit" ? data.nominal : 0,
                    tanggal: data.tanggal,
                    keterangan: data.keterangan,
                    akun: data.akun,
                }
                : item
        )
        return Promise.resolve()
    },

    delete(id: string) {
        kasHarianDB = kasHarianDB.filter(item => item.id !== id)
        return Promise.resolve()
    },
}
