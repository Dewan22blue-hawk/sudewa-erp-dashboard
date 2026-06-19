"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Search, Printer, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import { useCompany } from '@/contexts/CompanyContext';
import { resolveCompanyId, getLetterheadByCompanyId } from '@/lib/print-letterhead';
import { PrintLetterPage } from '@/components/common/PrintLetterPage';
import { getVisiblePageNumbers } from '@/lib/api/pagination';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

// Mock Data
const MOCK_RITASE = [
  { id: 1, tanggal: '2026-02-12', noPolisi: 'AB 0000 XX', tipe: 'FUSO', driver: 'Ahmad Syahroni', invEkspedisi: 1500000, biayaTambahan: null, ujDriver: 500000, biayaLainnya: null, invEkspedisiPendapatan: 2000000, tambahan: 0, ppn: 0, labaRugi: 1500000, ritase: 12 },
  { id: 2, tanggal: '2026-02-12', noPolisi: 'AB 0000 XX', tipe: 'FUSO', driver: 'Andhi Thok', invEkspedisi: 1500000, biayaTambahan: null, ujDriver: 500000, biayaLainnya: null, invEkspedisiPendapatan: 2000000, tambahan: 0, ppn: 0, labaRugi: 1500000, ritase: 12 },
  { id: 3, tanggal: '2026-02-12', noPolisi: 'AB 0000 XX', tipe: 'FUSO', driver: 'Ahmad Syahroni', invEkspedisi: 1500000, biayaTambahan: null, ujDriver: 500000, biayaLainnya: null, invEkspedisiPendapatan: 2000000, tambahan: 0, ppn: 0, labaRugi: 1500000, ritase: 12 },
  { id: 4, tanggal: '2026-02-12', noPolisi: 'AB 0000 XX', tipe: 'FUSO', driver: 'Ahmad Syahroni', invEkspedisi: 1500000, biayaTambahan: null, ujDriver: 500000, biayaLainnya: null, invEkspedisiPendapatan: 2000000, tambahan: 0, ppn: 0, labaRugi: 1500000, ritase: 12 },
  { id: 5, tanggal: '2026-02-12', noPolisi: 'AB 0000 XX', tipe: 'FUSO', driver: 'Ahmad Syahroni', invEkspedisi: 1500000, biayaTambahan: null, ujDriver: 500000, biayaLainnya: null, invEkspedisiPendapatan: 2000000, tambahan: 0, ppn: 0, labaRugi: 1500000, ritase: 12 },
  { id: 6, tanggal: '2026-02-12', noPolisi: 'AB 0000 XX', tipe: 'FUSO', driver: 'Ahmad Syahroni', invEkspedisi: 1500000, biayaTambahan: null, ujDriver: 500000, biayaLainnya: null, invEkspedisiPendapatan: 2000000, tambahan: 0, ppn: 0, labaRugi: 1500000, ritase: 12 },
  { id: 7, tanggal: '2026-02-12', noPolisi: 'AB 0000 XX', tipe: 'FUSO', driver: 'Ahmad Syahroni', invEkspedisi: 1500000, biayaTambahan: null, ujDriver: 500000, biayaLainnya: null, invEkspedisiPendapatan: 2000000, tambahan: 0, ppn: 0, labaRugi: 1500000, ritase: 12 },
  { id: 8, tanggal: '2026-02-12', noPolisi: 'AB 0000 XX', tipe: 'FUSO', driver: 'Ahmad Syahroni', invEkspedisi: 1500000, biayaTambahan: null, ujDriver: 500000, biayaLainnya: null, invEkspedisiPendapatan: 2000000, tambahan: 0, ppn: 0, labaRugi: 1500000, ritase: 12 },

];

