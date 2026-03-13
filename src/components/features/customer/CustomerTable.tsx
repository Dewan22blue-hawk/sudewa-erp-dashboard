import React from 'react';
import { Search, Plus, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { CustomerFormData } from './CustomerFormModal';

export interface Customer extends CustomerFormData {
  id: number;
}

interface CustomerTableProps {
  customers: Customer[];
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  perPage: number;
  totalData: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onAdd: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomerTable({
  customers,
  search,
  onSearchChange,
  page,
  perPage,
  totalData,
  onPageChange,
  onPerPageChange,
  onAdd,
  onEdit,
  onDelete
}: CustomerTableProps) {
  const totalPages = Math.ceil(totalData / perPage);
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = Math.min(page * perPage, totalData);

  return (
    <div className="space-y-4">
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

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Show</span>
            <Select value={perPage.toString()} onValueChange={(v) => onPerPageChange(Number(v))}>
              <SelectTrigger className="w-[70px] bg-white">
                <SelectValue placeholder="25" />
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

        <Button onClick={onAdd} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
          <Plus className="mr-2 h-4 w-4" /> Tambah
        </Button>
      </div>

      <Card className="rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
              <TableRow>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">NAMA DEALER</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">NAMA CUSTOMER</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">PIC</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">ALAMAT</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">MAPS</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">HANDPHONE</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-gray-50/50">
                    <TableCell className="px-4 py-4 text-sm text-gray-900 text-center">
                      {customer.namaDealer}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">
                      {customer.namaCustomer}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">
                      {customer.pic}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">
                      <span className="line-clamp-2 max-w-[200px] mx-auto">{customer.alamat}</span>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center">
                      <a href={customer.maps} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline max-w-[150px] inline-block truncate">
                        {customer.maps}
                      </a>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap">
                      {customer.phone}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => onEdit(customer)} className="cursor-pointer">
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(customer)} className="text-red-600 cursor-pointer focus:text-red-600">
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                    Tidak ada data customer ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

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
                onClick={() => onPageChange(page - 1)}
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
                  onClick={() => onPageChange(p)}
                  className={p === page ? "border-gray-200 bg-white" : "text-gray-500"}
                >
                  {p}
                </Button>
              ))}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(page + 1)}
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
  );
}
