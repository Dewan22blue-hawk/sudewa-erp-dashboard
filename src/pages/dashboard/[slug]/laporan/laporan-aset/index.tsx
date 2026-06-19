"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Printer, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

import { useAssetReport } from '@/hooks/report/useAssetReport';
import { useCompany } from '@/contexts/CompanyContext';
import { resolveCompanyId, getLetterheadByCompanyId } from '@/lib/print-letterhead';
import { PrintLetterPage } from '@/components/common/PrintLetterPage';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/format';

export default function LaporanAssetPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const slugParam = router.query.slug;

  const resolvedCompanyId = resolveCompanyId(slugParam, companyId) || 3;
  const selectedPrintBackground = getLetterheadByCompanyId(resolvedCompanyId);

  // States
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(25);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch report data
  const { data, pagination, isLoading, isError, error } = useAssetReport({
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

  const formatIDR = (value?: number | null) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
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

  const renderSortHeader = (title: string, sortKey: string, align: 'left' | 'right' | 'center' = 'left') => {
    const isSorted = sortBy === sortKey;
    const justifyClass = align === 'right' ? 'justify-end w-full' : align === 'center' ? 'justify-center w-full' : 'justify-start';
    return (
      <button
        type="button"
        className={`flex items-center gap-1 cursor-pointer select-none group w-full px-4 py-4 text-xs font-semibold uppercase transition-colors ${isSorted ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'} ${justifyClass}`}
        onClick={() => handleSort(sortKey)}
      >
        <span>{title}</span>
        {isSorted ? (
          sortOrder === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-70 transition-opacity duration-150 shrink-0 text-slate-400" />
        )}
      </button>
    );
  };

  // Print triggering handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center no-print">
          <div>
            <h1 className="text-2xl font-semibold">Laporan Aset</h1>
            <p className="text-sm text-muted-foreground">Laporan data aset perusahaan</p>
          </div>
          <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
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
                  <SelectTrigger className="w-[80px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="cursor-pointer" value="5">5</SelectItem>
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

          {/* Print Letter Wrapping Container */}
          <PrintLetterPage
            id="laporan-aset-print"
            className="laporan-penerimaan-print-area"
            letterheadSrc={selectedPrintBackground}
          >
            <div className="laporan-penerimaan-print-content print-letter-content">
              {/* Cover Letter Heading - Visible only in Print */}
              <div className="hidden print:flex flex-col items-center justify-center text-center space-y-1 mb-6 w-full">
                <h2 className="text-[18px] font-bold uppercase text-gray-900 tracking-wide">
                  Laporan Aset
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
                          <TableHead className="w-12 text-center text-xs font-semibold text-slate-500 uppercase px-4 py-4">NO</TableHead>
                          <TableHead className="p-0 text-left">
                            {renderSortHeader('Kode Aset', 'asset_code')}
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 whitespace-nowrap text-left">TGL BELI</TableHead>
                          <TableHead className="p-0 text-left">
                            {renderSortHeader('Nama Barang', 'asset_name')}
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 whitespace-nowrap text-left">TIPE ASET</TableHead>
                          <TableHead className="p-0 text-left">
                            {renderSortHeader('Serial Number', 'serial_number')}
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 whitespace-nowrap text-left">HARGA BELI</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 whitespace-nowrap text-left">UMUR EKONOMIS</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 whitespace-nowrap text-left">PENYUSUTAN/BULAN</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 whitespace-nowrap text-left">NILAI AKHIR</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.length > 0 ? (
                          data.map((item, idx) => {
                            const indexNumber = idx + 1 + (page - 1) * perPage;

                            const code = item.asset?.code || '-';
                            const serialNumber = item.asset?.serial_number || '-';
                            const name = item.asset?.name || '-';
                            const type = item.asset?.type || '-';
                            const purchaseDate = formatDateString(item.asset?.purchase_date);
                            const price = formatIDR(item.asset?.price);
                            const economicAge = item.economic_age !== null && item.economic_age !== undefined ? `${item.economic_age} TAHUN` : '-';
                            const depreciationPerMonth = formatIDR(item.depreciation_per_month);
                            const finalValue = formatIDR(item.final_value);

                            return (
                              <TableRow key={item.uuid || idx} className="border-slate-200 hover:bg-gray-50 transition-colors">
                                <TableCell className="text-center font-medium text-slate-500">{indexNumber}</TableCell>
                                <TableCell className="font-mono text-[13px] text-slate-700 whitespace-nowrap">{code}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap">{purchaseDate}</TableCell>
                                <TableCell className="font-semibold text-slate-800 whitespace-nowrap">{name}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap">{type}</TableCell>
                                <TableCell className="font-mono text-[13px] text-slate-600 whitespace-nowrap">{serialNumber}</TableCell>
                                <TableCell className="text-slate-800 font-semibold whitespace-nowrap">{price}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap">{economicAge}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap">{depreciationPerMonth}</TableCell>
                                <TableCell className="text-slate-800 font-semibold whitespace-nowrap">{finalValue}</TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={10} className="h-28 text-center text-slate-500 font-medium">
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 no-print border-t border-slate-100">
              <div className="text-sm text-slate-500">
                Showing {pagination.from} to {pagination.to} of {pagination.total} entries
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 cursor-pointer"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                {visiblePages[0] > 1 && <span className="px-1.5 text-slate-400">...</span>}
                {visiblePages.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none cursor-pointer',
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
                {visiblePages[visiblePages.length - 1] < pagination.lastPage && <span className="px-1.5 text-slate-400">...</span>}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 cursor-pointer"
                  disabled={page >= pagination.lastPage || pagination.total === 0 || isLoading}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
