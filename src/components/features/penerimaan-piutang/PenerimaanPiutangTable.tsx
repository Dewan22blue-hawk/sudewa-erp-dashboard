import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MoreVertical, Search, Loader2, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import type { PenerimaanPiutang } from '@/@types/penerimaan-piutang.types';
import type { LiabilityListMeta } from '@/types/pembayaran-hutang.types';

interface Props {
    data: PenerimaanPiutang[];
    meta: LiabilityListMeta | null;
    loading?: boolean;
    error?: string | null;
    search: string;
    perPage: number;
    currentPage: number;
    onSearchChange: (value: string) => void;
    onPerPageChange: (value: number) => void;
    onPageChange: (value: number) => void;
    onDelete?: (item: PenerimaanPiutang) => void;
    onRetry?: () => void;
}

const formatDate = (value: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('id-ID');
};

export default function PenerimaanPiutangTable({ data, meta, loading, error, search, perPage, currentPage, onSearchChange, onPerPageChange, onPageChange, onDelete, onRetry }: Props) {
    const router = useRouter();
    const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
    const showActions = typeof onDelete === 'function';

    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: string) => {
        if (sortBy === key) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(key);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        if (!sortBy) return data;
        return [...data].sort((a, b) => {
            let aVal = (a as any)[sortBy];
            let bVal = (b as any)[sortBy];

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortBy, sortDirection]);

    const totalPages = meta?.lastPage ?? 1;
    const pages = useMemo(() => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

        if (currentPage <= 3) {
            return [1, 2, 3, 4, '...', totalPages];
        }

        if (currentPage >= totalPages - 2) {
            return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }, [currentPage, totalPages]);

    const startIndex = meta?.from ?? (data.length > 0 ? (currentPage - 1) * perPage + 1 : 0);
    const endIndex = meta?.to ?? (data.length > 0 ? startIndex + data.length - 1 : 0);
    const totalItems = meta?.total ?? 0;

    const renderSortHeader = (title: string, sortKey: string, align: 'left' | 'right' = 'left') => {
        const isSorted = sortBy === sortKey;
        return (
            <button
                type="button"
                className={`flex items-center gap-1.5 font-semibold text-gray-900 cursor-pointer ${align === 'right' ? 'justify-end w-full' : 'justify-start'}`}
                onClick={() => handleSort(sortKey)}
            >
                <span>{title}</span>
                {isSorted ? (
                    sortDirection === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-emerald-600" />
                    )
                ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-50 text-slate-400" />
                )}
            </button>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative w-full md:max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input placeholder="Cari kode transaksi atau customer" value={search} onChange={(event) => onSearchChange(event.target.value)} className="pl-9 h-10" />
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 md:shrink-0">
                    <span>Show</span>
                    <Select
                        value={String(perPage)}
                        onValueChange={(value) => {
                            onPerPageChange(Number(value));
                        }}
                    >
                        <SelectTrigger className="h-9 w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <span>Page</span>
                </div>
            </div>

            {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p>{error}</p>
                        {onRetry ? (
                            <Button variant="outline" size="sm" onClick={onRetry}>
                                Coba Lagi
                            </Button>
                        ) : null}
                    </div>
                </div>
            ) : null}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 uppercase text-sm font-semibold text-gray-900 leading-normal border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left">No</th>
                            <th className="py-2.5 px-4 text-left">{renderSortHeader('No. Transaksi', 'code')}</th>
                            <th className="py-2.5 px-4 text-left">{renderSortHeader('Tanggal', 'date')}</th>
                            <th className="py-2.5 px-4 text-left">{renderSortHeader('Customer', 'supplier_name')}</th>
                            <th className="py-2.5 px-4 text-right">{renderSortHeader('Total Piutang', 'grand_total', 'right')}</th>
                            <th className="py-2.5 px-4 text-right">{renderSortHeader('Total Diterima', 'total_paid', 'right')}</th>
                            <th className="py-2.5 px-4 text-right">{renderSortHeader('Sisa Piutang', 'remaining_payment', 'right')}</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            {showActions ? <th className="px-4 py-3 text-center">Aksi</th> : null}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading && data.length === 0 ? (
                            <tr>
                                <td colSpan={showActions ? 9 : 8} className="px-4 py-12 text-center text-gray-500">
                                    <span className="inline-flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Memuat data...
                                    </span>
                                </td>
                            </tr>
                        ) : sortedData.length > 0 ? (
                            sortedData.map((item, index) => {
                                const percentage = Math.max(0, Math.min(100, item.paid_percentage));

                                return (
                                    <tr key={item.id} className="transition-colors hover:bg-gray-50/70">
                                        <td className="px-4 py-4 text-gray-600">{startIndex + index}</td>
                                        <td className="px-4 py-4 font-medium text-gray-900">{item.code}</td>
                                        <td className="px-4 py-4 text-gray-600">{formatDate(item.date)}</td>
                                        <td className="px-4 py-4 text-gray-700">{item.supplier_name}</td>
                                        <td className="px-4 py-4 text-right font-medium text-gray-900">{formatCurrency(item.grand_total)}</td>
                                        <td className="px-4 py-4 text-right font-medium text-emerald-600">{formatCurrency(item.total_paid)}</td>
                                        <td className="px-4 py-4 text-right font-medium text-orange-600">{formatCurrency(item.remaining_payment)}</td>
                                        <td className="px-4 py-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>{percentage.toFixed(0)}% diterima</span>
                                                    <span>{item.remaining_payment <= 0 ? 'Lunas' : 'Belum lunas'}</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-emerald-100">
                                                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percentage}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        {showActions ? (
                                            <td className="px-4 py-4 text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            {slug ? <Link href={`/dashboard/${slug}/finance/data-penerimaan-piutang/${item.id}`}>Detail</Link> : <span className="cursor-not-allowed text-gray-400">Detail</span>}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => onDelete?.(item)} className="text-orange-600 focus:text-orange-700">
                                                            Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        ) : null}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={showActions ? 9 : 8} className="px-4 py-12 text-center text-gray-500">
                                    Tidak ada data yang ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col gap-3 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
                <div>
                    Menampilkan {totalItems > 0 ? startIndex : 0}-{endIndex} dari {totalItems} data
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Prev
                    </Button>

                    {pages.map((page, index) => (
                        <Button
                            key={index}
                            variant={page === currentPage ? 'outline' : 'ghost'}
                            size="sm"
                            className={page === currentPage ? 'bg-gray-100' : ''}
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                            disabled={typeof page !== 'number'}
                        >
                            {page}
                        </Button>
                    ))}

                    <Button variant="outline" size="sm" disabled={currentPage >= totalPages || totalPages === 0} onClick={() => onPageChange(currentPage + 1)}>
                        Next
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
