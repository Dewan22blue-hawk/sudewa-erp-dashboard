'use client';

import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import PenerimaanUnitTable from '@/components/features/penerimaan-unit/PenerimaanUnitTable';
import PenerimaanUnitFormDialog from '@/components/features/penerimaan-unit/PenerimaanUnitFormDialog';
import { usePenerimaanUnits } from '@/hooks/usePenerimaanUnit';

export default function PenerimaanUnitPage() {
  const { data = [], isLoading } = usePenerimaanUnits();
  const [search, setSearch] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((item) => item.noPenerimaan.toLowerCase().includes(q) || item.supplier.toLowerCase().includes(q) || (item.keterangan || '').toLowerCase().includes(q));
  }, [data, search]);

  const perPage = Number(itemsPerPage);
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * perPage;
  const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + perPage, totalItems);
  const paginated = filtered.slice(startIndex, startIndex + perPage);

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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Data Penerimaan Unit</h1>
            <p className="text-sm text-gray-500">Kelola dan lacak semua data penerimaan stock unit</p>
          </div>
          <Button className="bg-[#19355d]" onClick={() => setOpenForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah
          </Button>
        </div>

        <div className="bg-white rounded-xl border p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search here"
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>Show</span>
              <Select
                value={itemsPerPage}
                onValueChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-20">
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

          {isLoading ? <div className="p-8 text-center text-gray-500">Loading...</div> : <PenerimaanUnitTable data={paginated} />}

          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems} data
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                Previous
              </Button>
              {getPageNumbers().map((page, idx) => (
                <Button
                  key={idx}
                  variant={page === currentPage ? 'outline' : 'ghost'}
                  size="sm"
                  className={page === currentPage ? 'bg-gray-100' : ''}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={typeof page !== 'number'}
                >
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={currentPage === totalPages || totalItems === 0} onClick={() => setCurrentPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </div>

        <PenerimaanUnitFormDialog open={openForm} onClose={() => setOpenForm(false)} />
      </div>
    </DashboardLayout>
  );
}
