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
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

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

    const renderSortHeader = (title: string, key: string, align: 'left' | 'right' | 'center' = 'left') => {
        const isSorted = sortKey === key;
        const justifyClass = align === 'right' ? 'justify-end w-full' : align === 'center' ? 'justify-center w-full' : 'justify-start';
        return (
            <button
                type="button"
                className={`flex items-center gap-1 cursor-pointer select-none group w-full px-4 py-4 text-xs font-semibold uppercase transition-colors ${
                    isSorted ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                } ${justifyClass}`}
                onClick={() => onSort?.(key)}
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

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-none">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="p-0 text-left w-[150px]">
                                {renderSortHeader('Tanggal', 'date', 'left')}
                            </TableHead>
                            <TableHead className="p-0 text-left w-[150px]">
                                {renderSortHeader('Nota Reff', 'code', 'left')}
                            </TableHead>
                            <TableHead className="p-0 text-left">
                                {renderSortHeader('Keterangan', 'note', 'left')}
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 w-[200px] text-left">PEMASUKAN</TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 w-[200px] text-left">PENGELUARAN</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50/50 bg-white border-b border-gray-100">
                                <TableCell className="px-4 py-4 text-sm text-gray-600 font-medium">
                                    {formatDate(item.date)}
                                </TableCell>
                                <TableCell className="px-4 py-4 text-sm text-gray-600">
                                    {item.code}
                                </TableCell>
                                <TableCell className="px-4 py-4 text-sm text-gray-600">
                                    {item.note || '-'}
                                </TableCell>
                                <TableCell className="px-4 py-4 text-sm font-semibold text-emerald-600">
                                    {item.debet > 0 ? formatCurrency(item.debet) : ''}
                                </TableCell>
                                <TableCell className="px-4 py-4 text-sm font-semibold text-rose-600">
                                    {item.credit > 0 ? formatCurrency(item.credit) : ''}
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                                    Tidak ada data transaksi kas
                                </TableCell>
                            </TableRow>
                        )}
                        {/* Footer Totals Row */}
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-t border-slate-200">
                            <TableCell colSpan={3} className="px-4 py-4">
                                <div className="text-right pr-12">
                                    <span className="text-sm font-semibold text-slate-900">Grand Total</span>
                                </div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-sm font-bold text-slate-900">
                                {formatCurrency(totalPemasukan)}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-sm font-bold text-slate-900">
                                {formatCurrency(totalPengeluaran)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
