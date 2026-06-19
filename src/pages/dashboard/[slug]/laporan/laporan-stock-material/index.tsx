"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Printer, Loader2, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

import { useStockMaterialReport } from '@/hooks/report/useStockMaterialReport';
import { useCompany } from '@/contexts/CompanyContext';
import { resolveCompanyId, getLetterheadByCompanyId } from '@/lib/print-letterhead';
import { PrintLetterPage } from '@/components/common/PrintLetterPage';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/format';

export default function LaporanStockMaterialPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const slugParam = router.query.slug;

  // Resolve companyId. PT Wajira Yanotama = 3
  const resolvedCompanyId = resolveCompanyId(slugParam, companyId) || 3;
  const selectedPrintBackground = getLetterheadByCompanyId(resolvedCompanyId);

  // States
  const [activeTab, setActiveTab] = useState<'stock' | 'penerimaan' | 'pengeluaran'>('stock');
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(25);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page when tab changes
  const handleTabChange = (val: string) => {
    setActiveTab(val as 'stock' | 'penerimaan' | 'pengeluaran');
    setPage(1);
  };

  // Fetch report data
  const { data, pagination, isLoading, isError, error } = useStockMaterialReport({
    activeTab,
    companyId: resolvedCompanyId,
    page,
    perPage,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });

  const visiblePages = getVisiblePageNumbers(pagination.lastPage, page, 5);

  const formatDateString = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return format(date, 'dd MMM yyyy', { locale: id });
  };

  // Sorting handler
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Print triggering handler
  const handlePrint = () => {
    window.print();
  };

  // Print Header Title based on active tab
  const getPrintTitle = () => {
    if (activeTab === 'stock') return 'Laporan Stock Perlengkapan';
    if (activeTab === 'penerimaan') return 'Laporan Penerimaan Barang';
    return 'Laporan Pengeluaran Barang';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between no-print">
          <div>
            <h1 className="text-2xl font-semibold">Laporan Stock Material</h1>
            <p className="text-sm text-muted-foreground">Laporan stock material, penerimaan barang, dan pengeluaran barang</p>
          </div>
          <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Tabs Navigation */}
          <div className="flex mb-6 no-print">
            <TabsList className="flex h-auto p-1 bg-slate-100 border border-slate-200/60 rounded-xl">
              <TabsTrigger
                value="stock"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                Laporan Stock Perlengkapan
              </TabsTrigger>
              <TabsTrigger
                value="penerimaan"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                Laporan Penerimaan Barang
              </TabsTrigger>
              <TabsTrigger
                value="pengeluaran"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                Laporan Pengeluaran Barang
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="space-y-4">
            {/* Filtering Block (Search and Show Page dropdown) */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between no-print">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-[300px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search here"
                    className="pl-9 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                  <span>Show</span>
                  <Select value={String(perPage)} onValueChange={(value) => { setPerPage(Number(value)); setPage(1); }}>
                    <SelectTrigger className="w-[70px] bg-white">
                      <SelectValue placeholder="25" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>Page</span>
                </div>
              </div>
            </div>

          {/* Print Letter Wrapping Container */}
          <PrintLetterPage
            id="laporan-stock-material-print"
            className="laporan-penerimaan-print-area"
            letterheadSrc={selectedPrintBackground}
          >
            <div className="laporan-penerimaan-print-content print-letter-content">
              {/* Cover Letter Heading - Visible only in Print */}
              <div className="hidden print:flex flex-col items-center justify-center text-center space-y-1 mb-6 w-full">
                <h2 className="text-[18px] font-bold uppercase text-gray-900 tracking-wide">
                  {getPrintTitle()}
                </h2>
                <p className="text-[15px] font-bold text-gray-900 tracking-wide">
                  PT WAJIRA YANOTAMA
                </p>
                <p className="text-[12px] text-gray-600">
                  Tanggal Cetak: {formatDate(new Date())}
                </p>
              </div>

              {/* Loader and Table Rendering */}
              {isLoading ? (
                <div className="flex justify-center items-center py-24 w-full bg-white rounded-xl border border-slate-200">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : isError ? (
                <div className="flex flex-col justify-center items-center py-20 w-full bg-white rounded-xl border border-red-100 text-center p-6">
                  <p className="text-red-600 font-semibold mb-1">Gagal memuat data laporan</p>
                  <p className="text-sm text-slate-500">{(error as any)?.message || 'Terjadi kesalahan pada server backend'}</p>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-none w-full">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500 px-4 py-4">NO</TableHead>
                          {activeTab !== 'stock' && (
                            <TableHead onClick={() => handleSort('transaction_date')} className="cursor-pointer select-none text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span>TANGGAL</span>
                                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              </div>
                            </TableHead>
                          )}
                          <TableHead onClick={() => handleSort('material_code')} className="cursor-pointer select-none text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-left">
                            <div className="flex items-center justify-start gap-1">
                              <span>KODE BARANG</span>
                              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            </div>
                          </TableHead>
                          <TableHead onClick={() => handleSort('material_name')} className="cursor-pointer select-none text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-left">
                            <div className="flex items-center justify-start gap-1">
                              <span>NAMA BARANG</span>
                              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            </div>
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-center">
                            QTY
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-left">
                            SATUAN
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.length > 0 ? (
                          data.map((item, idx) => {
                            const indexNumber = idx + 1 + (page - 1) * perPage;

                            // Material fields
                            const code = item.material?.code || '-';
                            const name = item.material?.name || '-';

                            // Qty parsing:
                            // Stock tab: current_stock fallback to qty
                            // Penerimaan/Pengeluaran tab: qty
                            let displayQty = 0;
                            if (activeTab === 'stock') {
                              displayQty = item.current_stock !== null && item.current_stock !== undefined ? item.current_stock : (item.qty || 0);
                            } else {
                              displayQty = item.qty || 0;
                            }

                            // Satuan parsing: material.type fallback type
                            const satuan = item.material?.type || item.type || '-';

                            // Transaction date
                            const tgl = item.goods_transaction?.transaction_date
                              ? formatDateString(item.goods_transaction.transaction_date)
                              : '-';

                            return (
                              <TableRow key={item.uuid || idx} className="border-slate-200 hover:bg-gray-50 transition-colors">
                                <TableCell className="text-center px-4 py-4 text-sm text-slate-500">{indexNumber}</TableCell>
                                {activeTab !== 'stock' && (
                                  <TableCell className="text-center px-4 py-4 text-sm text-slate-700 whitespace-nowrap">{tgl}</TableCell>
                                )}
                                <TableCell className="text-left px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">{code}</TableCell>
                                <TableCell className="text-left px-4 py-4 text-sm text-slate-700 whitespace-nowrap">{name}</TableCell>
                                <TableCell className="text-center px-4 py-4 text-sm text-slate-700 whitespace-nowrap">{displayQty}</TableCell>
                                <TableCell className="text-left px-4 py-4 text-sm text-slate-700 whitespace-nowrap">{satuan}</TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={activeTab === 'stock' ? 5 : 6} className="h-28 text-center text-slate-500 font-medium px-4 py-4 text-sm">
                              Tidak ada data laporan ditemukan.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </PrintLetterPage>

          {/* Pagination Footer */}
          {!isLoading && !isError && pagination.total > 0 && (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between no-print">
              <p className="text-sm text-slate-500">
                Showing {pagination.from}-{pagination.to} of {pagination.total} data
              </p>
              <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                {visiblePages.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                      pageNumber === page
                        ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                        : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                    )}
                    disabled={isLoading}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                ))}
                {pagination.lastPage > 5 && !visiblePages.includes(pagination.lastPage) && (
                  <>
                    <span className="px-1 text-slate-500">...</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 min-w-9 rounded-xl border border-transparent bg-transparent px-3 text-sm font-medium text-slate-700 hover:border-slate-200 hover:bg-white"
                      disabled={isLoading}
                      onClick={() => setPage(pagination.lastPage)}
                    >
                      {pagination.lastPage}
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
                  disabled={page >= pagination.lastPage || pagination.total === 0 || isLoading}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
