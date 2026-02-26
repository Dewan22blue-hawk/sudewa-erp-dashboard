"use client";

import { useMemo, useState, useEffect } from "react";
import { MoreVertical, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import DeletePengeluaranUnitDialog from "./DeletePengeluaranUnitDialog";
import { PengeluaranUnit } from "@/@types/pengeluaran-unit.types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Props {
    data: PengeluaranUnit[];
    onDelete: (id: string) => Promise<void>;
}

export default function PengeluaranUnitTable({ data, onDelete }: Props) {
    const router = useRouter();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [search, setSearch] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState("10");
    const [currentPage, setCurrentPage] = useState(1);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return data.filter((item) =>
            [item.noPengeluaran, item.tanggal, item.customer].some((val) =>
                String(val).toLowerCase().includes(q)
            )
        );
    }, [data, search]);

    const perPage = Number(itemsPerPage);
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * perPage;
    const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + perPage, totalItems);
    const paginated = filtered.slice(startIndex, startIndex + perPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage, search]);

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        await onDelete(deleteId);
        setIsDeleting(false);
        setDeleteId(null);
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            pages.push(1, 2, 3, 4, "...", totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
        }
        return pages;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-60 sm:w-64 text-gray-400 focus-within:text-gray-900">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Search here"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-10 border-gray-200 rounded-lg text-gray-900"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span>Show</span>
                        <Select value={itemsPerPage} onValueChange={(val) => setItemsPerPage(val)}>
                            <SelectTrigger className="h-10 w-20 border-gray-200 rounded-lg bg-white">
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

            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-[#f5f7fa] text-xs font-medium text-gray-700 uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">NO PENGELUARAN</th>
                            <th className="px-4 py-3 text-left">TANGGAL</th>
                            <th className="px-4 py-3 text-left">CUSTOMER</th>
                            <th className="px-4 py-3 text-left">KETERANGAN</th>
                            <th className="px-4 py-3 text-center w-[60px]">ACTION</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginated.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 text-gray-900 font-medium">{item.noPengeluaran}</td>
                                <td className="px-4 py-4 text-gray-600">{item.tanggal}</td>
                                <td className="px-4 py-4 text-gray-600">{item.customer}</td>
                                <td className="px-4 py-4 text-gray-600">{item.keterangan || "-"}</td>
                                <td className="px-4 py-4 text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1 outline-none text-gray-400 hover:text-gray-700 transition">
                                                <MoreVertical size={18} className="mx-auto" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-36 rounded-lg shadow-lg border-gray-100 p-1 font-medium text-[13px]">
                                            <DropdownMenuItem
                                                onClick={() => router.push(`${window.location.pathname}/${item.id}/edit`)}
                                                className="cursor-pointer text-gray-700 hover:bg-gray-50 rounded-md py-2.5 px-3"
                                            >
                                                Detail
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer text-gray-700 hover:bg-gray-50 rounded-md py-2.5 px-3">
                                                Print
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setDeleteId(item.id)}
                                                className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md py-2.5 px-3 focus:text-red-600 focus:bg-red-50"
                                            >
                                                Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                        {paginated.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                    Tidak ada data.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500 mt-4 px-1">
                <div>
                    Showing {startIndex === 0 && endIndex === 0 ? "0" : `${startIndex + 1}-${endIndex}`} of {totalItems} data
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 font-medium hover:bg-transparent hover:text-gray-900 px-3 disabled:opacity-50"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                    >
                        Previous
                    </Button>
                    {getPageNumbers().map((page, idx) => (
                        <Button
                            key={idx}
                            variant={page === currentPage ? "outline" : "ghost"}
                            size="sm"
                            className={`w-9 h-9 p-0 rounded-lg border-gray-200 font-medium ${page === currentPage
                                    ? "text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent"
                                }`}
                            onClick={() => typeof page === "number" && setCurrentPage(page)}
                            disabled={typeof page !== "number"}
                        >
                            {page}
                        </Button>
                    ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 font-medium hover:bg-transparent hover:text-gray-900 px-3 disabled:opacity-50"
                        disabled={currentPage === totalPages || totalItems === 0}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <DeletePengeluaranUnitDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
}