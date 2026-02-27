import { FilterLaporanPembelian } from "@/@types/laporan-pembelian.types"

export const getLaporanPembelian = async (
    filter: FilterLaporanPembelian
) => {

    if (filter.jenis === "per-nota") {
        return [
            { nota: "INV-001", supplier: "PT XX", total: 12000000 },
            { nota: "INV-002", supplier: "PT YY", total: 25000000 },
        ]
    }

    if (filter.jenis === "per-type") {
        return [
            { type: "Honda Vario", qty: 12, total: 80000000 },
            { type: "Beat", qty: 5, total: 40000000 },
        ]
    }

    if (filter.jenis === "per-supplier") {
        return [
            { supplier: "PT XX", total: 120000000 },
            { supplier: "PT YY", total: 90000000 },
        ]
    }

    return []
}