"use client";

import { useEffect, useMemo, useState } from 'react';
import { Check, Search, SendHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PengeluaranUnitDetail } from '@/@types/pengeluaran-unit.types';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/sortable-header';

interface Props {
    data: PengeluaranUnitDetail[];
    onKirim: (ids: string[]) => Promise<void>;
    onCancel?: () => void;
}

export default function PengeluaranUnitCreateTable({ data, onKirim, onCancel }: Props) {
    const [search, setSearch] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState('25');
    const [currentPage, setCurrentPage] = useState(1);
    const [selected, setSelected] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setSelected([]);
    }, [data]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return data.filter((item) =>
            [item.kodeJual, item.tipeUnit, item.warna, item.noMesin, item.noRangka].some((field) =>
                field.toLowerCase().includes(q)
            )
        );
    }, [data, search]);

    const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
        data: filtered,
    });

    const perPage = Number(itemsPerPage);
    const totalItems = sortedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * perPage;
    const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + perPage, totalItems);
    const paginated = sortedData.slice(startIndex, startIndex + perPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage, search]);

    const toggleSelect = (id: string) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
    };

    const toggleAll = () => {
        if (paginated.length === 0) return;
        const allIds = paginated.map((d) => d.id);
        const isAllSelected = allIds.every((id) => selected.includes(id));
        setSelected((prev) => (isAllSelected ? prev.filter((id) => !allIds.includes(id)) : Array.from(new Set([...prev, ...allIds]))));
    };

    const handleKirim = async () => {
        if (selected.length === 0) return;
        setIsSubmitting(true);
        await onKirim(selected);
        setSelected([]);
        setIsSubmitting(false);
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            pages.push(1, 2, 3, 4, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
        return pages;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-4">
                    <div className="relative w-60 sm:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input placeholder="Search here" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 border-gray-200 rounded-lg focus-visible:ring-1" />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span>Show</span>
                        <Select value={itemsPerPage} onValueChange={(val) => setItemsPerPage(val)}>
                            <SelectTrigger className="h-10 w-20 border-gray-200 rounded-lg">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                        <span>Page</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between min-h-[40px]">
                <div className="flex items-center gap-2 text-[15px] text-gray-500">
                    <Check size={20} className="text-[#1FBE78]" strokeWidth={2.5} />
                    <span>{selected.length} data terpilih</span>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="h-10 px-6 font-medium text-gray-600 hover:text-gray-900 bg-transparent" onClick={onCancel}>
                        Batal
                    </Button>
                    <Button size="sm" className="h-10 px-5 bg-[#1FBE78] hover:bg-[#19ac6c] font-medium rounded-lg gap-2 text-white" onClick={handleKirim} disabled={selected.length === 0 || isSubmitting}>
                        <SendHorizontal size={16} /> Kirim
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-[#f5f7fa] text-xs font-medium text-gray-700 uppercase">
                        <tr>
                            <th className="px-4 py-3 text-center w-[48px]">
                                <Checkbox checked={paginated.length > 0 && paginated.every((d) => selected.includes(d.id))} onCheckedChange={() => toggleAll()} />
                            </th>
                            <th className="py-2 text-left">
                                <SortableHeader title="NO" sortKey="id" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-700 justify-start w-full px-4" />
                            </th>
                            <th className="py-2 text-left">
                                <SortableHeader title="KODE JUAL" sortKey="kodeJual" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-700 justify-start w-full px-4" />
                            </th>
                            <th className="py-2 text-left">
                                <SortableHeader title="TIPE UNIT" sortKey="tipeUnit" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-700 justify-start w-full px-4" />
                            </th>
                            <th className="py-2 text-left">
                                <SortableHeader title="WARNA" sortKey="warna" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-700 justify-start w-full px-4" />
                            </th>
                            <th className="py-2 text-left">
                                <SortableHeader title="NO MESIN" sortKey="noMesin" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-700 justify-start w-full px-4" />
                            </th>
                            <th className="py-2 text-left">
                                <SortableHeader title="NO RANGKA" sortKey="noRangka" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="text-gray-700 justify-start w-full px-4" />
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginated.length > 0 ? (
                            paginated.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center">
                                        <Checkbox checked={selected.includes(item.id)} onCheckedChange={() => toggleSelect(item.id)} />
                                    </td>
                                    <td className="px-4 py-3">{startIndex + index + 1}</td>
                                    <td className="px-4 py-3">{item.kodeJual}</td>
                                    <td className="px-4 py-3">{item.tipeUnit}</td>
                                    <td className="px-4 py-3">{item.warna}</td>
                                    <td className="px-4 py-3">{item.noMesin}</td>
                                    <td className="px-4 py-3">{item.noRangka}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    Tidak ada data.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
                <div>
                    Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems} data
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-transparent hover:text-gray-900 px-3" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                        Previous
                    </Button>
                    {getPageNumbers().map((page, idx) => (
                        <Button
                            key={idx}
                            variant={page === currentPage ? 'outline' : 'ghost'}
                            size="sm"
                            className={`w-8 h-8 p-0 border-gray-200 ${page === currentPage ? 'text-gray-900 hover:bg-gray-50' : 'text-gray-600 hover:bg-transparent hover:text-gray-900 border-transparent'}`}
                            onClick={() => typeof page === 'number' && setCurrentPage(page)}
                            disabled={typeof page !== 'number'}
                        >
                            {page}
                        </Button>
                    ))}
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-transparent hover:text-gray-900 px-3" disabled={currentPage === totalPages || totalItems === 0} onClick={() => setCurrentPage((p) => p + 1)}>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}