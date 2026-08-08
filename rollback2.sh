#!/bin/bash

files=$(git diff origin/main --name-only)
pattern="warehouse|administrasi|transaksi|pembelian-unit|penjualan-unit|pembelian-sparepart|penjualan-sparepart|pengeluaran-unit|penerimaan-unit|stock-unit|sparepart-transaction|laporan-penerimaan|laporan-pengiriman|purchase|sales|refund-beli|unitTransaction.service.ts|sales.mapper.ts"
matched_files=$(echo "$files" | grep -iE "$pattern" || true)

for file in $matched_files; do
  if git ls-tree -r origin/main --name-only | grep -q "^${file}$"; then
    git checkout origin/main -- "$file"
    echo "Checked out $file from origin/main"
  else
    rm -f "$file"
    echo "Deleted $file (did not exist in origin/main)"
  fi
done
