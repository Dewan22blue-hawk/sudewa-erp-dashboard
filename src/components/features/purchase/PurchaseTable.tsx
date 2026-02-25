import { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Purchase } from '@/@types/purchase.types';
import { MoreVertical, Plus, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  data: Purchase[];
  onDelete: (id: string) => void;
  onAdd?: () => void;
  slug: string;
}

export default function PurchaseTable({ data, onDelete, onAdd, slug }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(
    (item) =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.includes(searchTerm)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleToggle = (id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to page 1 on page size change
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search here..."
              className="pl-8 bg-white"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm font-medium">Show</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
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
            <span className="text-sm font-medium">Entries</span>
          </div>


        </div>

        <div className="flex w-full sm:w-auto items-center gap-2 justify-end">
          {onAdd && (
            <Button onClick={onAdd} className="bg-[#1f304f] hover:bg-[#1a2842] text-white whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              Tambah
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-none">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="font-semibold uppercase text-slate-700">INVOICE</TableHead>
              <TableHead className="font-semibold uppercase text-slate-700">TANGGAL TRANSAKSI</TableHead>
              <TableHead className="font-semibold uppercase text-slate-700">NAMA SUPPLIER</TableHead>
              <TableHead className="font-semibold uppercase text-slate-700">TOTAL BIAYA</TableHead>
              <TableHead className="font-semibold uppercase text-slate-700">TOTAL DPP</TableHead>
              <TableHead className="font-semibold uppercase text-slate-700">TOTAL PPN</TableHead>
              <TableHead className="font-semibold uppercase text-slate-700">TOTAL PEMBELIAN</TableHead>
              <TableHead className="font-semibold uppercase text-slate-700">SISA BAYAR</TableHead>
              <TableHead className="text-right font-semibold uppercase text-slate-700">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((item) => (
                <TableRow key={item.id} className="border-t hover:bg-slate-50/50 transition-colors" data-state={selectedIds.has(item.id) && 'selected'}>
                  <TableCell className="w-12">
                    <Checkbox checked={selectedIds.has(item.id)} onCheckedChange={() => handleToggle(item.id)} />
                  </TableCell>
                  <TableCell className="font-medium text-slate-800 cursor-pointer hover:underline" onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${item.id}`)}>
                    {item.code}
                  </TableCell>
                  <TableCell className="text-slate-700">{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-slate-700">{item.supplierName}</TableCell>
                  <TableCell className="text-slate-700">{Number(item.totalBiaya).toLocaleString('id-ID')}</TableCell>
                  <TableCell className="text-slate-700">{Number(item.totalDpp).toLocaleString('id-ID')}</TableCell>
                  <TableCell className="text-slate-700">{Number(item.totalPpn).toLocaleString('id-ID')}</TableCell>
                  <TableCell className="font-semibold text-slate-800">{Number(item.totalPurchase).toLocaleString('id-ID')}</TableCell>
                  <TableCell className="text-red-500 font-semibold">{Number(item.remainingPayment).toLocaleString('id-ID')}</TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${item.id}`)}>Detail</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/edit/${item.id}`)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/dashboard/${slug}/transaksi/pembelian-unit/${item.id}/detail?print=true`, '_blank')}>Print</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <div className="text-sm text-slate-500">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3"
            >
              Previous
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-[#1f304f] hover:bg-[#1a2842]' : ''}`}
                >
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="px-2 text-slate-500">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  className="h-8 w-8 p-0"
                >
                  {totalPages}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
