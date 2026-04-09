"use client"

import { useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LaporanPenerimaanFilter from '@/components/features/laporan-penerimaan/LaporanPenerimaanFilter';
import LaporanPenerimaanTable from '@/components/features/laporan-penerimaan/LaporanPenerimaanTable';
import LaporanPenerimaanPerTipe from '@/components/features/laporan-penerimaan/LaporanPenerimaanPerTipe';
import LaporanPenerimaanPerSupplier from '@/components/features/laporan-penerimaan/LaporanPenerimaanPerSupplier';
import { PrintLetterPage } from '@/components/common/PrintLetterPage';
import { useLaporanPenerimaan } from '@/hooks/useLaporanPenerimaan';

type TabType = 'penerimaan' | 'per-tipe' | 'per-supplier';

export default function LaporanPenerimaanPage() {
  const [activeTab, setActiveTab] = useState<TabType>('penerimaan');
  const {
    data,
    pagination,
    isLoading,
    setPage,
    setPerPage,
    setDateRange,
    setSupplier,
    setUnitType,
  } = useLaporanPenerimaan();

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (data.length === 0) {
      alert('Tidak ada data untuk diunduh');
      return;
    }

    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeTab === 'penerimaan') {
      headers = ['NO', 'NO PENERIMAAN', 'TGL TERIMA', 'NAMA SUPPLIER', 'TIPE UNIT', 'WARNA', 'NO MESIN', 'NO RANGKA'];
      rows = data.map((item, idx) => [
        idx + 1 + (pagination.currentPage - 1) * pagination.perPage,
        item.transaction_code,
        new Date(item.receipt_date).toLocaleDateString('id-ID'),
        item.person,
        item.unit_type.name,
        item.color,
        item.machine_number,
        item.chassis_number,
      ] as (string | number)[]);
    } else if (activeTab === 'per-tipe') {
      headers = ['NO', 'TIPE UNIT', 'QTY', 'WARNA'];
      const groupedByType = new Map<string, Map<string, number>>();
      data.forEach((item) => {
        if (!groupedByType.has(item.unit_type.name)) {
          groupedByType.set(item.unit_type.name, new Map());
        }
        const colorMap = groupedByType.get(item.unit_type.name)!;
        const colorKey = item.color || 'Tidak Ada Warna';
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
      });

        let idx = 0;
        groupedByType.forEach((colorMap, typeName) => {
          colorMap.forEach((qty, color) => {
            rows.push([++idx, typeName, qty, color] as (string | number)[]);
          });
        });
    } else if (activeTab === 'per-supplier') {
      headers = ['NO', 'NAMA SUPPLIER', 'QTY'];
      const groupedBySupplier = new Map<string, number>();
      data.forEach((item) => {
        groupedBySupplier.set(item.person, (groupedBySupplier.get(item.person) || 0) + 1);
      });

        let idx = 0;
        groupedBySupplier.forEach((qty, supplier) => {
          rows.push([++idx, supplier, qty] as (string | number)[]);
        });
    }

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell: string | number) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-penerimaan-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <PrintLetterPage id="laporan-penerimaan-print" className="laporan-penerimaan-print-area">
        <div className="laporan-penerimaan-page p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Laporan Penerimaan</h1>
            <p className="text-sm text-gray-500">
              Pantau semua transaksi penerimaan unit
            </p>
          </div>

          {/* Filter Component */}
          <LaporanPenerimaanFilter
            onDateRangeChange={setDateRange}
            onSupplierChange={setSupplier}
            onUnitTypeChange={setUnitType}
            onPerPageChange={setPerPage}
            activeTab={activeTab}
            onPrint={handlePrint}
            onDownload={exportToCSV}
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabType)}>
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="penerimaan">Penerimaan</TabsTrigger>
              <TabsTrigger value="per-tipe">Per Tipe</TabsTrigger>
              <TabsTrigger value="per-supplier">Per Supplier</TabsTrigger>
            </TabsList>

            <div className="laporan-penerimaan-print-content">
              <TabsContent value="penerimaan">
                <LaporanPenerimaanTable
                  data={data}
                  pagination={pagination}
                  isLoading={isLoading}
                  onPageChange={setPage}
                />
              </TabsContent>

              <TabsContent value="per-tipe">
                <LaporanPenerimaanPerTipe
                  data={data}
                  pagination={pagination}
                  isLoading={isLoading}
                  onPageChange={setPage}
                />
              </TabsContent>

              <TabsContent value="per-supplier">
                <LaporanPenerimaanPerSupplier
                  data={data}
                  pagination={pagination}
                  isLoading={isLoading}
                  onPageChange={setPage}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </PrintLetterPage>
    </DashboardLayout>
  );
}
