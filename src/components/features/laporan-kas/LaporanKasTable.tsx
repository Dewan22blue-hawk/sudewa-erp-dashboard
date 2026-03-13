import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { TransaksiKas } from './laporan-kas.data';
import { ArrowUpDown } from 'lucide-react';

interface LaporanKasTableProps {
    data: TransaksiKas[];
}

export function LaporanKasTable({ data }: LaporanKasTableProps) {
    const formatCurrencyMatchImage = (val: number) => {
        // Return strictly Rp x.xxx.xxx style with 0 decimal places if possible, or exact commas. 
        // Image shows: Rp 25,000,000
        return `Rp ${val.toLocaleString('en-US')}`;
    };

    const totalPemasukan = data.reduce((sum, item) => sum + (item.pemasukan || 0), 0);
    const totalPengeluaran = data.reduce((sum, item) => sum + (item.pengeluaran || 0), 0);

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-[#f3f4f6]">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold text-gray-700 py-3 px-4 w-[150px]">
                                <div className="flex items-center gap-2 cursor-pointer select-none">
                                    TANGGAL
                                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 px-4 w-[150px]">NOTA REFF</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 px-4">KETERANGAN</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 px-4 w-[200px]">Pemasukan</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 px-4 w-[200px]">Pengeluaran</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50 bg-white">
                                <TableCell className="py-3 px-4 text-sm text-gray-600 font-medium">
                                    {item.tanggal}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-sm text-gray-600">
                                    {item.notaReff}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-sm text-gray-600">
                                    {item.keterangan}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-sm font-medium text-[#22c55e]">
                                    {item.pemasukan ? formatCurrencyMatchImage(item.pemasukan) : ''}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-sm font-medium text-[#ef4444]">
                                    {item.pengeluaran ? formatCurrencyMatchImage(item.pengeluaran) : ''}
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                        {/* Footer Totals Row */}
                        <TableRow className="bg-white hover:bg-white border-t-2 border-gray-100">
                            <TableCell colSpan={2} className="py-4"></TableCell>
                            <TableCell className="py-4 text-sm font-bold text-gray-900 text-right pr-12">
                                Grand Total
                            </TableCell>
                            <TableCell className="py-4 text-sm font-bold text-gray-900">
                                {formatCurrencyMatchImage(totalPemasukan)}
                            </TableCell>
                            <TableCell className="py-4 text-sm font-bold text-gray-900">
                                {formatCurrencyMatchImage(totalPengeluaran)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
