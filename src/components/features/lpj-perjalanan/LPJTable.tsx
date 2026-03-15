import { format } from 'date-fns';
import { MoreVertical, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { LPJRecord } from './lpj-perjalanan.data';

interface LPJTableProps {
  data: LPJRecord[];
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  perPage: number;
  totalData: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (value: number) => void;
  onAdd: () => void;
  onEdit: (item: LPJRecord) => void;
  onDetail: (item: LPJRecord) => void;
  onDelete: (item: LPJRecord) => void;
}

export function LPJTable({ data, search, onSearchChange, page, perPage, totalData, onPageChange, onPerPageChange, onAdd, onEdit, onDetail, onDelete }: LPJTableProps) {
  const totalPages = Math.ceil(totalData / perPage);
  const startData = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const endData = Math.min(page * perPage, totalData);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-75">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search here" className="pl-9 bg-white" value={search} onChange={(e) => onSearchChange(e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Show</span>
            <Select value={perPage.toString()} onValueChange={(v) => onPerPageChange(Number(v))}>
              <SelectTrigger className="w-17.5 bg-white">
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

        <Button onClick={onAdd} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
          <Plus className="mr-2 h-4 w-4" /> Tambah
        </Button>
      </div>

      <Card className="rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <Table className="min-w-275">
            <TableHeader className="bg-[#f8f9fa] border-b border-gray-200">
              <TableRow>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">KODE LPJ</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">DRIVER</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">NO POLISI</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">TGL BERANGKAT</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">TGL KEMBALI</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">RUTE</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">MUATAN</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">TOTAL KM</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center py-3">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50">
                    <TableCell className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.kodeLPJ}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700 text-center whitespace-nowrap">{item.driver}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700 text-center whitespace-nowrap">{item.noPolisi}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700 text-center whitespace-nowrap">{format(new Date(item.tglBerangkat), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700 text-center whitespace-nowrap">{item.tglKembali ? format(new Date(item.tglKembali), 'dd/MM/yyyy') : '-'}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700 text-center">
                      <span className="inline-flex flex-col items-center gap-1">
                        <span>{item.ruteAsal}</span>
                        <span>{item.ruteTujuan}</span>
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700 text-center whitespace-nowrap">{item.muatan}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700 text-center whitespace-nowrap">{item.totalKM} km</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDetail(item)} className="cursor-pointer">
                            Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(item)} className="text-red-600 cursor-pointer focus:text-red-600">
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-gray-500">
                    Tidak ada data LPJ ditemukan
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
              <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1} className="text-gray-500">
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button key={p} variant={p === page ? 'outline' : 'ghost'} size="sm" onClick={() => onPageChange(p)} className={p === page ? 'border-gray-200 bg-white' : 'text-gray-500'}>
                  {p}
                </Button>
              ))}

              <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="text-gray-500">
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
