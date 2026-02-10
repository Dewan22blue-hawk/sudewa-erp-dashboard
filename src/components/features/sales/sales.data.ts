/**
 * Sales Data Types - EXACT dari Figma
 */
export interface SalesItem {
    id: string
    kodeJual: string
    tanggal: string
    customer: string
    totalBiaya: number
    totalDpp: number
    totalPpn: number
    totalJual: number
    kurangBayar: number
}

/**
 * Generate mock customer names
 */
const CUSTOMERS = [
    "ADHITYA AGRA DHASTA",
    "BUDI SANTOSO",
    "CITRA DEWI LESTARI",
    "DIAN PRATAMA",
    "EKO WIJAYA",
    "FAJAR NUGROHO",
    "GITA PERMATA",
    "HENDRA KUSUMA",
    "INDAH SARI",
    "JOKO WIDODO",
]

/**
 * Generate random date in January 2026
 */
function generateDate(day: number): string {
    return `${String(day).padStart(2, '0')}/01/2026`
}

/**
 * Generate random invoice number
 */
function generateInvoice(num: number): string {
    const paddedNum = String(num).padStart(4, '0')
    return `INV-WAJ-2207/162-${paddedNum}`
}

/**
 * Mock Data - 50 records untuk pagination
 */
export const SALES_DATA: SalesItem[] = Array.from(
    { length: 50 },
    (_, i) => {
        const totalDpp = 381801805 + (i * 1234567)
        const totalPpn = Math.floor(totalDpp * 0.11)
        const totalJual = totalDpp + totalPpn

        return {
            id: String(i + 1),
            kodeJual: generateInvoice(i + 12),
            tanggal: generateDate((i % 28) + 1),
            customer: CUSTOMERS[i % CUSTOMERS.length],
            totalBiaya: 0,
            totalDpp,
            totalPpn,
            totalJual,
            kurangBayar: totalJual,
        }
    }
)
