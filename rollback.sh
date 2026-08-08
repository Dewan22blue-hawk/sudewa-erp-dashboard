#!/bin/bash

# Get list of files changed from origin/main
files=$(git diff origin/main --name-only)

# Filter for modules Administrasi and Warehouse
# Using keywords derived from the directory structure and menu config
pattern="warehouse|administrasi|transaksi|pembelian-unit|penjualan-unit|pembelian-sparepart|penjualan-sparepart|pengeluaran-unit|penerimaan-unit|stock-unit|sparepart-transaction|laporan-penerimaan|laporan-pengiriman|purchase|sales|refund-beli|unitTransaction.service.ts|sales.mapper.ts"

matched_files=$(echo "$files" | grep -iE "$pattern" || true)

if [ -z "$matched_files" ]; then
    echo "No files found to rollback."
    exit 0
fi

echo "Rolling back the following files:"
echo "$matched_files"

# Check out from origin/main
echo "$matched_files" | xargs git checkout origin/main --
