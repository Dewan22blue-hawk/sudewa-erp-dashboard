import { EditUnitData, ProductOption } from "./edit-unit.types"

/**
 * Product options untuk Tipe Unit dropdown
 */
export const PRODUCT_OPTIONS: ProductOption[] = [
    { value: "honda-adv-160-abs", label: "Honda/ADV 160 ABS" },
    { value: "honda-adv-160-std", label: "Honda/ADV 160 Standard" },
    { value: "honda-pcx-160", label: "Honda/PCX 160" },
    { value: "yamaha-nmax", label: "Yamaha/NMAX 155" },
    { value: "yamaha-aerox", label: "Yamaha/AEROX 155" },
]

/**
 * Mock data untuk Edit Unit
 */
export const EDIT_UNIT_DATA: EditUnitData = {
    id: "1",
    invoiceNumber: "INV-WAJ-2207/162-0012",
    tipeUnit: "honda-adv-160-abs",
    qty: 1,
    harga: 35400000,
    hppSatuan: 31891892,
    totalHpp: 31891892,
    dppSatuan: 31891892,
    totalDpp: 31891892,
    ppnSatuan: 3508108,
    totalPpn: 3508108,
    biayaBbn: 0,
    biayaEkspedisi: 0,
    biayaLain: 0,
}
