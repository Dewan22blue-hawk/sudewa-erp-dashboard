import { FilterLaporanPenerimaan } from "@/@types/laporan-penerimaan.types"

// TODO: Replace with actual API call
export const getLaporanPenerimaan = async (
    filter: FilterLaporanPenerimaan
) => {
    // Simulasi delay jaringan
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (filter.jenis === "per-nota") {
        return [
            { nota: "TRM-2026-001", penerima: "Budi Santoso", total: 10 },
            { nota: "TRM-2026-002", penerima: "Andi Wijaya", total: 5 },
            { nota: "TRM-2026-003", penerima: "Siti Aminah", total: 12 },
        ]
    }

    if (filter.jenis === "per-type") {
        return [
            { type: "Honda Vario 160", qty: 10 },
            { type: "Honda Beat Street", qty: 5 },
            { type: "Yamaha NMAX Connected", qty: 12 },
        ]
    }

    if (filter.jenis === "per-supplier") {
        return [
            { supplier: "PT Astra Honda Motor", total: 15 },
            { supplier: "PT Yamaha Indonesia Motor Mfg", total: 12 },
        ]
    }

    return []
}
