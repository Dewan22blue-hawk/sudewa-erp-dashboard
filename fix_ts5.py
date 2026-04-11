import re
import os

def fix():
    files = [
        'src/hooks/useLaporanKas.ts',
        'src/hooks/useLaporanPenerimaan.ts',
        'src/hooks/useLaporanPengiriman.ts',
        'src/hooks/useLaporanPenjualan.ts',
    ]
    for f in files:
        if os.path.exists(f):
            with open(f, 'r') as file: content = file.read()
            content = content.replace("per_page: result", "perPage: result")
            with open(f, 'w') as file: file.write(content)

    if os.path.exists('src/lib/api/response.ts'):
        with open('src/lib/api/response.ts', 'r') as file: content = file.read()
        content = content.replace("per_page: data.per_page", "perPage: data.per_page")
        content = content.replace("per_page: data.perPage", "perPage: data.perPage")
        with open('src/lib/api/response.ts', 'w') as file: file.write(content)

    warehouse_files = [
        'src/components/features/laporan-warehouse/PurchaseOrderTab.tsx',
        'src/components/features/laporan-warehouse/SalesOrderTab.tsx',
        'src/components/features/laporan-warehouse/StockDetailTab.tsx',
        'src/components/features/laporan-warehouse/StockTab.tsx',
    ]
    for f in warehouse_files:
        if os.path.exists(f):
            with open(f, 'r') as file: content = file.read()
            content = content.replace("perPage: pagination.perPage", "per_page: pagination.perPage")
            content = content.replace("perPage: pagination.per_page", "per_page: pagination.perPage")
            with open(f, 'w') as file: file.write(content)

    pengeluaran = 'src/components/features/pengeluaran-unit/PengeluaranUnitEditTable.tsx'
    if os.path.exists(pengeluaran):
        with open(pengeluaran, 'r') as file: content = file.read()
        content = content.replace("PengeluaranUnitDetail", "PengeluaranUnit")
        with open(pengeluaran, 'w') as file: file.write(content)

    kas_harian = 'src/pages/dashboard/[slug]/finance/kas-harian/index.tsx'
    if os.path.exists(kas_harian):
        with open(kas_harian, 'r') as file: content = file.read()
        content = content.replace("search: searchTerm", "")
        content = content.replace(",  }", " }")
        with open(kas_harian, 'w') as file: file.write(content)

    stock_unit = 'src/pages/dashboard/[slug]/warehouse/stock-unit/index.tsx'
    if os.path.exists(stock_unit):
        with open(stock_unit, 'r') as file: content = file.read()
        content = content.replace("stockUnitList?.current_page", "stockUnitList?.meta?.currentPage")
        content = content.replace("stockUnitList?.per_page", "stockUnitList?.meta?.perPage")
        content = content.replace("stockUnitList?.total", "stockUnitList?.meta?.total")
        with open(stock_unit, 'w') as file: file.write(content)

    service_files = [
        'src/services/account-group.service.ts',
        'src/services/account.service.ts',
        'src/services/brand.service.ts',
        'src/services/customer.service.ts',
        'src/services/kas.service.ts',
        'src/services/pengeluaran-unit.service.ts',
        'src/services/sparepart.service.ts',
        'src/services/stock-unit.service.ts',
        'src/services/supplier.service.ts',
    ]
    for f in service_files:
        if os.path.exists(f):
            with open(f, 'r') as file: content = file.read()
            content = content.replace("per_page: data.per_page", "perPage: data.perPage")
            content = content.replace("per_page: data.perPage", "perPage: data.perPage")
            content = content.replace("per_page: parsed.per_page", "perPage: parsed.perPage")
            with open(f, 'w') as file: file.write(content)

    if os.path.exists('src/services/penerimaan-piutang.service.ts'):
        with open('src/services/penerimaan-piutang.service.ts', 'r') as file: content = file.read()
        content = content.replace("(cash_payment_amount + bca_payment_amount)", "total_paid")
        with open('src/services/penerimaan-piutang.service.ts', 'w') as file: file.write(content)

fix()
