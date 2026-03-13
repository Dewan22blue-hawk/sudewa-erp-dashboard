import React, { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DOEkspedisiDetailCard } from '@/components/features/do-ekspedisi/DOEkspedisiDetailCard';
import { DOEkspedisiDetailTable } from '@/components/features/do-ekspedisi/DOEkspedisiDetailTable';
import { DOEkspedisi, DODetail, DUMMY_DO_EKSPEDISI, DUMMY_DO_DETAILS } from '@/components/features/do-ekspedisi/do-ekspedisi.data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Search, Plus } from 'lucide-react';
import { useRouter } from 'next/router';

export default function DetailDOEkspedisiPage() {
    const router = useRouter();
    const { slug, id } = router.query;

    const [doData, setDoData] = useState<DOEkspedisi | null>(null);
    const [doDetails, setDoDetails] = useState<DODetail[]>([]);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    useEffect(() => {
        if (id) {
            const numId = Number(id);
            const foundDO = DUMMY_DO_EKSPEDISI.find(d => d.id === numId);
            if (foundDO) {
                setDoData(foundDO);
                // Filter dummy details by matching doId
                const foundDetails = DUMMY_DO_DETAILS.filter(detail => detail.doId === numId);
                setDoDetails(foundDetails);
            } else {
                router.push(`/dashboard/${slug}/do-ekspedisi`);
            }
        }
    }, [id, slug, router]);

    const filteredDetails = useMemo(() => {
        return doDetails.filter(detail =>
            detail.customer.toLowerCase().includes(search.toLowerCase()) ||
            detail.tujuanKirim.toLowerCase().includes(search.toLowerCase()) ||
            detail.invoice.toLowerCase().includes(search.toLowerCase())
        );
    }, [doDetails, search]);

    const paginatedDetails = useMemo(() => {
        const startIndex = (page - 1) * perPage;
        return filteredDetails.slice(startIndex, startIndex + perPage);
    }, [filteredDetails, page, perPage]);

    const handleAddDetailClick = () => {
        if (slug && id) {
            router.push(`/dashboard/${slug}/do-ekspedisi/detail/${id}/create`);
        }
    };

    if (!doData) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Memuat detail DO...</p>
                </div>
            </DashboardLayout>
        );
    }

    const totalData = filteredDetails.length;
    const totalPages = Math.ceil(totalData / perPage);
    const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
    const endData = Math.min(page * perPage, totalData);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => router.push(`/dashboard/${slug}/do-ekspedisi`)}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Detail DO Expedisi</h1>
                        <p className="text-sm text-gray-500">Kode DO <span className="text-blue-600 font-medium">{doData.kodeDO}</span></p>
                    </div>
                </div>

                <DOEkspedisiDetailCard data={doData} />

                {/* Filters and Actions for Table */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search here"
                                className="pl-9 bg-white"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 whitespace-nowrap">Show</span>
                            <Select value={perPage.toString()} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                                <SelectTrigger className="w-[70px] bg-white">
                                    <SelectValue placeholder="10" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-gray-500 whitespace-nowrap">Page</span>
                        </div>
                    </div>

                    <Button onClick={handleAddDetailClick} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
                        <Plus className="mr-2 h-4 w-4" /> Tambah
                    </Button>
                </div>

                <DOEkspedisiDetailTable data={paginatedDetails} />

                {totalPages > 0 && (
                    <div className="flex items-center justify-between px-2 pt-2">
                        <div className="text-sm text-gray-500">
                            Showing {startData}-{endData} of {totalData} data
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="text-gray-500"
                                >
                                    Previous
                                </Button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <Button
                                        key={p}
                                        variant={p === page ? "outline" : "ghost"}
                                        size="sm"
                                        onClick={() => setPage(p)}
                                        className={p === page ? "border-gray-200 bg-white shadow-sm" : "text-gray-500"}
                                    >
                                        {p}
                                    </Button>
                                ))}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages}
                                    className="text-gray-500"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
