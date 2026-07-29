import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { ChevronRight, ArrowLeft, FileText, Package } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PengeluaranUnitDetailTable from '@/components/features/pengeluaran-unit/PengeluaranUnitDetailTable';
import { useDispatchPengeluaranStock } from '@/hooks/usePengeluaranUnit';
import { useWarehouseActivityDetail } from '@/hooks/useWarehouseActivity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CopyBox } from '@/components/ui/copy-box';
import { formatDate } from '@/lib/utils/format';
import { ReferenceLink } from '@/components/ui/reference-link';

export default function PengeluaranUnitDetailPage() {
  const router = useRouter();
  const { id, slug } = router.query as { id?: string; slug?: string };

  const { data: detailData, isLoading } = useWarehouseActivityDetail(id);

  useEffect(() => {
    if (!isLoading && detailData && detailData.activity_type !== 'issue') {
      router.push(`/dashboard/${slug}/warehouse/pengeluaran-unit`);
    }
  }, [detailData, isLoading, router, slug]);

  const header = detailData;
  const details = detailData?.unit_transaction_details ?? [];
  const dispatchMutation = useDispatchPengeluaranStock();

  const handleKirim = async (ids: number[]) => {
    if (!id) return;
    if (ids.length === 0) {
      toast.error('Pilih minimal satu unit');
      return;
    }

    try {
      await dispatchMutation.mutateAsync({
        warehouseActivityId: id,
        detailIds: ids,
      });
      toast.success('Dispatch stock berhasil diproses');
    } catch (error: unknown) {
      const apiError = error as { message?: string; details?: unknown };
      const detailsError = apiError?.details;

      if (Array.isArray(detailsError)) {
        toast.error(apiError?.message || 'Sebagian data detail tidak valid untuk proses release/issue stock');
        return;
      }

      if (detailsError && typeof detailsError === 'object') {
        const detailText = Object.entries(detailsError as Record<string, unknown>)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? String(value[0]) : String(value)}`)
          .join(', ')
          .trim();

        toast.error(detailText || apiError?.message || 'Gagal memproses release/issue stock');
        return;
      }

      toast.error(apiError?.message || 'Gagal memproses release/issue stock');
    }
  };

  const handleDelete = async (_ids: number[]) => {
    void _ids;
    toast.error('Endpoint hapus detail belum tersedia pada API warehouse activity');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* BREADCRUMB HEADER */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => router.push(`/dashboard/${slug}/warehouse/pengeluaran-unit`)}>
            Pengeluaran Unit
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="font-medium text-slate-800">Detail Pengeluaran Unit</span>
        </div>

        {/* HEADLINE & ACTIONS */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push(`/dashboard/${slug}/warehouse/pengeluaran-unit`)} variant="ghost" size="icon" className="h-10 w-10 rounded-md border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ArrowLeft className="h-5 w-5 text-slate-700" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-slate-900">Detail Pengeluaran Unit</h1>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>Kode Transaksi:</span>
                <span className="text-blue-600 font-semibold">{header?.activity_number || header?.noPenerimaan || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Card 1: Informasi Pengeluaran */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-50">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Informasi Pengeluaran</h3>
              </div>
              <div className="text-sm text-slate-600 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-slate-400">No. Pengeluaran</p>
                    <p className="font-semibold text-slate-900">
                      <CopyBox text={header?.activity_number || header?.noPenerimaan || '-'} />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Tanggal Pengeluaran</p>
                    <p className="font-semibold text-slate-900">{formatDate(header?.activity_date || header?.tanggal || '')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Warehouse/Gudang</span>
                  <span className="font-semibold text-slate-900">{header?.warehouse?.name || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Customer</span>
                  <span className="font-semibold text-slate-900">
                    {header?.person?.name ? (
                      <ReferenceLink href={`/dashboard/${slug}/master/customer?search=${header?.person?.name}`}>
                        {header?.person?.name}
                      </ReferenceLink>
                    ) : '-'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Keterangan & Logistik */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-yellow-50">
                  <Package className="h-5 w-5 text-yellow-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Keterangan & Logistik</h3>
              </div>
              <div className="text-sm text-slate-600 mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Unit Detail</span>
                  <span className="font-semibold text-slate-900">{details.length} Unit</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-slate-400">Catatan / Keterangan</span>
                  <p className="text-slate-900 p-2 rounded-md bg-slate-50 w-full min-h-[50px]">
                    {header?.description || header?.keterangan || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-md border sm:p-5 space-y-4">
          <PengeluaranUnitDetailTable data={details} onKirim={handleKirim} onDelete={handleDelete} isLoading={isLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
}
