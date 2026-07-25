import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGoodsIssueEquipmentDetail } from '@/hooks/warehouse/useGoodsIssueEquipment';

const formatLongDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const getCategoryLabel = (category?: string) => {
  if (category === 'equipped') return 'Perlengkapan Armada';
  if (category === 'maintenance') return 'Maintenance Armada';
  return category || '-';
};

export default function PengeluaranPerlengkapanDetailPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const rawId = typeof router.query.id === 'string' ? Number(router.query.id) : NaN;
  const id = Number.isFinite(rawId) ? rawId : undefined;

  const { data: transaction, isLoading, isError, refetch } = useGoodsIssueEquipmentDetail(id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Memuat data detail pengeluaran perlengkapan...
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !transaction) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
          <p className="text-[16px] text-red-600 font-medium mb-4">
            Gagal memuat data detail pengeluaran perlengkapan atau data tidak ditemukan.
          </p>
          <Button variant="outline" className="rounded-md" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const items = transaction.goodsTransactionDetails ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6 px-1">
        <PageHeader
          breadcrumbs={[
            { label: 'Data Pengeluaran Perlengkapan', onClick: () => router.push(`/dashboard/${slug}/warehouse/pengeluaran-perlengkapan`) },
            { label: 'Detail' }
          ]}
          title="Detail Pengeluaran Perlengkapan"
          onBack={() => router.push(`/dashboard/${slug}/warehouse/pengeluaran-perlengkapan`)}
        />

        <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-none">
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-[18px] font-semibold text-slate-900">Informasi Pengeluaran</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500">Kode Pengeluaran</span>
                <p className="text-[16px] font-semibold text-slate-900">{transaction.code}</p>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500">Tanggal Pengeluaran</span>
                <p className="text-[16px] font-medium text-slate-900">{formatLongDate(transaction.transactionDate)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500">Driver</span>
                <p className="text-[16px] font-medium text-slate-900">{transaction.driver?.name || '-'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500">Nomor Polisi</span>
                <p className="text-[16px] font-medium text-slate-900">{transaction.vehicleFleet?.registrationNumber || '-'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500">Kategori</span>
                <p className="text-[16px] font-medium text-slate-900">{getCategoryLabel(transaction.category)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500">Total Perlengkapan</span>
                <p className="text-[16px] font-medium text-slate-900">{items.length} Item</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-medium text-slate-500">Keterangan</span>
              <p className="text-[16px] text-slate-800 bg-slate-50/50 rounded-md p-3 border border-slate-100 min-h-16">
                {transaction.description || '-'}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-sm font-medium text-slate-500 block">Nota / Invoice</span>
              {transaction.invoiceFile ? (
                <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-md p-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <p className="text-[14px] font-semibold text-slate-800">File Invoice Tersedia</p>
                    <a
                      href={transaction.invoiceFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] text-blue-600 hover:underline mt-0.5 font-medium"
                    >
                      <Download className="h-3.5 w-3.5" /> Download / Lihat File
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-[15px] text-slate-500 italic">Belum ada nota yang diupload.</p>
              )}
            </div>
          </div>
        </Card>

        {/* Detail Items Card */}
        <div className="space-y-3">
          <h3 className="text-[18px] font-semibold text-slate-900 px-1">Daftar Perlengkapan Keluar</h3>
          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-none">
            <Table>
              <TableHeader className="bg-slate-100/90">
                <TableRow className="border-slate-200 hover:bg-transparent">
                  <TableHead className="w-[56px] px-5 py-4 text-center text-[14px] font-semibold uppercase text-slate-950">NO</TableHead>
                  <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">KODE BARANG</TableHead>
                  <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">NAMA BARANG</TableHead>
                  <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">QTY</TableHead>
                  <TableHead className="px-5 py-4 text-[14px] font-semibold uppercase text-slate-950">KETERANGAN</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-slate-500">
                      Belum ada perlengkapan yang dimasukkan.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => (
                    <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50/70">
                      <TableCell className="px-5 py-4 text-center text-[14px] text-slate-800">{index + 1}</TableCell>
                      <TableCell className="px-5 py-4 text-[14px] text-slate-800">{item.vehicleEquipment?.code || '-'}</TableCell>
                      <TableCell className="px-5 py-4 text-[14px] text-slate-800">{item.vehicleEquipment?.name || '-'}</TableCell>
                      <TableCell className="px-5 py-4 text-[14px] font-semibold text-slate-900">{item.qty}</TableCell>
                      <TableCell className="px-5 py-4 text-[14px] text-slate-800">{item.description || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
