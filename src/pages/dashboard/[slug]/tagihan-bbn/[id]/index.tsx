import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Pencil, Plus, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCompany } from '@/contexts/CompanyContext';
import { useKas } from '@/hooks/useKas';
import {
  useBBNBillBillingItems,
  useBBNBillBillings,
  useBBNBillDetail,
  useDeleteBBNBillBillingItem,
} from '@/hooks/useBBNBill';
import {
  calculateOutstanding,
  formatBillCode,
  formatCurrency,
  formatShortDate,
  getCashLabel,
} from '@/components/features/tagihan-bbn/utils';

function ReadonlyField({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-900">{label}</p>
      <Input value={value} readOnly className={`h-11 rounded-xl border-slate-200 bg-white ${danger ? 'text-red-500' : 'text-slate-500'}`} />
    </div>
  );
}

export default function BBNBillDetailPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const id = typeof router.query.id === 'string' ? router.query.id : null;
  const shouldPrint = router.query.print === '1';
  const { companyId } = useCompany();
  const safeCompanyId = companyId || '1';

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(25);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim().toLowerCase());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const detailQuery = useBBNBillDetail(id);
  const billingsQuery = useBBNBillBillings({ page: 1, perPage: 1000 });
  const billingItemsQuery = useBBNBillBillingItems({ page: 1, perPage: 1000 });
  const kasQuery = useKas(safeCompanyId);
  const deleteBillingItemMutation = useDeleteBBNBillBillingItem();

  const cashLabelMap = React.useMemo(() => {
    const map = new Map<number, string>();
    (kasQuery.data?.data ?? []).forEach((cash) => {
      map.set(Number(cash.id), getCashLabel(cash));
    });
    return map;
  }, [kasQuery.data?.data]);

  const billings = React.useMemo(() => {
    const currentId = Number(id || 0);
    const fromList = (billingsQuery.data?.data ?? []).filter((item) => item.bbnBillId === currentId);
    if (fromList.length > 0) return fromList;

    return (detailQuery.data?.billings ?? []).map((item) => ({
      id: item.id,
      uuid: item.uuid,
      bbnBillId: item.bbnBillId,
      totalPayment: item.totalPayment,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      bbnBill: null,
    }));
  }, [billingsQuery.data?.data, detailQuery.data?.billings, id]);

  const billingIds = React.useMemo(() => new Set(billings.map((item) => item.id)), [billings]);

  const paymentItems = React.useMemo(() => {
    return (billingItemsQuery.data?.data ?? [])
      .filter((item) => billingIds.has(item.bbnBillBillingId))
      .map((item) => ({
        ...item,
        cashLabel: item.cashLabel || (item.cashId ? cashLabelMap.get(item.cashId) : undefined) || 'Cash',
      }));
  }, [billingIds, billingItemsQuery.data?.data, cashLabelMap]);

  const vehicles = React.useMemo(() => detailQuery.data?.dealerDetail?.vehicleDatas ?? [], [detailQuery.data?.dealerDetail?.vehicleDatas]);
  const filteredVehicles = React.useMemo(() => {
    if (!search) return vehicles;

    return vehicles.filter((vehicle) => {
      const registration = vehicle.vehicleRegistration;
      return [
        detailQuery.data?.dealer?.name || '',
        vehicle.stnkName || '',
        vehicle.machineNumber || '',
        vehicle.chassisNumber || '',
        registration?.tnkbNumber || '',
        vehicle.invoiceNumber || '',
      ].some((field) => field.toLowerCase().includes(search));
    });
  }, [detailQuery.data?.dealer?.name, search, vehicles]);

  const pagedVehicles = React.useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredVehicles.slice(start, start + perPage);
  }, [filteredVehicles, page, perPage]);

  const aggregatedFees = React.useMemo(() => {
    return vehicles.reduce(
      (acc, vehicle) => {
        const registration = vehicle.vehicleRegistration;
        acc.bbn += registration?.bbnRegistrationFee || 0;
        acc.garwil += registration?.garwilFee || 0;
        acc.nik += registration?.nikValidationFee || 0;
        acc.acceleration += registration?.accelerationFee || 0;
        acc.stamp += registration?.stampFee || 0;
        acc.pnbp += registration?.pnbpBpkb || 0;
        acc.skpd += registration?.skpdFee || 0;
        return acc;
      },
      { bbn: 0, garwil: 0, nik: 0, acceleration: 0, stamp: 0, pnbp: 0, skpd: 0 },
    );
  }, [vehicles]);

  React.useEffect(() => {
    if (!shouldPrint || !detailQuery.data) return;
    const timeout = window.setTimeout(() => {
      window.print();
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [detailQuery.data, shouldPrint]);

  return (
    <DashboardLayout>
      {detailQuery.isLoading ? (
        <div className="flex h-[360px] items-center justify-center text-slate-500">Memuat detail tagihan BBN...</div>
      ) : detailQuery.isError || !detailQuery.data ? (
        <div className="flex h-[360px] flex-col items-center justify-center gap-3 text-center">
          <p className="text-red-500">Detail tagihan BBN tidak ditemukan.</p>
          <button onClick={() => router.back()} className="text-sm text-blue-600 underline">Kembali</button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[36px] font-semibold tracking-[-0.03em] text-slate-950">Detail Tagihan</h1>
              <p className="mt-1 text-base text-slate-500">Kelola data tagihan STNK &amp; BPKB</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/dashboard/${slug}/tagihan-bbn/${detailQuery.data.id}/edit`}>
                <Button variant="outline" className="h-11 rounded-xl border-slate-200 bg-white">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button onClick={() => window.print()} className="h-11 rounded-xl bg-[#1f4163] hover:bg-[#183552]">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>

          <Card className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <ReadonlyField label="Dealer" value={detailQuery.data.dealer?.name || '-'} />
              <ReadonlyField label="Nomor Tagihan" value={formatBillCode(detailQuery.data.id)} />
              <ReadonlyField label="Tanggal Penagihan" value={formatShortDate(detailQuery.data.billDate)} />
              <ReadonlyField label="Tanggal Bayar" value={formatShortDate(detailQuery.data.paidDate)} />
              <ReadonlyField label="Jumlah Tagihan" value={formatCurrency(detailQuery.data.bruttoAmount)} />
              <ReadonlyField label="PPH 23=2%" value={formatCurrency(0)} />
              <ReadonlyField label="Grand Total (Jumlah Tagihan & PPH)" value={formatCurrency(detailQuery.data.bruttoAmount)} />
              <ReadonlyField label="Terbayar" value={formatCurrency(detailQuery.data.paidAmount)} />
              <ReadonlyField label="Kurang Bayar" value={formatCurrency(calculateOutstanding(detailQuery.data.bruttoAmount, detailQuery.data.paidAmount))} danger />
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  placeholder="Search here"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="h-11 w-full rounded-xl border-slate-200 bg-white sm:w-[258px]"
                />
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-700">Show</span>
                  <select
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    value={perPage}
                    onChange={(event) => {
                      setPerPage(Number(event.target.value));
                      setPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-slate-700">Page</span>
                </div>
              </div>

              <Link href={`/dashboard/${slug}/tagihan-bbn/${detailQuery.data.id}/pembayaran`}>
                <Button className="h-11 rounded-xl bg-[#1f4163] hover:bg-[#183552]">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Pembayaran
                </Button>
              </Link>
            </div>

            <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#edf2f7]">
                    <TableRow className="border-slate-200">
                      <TableHead className="px-4 py-4 text-center text-sm font-semibold text-slate-900">NAMA DEALER</TableHead>
                      <TableHead className="px-4 py-4 text-center text-sm font-semibold text-slate-900">NAMA STNK</TableHead>
                      <TableHead className="px-4 py-4 text-center text-sm font-semibold text-slate-900">NOMOR POLISI</TableHead>
                      <TableHead className="px-4 py-4 text-center text-sm font-semibold text-slate-900">NOMOR RANGKA</TableHead>
                      <TableHead className="px-4 py-4 text-center text-sm font-semibold text-slate-900">NOMOR MESIN</TableHead>
                      <TableHead className="px-4 py-4 text-center text-sm font-semibold text-slate-900">DAFTAR BBN</TableHead>
                      <TableHead className="px-4 py-4 text-center text-sm font-semibold text-slate-900">ACC GARWIL</TableHead>
                      <TableHead className="px-4 py-4 text-center text-sm font-semibold text-slate-900">ACC NIK</TableHead>
                      <TableHead className="px-4 py-4 text-center text-sm font-semibold text-slate-900">PERCEPATAN</TableHead>
                      <TableHead className="px-4 py-4 text-center text-sm font-semibold text-slate-900">ACTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id} className="border-slate-100">
                        <TableCell className="px-4 py-3 text-center text-sm uppercase text-slate-700">{detailQuery.data?.dealer?.name || '-'}</TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{vehicle.stnkName || '-'}</TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{vehicle.vehicleRegistration?.tnkbNumber || '-'}</TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{vehicle.chassisNumber || '-'}</TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{vehicle.machineNumber || '-'}</TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{formatCurrency(vehicle.vehicleRegistration?.bbnRegistrationFee || 0)}</TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{formatCurrency(vehicle.vehicleRegistration?.garwilFee || 0)}</TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{formatCurrency(vehicle.vehicleRegistration?.nikValidationFee || 0)}</TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm text-slate-700">{formatCurrency(vehicle.vehicleRegistration?.accelerationFee || 0)}</TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          <Link href={`/dashboard/${slug}/tagihan-bbn/${detailQuery.data.id}/kendaraan/${vehicle.id}/edit`} className="text-sm font-medium text-[#1f4163] hover:underline">
                            Edit
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pagedVehicles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="h-24 text-center text-sm text-slate-500">
                          Tidak ada detail kendaraan pada tagihan ini.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <div className="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">Showing {filteredVehicles.length === 0 ? 0 : (page - 1) * perPage + 1}-{Math.min(page * perPage, filteredVehicles.length)} of {filteredVehicles.length} data</p>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <button disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>Previous</button>
                <span>{page}</span>
                <button disabled={page >= Math.max(1, Math.ceil(filteredVehicles.length / perPage))} onClick={() => setPage((current) => current + 1)}>Next</button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[32px] font-semibold tracking-[-0.03em] text-slate-950">History Pembayaran</h2>
                <p className="mt-1 text-sm text-slate-500">Rincian pembayaran tagihan yang telah dibuat</p>
              </div>
            </div>

            <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#eef9ee]">
                    <TableRow className="border-slate-200">
                      <TableHead className="px-4 py-4 text-sm font-semibold text-slate-900">Tanggal</TableHead>
                      <TableHead className="px-4 py-4 text-sm font-semibold text-slate-900">Bukti Pembayaran</TableHead>
                      <TableHead className="px-4 py-4 text-sm font-semibold text-slate-900">Nominal Pembayaran Cash BCA</TableHead>
                      <TableHead className="px-4 py-4 text-sm font-semibold text-slate-900">Nominal Pembayaran USD BCA</TableHead>
                      <TableHead className="px-4 py-4 text-sm font-semibold text-slate-900">Nominal Pembayaran Cash</TableHead>
                      <TableHead className="px-4 py-4 text-sm font-semibold text-slate-900">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentItems.map((item) => {
                      const label = item.cashLabel || 'Cash';
                      return (
                        <TableRow key={item.id} className="border-slate-100">
                          <TableCell className="px-4 py-3 text-sm text-slate-700">{formatShortDate(item.paidDate)}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-slate-700">-</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-slate-700">{label === 'BCA IDR' ? formatCurrency(item.amount) : 'Rp'}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-slate-700">{label === 'BCA USD' ? formatCurrency(item.amount) : 'Rp'}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-slate-700">{label === 'CASH IDR' || label === 'Cash' ? formatCurrency(item.amount) : 'Rp'}</TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Link href={`/dashboard/${slug}/tagihan-bbn/${detailQuery.data.id}/pembayaran?itemId=${item.id}`} className="text-sm font-medium text-[#1f4163] hover:underline">
                                Edit
                              </Link>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await deleteBillingItemMutation.mutateAsync(item.id);
                                    toast.success('Item pembayaran berhasil dihapus');
                                  } catch (error: any) {
                                    toast.error(error.message || 'Gagal menghapus item pembayaran');
                                  }
                                }}
                                className="text-sm font-medium text-red-600"
                              >
                                Hapus
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {paymentItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-20 text-center text-sm text-slate-500">
                          Belum ada riwayat pembayaran untuk tagihan ini.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          <Card className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Ringkasan Biaya Kendaraan</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ReadonlyField label="Daftar BBN" value={formatCurrency(aggregatedFees.bbn)} />
              <ReadonlyField label="Acc Garwil" value={formatCurrency(aggregatedFees.garwil)} />
              <ReadonlyField label="Acc NIK" value={formatCurrency(aggregatedFees.nik)} />
              <ReadonlyField label="Percepatan" value={formatCurrency(aggregatedFees.acceleration)} />
              <ReadonlyField label="Materai" value={formatCurrency(aggregatedFees.stamp)} />
              <ReadonlyField label="PNBP BPKB" value={formatCurrency(aggregatedFees.pnbp)} />
              <ReadonlyField label="Notice SKPD" value={formatCurrency(aggregatedFees.skpd)} />
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