const MOCK_MAINTENANCE = [
  { id: 1, noPolisi: 'AB 1234 XX', tipe: 'FUSO', driverPic: 'Ahmad Syahroni', sparepart: 'Ban', qty: 1, keterangan: 'Ganti ban', tglPerbaikan: '2026-01-12' },
  { id: 2, noPolisi: 'AB 4321 XO', tipe: 'TOWING', driverPic: 'Deni Caknun', sparepart: 'Oli', qty: 2, keterangan: 'Ganti oli', tglPerbaikan: '2026-06-02' },
  { id: 3, noPolisi: 'AB 9999 XX', tipe: 'FUSO', driverPic: 'Falah Hadialah', sparepart: 'Mesin', qty: 1, keterangan: 'Servis Mesin', tglPerbaikan: '2026-06-02' },
  { id: 4, noPolisi: 'AB 1241 XX', tipe: 'FUSO', driverPic: 'Wahyu Alima', sparepart: 'Ban', qty: 4, keterangan: 'Ganti ban 2 set', tglPerbaikan: '2026-06-02' },
  { id: 5, noPolisi: 'AB 1555 BGT', tipe: 'TOWING', driverPic: 'Gogon', sparepart: 'Seatbelt', qty: 1, keterangan: 'Ganti seatbelt', tglPerbaikan: '2026-06-02' },
  { id: 6, noPolisi: 'AB 1555 BGT', tipe: 'TOWING', driverPic: 'Gogon', sparepart: 'Seatbelt', qty: 1, keterangan: 'Ganti seatbelt', tglPerbaikan: '2026-06-02' },
  { id: 7, noPolisi: 'AB 1555 BGT', tipe: 'TOWING', driverPic: 'Gogon', sparepart: 'Seatbelt', qty: 1, keterangan: 'Ganti seatbelt', tglPerbaikan: '2026-06-02' },
  { id: 8, noPolisi: 'AB 1555 BGT', tipe: 'TOWING', driverPic: 'Gogon', sparepart: 'Seatbelt', qty: 1, keterangan: 'Ganti seatbelt', tglPerbaikan: '2026-06-02' },

];



export default function LaporanRitaseArmadaPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const slugParam = router.query.slug;

  const resolvedCompanyId = resolveCompanyId(slugParam, companyId) || 4;
  const selectedPrintBackground = getLetterheadByCompanyId(resolvedCompanyId);

  const getCompanyName = (coId: number) => {
    if (coId === 1) return 'PT WAJIRA JAGRATARA MORINDO';
    if (coId === 3) return 'PT WAJIRA YANOTAMA';
    if (coId === 4) return 'PT WAJIRA TRANSINDO';
    return 'PT WAJIRA';
  };

  // States
  const [activeTab, setActiveTab] = useState<'ritase' | 'maintenance'>('ritase');
  const [searchTerm, setSearchTerm] = useState('');
  const [perPage, setPerPage] = useState('25');
  const [page, setPage] = useState(1);

  // Modal Edit Ritase State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRitaseValue, setEditRitaseValue] = useState('');

  // Formatters
  const formatDateString = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return format(date, 'dd/MM/yyyy');
  };

  const formatIDR = (value?: number | null) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handlePrint = () => {
    window.print();
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchTerm, perPage]);

  // Pagination Math
  const limit = Number(perPage);
  const startIndex = (page - 1) * limit;

  // Filter & Slice Ritase
  const filteredRitase = MOCK_RITASE.filter((item) => {
    if (!searchTerm) return true;
    return Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
  });
  const paginatedRitase = filteredRitase.slice(startIndex, startIndex + limit);

  // Filter & Slice Maintenance
  const filteredMaintenance = MOCK_MAINTENANCE.filter((item) => {
    if (!searchTerm) return true;
    return Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
  });
  const paginatedMaintenance = filteredMaintenance.slice(startIndex, startIndex + limit);

  const totalRecords = activeTab === 'ritase' ? filteredRitase.length : filteredMaintenance.length;
  const lastPage = Math.ceil(totalRecords / limit) || 1;
  const visiblePages = getVisiblePageNumbers(lastPage, page, 5);

  const handleOpenEdit = () => {
    setEditRitaseValue('');
    setIsEditModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center no-print">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Laporan Ritase Armada</h1>
            <p className="text-sm text-slate-500">Laporan ritase armada yang sudah dilakukan</p>
          </div>
          <Button onClick={handlePrint} variant="outline" className="gap-2 rounded-xl px-4 py-2 border-slate-200 hover:bg-slate-50 cursor-pointer shadow-sm">
            <Printer className="h-4.5 w-4.5 text-slate-700" /> Print
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'ritase' | 'maintenance')} className="w-full">
          {/* Tabs Navigation & Filtering Block */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between no-print mb-6">
            <TabsList className="flex h-auto p-1 bg-slate-100 border border-slate-200/60 rounded-xl w-fit">
              <TabsTrigger
                value="ritase"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer whitespace-nowrap"
              >
                Laporan Ritase Armada
              </TabsTrigger>
              <TabsTrigger
                value="maintenance"
                className="rounded-lg px-5 py-2 text-[14px] font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer whitespace-nowrap"
              >
                Laporan Maintenance Armada
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
                  <Select value={perPage} onValueChange={setPerPage}>
                    <SelectTrigger className="w-[80px] rounded-xl border-slate-200 bg-white shadow-sm cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="cursor-pointer" value="5">5</SelectItem>
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

          <PrintLetterPage
            id="laporan-ritase-print"
            className="laporan-penerimaan-print-area"
            letterheadSrc={selectedPrintBackground}
          >
            <div className="laporan-penerimaan-print-content print-letter-content">
              {/* Cover Letter Heading - Visible only in Print */}
              <div className="hidden print:flex flex-col items-center justify-center text-center space-y-1 mb-6 w-full">
                <h2 className="text-[18px] font-bold uppercase text-gray-900 tracking-wide">
                  {activeTab === 'ritase' ? 'Laporan Ritase Armada' : 'Laporan Maintenance Armada'}
                </h2>
                <p className="text-[15px] font-bold text-gray-900 tracking-wide">
                  {getCompanyName(resolvedCompanyId)}
                </p>
                <p className="text-[12px] text-gray-600">
                  Tanggal Cetak: {formatDate(new Date())}
                </p>
              </div>

              <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-none w-full">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                      {activeTab === 'ritase' && (
                        <>
                          {/* Group Headers */}
                          <TableRow className="hover:bg-transparent border-b border-slate-200">
                            <TableHead colSpan={5} className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap border-r border-slate-200 bg-slate-100">
                              LAPORAN TARGET INCOME EKSPEDISI PT WAJIRA JAGRATARA MORINDO
                            </TableHead>
                            <TableHead colSpan={3} className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap border-r border-slate-200 bg-slate-100">
                              BIAYA DAN PENGELUARAN
                            </TableHead>
                            <TableHead colSpan={3} className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap border-r border-slate-200 bg-slate-100">
                              PENDAPATAN
                            </TableHead>
                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap border-r border-slate-200 bg-slate-100">
                              KETERANGAN
                            </TableHead>
                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap border-r border-slate-200 bg-slate-100">
                              DATA TARGET
                            </TableHead>
                            <TableHead className="bg-slate-50"></TableHead>
                          </TableRow>
                          {/* Normal Headers */}
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap">TANGGAL</TableHead>
                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap">NO POLISI</TableHead>
                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap">TIPE</TableHead>
                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap">DRIVER</TableHead>
                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap border-r border-slate-200">INV EKSPEDISI</TableHead>

                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap">BIAYA TAMBAHAN</TableHead>
                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap">UJ DRIVER</TableHead>
                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap border-r border-slate-200">BIAYA LAINNYA</TableHead>

                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap">INV EKSPEDISI</TableHead>
                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap">TAMBAHAN</TableHead>
                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap border-r border-slate-200">PPN</TableHead>

                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap border-r border-slate-200">LABA/RUGI</TableHead>

                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap border-r border-slate-200">RITASE</TableHead>

                            <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap no-print w-16">ACTION</TableHead>
                          </TableRow>
                        </>
                      )}

                      {activeTab === 'maintenance' && (
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-12 text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap">NO</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">NO POLISI</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">TIPE</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">DRIVER/PIC</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">SPAREPART</TableHead>
                          <TableHead className="text-center text-xs font-bold uppercase text-slate-700 whitespace-nowrap">QTY</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">KETERANGAN</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">TGL PERBAIKAN</TableHead>
                        </TableRow>
                      )}
                    </TableHeader>
                    <TableBody>
                      {activeTab === 'ritase' && (
                        paginatedRitase.length > 0 ? paginatedRitase.map((item, idx) => (
                          <TableRow key={item.id || idx} className="border-slate-100 hover:bg-slate-50/50">
                            <TableCell className="text-center text-slate-600 whitespace-nowrap">{formatDateString(item.tanggal)}</TableCell>
                            <TableCell className="text-center font-mono text-[13px] text-slate-700 whitespace-nowrap">{item.noPolisi}</TableCell>
                            <TableCell className="text-center text-slate-600 whitespace-nowrap">{item.tipe}</TableCell>
                            <TableCell className="text-center text-slate-600 whitespace-nowrap">{item.driver}</TableCell>
                            <TableCell className="text-center text-slate-800 font-medium whitespace-nowrap border-r border-slate-100">{formatIDR(item.invEkspedisi)}</TableCell>

                            <TableCell className="text-center text-slate-600 whitespace-nowrap">{formatIDR(item.biayaTambahan)}</TableCell>
                            <TableCell className="text-center text-slate-600 whitespace-nowrap">{formatIDR(item.ujDriver)}</TableCell>
                            <TableCell className="text-center text-slate-600 whitespace-nowrap border-r border-slate-100">{formatIDR(item.biayaLainnya)}</TableCell>

                            <TableCell className="text-center text-slate-800 font-medium whitespace-nowrap">{formatIDR(item.invEkspedisiPendapatan)}</TableCell>
                            <TableCell className="text-center text-slate-600 whitespace-nowrap">{formatIDR(item.tambahan)}</TableCell>
                            <TableCell className="text-center text-slate-600 whitespace-nowrap border-r border-slate-100">{formatIDR(item.ppn)}</TableCell>

                            <TableCell className="text-center text-slate-800 font-medium whitespace-nowrap border-r border-slate-100">{formatIDR(item.labaRugi)}</TableCell>

                            <TableCell className="text-center text-slate-800 font-medium whitespace-nowrap border-r border-slate-100">{item.ritase}</TableCell>

                            <TableCell className="text-center no-print">
                              <Button variant="ghost" size="icon" onClick={handleOpenEdit} className="h-8 w-8 text-slate-500 hover:text-slate-900 cursor-pointer">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={14} className="h-28 text-center text-slate-500 font-medium">
                              Tidak ada data ditemukan.
                            </TableCell>
                          </TableRow>
                        )
                      )}

                      {activeTab === 'maintenance' && (
                        paginatedMaintenance.length > 0 ? paginatedMaintenance.map((item, idx) => (
                          <TableRow key={item.id || idx} className="border-slate-100 hover:bg-slate-50/50">
                            <TableCell className="text-center font-medium text-slate-500 whitespace-nowrap">{item.id}</TableCell>
                            <TableCell className="font-mono text-[13px] text-slate-700 whitespace-nowrap">{item.noPolisi}</TableCell>
                            <TableCell className="text-slate-600 whitespace-nowrap">{item.tipe}</TableCell>
                            <TableCell className="text-slate-600 whitespace-nowrap">{item.driverPic}</TableCell>
                            <TableCell className="text-slate-600 whitespace-nowrap">{item.sparepart}</TableCell>
                            <TableCell className="text-center text-slate-800 font-medium whitespace-nowrap">{item.qty}</TableCell>
                            <TableCell className="text-slate-600 whitespace-nowrap">{item.keterangan}</TableCell>
                            <TableCell className="text-slate-600 whitespace-nowrap">{formatDateString(item.tglPerbaikan)}</TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={8} className="h-28 text-center text-slate-500 font-medium">
                              Tidak ada data ditemukan.
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          </PrintLetterPage>

          {/* Pagination */}
          <div className="flex flex-col gap-4 px-1 py-4 md:flex-row md:items-center md:justify-between no-print">
            <div className="text-sm text-slate-500">
              Showing {totalRecords === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + limit, totalRecords)} of {totalRecords} data
            </div>
            {totalRecords > 0 && (
              <div className="flex items-center gap-1 text-sm text-slate-700">
                <Button variant="ghost" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1} className="rounded-xl px-3 hover:bg-slate-100 font-semibold text-[13px] cursor-pointer">Previous</Button>
                {visiblePages[0] > 1 && <span className="px-1.5 text-slate-400">...</span>}
                {visiblePages.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === page ? 'outline' : 'ghost'}
                    size="sm"
                    onClick={() => setPage(pageNumber)}
                    className={cn(
                      "h-9 min-w-9 rounded-xl border-slate-200 text-[13px] font-semibold cursor-pointer",
                      pageNumber === page ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {pageNumber}
                  </Button>
                ))}
                {visiblePages[visiblePages.length - 1] < lastPage && <span className="px-1.5 text-slate-400">...</span>}
                <Button variant="ghost" size="sm" onClick={() => setPage(page + 1)} disabled={page >= lastPage} className="rounded-xl px-3 hover:bg-slate-100 font-semibold text-[13px] cursor-pointer">Next</Button>
              </div>
            )}
          </div>
        </Tabs>
      </div>

      {/* Edit Ritase Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-6 rounded-2xl bg-white shadow-xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-slate-900">Edit Ritase</DialogTitle>
            <DialogDescription className="text-[14px] text-slate-500 mt-1">
              Edit ritase yang dilakukan
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <Label htmlFor="ritase" className="text-sm font-semibold text-slate-700">
              Ritase
            </Label>
            <Input
              id="ritase"
              placeholder="Contoh: 12"
              value={editRitaseValue}
              onChange={(e) => setEditRitaseValue(e.target.value)}
              className="rounded-xl border-slate-200 bg-white h-11"
            />
          </div>
          <DialogFooter className="mt-6 flex flex-col sm:flex-col gap-3">
            <Button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="w-full bg-[#1c3553] hover:bg-[#122438] text-white rounded-xl h-11 font-medium cursor-pointer"
            >
              Simpan
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="w-full rounded-xl border-slate-200 h-11 font-medium cursor-pointer mt-0 sm:mt-0"
            >
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
