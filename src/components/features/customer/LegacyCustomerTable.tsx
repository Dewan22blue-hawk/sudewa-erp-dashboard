import { useMemo, useState, type ChangeEvent } from 'react';
import { MoreHorizontal, Plus, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Customer } from '@/@types/customer.types';

interface LegacyCustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onAdd?: () => void;
  onImport?: () => void;
}

export function LegacyCustomerTable({ customers, onEdit, onDelete, onAdd, onImport }: LegacyCustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const filteredData = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    return customers.filter(
      (item) =>
        (item.name ?? '').toLowerCase().includes(lowercasedTerm) ||
        (item.code ?? '').toLowerCase().includes(lowercasedTerm) ||
        (item.address ?? '').toLowerCase().includes(lowercasedTerm) ||
        (item.npwp ?? '').toLowerCase().includes(lowercasedTerm) ||
        (item.pic ?? '').toLowerCase().includes(lowercasedTerm) ||
        (item.phone ?? '').toLowerCase().includes(lowercasedTerm) ||
        (item.map_link ?? '').toLowerCase().includes(lowercasedTerm),
    );
  }, [customers, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const renderActionMenu = (customer: Customer) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(customer)}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(customer)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search here" value={searchTerm} onChange={handleSearchChange} className="pl-9 bg-white" />
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm font-medium">Show</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-17.5 bg-white">
                <SelectValue placeholder="25" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm font-medium">Page</span>
          </div>
        </div>

        <div className="flex w-full sm:w-auto justify-end gap-2">
          {onImport && (
            <Button onClick={onImport} variant="outline" className="w-full sm:w-auto">
              <Upload className="h-4 w-4" />
              Import
            </Button>
          )}
          {onAdd && (
            <Button onClick={onAdd} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
              <Plus className="h-4 w-4" />
              Tambah
            </Button>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className={currentData.length > 0 ? 'pr-24' : undefined}>
          <Table className="min-w-[1040px]">
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold uppercase text-slate-700">Kode Customer</TableHead>
                <TableHead className="font-semibold uppercase text-slate-700">Nama Customer</TableHead>
                <TableHead className="font-semibold uppercase text-slate-700">Alamat</TableHead>
                <TableHead className="font-semibold uppercase text-slate-700">NPWP</TableHead>
                <TableHead className="font-semibold uppercase text-slate-700">PIC</TableHead>
                <TableHead className="font-semibold uppercase text-slate-700">Phone</TableHead>
                <TableHead className="font-semibold uppercase text-slate-700">Maps</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.length === 0 ? (
                <TableRow className="group">
                  <TableCell colSpan={100} className="py-16 h-24 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="rounded-full bg-slate-50 p-4 mb-2">
                        <Search className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                      <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentData.map((customer) => (
                  <TableRow key={customer.id} className="group hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-800">{customer.code ?? '-'}</TableCell>
                    <TableCell className="text-slate-700">{customer.name}</TableCell>
                    <TableCell className="max-w-75 truncate text-slate-700" title={customer.address ?? undefined}>
                      {customer.address ?? '-'}
                    </TableCell>
                    <TableCell className="text-slate-700">{customer.npwp ?? '-'}</TableCell>
                    <TableCell className="text-slate-700">{customer.pic ?? '-'}</TableCell>
                    <TableCell className="text-slate-700">{customer.phone ?? '-'}</TableCell>
                    <TableCell className="text-slate-700">
                      {customer.map_link ? (
                        <a href={customer.map_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          [link]
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {currentData.length > 0 ? (
          <div className="absolute right-0 top-0 z-30 w-24 bg-white shadow-[-8px_0_12px_-10px_rgba(15,23,42,0.45)]">
            <table className="w-full caption-bottom text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b">
                  <th className="h-10 px-2 text-right align-middle font-semibold uppercase text-slate-700 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((customer) => (
                  <tr key={customer.id} className="border-b transition-colors hover:bg-slate-50/50">
                    <td className="p-2 text-right align-middle whitespace-nowrap">{renderActionMenu(customer)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <div className="text-sm text-slate-500">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="h-8 px-3">
              Previous
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(pageNum)} className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-[#1f304f] hover:bg-[#1a2842]' : ''}`}>
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="px-2 text-slate-500">...</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} className="h-8 w-8 p-0">
                  {totalPages}
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="h-8 px-3">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
