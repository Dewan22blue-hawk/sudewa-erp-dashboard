'use client';

import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EditUnitForm } from '@/components/features/sales/edit/EditUnitForm';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateSalesPage() {
  const router = useRouter();
  const slugQuery = router.query.slug;
  const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';
  const salesPath = slug ? `/dashboard/${slug}/sales` : '/sales';

  const handleSubmit = (data: any) => {
    console.log('Submitting sales data:', data);
    // Simulation of API call
    setTimeout(() => {
      toast.success('Penjualan unit berhasil ditambahkan');
      router.push(salesPath);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(salesPath)}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-semibold tracking-tight">Tambah Penjualan</h1>
          </div>
          <div className="flex items-center gap-2 mt-1 ml-7 text-xs">
            <span className="text-muted-foreground">Kode Jual</span>
            <span className="text-blue-500 font-medium">INV-WIN/20260202-0001</span>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 md:p-6 shadow-sm">
          <EditUnitForm
            defaultValues={{
              customer: 'PT XX',
              tipeUnit: '',
              qty: 1,
              harga: 0,
              hppSatuan: 0,
              totalHpp: 0,
              dppSatuan: 0,
              totalDpp: 0,
              ppnSatuan: 0,
              totalPpn: 0,
              biayaBbn: 0,
              biayaEkspedisi: 0,
              biayaLain: 0,
            }}
            onSubmit={handleSubmit}
            onCancel={() => router.push(salesPath)}
            showAddUnitButton
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
