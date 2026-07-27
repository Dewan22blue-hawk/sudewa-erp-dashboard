import React from 'react';
import { Search, Plus, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { VehicleEquipment } from '@/@types/vehicle-equipment.types';

interface VehicleEquipmentTableProps {
    equipments: VehicleEquipment[];
    search: string;
    onSearchChange: (value: string) => void;
    page: number;
    perPage: number;
    totalData: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    onAdd: () => void;
    onEdit: (equipment: VehicleEquipment) => void;
    onDelete: (equipment: VehicleEquipment) => void;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

export function VehicleEquipmentTable({
    equipments,
    search,
    onSearchChange,
    page,
    perPage,
    totalData,
    onPageChange,
    onPerPageChange,
    onAdd,
    onEdit,
    onDelete,
    canCreate,
    canEdit,
    canDelete,
}: VehicleEquipmentTableProps) {

    const totalPages = Math.ceil(totalData / perPage);
    const startData = (page - 1) * perPage + 1;
    const endData = Math.min(page * perPage, totalData);

    const renderPaginationNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                    key={p}
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(p)}
                    className={
                        p === page
                            ? 'h-9 min-w-9 rounded-md border px-3 text-sm font-medium shadow-sm border-slate-200 bg-white text-slate-950'
                            : 'h-9 min-w-9 rounded-md border px-3 text-sm font-medium border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white'
                    }
                >
                    {p}
                </Button>
            ));
        }

        const pages = [];
        if (page <= 3) {
            for (let i = 1; i <= 4; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        } else if (page >= totalPages - 2) {
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('...');
            pages.push(page - 1, page, page + 1);
            pages.push('...');
            pages.push(totalPages);
        }

        return pages.map((p, idx) => (
            <Button
                key={idx}
                variant="ghost"
                size="sm"
                disabled={p === '...'}
                onClick={() => typeof p === 'number' && onPageChange(p)}
                className={
                    p === page
                        ? 'h-9 min-w-9 rounded-md border px-3 text-sm font-medium shadow-sm border-slate-200 bg-white text-slate-950'
                        : p === '...'
                            ? 'h-9 min-w-9 rounded-md border px-3 text-sm font-medium border-transparent bg-transparent text-slate-500 cursor-default hover:bg-transparent hover:border-transparent'
                            : 'h-9 min-w-9 rounded-md border px-3 text-sm font-medium border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white'
                }
            >
                {p}
            </Button>
        ));
    };

    return (
        <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search here"
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                        <span>Show</span>
                        <Select value={perPage.toString()} onValueChange={(v) => onPerPageChange(Number(v))}>
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

                <div className="flex flex-wrap items-center gap-2">
                    {canCreate && (
                        <Button onClick={onAdd} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah
                        </Button>
                    )}
                </div>
            </div>

            {/* Table Card */}
            <div className="rounded-md overflow-x-auto border border-gray-200 bg-white shadow-none">s*<Table>
                <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                    <TableRow>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">KODE BARANG</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase px-4 py-4 text-center">NAMA BARANG</TableHead>
                        <TableHead className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 whitespace-nowrap sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {equipments.length > 0 ? (
                        equipments.map((item) => (
                            <TableRow key={item.uuid} className="group hover:bg-gray-50/50 border-b border-gray-100">
                                <TableCell className="text-center px-4 py-4 sticky right-0 bg-white z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                                    {item.code || '-'}
                                </TableCell>
                                <TableCell className="px-4 py-4 text-sm text-gray-800 text-center font-medium">
                                    {item.name || '-'}
                                </TableCell>
                                <TableCell className="px-4 py-4 text-sm text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                                                <MoreVertical className="h-4 w-4 text-gray-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[140px] rounded-md border border-gray-100 bg-white shadow-lg p-1.5">
                                            <DropdownMenuItem
                                                onClick={() => onEdit(item)}
                                                disabled={!canEdit}
                                                className="cursor-pointer text-gray-700 font-medium rounded-lg hover:bg-gray-50 px-3 py-2 text-sm"
                                            >
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(item)}
                                                disabled={!canDelete}
                                                className="text-red-600 cursor-pointer font-medium rounded-lg hover:bg-red-50 focus:bg-red-50 focus:text-red-600 px-3 py-2 text-sm"
                                            >
                                                Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow className="group">
                            <TableCell colSpan={100} className="py-16 h-40 text-center text-gray-400 text-sm font-medium">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="rounded-full bg-slate-50 p-4 mb-2">
                                        <Search className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                                    <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            </div>

            {/* Bottom Pagination */}
            <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between px-1">
                <div>
                    Showing {totalData === 0 ? 0 : startData}-{endData} of {totalData} data
                </div>

                {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                            className="h-9 rounded-md px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
                        >
                            Previous
                        </Button>

                        {renderPaginationNumbers()}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages}
                            className="h-9 rounded-md px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300 text-gray-500"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
