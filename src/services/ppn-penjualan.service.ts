import { PPNPenjualan } from "@/@types/ppn-penjualan.types"

// Generate 100 dummy records
let ppnDB: PPNPenjualan[] = Array.from({ length: 100 }).map((_, index) => {
    const id = (index + 1).toString()
    const paddedId = id.padStart(4, "0")
    return {
        id,
        kodeJual: `INV-WIN/20260202-${paddedId}`,
        tanggalJual: "28/01/2026",
        customer: "WAJIRA JAGATARA MORINDO",
        tanggalFPK: "28/01/2026",
        masaNSFPK: "Jan 2026",
        nsfpkKeluaran: `NSFPK-${paddedId}`,
        qty: 1,
        tipeUnit: "Stylo 190 CBS",
        noMesin: `ABC 1223 ${paddedId}`,
        noRangka: `MH847420JVIDO${paddedId}`,
        hargaJual: 99999999,
        biaya: 99999999,
        hargaUnit: 99999999,
        dppJual: 99999999,
        ppn: 99999999,
        paymentJual: 99999999,
    }
})

export const getPPNPenjualan = async () => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return [...ppnDB]
}

export const createPPNPenjualan = async (
    data: Omit<PPNPenjualan, "id">
) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newItem: PPNPenjualan = {
        ...data,
        id: Date.now().toString(),
    }
    ppnDB = [newItem, ...ppnDB]
    return newItem
}

export const updatePPNPenjualan = async (data: PPNPenjualan) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    ppnDB = ppnDB.map(item =>
        item.id === data.id ? data : item
    )
    return data
}

export const deletePPNPenjualan = async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    ppnDB = ppnDB.filter(item => item.id !== id)
}
