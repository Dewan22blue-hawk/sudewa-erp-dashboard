import { FilterLaporanPenjualan } from "@/@types/laporan-penjualan.types"

export const getLaporanPenjualan = async (
    filter: FilterLaporanPenjualan
) => {

    if (filter.jenis === "per-nota") {
        return [
            { nota: "JUAL-001", customer: "PT A", total: 50000000 },
            { nota: "JUAL-002", customer: "PT B", total: 75000000 },
        ]
    }

    if (filter.jenis === "per-type") {
        return [
            { type: "Honda Vario", qty: 15, total: 200000000 },
            { type: "Beat", qty: 10, total: 150000000 },
        ]
    }

    if (filter.jenis === "per-supplier") {
        return [
            { supplier: "PT Jack Owe Me", total: 300000000 },
            { supplier: "PT XYZ", total: 150000000 },
        ]
    }

    return []
}