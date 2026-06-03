import type { Customer } from '@/@types/customer.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { Download, MoreVertical, Plus, Search, Upload } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  isLoading?: boolean;
  search: string;
  page: number;
  perPage: number;
  totalData: number;
  totalPages: number;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onAdd: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onImport: () => void;
  onExport: () => void;
  isExporting?: boolean;
}

const buildPagination = (page: number, totalPages: number): Array<number | 'ellipsis'> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 'ellipsis', totalPages];
  }

  if (page >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages];
};

export function CustomerTable({
  customers,
  isLoading = false,
  search,
  page,
  perPage,
  totalData,
  totalPages,
  onSearchChange,
  onPageChange,
  onPerPageChange,
  onAdd,
  onEdit,
  onDelete,
  onImport,
  onExport,
  isExporting = false,
}: CustomerTableProps) {
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = totalData === 0 ? 0 : Math.min(page * perPage, totalData);
  const paginationItems = buildPagination(page, totalPages);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative w-full lg:w-[332px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search here"
              className="h-10 rounded-xl border-[#D4D4D8] bg-white pl-11 text-[15px] text-[#171717] placeholder:text-[#A3A3A3]"
            />
          </div>

          <div className="flex items-center gap-3 text-[15px] text-[#171717]">
            <span>Show</span>
            <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
              <SelectTrigger className="h-10 w-[64px] rounded-xl border-[#D4D4D8] bg-white px-3">
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

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button variant="outline" className="h-10 rounded-xl border-[#D4D4D8] px-4 text-[#171717]" onClick={onImport}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" className="h-10 rounded-xl border-[#D4D4D8] px-4 text-[#171717]" onClick={onExport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button className="h-10 rounded-xl bg-[#1F3B5B] px-5 text-white hover:bg-[#19314b]" onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-xl border border-[#D4D4D8] bg-white shadow-none">
        <div className="overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow className="border-b border-[#E4E4E7] bg-[#F1F5F9] hover:bg-[#F1F5F9]">
                <TableHead className="h-[46px] px-7 text-center text-[15px] font-semibold uppercase text-[#171717]">Kode</TableHead>
                <TableHead className="h-[46px] px-7 text-center text-[15px] font-semibold uppercase text-[#171717]">Nama Customer</TableHead>
                <TableHead className="h-[46px] px-7 text-center text-[15px] font-semibold uppercase text-[#171717]">PIC</TableHead>
                <TableHead className="h-[46px] px-7 text-center text-[15px] font-semibold uppercase text-[#171717]">Phone</TableHead>
                <TableHead className="h-[46px] px-7 text-center text-[15px] font-semibold uppercase text-[#171717]">NPWP</TableHead>
                <TableHead className="h-[46px] px-7 text-center text-[15px] font-semibold uppercase text-[#171717]">Alamat</TableHead>
                <TableHead className="h-[46px] px-7 text-center text-[15px] font-semibold uppercase text-[#171717]">Maps</TableHead>
                <TableHead className="h-[46px] px-7 text-center text-[15px] font-semibold uppercase text-[#171717]">Created At</TableHead>
                <TableHead className="h-[46px] px-7 text-center text-[15px] font-semibold uppercase text-[#171717]">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: Math.max(3, perPage > 3 ? 3 : perPage) }).map((_, index) => (
                  <TableRow key={index} className="border-b border-[#E4E4E7]">
                    <TableCell colSpan={9} className="px-7 py-5">
                      <div className="h-10 animate-pulse rounded-lg bg-[#F4F4F5]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow key={customer.id} className="border-b border-[#E4E4E7] align-top hover:bg-[#FAFAFA]">
                    <TableCell className="px-7 py-4 text-center text-[15px] font-medium leading-6 text-[#171717]">
                      <div className="mx-auto max-w-[160px] break-words">{customer.code || '-'}</div>
                    </TableCell>
                    <TableCell className="px-7 py-4 text-center text-[15px] font-medium uppercase leading-6 text-[#171717]">
                      <div className="mx-auto max-w-[220px] break-words">{customer.name}</div>
                    </TableCell>
                    <TableCell className="px-7 py-4 text-center text-[15px] leading-6 text-[#171717]">
                      <div className="mx-auto max-w-[140px] break-words">{customer.pic || '-'}</div>
                    </TableCell>
                    <TableCell className="px-7 py-4 text-center text-[15px] leading-6 text-[#171717]">
                      <div className="mx-auto max-w-[140px] break-words">{customer.phone || '-'}</div>
                    </TableCell>
                    <TableCell className="px-7 py-4 text-center text-[15px] leading-6 text-[#171717]">
                      <div className="mx-auto max-w-[180px] break-words">{customer.npwp || '-'}</div>
                    </TableCell>
                    <TableCell className="px-7 py-4 text-center text-[15px] leading-6 text-[#171717]">
                      <div className="mx-auto max-w-[240px] whitespace-pre-line break-words">{customer.address || '-'}</div>
                    </TableCell>
                    <TableCell className="px-7 py-4 text-center text-[15px] leading-6 text-[#171717]">
                      {customer.map_link ? (
                        <a
                          href={customer.map_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mx-auto block max-w-[180px] break-all text-[#171717] hover:text-[#1F3B5B] hover:underline"
                        >
                          {customer.map_link}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="px-7 py-4 text-center text-[15px] leading-6 text-[#171717]">
                      {customer.createdAt ? formatDate(customer.createdAt) : '-'}
                    </TableCell>
                    <TableCell className="px-7 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-[#171717] hover:bg-[#F4F4F5]">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[150px] rounded-2xl border-[#E4E4E7] p-2 shadow-lg">
                          <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2 text-[15px]" onClick={() => onEdit(customer)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2 text-[15px] text-[#DC2626] focus:text-[#DC2626]" onClick={() => onDelete(customer)}>
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="px-7 py-16 text-center text-[15px] text-[#71717A]">
                    Belum ada data customer untuk company aktif
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex flex-col gap-4 text-[15px] text-[#71717A] md:flex-row md:items-center md:justify-between">
        <p>
          Showing {startData}-{endData} of {totalData} data
        </p>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-end gap-1 text-[#171717]">
            <Button
              variant="ghost"
              className="h-9 rounded-xl px-3 text-[15px] font-normal text-[#171717] hover:bg-transparent disabled:text-[#A1A1AA]"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>

            {paginationItems.map((item, index) =>
              item === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-3 text-[15px] text-[#171717]">
                  ...
                </span>
              ) : (
                <Button
                  key={item}
                  variant="ghost"
                  className={cn(
                    'h-9 min-w-9 rounded-xl border border-transparent px-3 text-[15px] font-normal text-[#171717] hover:bg-transparent',
                    item === page && 'border-[#D4D4D8] bg-white shadow-sm hover:bg-white',
                  )}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </Button>
              ),
            )}

            <Button
              variant="ghost"
              className="h-9 rounded-xl px-3 text-[15px] font-normal text-[#171717] hover:bg-transparent disabled:text-[#A1A1AA]"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
