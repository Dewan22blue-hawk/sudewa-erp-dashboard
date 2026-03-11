'use client';

import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/common/PageHeader';
import PurchaseUnitForm from '@/components/features/purchase/PurchaseUnitForm';
import { useCreatePurchase } from '@/hooks/usePurchase';
import { ChevronRight } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useSuppliers } from '@/hooks/useSupplier';

export default function CreatePurchasePage() {
  const router = useRouter();
  const { slug } = router.query;
  const { companyId } = useCompany();
  const mutation = useCreatePurchase();
  const { data: supplierData } = useSuppliers(companyId || null);

  const handleSubmit = async (data: any) => {
    try {
      const now = new Date();
      const ymd = now.toISOString().split('T')[0].replace(/-/g, '');
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      const seq = String(now.getSeconds()).padStart(2, '0');
      const slugCode = String(slug || 'UNK')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      const companyCode = slugCode ? slugCode.slice(0, 3) : 'UNK';
      const generatedCode = `PBL-${companyCode}/${ymd}-${seq}${ms}`;

      const supplierInputRaw = data.supplierId || data.supplierName || '';
      const supplierInput = String(supplierInputRaw).trim();
      let supplierNumeric = Number(supplierInput);
      let supplierNameResolved = supplierInput;

      if (Number.isNaN(supplierNumeric)) {
        const match = supplierData?.data?.find((s) => s.name.toLowerCase() === supplierInput.toLowerCase());
        if (match) {
          supplierNumeric = Number(match.id);
          supplierNameResolved = match.name;
        } else {
          toast.error('Supplier harus diisi dengan ID person atau nama yang terdaftar di master supplier');
          return;
        }
      }

      const warehouseNumeric = Number(data.warehouseId || 1);

      if (!supplierNumeric || supplierNumeric <= 0) {
        toast.error('Supplier wajib dipilih (person_id tidak boleh kosong)');
        return;
      }

      if (!warehouseNumeric || warehouseNumeric <= 0) {
        toast.error('Warehouse ID wajib diisi (gunakan ID yang valid, contoh: 1)');
        return;
      }

      const qtyNumber = Number(data.qty ?? 0);
      const priceNumber = Number(data.price ?? 0);
      const bbnNumber = Number(data.biayaBBN ?? 0);
      const ekspedisiNumber = Number(data.biayaEkspedisi ?? 0);
      const lainNumber = Number(data.biayaLain ?? 0);
      const payload = {
        ...data,
        date: new Date().toISOString().split('T')[0],
        supplierName: supplierNameResolved,
        companyId: companyId || '',
        supplierId: supplierNumeric,
        npwp: data.npwp,
        address: data.address,
        warehouseId: warehouseNumeric,
        stockState: 'draft',
        type: 'purchase',
        code: (typeof window !== 'undefined' && (window as any).__generatedPurchaseCode) || generatedCode,
        qty: qtyNumber,
        price: priceNumber,
        biayaBBN: bbnNumber,
        biayaEkspedisi: ekspedisiNumber,
        biayaLain: lainNumber,
        maxCapacity: qtyNumber,
        typeUnitName: data.typeUnitName || data.typeUnitId,
        typeUnitId: String(data.typeUnitId || ''),
      };

      if (process.env.NODE_ENV !== 'production') {
        // Log untuk debug jika validasi backend gagal
        console.debug('create purchase payload', payload);
      }

      const newPurchase = await mutation.mutateAsync(payload);

      toast.success('Pembelian berhasil dibuat');
      router.push(
        `/dashboard/${slug}/transaksi/pembelian-unit/${newPurchase.id}/detail`, // Corrected path
      );
    } catch (err: any) {
      const apiMessage = err?.message;
      const apiErrors = err?.details || err?.response?.data?.errors;
      let detail = '';
      if (apiErrors && typeof apiErrors === 'object') {
        const entries = Object.entries(apiErrors)
          .map(([k, v]) => {
            const msg = Array.isArray(v) ? v[0] : String(v);
            return `${k}: ${msg}`;
          })
          .join(', ');
        detail = entries;
      }
      const detailJson = err?.response?.data ? JSON.stringify(err.response.data) : '';
      toast.error(apiMessage || detail || 'Gagal membuat pembelian');
      if (process.env.NODE_ENV !== 'production') {
        console.error('create purchase error', err?.response?.data || err);
        if (detailJson) console.error('create purchase error detail', detailJson);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* BREADCRUMB HEADER */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer" onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)}>
            Pembelian Unit
          </span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Tambah Pembelian</span>
        </div>

        <div className="flex flex-col gap-1">
          <PageHeader title="Tambah Pembelian Unit" description="" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Kode Beli</span>
            {(() => {
              const s = String(slug || 'UNK')
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '');
              const companyCode = s ? s.slice(0, 3) : 'UNK';
              const time = new Date();
              const ymd = time.toISOString().split('T')[0].replace(/-/g, '');
              const ms = String(time.getMilliseconds()).padStart(3, '0');
              const seq = String(time.getSeconds()).padStart(2, '0');
              const code = `PBL-${companyCode}/${ymd}-${seq}${ms}`;
              if (typeof window !== 'undefined') (window as any).__generatedPurchaseCode = code; // make available for handleSubmit
              return <span className="text-blue-600 font-medium">{code}</span>;
            })()}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 md:p-8">
          <PurchaseUnitForm onSubmit={handleSubmit} loading={mutation.isPending} onCancel={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)} companyId={companyId} />
        </div>
      </div>
    </DashboardLayout>
  );
}
