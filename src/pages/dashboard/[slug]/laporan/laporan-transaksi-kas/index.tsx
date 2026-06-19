"use client";

import { useState } from 'react';
import { useRouter } from 'next/router';
import { Printer, Eye, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';

import { useCompany } from '@/contexts/CompanyContext';
import { resolveCompanyId, getLetterheadByCompanyId } from '@/lib/print-letterhead';
import { PrintLetterPage } from '@/components/common/PrintLetterPage';
import { formatDate } from '@/lib/utils/format';

// Mock Data
const MOCK_DATA = [
  {
    id: 1,
    tanggal: '2026-12-31',
    notaReff: 'TRX-011',
    keterangan: 'Terima tagihan John Doe',
    pemasukan: 25000000,
    pengeluaran: 0,
    namaAkun: 'Inventaris Kantor',
    namaKas: 'Cash IDR',
  },
  {
    id: 2,
    tanggal: '2026-12-31',
    notaReff: 'TRX-011',
    keterangan: 'Pembayaran Listrik Bulanan',
    pemasukan: 0,
    pengeluaran: 1500000,
    namaAkun: 'Biaya Listrik',
    namaKas: 'Bank BCA IDR',
  },
  {
    id: 3,
    tanggal: '2026-12-31',
    notaReff: 'TRX-011',
    keterangan: 'Pembayaran Listrik Bulanan',
    pemasukan: 0,
    pengeluaran: 1500000,
    namaAkun: 'Biaya Listrik',
    namaKas: 'Bank BCA USD',
  },
];

export default function LaporanTransaksiKasPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const slugParam = router.query.slug;

  const resolvedCompanyId = resolveCompanyId(slugParam, companyId) || 3;
  const selectedPrintBackground = getLetterheadByCompanyId(resolvedCompanyId);

  const getCompanyName = (coId: number) => {
    if (coId === 1) return 'PT WAJIRA JAGRATARA MORINDO';
    if (coId === 3) return 'PT WAJIRA YANOTAMA';
    if (coId === 4) return 'PT WAJIRA TRANSINDO';
    return 'PT WAJIRA';
  };

  // States
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date('2025-01-20'));
  
  // Formatters
  const formatDateString = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return format(date, 'dd/MM/yyyy');
  };

  const formatIDR = (value?: number | null) => {
    if (value === null || value === undefined || value === 0) return '';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Print triggering handler
  const handlePrint = () => {
    window.print();
  };

  // Calculate Grand Totals
  const totalPemasukan = MOCK_DATA.reduce((acc, curr) => acc + curr.pemasukan, 0);
  const totalPengeluaran = MOCK_DATA.reduce((acc, curr) => acc + curr.pengeluaran, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center no-print">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Laporan Transaksi Kas</h1>
            <p className="text-sm text-slate-500">Pantau semua pemasukan dan pengeluaran</p>
          </div>
          <Button onClick={handlePrint} variant="outline" className="gap-2 rounded-xl px-4 py-2 border-slate-200 hover:bg-slate-50 cursor-pointer shadow-sm">
            <Printer className="h-4.5 w-4.5 text-slate-700" /> Print
          </Button>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col gap-2 no-print mb-5">
          <Label className="text-sm font-semibold text-slate-700">Periode Transaksi</Label>
          <div className="flex items-center gap-4">
            <div className="w-[280px]">
              <DatePicker 
                value={selectedDate} 
                onChange={(date) => setSelectedDate(date)} 
                placeholder="Pilih Tanggal"
                className="bg-white rounded-xl border-slate-200 shadow-sm w-full"
              />
            </div>
            <Button variant="secondary" className="gap-2 rounded-xl px-6 py-2 border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer shadow-sm">
              <Eye className="h-4.5 w-4.5" /> Show
            </Button>
          </div>
        </div>

        {/* Print Letter Wrapping Container */}
        <PrintLetterPage
          id="laporan-transaksi-kas-print"
          className="laporan-penerimaan-print-area"
          letterheadSrc={selectedPrintBackground}
        >
          <div className="laporan-penerimaan-print-content print-letter-content">
            {/* Cover Letter Heading - Visible only in Print */}
            <div className="hidden print:flex flex-col items-center justify-center text-center space-y-1 mb-6 w-full">
              <h2 className="text-[18px] font-bold uppercase text-gray-900 tracking-wide">
                Laporan Transaksi Kas
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
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="cursor-pointer select-none text-xs font-bold uppercase text-slate-700 whitespace-nowrap px-4 py-4">
                        TANGGAL <ArrowUpDown className="inline-block h-3.5 w-3.5 ml-1 text-slate-400" />
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">NOTA REFF</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">KETERANGAN</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">Pemasukan</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">Pengeluaran</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">NAMA AKUN</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-slate-700 whitespace-nowrap">NAMA KAS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_DATA.length > 0 ? (
                      MOCK_DATA.map((item) => {
                        return (
                          <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/50">
                            <TableCell className="text-slate-600 whitespace-nowrap">{formatDateString(item.tanggal)}</TableCell>
                            <TableCell className="font-medium text-slate-700 whitespace-nowrap">{item.notaReff}</TableCell>
                            <TableCell className="text-slate-600 whitespace-nowrap">{item.keterangan}</TableCell>
                            <TableCell className="text-green-500 font-medium whitespace-nowrap">{formatIDR(item.pemasukan)}</TableCell>
                            <TableCell className="text-red-500 font-medium whitespace-nowrap">{formatIDR(item.pengeluaran)}</TableCell>
                            <TableCell className="text-slate-600 whitespace-nowrap">{item.namaAkun}</TableCell>
                            <TableCell className="text-slate-600 whitespace-nowrap">{item.namaKas}</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-28 text-center text-slate-500 font-medium">
                          Tidak ada data laporan ditemukan.
                        </TableCell>
                      </TableRow>
                    )}
                    {/* Grand Total Footer Row */}
                    <TableRow className="border-t border-slate-200 bg-white hover:bg-white">
                      <TableCell colSpan={3} className="text-center font-bold text-slate-900 text-[14px]">Grand Total</TableCell>
                      <TableCell className="font-bold text-slate-900 whitespace-nowrap text-[14px]">{formatIDR(totalPemasukan) || 'Rp 0'}</TableCell>
                      <TableCell className="font-bold text-slate-900 whitespace-nowrap text-[14px]">{formatIDR(totalPengeluaran) || 'Rp 0'}</TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </PrintLetterPage>
      </div>
    </DashboardLayout>
  );
}