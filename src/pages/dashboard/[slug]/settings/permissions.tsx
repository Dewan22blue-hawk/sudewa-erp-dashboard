import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { usePermissions } from '@/hooks/usePermission';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import { Search } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PermissionsPage() {
  const { hasPermission } = usePermissionGuard();
  const { data: permissions = [], isLoading } = usePermissions();

  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("25");
  const [currentPage, setCurrentPage] = useState(1);

  if (!hasPermission('permissions:list')) {
    return (
      <DashboardLayout>
        <div className="p-6 text-sm text-muted-foreground">Anda tidak memiliki akses ke halaman ini.</div>
      </DashboardLayout>
    );
  }

  // Filter Logic
  const filteredData = permissions.filter(perm =>
    perm.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / Number(itemsPerPage)) || 1;
  const startIndex = (currentPage - 1) * Number(itemsPerPage);
  const endIndex = startIndex + Number(itemsPerPage);
  const currentData = filteredData.slice(startIndex, endIndex);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 grid grid-cols-1">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Permissions</h1>
          <p className="text-sm text-gray-500">Daftar permission yang tersedia.</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search here"
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show</span>
              <Select
                value={itemsPerPage}
                onValueChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="25" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500">Page</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="min-w-full w-full text-sm">
            <thead className="bg-gray-50/50 uppercase text-sm font-semibold text-gray-900">
              <tr className="text-center border-b border-gray-200">
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Guard</th>
                <th className="px-4 py-3 text-left">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-gray-500">Memuat...</td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-gray-500">Tidak ada data</td>
                </tr>
              ) : (
                currentData.map((perm) => (
                  <tr key={perm.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">{perm.name}</td>
                    <td className="px-4 py-3">{perm.guard_name || '-'}</td>
                    <td className="px-4 py-3">{perm.created_at?.slice(0, 10) || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Showing {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} data
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-gray-100">
              {currentPage}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
