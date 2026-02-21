import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
// Button import removed (unused)
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { EditUnitForm } from '@/components/features/sales/edit/EditUnitForm';
import { EditUnitFormData } from '@/components/features/sales/edit/edit-unit.schema';
import { SALES_DATA } from '@/components/features/sales/sales.data';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Edit Unit Page - EXACT sesuai Figma
 * Layout: Back nav → Title/Invoice → Form card → Actions
 */
export default function EditUnitPage() {
  const router = useRouter();
  const { itemId } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<EditUnitFormData | null>(null);
  const [invoiceCode, setInvoiceCode] = useState('');

  // Fetch data imitation
  useEffect(() => {
    if (!itemId) return;

    const item = SALES_DATA.find((d) => d.id === itemId);

    if (item) {
      setInvoiceCode(item.kodeJual);

      // Mocking detailed data since SALES_DATA only has totals
      // In real app, this would come from API
      const mockQty = 1;

      // Calculate reverse values or set logic defaults
      // For now we set based on available totals for display

      setFormData({
        tipeUnit: 'Product A', // Default/Mock
        qty: mockQty,
        harga: 0,

        // Biaya - Mock values because they aren't in list data
        biayaBbn: 0,
        biayaEkspedisi: 0,
        biayaLain: 0,

        // Totals from data
        totalHpp: item.totalDpp * 0.8, // Mock HPP as 80% of DPP
        totalDpp: item.totalDpp,
        totalPpn: item.totalPpn,

        // Satuan (Derived)
        hppSatuan: (item.totalDpp * 0.8) / mockQty,
        dppSatuan: item.totalDpp / mockQty,
        ppnSatuan: item.totalPpn / mockQty,
      });
    } else {
      toast.error('Data penjualan tidak ditemukan');
      const slugQuery = router.query.slug;
      const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';
      router.push(slug ? `/dashboard/${slug}/sales` : '/sales');
    }
    setIsLoading(false);
  }, [itemId, router]);

  /**
   * Handle form submit - API READY
   * TODO: Replace with actual API call when backend ready
   */
  const handleSubmit = async (data: EditUnitFormData) => {
    try {
      console.log('=== SUBMIT DATA ===');
      console.log('Item ID:', itemId);
      console.log('Form Data:', data);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

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
