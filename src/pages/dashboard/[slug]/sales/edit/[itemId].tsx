import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
// Button import removed (unused)
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { EditUnitForm } from '@/components/features/sales/edit/EditUnitForm';
import { EditUnitFormData } from '@/components/features/sales/edit/edit-unit.schema';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useSalesDetail, useUpdateSales } from '@/hooks/useSales';
import { mapSalesDetailToEditForm } from '@/services/sales.mapper';
import { useCompany } from '@/contexts/CompanyContext';

/**
 * Edit Unit Page - EXACT sesuai Figma
 * Layout: Back nav → Title/Invoice → Form card → Actions
 */
export default function EditUnitPage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const { itemId } = router.query;
  const salesId = Array.isArray(itemId) ? itemId[0] : itemId;
  const { data, isLoading, isError } = useSalesDetail(salesId);
  const updateMutation = useUpdateSales();
  const formData: EditUnitFormData | null = useMemo(() => {
    if (!data?.raw) return null;
    return mapSalesDetailToEditForm(data.raw);
  }, [data?.raw]);

  const invoiceCode = data?.raw?.code ?? '';

  useEffect(() => {
    if (!salesId || isLoading) return;

    if (isError || !data?.raw) {
      toast.error('Data penjualan tidak ditemukan');
      const slugQuery = router.query.slug;
      const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';
      router.push(slug ? `/dashboard/${slug}/sales` : '/sales');
    }
  }, [data?.raw, isError, isLoading, router, salesId]);

  /**
   * Handle form submit - API READY
   * TODO: Replace with actual API call when backend ready
   */
  const handleSubmit = async (form: EditUnitFormData) => {
    try {
      if (!salesId || !data?.raw) {
        toast.error('Data penjualan tidak ditemukan');
        return;
      }

      const payload = {
        company_id: Number(companyId || data.raw.company_id || 0),
        person_id: Number(data.raw.person?.id ?? data.raw.person_id ?? 0),
        warehouse_id: Number(data.raw.warehouse?.id ?? data.raw.warehouse_id ?? 1),
        code: data.raw.code ?? invoiceCode,
        type: 'sales' as const,
        max_capacity: Number(form.qty ?? 0),
        stock_state: data.raw.stock_state ?? 'draft',
      };

      if (!payload.company_id || !payload.person_id || !payload.warehouse_id || !payload.max_capacity) {
        toast.error('Data wajib tidak lengkap untuk update penjualan');
        return;
      }

      await updateMutation.mutateAsync({ id: salesId, payload });

      toast.success('Data berhasil disimpan!');

      // Navigate back to detail page
      const slugQuery = router.query.slug;
      const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';
      const basePath = slug ? `/dashboard/${slug}/sales` : '/sales';
      router.push(`${basePath}`);
    } catch (error) {
      console.error('Error updating unit:', error);
      toast.error('Gagal menyimpan data. Silakan coba lagi.');
    }
  };

  const handleCancel = () => {
    if (confirm('Batalkan perubahan?')) {
      router.back();
    }
  };

  if (isLoading || !formData) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header dengan Back Navigation */}
        <div>
          {/* Back Navigation */}
          <button onClick={() => router.back()} className="mb-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Edit Penjualan</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Kode Jual</span>
              <span className="text-blue-600 font-medium">{invoiceCode}</span>
            </div>
          </div>
        </div>

        {/* Form Card - Border 1px, Radius 12px, Padding 24px */}
        <Card className="rounded-xl">
          <CardContent className="p-6">
            <EditUnitForm defaultValues={formData} onSubmit={handleSubmit} onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
