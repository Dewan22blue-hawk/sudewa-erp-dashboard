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

import { useJumlahDaftarReport } from '@/hooks/report/useJumlahDaftarReport';
import { useCompany } from '@/contexts/CompanyContext';
import { resolveCompanyId, getLetterheadByCompanyId } from '@/lib/print-letterhead';
import { PrintLetterPage } from '@/components/common/PrintLetterPage';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/format';

export default function LPJumlahDaftarPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const slugParam = router.query.slug;

  const resolvedCompanyId = resolveCompanyId(slugParam, companyId);
  const selectedPrintBackground = getLetterheadByCompanyId(resolvedCompanyId);

  // States
  const [activeTab, setActiveTab] = useState<'bpkb' | 'stnk' | 'skpd' | 'tnkb'>('bpkb');
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

  // Reset page, search and sorting when tab changes
  const handleTabChange = (val: string) => {
    setActiveTab(val as 'bpkb' | 'stnk' | 'skpd' | 'tnkb');
    setPage(1);
    setSearchTerm('');
    setDebouncedSearch('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  // Fetch report data
  const { data, pagination, isLoading, isError, error } = useJumlahDaftarReport({
    activeTab,
    page,
    perPage,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });

  const visiblePages = getVisiblePageNumbers(pagination.lastPage, page, 5);

  // Formatting helpers
  const formatVehicleType = (type?: string | null) => {
    if (!type) return '-';
    const t = type.toLowerCase().trim();
    if (t === 'r2') return 'Roda Dua';
    if (t === 'r3') return 'Roda Tiga';
    if (t === 'r4') return 'Roda Empat';
    return type;
  };

  const renderPhysicalStatus = (status?: boolean | null) => {
    if (status === null || status === undefined) return '-';
    return status ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Ada / Tersedia
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        Belum Ada
      </span>
    );
  };

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

  return (
    <DashboardLayout>
      <div className="space-y-6 px-1">
        {/* Header Section */}
        <div className="flex justify-between items-start no-print">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Laporan Jumlah Daftar</h1>
            <p className="text-sm text-slate-500 mt-1">Laporan jumlah data masuk ke sistem</p>
          </div>
          <Button onClick={handlePrint} variant="outline" className="gap-2 rounded-xl px-4 py-2 border-slate-200 hover:bg-slate-50 cursor-pointer shadow-sm">
            <Printer className="h-4.5 w-4.5 text-slate-700" /> Print
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Tabs Navigation (Pills structure) */}
          <div className="flex mb-6 no-print">
            <TabsList className="flex h-auto p-1 bg-slate-100 border border-slate-200/60 rounded-xl">
              <TabsTrigger
                value="bpkb"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                LP Jumlah Daftar BPKB
              </TabsTrigger>
              <TabsTrigger
                value="stnk"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                LP Jumlah Daftar STNK
              </TabsTrigger>
              <TabsTrigger
                value="skpd"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                LP Jumlah Daftar SKPD
              </TabsTrigger>
              <TabsTrigger
                value="tnkb"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                LP Jumlah Daftar TNKB
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Filtering Block (Search and Show Page dropdown) */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center no-print mb-5">
            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search here"
                className="h-11 rounded-xl border-slate-200 bg-white pl-11 shadow-sm focus-visible:ring-1"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span>Show</span>
              <Select value={String(perPage)} onValueChange={(value) => { setPerPage(Number(value)); setPage(1); }}>
                <SelectTrigger className="h-11 w-[90px] rounded-xl border-slate-200 bg-white shadow-sm cursor-pointer">
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

          {/* Print Letter Wrapping Container */}
          <PrintLetterPage
            id="laporan-jumlah-daftar-print"
            className="laporan-penerimaan-print-area"
            letterheadSrc={selectedPrintBackground}
          >
            <div className="laporan-penerimaan-print-content print-letter-content">
              {/* Cover Letter Heading - Visible only in Print */}
              <div className="hidden print:flex flex-col items-center justify-center text-center space-y-1 mb-6 w-full">
                <h2 className="text-[18px] font-bold uppercase text-gray-900 tracking-wide">
                  {activeTab === 'bpkb' && 'LP Jumlah Daftar BPKB'}
                  {activeTab === 'stnk' && 'LP Jumlah Daftar STNK'}
                  {activeTab === 'skpd' && 'LP Jumlah Daftar SKPD'}
                  {activeTab === 'tnkb' && 'LP Jumlah Daftar TNKB'}
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
                <Card className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm w-full">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 border-b border-slate-200">
                        {/* Tab BPKB Header */}
                        {activeTab === 'bpkb' && (
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12 text-center text-xs font-bold uppercase text-slate-700">NO</TableHead>
                            <TableHead onClick={() => handleSort('stnk_name')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NAMA BPKB <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('bpkb_number')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NOMOR BPKB <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('region')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              WILAYAH <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('dealer')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              DEALER <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('vendor')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              VENDOR <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('tnkb_number')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NO POLISI <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('vehicle_type')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              JENIS <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('chassis_number')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NO RANGKA <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('machine_number')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NO MESIN <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('registration_date')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              TGL DAFTAR <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('bpkb_physical_status')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap text-center">
                              FISIK BPKB <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                          </TableRow>
                        )}

                        {/* Tab STNK Header */}
                        {activeTab === 'stnk' && (
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12 text-center text-xs font-bold uppercase text-slate-700">NO</TableHead>
                            <TableHead onClick={() => handleSort('stnk_name')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NAMA STNK <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('stnk_number')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NOMOR STNK <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('region')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              WILAYAH <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('dealer')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              DEALER <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('vendor')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              VENDOR <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('tnkb_number')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NO POLISI <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('vehicle_type')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              JENIS <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('chassis_number')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NO RANGKA <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('machine_number')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NO MESIN <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('registration_date')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              TGL DAFTAR <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('stnk_physical_status')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap text-center">
                              FISIK STNK <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                          </TableRow>
                        )}

                        {/* Tab SKPD Header */}
                        {activeTab === 'skpd' && (
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12 text-center text-xs font-bold uppercase text-slate-700">NO</TableHead>
                            <TableHead onClick={() => handleSort('stnk_name')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NAMA SKPD <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('region')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              WILAYAH <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('dealer')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              DEALER <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('vendor')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              VENDOR <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('tnkb_number')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NO POLISI <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('vehicle_type')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              JENIS <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('chassis_number')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NO RANGKA <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('machine_number')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NO MESIN <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('registration_date')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              TGL DAFTAR <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('skpd_physical_status')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap text-center">
                              FISIK SKPD <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                          </TableRow>
                        )}

                        {/* Tab TNKB Header */}
                        {activeTab === 'tnkb' && (
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12 text-center text-xs font-bold uppercase text-slate-700">NO</TableHead>
                            <TableHead onClick={() => handleSort('stnk_name')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NAMA TNKB <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('region')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              WILAYAH <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('dealer')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              DEALER <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('vendor')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              VENDOR <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('tnkb_number')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NO POLISI <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('vehicle_type')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              JENIS <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('chassis_number')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NO RANGKA <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('machine_number')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              NO MESIN <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('registration_date')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap">
                              TGL DAFTAR <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('tnkb_physical_status')} className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap text-center">
                              FISIK TNKB <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                            </TableHead>
                          </TableRow>
                        )}
                      </TableHeader>
                      <TableBody>
                        {data.length > 0 ? (
                          data.map((item, idx) => {
                            const indexNumber = idx + 1 + (page - 1) * perPage;
                            return (
                              <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/50">
                                <TableCell className="text-center font-medium text-slate-500">{indexNumber}</TableCell>
                                <TableCell className="font-semibold text-slate-800 whitespace-nowrap">{item.stnk_name || '-'}</TableCell>
                                
                                {activeTab === 'bpkb' && <TableCell className="font-medium whitespace-nowrap">{(item as any).bpkb_number || '-'}</TableCell>}
                                {activeTab === 'stnk' && <TableCell className="font-medium whitespace-nowrap">{(item as any).stnk_number || '-'}</TableCell>}

                                <TableCell className="text-slate-600 whitespace-nowrap">{item.region || '-'}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap">{item.dealer || '-'}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap">{item.vendor || '-'}</TableCell>
                                <TableCell className="font-medium text-slate-800 whitespace-nowrap">{item.tnkb_number || '-'}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap">{formatVehicleType(item.vehicle_type)}</TableCell>
                                <TableCell className="text-slate-600 font-mono text-[13px] whitespace-nowrap">{item.chassis_number || '-'}</TableCell>
                                <TableCell className="text-slate-600 font-mono text-[13px] whitespace-nowrap">{item.machine_number || '-'}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap">{formatDateString(item.registration_date)}</TableCell>
                                
                                <TableCell className="text-center whitespace-nowrap">
                                  {activeTab === 'bpkb' && renderPhysicalStatus((item as any).bpkb_physical_status)}
                                  {activeTab === 'stnk' && renderPhysicalStatus((item as any).stnk_physical_status)}
                                  {activeTab === 'skpd' && renderPhysicalStatus((item as any).skpd_physical_status)}
                                  {activeTab === 'tnkb' && renderPhysicalStatus((item as any).tnkb_physical_status)}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={activeTab === 'skpd' || activeTab === 'tnkb' ? 11 : 12} className="h-28 text-center text-slate-500 font-medium">
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
