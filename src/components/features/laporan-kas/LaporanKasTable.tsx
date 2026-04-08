import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CashFlowItem } from '@/services/cashFlow.service';
import { ArrowUpDown } from 'lucide-react';

interface LaporanKasTableProps {
    data: CashFlowItem[];
    totalPemasukan?: number;
    totalPengeluaran?: number;
    onSort?: (key: string) => void;
    sortKey?: string;
    sortOrder?: 'asc' | 'desc';
}

export function LaporanKasTable({ 
    data, 
    totalPemasukan = 0, 
    totalPengeluaran = 0,
    onSort,
    sortKey,
    sortOrder 
}: LaporanKasTableProps) {
    const formatCurrency = (val: number) => {
        return `Rp ${val.toLocaleString('id-ID')}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-[#f3f4f6]">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold text-gray-700 py-3 px-4 w-[150px]">
                                <div 
                                    className="flex items-center gap-2 cursor-pointer select-none"
                                    onClick={() => onSort?.('date')}
                                >
                                    TANGGAL
                                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 px-4 w-[150px]">
                                <div 
                                    className="flex items-center gap-2 cursor-pointer select-none"
                                    onClick={() => onSort?.('code')}
                                >
                                    NOTA REFF
                                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 px-4">
                                <div 
                                    className="flex items-center gap-2 cursor-pointer select-none"
                                    onClick={() => onSort?.('note')}
                                >
                                    KETERANGAN
                                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 px-4 w-[200px]">PEMASUKAN</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3 px-4 w-[200px]">PENGELUARAN</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50 bg-white">
                                <TableCell className="py-3 px-4 text-sm text-gray-600 font-medium">
                                    {formatDate(item.date)}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-sm text-gray-600">
                                    {item.code}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-sm text-gray-600">
                                    {item.note || '-'}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-sm font-medium text-[#22c55e]">
                                    {item.debet > 0 ? formatCurrency(item.debet) : ''}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-sm font-medium text-[#ef4444]">
                                    {item.credit > 0 ? formatCurrency(item.credit) : ''}
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    Tidak ada data transaksi kas
                                </TableCell>
                            </TableRow>
                        )}
                        {/* Footer Totals Row */}
                        <TableRow className="bg-white hover:bg-white border-t-2 border-gray-100">
                            <TableCell colSpan={3} className="py-4">
                                <div className="text-right pr-12">
                                    <span className="text-sm font-bold text-gray-900">Grand Total</span>
                                </div>
                            </TableCell>
                            <TableCell className="py-4 text-sm font-bold text-gray-900">
                                {formatCurrency(totalPemasukan)}
                            </TableCell>
                            <TableCell className="py-4 text-sm font-bold text-gray-900">
                                {formatCurrency(totalPengeluaran)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
