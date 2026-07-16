"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Printer, Loader2, ArrowUpDown, MoreVertical, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { useInvoiceReport } from '@/hooks/report/useInvoiceReport';
import { useCompany } from '@/contexts/CompanyContext';
import { resolveCompanyId, getLetterheadByCompanyId } from '@/lib/print-letterhead';
import { PrintLetterPage } from '@/components/common/PrintLetterPage';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { cn } from '@/lib/utils';
import { formatDate, formatMoney } from '@/lib/utils/format';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';

export default function LaporanInvoicePage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const slugParam = router.query.slug;

  const resolvedCompanyId = resolveCompanyId(slugParam, companyId) || 4; // Transindo defaults to 4
  const selectedPrintBackground = getLetterheadByCompanyId(resolvedCompanyId);

  // States
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(25);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [orderBy, setOrderBy] = useState<string>('created_at');
  const [orderSort, setOrderSort] = useState<'asc' | 'desc'>('desc');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch report data
  const { data, pagination, isLoading, isError, error } = useInvoiceReport({
    page,
    perPage,
    search: debouncedSearch,
    orderBy,
    orderSort,
  });

  const visiblePages = getVisiblePageNumbers(pagination.lastPage, page, 5);

  // Formatting helpers
  const formatDateString = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return format(date, 'dd MMMM yyyy', { locale: id });
  };

  // Sorting handler
  const handleSort = (field: string) => {
    if (orderBy === field) {
      setOrderSort(orderSort === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(field);
      setOrderSort('desc');
    }
    setPage(1);
  };

  // Print triggering handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between no-print">
          <div>
            <h1 className="text-2xl font-semibold">Laporan Invoice</h1>
            <p className="text-sm text-muted-foreground">Laporan data invoice ekspedisi</p>
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
          </div>

          {/* Print Letter Wrapping Container */}
          <PrintLetterPage
            id="laporan-invoice-print"
            className="laporan-penerimaan-print-area"
            letterheadSrc={selectedPrintBackground}
          >
            <div className="laporan-penerimaan-print-content print-letter-content">
              {/* Cover Letter Heading - Visible only in Print */}
              <div className="hidden print:flex flex-col items-center justify-center text-center space-y-1 mb-6 w-full">
                <h2 className="text-[18px] font-bold uppercase text-gray-900 tracking-wide">
                  Laporan Invoice
                </h2>
                <p className="text-[15px] font-bold text-gray-900 tracking-wide">
                  PT WAJIRA TRANSINDO
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
                          <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NO</TableHead>
                          <TableHead onClick={() => handleSort('code')} className="cursor-pointer select-none text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
                            NO SURAT INV <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">TANGGAL</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">NO POLISI</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">TIPE</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">DRIVER</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">LOADING IN</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">TUJUAN</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">LOADING OUT</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">INV EKSPEDISI</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">BIAYA</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap text-center no-print">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.length > 0 ? (
                          data.map((item, idx) => {
                            const indexNumber = idx + 1 + (page - 1) * perPage;

                            const code = item.code || '-';
                            const dateStr = formatDateString(item.date);
                            const registrationNumber = item.vehicle?.registrationNumber || '-';
                            const vehicleType = item.vehicle?.type || item.orderList?.vehicleType || '-';
                            const driverName = item.driver?.name || '-';
                            const loadingIn = item.orderList?.loadingIn || '-';
                            const destination = item.orderList?.doDeliveryDestination || '-';
                            const loadingOut = item.orderList?.loadingOut || '-';

                            // Ekspedisi = bill_invoice / invoice_amount
                            const invoiceExpedition = item.orderList?.billInvoice || 0;
                            const biaya = (item.additional_fee || 0) + (item.other_fee || 0);

                            return (
                              <TableRow key={item.uuid || idx} className="border-slate-200 hover:bg-gray-50 transition-colors">
                                <TableCell className="text-center font-medium text-slate-500 text-sm">{indexNumber}</TableCell>
                                <TableCell className="font-mono text-sm text-gray-900 whitespace-nowrap">{code}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap text-sm">{dateStr}</TableCell>
                                <TableCell className="font-mono text-sm text-slate-600 whitespace-nowrap">{registrationNumber}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap text-sm">{vehicleType}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap text-sm">{driverName}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap text-sm">{loadingIn}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap text-sm">{destination}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap text-sm">{loadingOut}</TableCell>
                                <TableCell className="font-semibold text-gray-900 whitespace-nowrap text-sm">{formatMoney(invoiceExpedition, 'IDR')}</TableCell>
                                <TableCell className="font-semibold text-gray-900 whitespace-nowrap text-sm">{formatMoney(biaya, 'IDR')}</TableCell>
                                <TableCell className="text-center no-print">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="min-w-[140px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          // Arahkan ke halaman detail invoice finance Wajira
                                          router.push(`/dashboard/${slugParam}/finance/invoice/${item.id}`);
                                        }}
                                        className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer"
                                      >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Detail
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={12} className="h-28 text-center text-slate-500 font-medium text-sm">
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
      </div>
    </DashboardLayout>
  );
}
