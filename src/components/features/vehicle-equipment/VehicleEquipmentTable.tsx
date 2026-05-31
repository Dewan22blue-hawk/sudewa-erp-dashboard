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
}: VehicleEquipmentTableProps) {

    const totalPages = Math.ceil(totalData / perPage);
    const startData = (page - 1) * perPage + 1;
    const endData = Math.min(page * perPage, totalData);

    const renderPaginationNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                    key={p}
                    variant={p === page ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => onPageChange(p)}
                    className={p === page ? "border-gray-200 bg-white font-medium h-9 w-9 p-0" : "text-gray-500 font-medium h-9 w-9 p-0"}
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
                variant={p === page ? "outline" : "ghost"}
                size="sm"
                disabled={p === '...'}
                onClick={() => typeof p === 'number' && onPageChange(p)}
                className={p === page ? "border-gray-200 bg-white font-medium h-9 w-9 p-0" : "text-gray-500 font-medium h-9 w-9 p-0"}
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
                            className="pl-9 bg-white border border-gray-200 rounded-lg text-sm"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm text-gray-500">Show</span>
                        <Select value={perPage.toString()} onValueChange={(v) => onPerPageChange(Number(v))}>
                            <SelectTrigger className="w-[70px] bg-white border border-gray-200 rounded-lg text-sm">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-500">Page</span>
                    </div>
                </div>

                <div className="w-full sm:w-auto flex justify-end">
                    <Button 
                        onClick={onAdd} 
                        className="w-full sm:w-auto bg-[#15305B] hover:bg-[#0E2140] font-semibold text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah
                    </Button>
                </div>
            </div>

            {/* Table Card */}
            <Card className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
                            <TableRow>
                                <TableHead className="text-sm font-bold text-gray-800 uppercase px-6 py-4 text-center">KODE BARANG</TableHead>
                                <TableHead className="text-sm font-bold text-gray-800 uppercase px-6 py-4 text-center">NAMA BARANG</TableHead>
                                <TableHead className="text-sm font-bold text-gray-800 uppercase px-6 py-4 text-center w-[120px]">ACTION</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {equipments.length > 0 ? (
                                equipments.map((item) => (
                                    <TableRow key={item.uuid} className="hover:bg-gray-50/50 border-b border-gray-100">
                                        <TableCell className="px-6 py-4 text-sm text-gray-600 font-medium text-center">
                                            {item.code || '-'}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-sm text-gray-800 text-center font-medium">
                                            {item.name || '-'}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-sm text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                                                        <MoreVertical className="h-4 w-4 text-gray-500" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[140px] rounded-xl border border-gray-100 bg-white shadow-lg p-1.5">
                                                    <DropdownMenuItem 
                                                        onClick={() => onEdit(item)} 
                                                        className="cursor-pointer text-gray-700 font-medium rounded-lg hover:bg-gray-50 px-3 py-2 text-sm"
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => onDelete(item)} 
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
                                <TableRow>
                                    <TableCell colSpan={3} className="h-40 text-center text-gray-400 text-sm font-medium">
                                        Tidak ada data perlengkapan ditemukan
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Bottom Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-2">
                <div className="text-sm text-gray-500 font-medium">
                    Showing {totalData === 0 ? 0 : startData}-{endData} of {totalData} data
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                            className="text-gray-500 font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                            Previous
                        </Button>
                        
                        {renderPaginationNumbers()}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages}
                            className="text-gray-500 font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
