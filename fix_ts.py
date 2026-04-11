import os

def replace_in_file(filepath, replacements):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        for old, new in replacements:
            content = content.replace(old, new)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")
    except Exception as e:
        print(f"Error updating {filepath}: {e}")

# Global replace for per_page to perPage in specific hooks/pages
per_page_files = [
    "src/components/features/laporan-warehouse/PurchaseOrderTab.tsx",
    "src/components/features/laporan-warehouse/SalesOrderTab.tsx",
    "src/components/features/laporan-warehouse/StockDetailTab.tsx",
    "src/components/features/laporan-warehouse/StockTab.tsx",
    "src/components/features/kas-harian/AddKasHarianDialog.tsx",
    "src/components/features/kas-harian/EditKasHarianDialog.tsx",
    "src/pages/dashboard/[slug]/laporan/laporan-pembelian/[type].tsx",
    "src/pages/dashboard/[slug]/laporan/laporan-penerimaan/[type].tsx",
    "src/pages/dashboard/[slug]/laporan/laporan-penjualan/[type].tsx",
    "src/hooks/useDataHutang.ts",
    "src/hooks/useDataPiutang.ts",
    "src/hooks/useLaporanKas.ts",
    "src/hooks/useLaporanPembelian.ts",
    "src/hooks/useLaporanPenerimaan.ts",
    "src/hooks/useLaporanPengiriman.ts",
    "src/hooks/useLaporanPenjualan.ts",
    "src/hooks/usePembayaranHutang.ts",
    "src/hooks/usePenerimaanPiutang.ts",
    "src/hooks/useRefundBeli.ts",
    "src/hooks/useRefundJual.ts",
    "src/lib/api/response.ts",
    "src/services/account-group.service.ts",
    "src/services/account.service.ts",
    "src/services/brand.service.ts",
    "src/services/customer.service.ts",
    "src/services/kas.service.ts",
    "src/services/penerimaan-unit-receipt.service.ts",
    "src/services/pengeluaran-unit.service.ts",
    "src/services/sales.service.ts",
    "src/services/sparepart.service.ts",
    "src/services/stock-unit.service.ts",
    "src/services/supplier.service.ts",
    "src/services/transaction.service.ts",
    "src/services/type-unit.service.ts",
]

for file in per_page_files:
    replace_in_file(file, [("per_page:", "perPage:"), ("per_page,", "perPage,"), ("per_page ", "perPage "), ("per_page?", "perPage?")])

# KasHarianSummary
replace_in_file("src/components/features/kas-harian/KasHarianSummary.tsx", [
    ("item.akun", "item.account?.name"),
    ("item.tanggal", "item.date"),
    ("item.debit", "item.debet"),
    ("item.kredit", "item.credit")
])

# PenerimaanPiutangDetailHeader
replace_in_file("src/components/features/penerimaan-piutang/PenerimaanPiutangDetailHeader.tsx", [
    ("data.totalJual", "data.billing_summary.grand_total"),
    ("data.totalTerima", "data.billing_summary.total_paid"),
    ("data.totalPiutang", "data.billing_summary.remaining_payment"),
    ("data.kodeJual", "data.code"),
    ("data.tanggal", "data.date"),
    ("data.customer", "data.person.name")
])

# PenerimaanPiutangPaymentTable
replace_in_file("src/components/features/penerimaan-piutang/PenerimaanPiutangPaymentTable.tsx", [
    ("item.jumlahTerima", "(item.cash_payment_amount + item.bca_payment_amount)"),
    ("item.kodeTerima", "item.id"),
    ("item.tanggalTerima", "item.payment_at"),
    ("item.kasMasuk", "item.cash_payment_amount")
])

# KasHarian service
replace_in_file("src/services/kas-harian.service.ts", [
    ("item.companyId", "item.company.id"),
    ("=== cash_id", "=== Number(cash_id)"),
    ("=== account_id", "=== Number(account_id)"),
    ("=== companyId", "=== Number(companyId)")
])

# PenerimaanPiutang service
replace_in_file("src/services/penerimaan-piutang.service.ts", [
    ("payment.jumlahTerima", "(payment.cash_payment_amount + payment.bca_payment_amount)"),
    ("payment.kodeTerima", "payment.id.toString()"),
    ("payment.tanggalTerima", "payment.payment_at"),
    ("payment.kasMasuk", "payment.cash_payment_amount"),
    ("kodeJual:", "code:")
])

print("Done phase 1")
