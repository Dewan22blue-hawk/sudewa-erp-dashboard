'use client';

import { MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { PenerimaanUnit } from '@/@types/penerimaan-unit.types';
import DeletePenerimaanUnitDialog from './DeletePenerimaanUnitDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Props {
  data: PenerimaanUnit[];
}

export default function PenerimaanUnitTable({ data }: Props) {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 uppercase text-xs font-medium tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">NO PENERIMAAN</th>
            <th className="px-4 py-3 text-left">TANGGAL</th>
            <th className="px-4 py-3 text-left">SUPPLIER</th>
            <th className="px-4 py-3 text-left">KETERANGAN</th>
            <th className="px-4 py-3 text-center w-[60px]">ACTION</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium text-gray-900">{item.noPenerimaan}</td>
              <td className="px-4 py-3">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
              <td className="px-4 py-3">{item.supplier}</td>
              <td className="px-4 py-3">{item.keterangan || '-'}</td>
              <td className="px-4 py-3 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>{slug ? <Link href={`/dashboard/${slug}/warehouse/penerimaan-unit/${item.id}/edit`}>Edit</Link> : <span className="text-gray-400">Edit</span>}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteId(item.id)} className="text-red-600">
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {deleteId && <DeletePenerimaanUnitDialog id={deleteId} open={!!deleteId} onClose={() => setDeleteId(null)} />}
    </div>
  );
}
