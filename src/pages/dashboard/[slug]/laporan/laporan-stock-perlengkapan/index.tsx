"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Printer, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

function SortIcon({ sortKey, currentSortKey, sortOrder }: { sortKey: string; currentSortKey: string; sortOrder: 'asc' | 'desc' }) {
  const isActive = currentSortKey === sortKey;
  if (isActive && sortOrder === 'asc')
    return <ArrowUp className="h-3.5 w-3.5 text-indigo-600 shrink-0 transition-colors ml-1 inline-block" />;
  if (isActive && sortOrder === 'desc')
    return <ArrowDown className="h-3.5 w-3.5 text-indigo-600 shrink-0 transition-colors ml-1 inline-block" />;
  return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity duration-150 ml-1 inline-block" />;
}

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
    return format(date, 'dd MMMM yyyy', { locale: id });
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
      <div className="space-y-6">
        {/* Header Section */}
        <div className="no-print">
          <h1 className="text-2xl font-semibold">Laporan Stock Perlengkapan</h1>
          <p className="text-sm text-muted-foreground">Laporan stock perlengkapan, penerimaan barang, dan pengeluaran barang</p>
        </div>

        {/* Search + Print row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
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
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>Page</span>
            </div>
          </div>
          <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Tabs Navigation */}
          <div className="flex mb-4 no-print">
            <TabsList className="flex h-auto p-1 bg-gray-50 border border-gray-100 rounded-md w-fit">
              <TabsTrigger
                value="stock"
                className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm cursor-pointer whitespace-nowrap"
              >
                Laporan Stock Perlengkapan
              </TabsTrigger>
              <TabsTrigger
                value="penerimaan"
                className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm cursor-pointer whitespace-nowrap"
              >
                Laporan Penerimaan Barang
              </TabsTrigger>
              <TabsTrigger
                value="pengeluaran"
                className="rounded-lg px-6 py-2.5 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm cursor-pointer whitespace-nowrap"
              >
                Laporan Pengeluaran Barang
              </TabsTrigger>
            </TabsList>
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

              {/* Table Rendering (static header, dynamic body) */}
              <div className="rounded-md border border-gray-200 bg-white overflow-hidden shadow-none w-full">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                      {activeTab === 'stock' && (
                        <TableRow className="hover:bg-[#f8f9fa]">
                          <TableHead className="w-12 px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NO</TableHead>
                          <TableHead
                            onClick={() => handleSort('code')}
                            className={cn(
                              "group px-4 py-4 cursor-pointer select-none text-xs font-semibold uppercase transition-colors whitespace-nowrap text-left",
                              sortBy === 'code' ? 'text-gray-900' : 'text-slate-500 hover:text-slate-800'
                            )}
                          >
                            <div className="flex items-center gap-1">
                              <span>KODE BARANG</span>
                              <SortIcon sortKey="code" currentSortKey={sortBy} sortOrder={sortOrder} />
                            </div>
                          </TableHead>
                          <TableHead
                            onClick={() => handleSort('name')}
                            className={cn(
                              "group px-4 py-4 cursor-pointer select-none text-xs font-semibold uppercase transition-colors whitespace-nowrap text-left",
                              sortBy === 'name' ? 'text-gray-900' : 'text-slate-500 hover:text-slate-800'
                            )}
                          >
                            <div className="flex items-center gap-1">
                              <span>NAMA BARANG</span>
                              <SortIcon sortKey="name" currentSortKey={sortBy} sortOrder={sortOrder} />
                            </div>
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-center">QTY</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-left">LOKASI/ARMADA</TableHead>
                        </TableRow>
                      )}

                      {activeTab === 'penerimaan' && (
                        <TableRow className="hover:bg-[#f8f9fa]">
                          <TableHead className="w-12 px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NO</TableHead>
                          <TableHead
                            onClick={() => handleSort('transaction_date')}
                            className={cn(
                              "group px-4 py-4 cursor-pointer select-none text-xs font-semibold uppercase transition-colors whitespace-nowrap text-center",
                              sortBy === 'transaction_date' ? 'text-gray-900' : 'text-slate-500 hover:text-slate-800'
                            )}
                          >
                            <div className="inline-flex items-center justify-center">
                              <span className="w-3.5 shrink-0" />
                              <span>TANGGAL</span>
                              <SortIcon sortKey="transaction_date" currentSortKey={sortBy} sortOrder={sortOrder} />
                            </div>
                          </TableHead>
                          <TableHead
                            onClick={() => handleSort('code')}
                            className={cn(
                              "group px-4 py-4 cursor-pointer select-none text-xs font-semibold uppercase transition-colors whitespace-nowrap text-left",
                              sortBy === 'code' ? 'text-gray-900' : 'text-slate-500 hover:text-slate-800'
                            )}
                          >
                            <div className="flex items-center gap-1">
                              <span>KODE BARANG</span>
                              <SortIcon sortKey="code" currentSortKey={sortBy} sortOrder={sortOrder} />
                            </div>
                          </TableHead>
                          <TableHead
                            onClick={() => handleSort('name')}
                            className={cn(
                              "group px-4 py-4 cursor-pointer select-none text-xs font-semibold uppercase transition-colors whitespace-nowrap text-left",
                              sortBy === 'name' ? 'text-gray-900' : 'text-slate-500 hover:text-slate-800'
                            )}
                          >
                            <div className="flex items-center gap-1">
                              <span>NAMA BARANG</span>
                              <SortIcon sortKey="name" currentSortKey={sortBy} sortOrder={sortOrder} />
                            </div>
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-center">QTY</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-left">LOKASI</TableHead>
                        </TableRow>
                      )}

                      {activeTab === 'pengeluaran' && (
                        <TableRow className="hover:bg-[#f8f9fa]">
                          <TableHead className="w-12 px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NO</TableHead>
                          <TableHead
                            onClick={() => handleSort('transaction_date')}
                            className={cn(
                              "group px-4 py-4 cursor-pointer select-none text-xs font-semibold uppercase transition-colors whitespace-nowrap text-center",
                              sortBy === 'transaction_date' ? 'text-gray-900' : 'text-slate-500 hover:text-slate-800'
                            )}
                          >
                            <div className="inline-flex items-center justify-center">
                              <span className="w-3.5 shrink-0" />
                              <span>TANGGAL</span>
                              <SortIcon sortKey="transaction_date" currentSortKey={sortBy} sortOrder={sortOrder} />
                            </div>
                          </TableHead>
                          <TableHead
                            onClick={() => handleSort('code')}
                            className={cn(
                              "group px-4 py-4 cursor-pointer select-none text-xs font-semibold uppercase transition-colors whitespace-nowrap text-left",
                              sortBy === 'code' ? 'text-gray-900' : 'text-slate-500 hover:text-slate-800'
                            )}
                          >
                            <div className="flex items-center gap-1">
                              <span>KODE BARANG</span>
                              <SortIcon sortKey="code" currentSortKey={sortBy} sortOrder={sortOrder} />
                            </div>
                          </TableHead>
                          <TableHead
                            onClick={() => handleSort('name')}
                            className={cn(
                              "group px-4 py-4 cursor-pointer select-none text-xs font-semibold uppercase transition-colors whitespace-nowrap text-left",
                              sortBy === 'name' ? 'text-gray-900' : 'text-slate-500 hover:text-slate-800'
                            )}
                          >
                            <div className="flex items-center gap-1">
                              <span>NAMA BARANG</span>
                              <SortIcon sortKey="name" currentSortKey={sortBy} sortOrder={sortOrder} />
                            </div>
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-center">QTY</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-left">NO POLISI</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 px-4 py-4 whitespace-nowrap text-left">DRIVER</TableHead>
                        </TableRow>
                      )}
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center">
                            <div className="flex items-center justify-center gap-2 text-slate-400">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span className="text-sm font-medium">Memuat data...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : isError ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-red-600 font-semibold p-4">
                            <p className="mb-0.5">Gagal memuat data laporan</p>
                            <p className="text-xs text-slate-500 font-normal">{(error as any)?.message || 'Terjadi kesalahan pada server backend'}</p>
                          </TableCell>
                        </TableRow>
                      ) : data.length > 0 ? (
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
                              <TableRow key={item.uuid || idx} className="border-slate-200 hover:bg-gray-50 transition-colors">
                                <TableCell className="px-4 py-4 text-center text-sm font-medium text-slate-500">{indexNumber}</TableCell>
                                <TableCell className="px-4 py-4 text-left font-mono text-sm text-gray-900 whitespace-nowrap">{code}</TableCell>
                                <TableCell className="px-4 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">{name}</TableCell>
                                <TableCell className="px-4 py-4 text-center text-gray-900 font-medium whitespace-nowrap text-sm">{displayQty}</TableCell>
                                <TableCell className="px-4 py-4 text-left text-sm text-slate-600 whitespace-nowrap">{lokasiArmada}</TableCell>
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
                              <TableRow key={item.uuid || idx} className="border-slate-200 hover:bg-gray-50 transition-colors">
                                <TableCell className="px-4 py-4 text-center text-sm font-medium text-slate-500">{indexNumber}</TableCell>
                                <TableCell className="px-4 py-4 text-center text-sm text-slate-600 whitespace-nowrap">{tgl}</TableCell>
                                <TableCell className="px-4 py-4 text-left font-mono text-sm text-gray-900 whitespace-nowrap">{code}</TableCell>
                                <TableCell className="px-4 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">{name}</TableCell>
                                <TableCell className="px-4 py-4 text-center text-gray-900 font-medium whitespace-nowrap text-sm">{qtyVal}</TableCell>
                                <TableCell className="px-4 py-4 text-left text-sm text-slate-600 whitespace-nowrap">{lokasi}</TableCell>
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
                            <TableRow key={item.uuid || idx} className="border-slate-200 hover:bg-gray-50 transition-colors">
                              <TableCell className="px-4 py-4 text-center text-sm font-medium text-slate-500">{indexNumber}</TableCell>
                              <TableCell className="px-4 py-4 text-center text-sm text-slate-600 whitespace-nowrap">{tgl}</TableCell>
                              <TableCell className="px-4 py-4 text-left font-mono text-sm text-gray-900 whitespace-nowrap">{code}</TableCell>
                              <TableCell className="px-4 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">{name}</TableCell>
                              <TableCell className="px-4 py-4 text-center text-gray-900 font-medium whitespace-nowrap text-sm">{qtyVal}</TableCell>
                              <TableCell className="px-4 py-4 text-left font-mono text-sm text-gray-900 whitespace-nowrap">{noPolisi}</TableCell>
                              <TableCell className="px-4 py-4 text-left text-sm text-slate-600 whitespace-nowrap">{driver}</TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow className="group">
                          <TableCell colSpan={100} className="py-16 h-32 text-center text-sm text-slate-500">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="rounded-full bg-slate-50 p-4 mb-2">
                                <Search className="h-8 w-8 text-slate-400" />
                              </div>
                              <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                              <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
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
                  className="h-9 rounded-md px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
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
                      'h-9 min-w-9 rounded-md border px-3 text-sm font-medium shadow-none',
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
                      className="h-9 min-w-9 rounded-md border border-transparent bg-transparent px-3 text-sm font-medium text-slate-700 hover:border-slate-200 hover:bg-white"
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
                  className="h-9 rounded-md px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
                  disabled={page >= pagination.lastPage || pagination.total === 0 || isLoading}
                  onClick={() => setPage(page + 1)}
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
