import { PPNPembelian } from "@/@types/ppn-pembelian.types"

// Generate 100 dummy records
let ppnDB: PPNPembelian[] = Array.from({ length: 100 }).map((_, index) => {
    const id = (index + 1).toString()
    const paddedId = id.padStart(4, "0")
    return {
        id,
        kodeBeli: `PBL-WIN/20260202-${paddedId}`,
        tanggalBeli: "28/01/2026",
        supplier: "WAJIRA JAGATARA MORINDO",
        tanggalFPM: "28/01/2026",
        masaNSFPM: "Jan 2026",
        nsfpmMasukan: `NSFPM-${paddedId}`,
        qty: 1,
        tipeUnit: "Stylo 190 CBS",
        noMesin: `ABC 1223 ${paddedId}`,
        noRangka: `MH847420JVIDO${paddedId}`,
        hargaBeli: 99999999,
        biaya: 99999999,
        hargaUnit: 99999999,
        dppBeli: 99999999,
        ppn: 99999999,
        paymentBeli: 99999999,
    }
})

export const getPPNPembelian = async () => {
    return [...ppnDB]
}

export const createPPNPembelian = async (
    data: Omit<PPNPembelian, "id">
) => {
    const newItem: PPNPembelian = {
        ...data,
        id: Date.now().toString(),
    }
    ppnDB = [newItem, ...ppnDB]
    return newItem
}

export const updatePPNPembelian = async (data: PPNPembelian) => {
    ppnDB = ppnDB.map(item =>
        item.id === data.id ? data : item
    )
    return data
}

export const deletePPNPembelian = async (id: string) => {
    ppnDB = ppnDB.filter(item => item.id !== id)
}
