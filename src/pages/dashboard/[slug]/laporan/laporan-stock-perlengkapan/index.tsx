"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Printer, Loader2, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

import { useStockPerlengkapanReport } from '@/hooks/report/useStockPerlengkapanReport';
import { useCompany } from '@/contexts/CompanyContext';
import { resolveCompanyId, getLetterheadByCompanyId } from '@/lib/print-letterhead';
import { PrintLetterPage } from '@/components/common/PrintLetterPage';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/format';

export default function LaporanStockPerlengkapanPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const slugParam = router.query.slug;

  // Resolve companyId. Defaults to Wajira Transindo (4) for this sub-menu
  const resolvedCompanyId = resolveCompanyId(slugParam, companyId) || 4;
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
  const { data, pagination, isLoading, isError, error } = useStockPerlengkapanReport({
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
    return format(date, 'dd/MM/yyyy');
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

  // Resolve Company Name for Cover Letter Print Heading
  const getCompanyName = (coId: number) => {
    if (coId === 1) return 'PT WAJIRA JAGRATARA MORINDO';
    if (coId === 3) return 'PT WAJIRA YANOTAMA';
    if (coId === 4) return 'PT WAJIRA TRANSINDO';
    return 'PT WAJIRA TRANSINDO';
  };

  // Print Header Title based on active tab
  const getPrintTitle = () => {
    if (activeTab === 'stock') return 'Laporan Stock Perlengkapan';
    if (activeTab === 'penerimaan') return 'Laporan Penerimaan Barang';
    return 'Laporan Pengeluaran Barang';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 px-1">
        {/* Header Section */}
        <div className="flex justify-between items-start no-print">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Laporan Stock Perlengkapan</h1>
            <p className="text-sm text-slate-500 mt-1">Laporan stock perlengkapan, penerimaan barang, dan pengeluaran barang</p>
          </div>
          <Button onClick={handlePrint} variant="outline" className="gap-2 rounded-xl px-4 py-2 border-slate-200 hover:bg-slate-50 cursor-pointer shadow-sm">
            <Printer className="h-4.5 w-4.5 text-slate-700" /> Print
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Tabs Navigation & Filtering Block */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between no-print mb-6">
            <TabsList className="flex h-auto p-1 bg-slate-100 border border-slate-200/60 rounded-xl w-fit">
              <TabsTrigger
                value="stock"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer whitespace-nowrap"
              >
                Laporan Stock Perlengkapan
              </TabsTrigger>
              <TabsTrigger
                value="penerimaan"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer whitespace-nowrap"
              >
                Laporan Penerimaan Barang
              </TabsTrigger>
              <TabsTrigger
                value="pengeluaran"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer whitespace-nowrap"
              >
                Laporan Pengeluaran Barang
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between no-print mb-2">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-[300px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search here"
                    className="pl-9 bg-white rounded-xl border-slate-200 shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                  <span>Show</span>
                  <Select value={String(perPage)} onValueChange={(value) => { setPerPage(Number(value)); setPage(1); }}>
                    <SelectTrigger className="w-[80px] rounded-xl border-slate-200 bg-white shadow-sm cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="cursor-pointer" value="5">5</SelectItem>
                      <SelectItem className="cursor-pointer" value="8">8</SelectItem>
                      <SelectItem className="cursor-pointer" value="10">10</SelectItem>
                      <SelectItem className="cursor-pointer" value="25">25</SelectItem>
                      <SelectItem className="cursor-pointer" value="50">50</SelectItem>
                      <SelectItem className="cursor-pointer" value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>Page</span>
                </div>
              </div>
            </div>
          </div>


          {/* Print Letter Wrapping Container */}
          <PrintLetterPage
            id="laporan-stock-perlengkapan-print"
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
                  {getCompanyName(resolvedCompanyId)}
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
                <Card className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm w-full">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 border-b border-slate-200">
                        {activeTab === 'stock' && (
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12 text-center text-xs font-bold uppercase text-slate-700">NO</TableHead>
                            <TableHead onClick={() => handleSort('code')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              KODE BARANG <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('name')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NAMA BARANG <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">QTY</TableHead>
                            <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">LOKASI/ARMADA</TableHead>
                          </TableRow>
                        )}

                        {activeTab === 'penerimaan' && (
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12 text-center text-xs font-bold uppercase text-slate-700">NO</TableHead>
                            <TableHead onClick={() => handleSort('transaction_date')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              TANGGAL <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('code')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              KODE BARANG <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('name')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NAMA BARANG <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">QTY</TableHead>
                            <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">LOKASI</TableHead>
                          </TableRow>
                        )}

                        {activeTab === 'pengeluaran' && (
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12 text-center text-xs font-bold uppercase text-slate-700">NO</TableHead>
                            <TableHead onClick={() => handleSort('transaction_date')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              TANGGAL <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('code')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              KODE BARANG <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('name')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NAMA BARANG <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">QTY</TableHead>
                            <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">NO POLISI</TableHead>
                            <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">DRIVER</TableHead>
                          </TableRow>
                        )}
                      </TableHeader>
                      <TableBody>
                        {data.length > 0 ? (
                          data.map((item, idx) => {
                            const indexNumber = idx + 1 + (page - 1) * perPage;

                            // Common fields
                            const code = item.vehicle_equipment?.code || item.code || '-';
                            const name = item.vehicle_equipment?.name || item.name || '-';

                            // Render table row based on active tab
                            if (activeTab === 'stock') {
                              const displayQty = item.current_stock !== undefined && item.current_stock !== null
                                ? item.current_stock
                                : (item.total_stock !== undefined && item.total_stock !== null ? item.total_stock : (item.qty || 0));

                              const lokasiArmada = item.location ||
                                item.goods_transaction?.location ||
                                item.vehicle_fleet?.registration_number ||
                                item.goods_transaction?.vehicle_fleet?.registration_number ||
                                item.goods_transaction?.vehicle?.registration_number ||
                                item.armada ||
                                '-';

                              return (
                                <TableRow key={item.uuid || idx} className="border-slate-100 hover:bg-slate-50/50">
                                  <TableCell className="text-center font-medium text-slate-500">{indexNumber}</TableCell>
                                  <TableCell className="font-mono text-[13px] text-slate-700 whitespace-nowrap">{code}</TableCell>
                                  <TableCell className="font-semibold text-slate-800 whitespace-nowrap">{name}</TableCell>
                                  <TableCell className="text-slate-800 font-medium whitespace-nowrap">{displayQty}</TableCell>
                                  <TableCell className="text-slate-600 whitespace-nowrap">{lokasiArmada}</TableCell>
                                </TableRow>
                              );
                            }

                            if (activeTab === 'penerimaan') {
                              const tgl = item.goods_transaction?.transaction_date
                                ? formatDateString(item.goods_transaction.transaction_date)
                                : '-';
                              const qtyVal = item.qty || 0;
                              const lokasi = item.location || item.goods_transaction?.location || '-';

                              return (
                                <TableRow key={item.uuid || idx} className="border-slate-100 hover:bg-slate-50/50">
                                  <TableCell className="text-center font-medium text-slate-500">{indexNumber}</TableCell>
                                  <TableCell className="text-slate-600 whitespace-nowrap">{tgl}</TableCell>
                                  <TableCell className="font-mono text-[13px] text-slate-700 whitespace-nowrap">{code}</TableCell>
                                  <TableCell className="font-semibold text-slate-800 whitespace-nowrap">{name}</TableCell>
                                  <TableCell className="text-slate-800 font-medium whitespace-nowrap">{qtyVal}</TableCell>
                                  <TableCell className="text-slate-600 whitespace-nowrap">{lokasi}</TableCell>
                                </TableRow>
                              );
                            }

                            // activeTab === 'pengeluaran'
                            const tgl = item.goods_transaction?.transaction_date
                              ? formatDateString(item.goods_transaction.transaction_date)
                              : '-';
                            const qtyVal = item.qty || 0;
                            const noPolisi = item.goods_transaction?.vehicle_fleet?.registration_number ||
                              item.vehicle_fleet?.registration_number ||
                              item.goods_transaction?.vehicle?.registration_number ||
                              item.armada ||
                              '-';
                            const driver = item.goods_transaction?.driver?.name || item.driver?.name || '-';

                            return (
                              <TableRow key={item.uuid || idx} className="border-slate-100 hover:bg-slate-50/50">
                                <TableCell className="text-center font-medium text-slate-500">{indexNumber}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap">{tgl}</TableCell>
                                <TableCell className="font-mono text-[13px] text-slate-700 whitespace-nowrap">{code}</TableCell>
                                <TableCell className="font-semibold text-slate-800 whitespace-nowrap">{name}</TableCell>
                                <TableCell className="text-slate-800 font-medium whitespace-nowrap">{qtyVal}</TableCell>
                                <TableCell className="font-mono text-[13px] text-slate-700 whitespace-nowrap">{noPolisi}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap">{driver}</TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={activeTab === 'pengeluaran' ? 7 : activeTab === 'penerimaan' ? 6 : 5} className="h-28 text-center text-slate-500 font-medium">
                              Tidak ada data laporan ditemukan.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}
            </div>
          </PrintLetterPage>

          {/* Pagination Footer */}
          {!isLoading && !isError && pagination.total > 0 && (
            <div className="flex flex-col gap-4 px-1 py-4 md:flex-row md:items-center md:justify-between no-print">
              <div className="text-sm text-slate-500">
                Showing {pagination.from}-{pagination.to} of {pagination.total} data
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="rounded-xl px-3 hover:bg-slate-100 font-semibold text-[13px] cursor-pointer"
                >
                  Previous
                </Button>
                {visiblePages[0] > 1 && <span className="px-1.5 text-slate-400">...</span>}
                {visiblePages.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === page ? 'outline' : 'ghost'}
                    size="sm"
                    onClick={() => setPage(pageNumber)}
                    className={cn(
                      "h-9 min-w-9 rounded-xl border-slate-200 text-[13px] font-semibold cursor-pointer",
                      pageNumber === page
                        ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-slate-200 hover:bg-slate-50"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {pageNumber}
                  </Button>
                ))}
                {visiblePages[visiblePages.length - 1] < pagination.lastPage && <span className="px-1.5 text-slate-400">...</span>}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.lastPage}
                  className="rounded-xl px-3 hover:bg-slate-100 font-semibold text-[13px] cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
