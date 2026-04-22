import * as React from 'react';
import { useRouter } from 'next/router';
import { Printer, Save } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/features/vehicle-data/SearchableSelect';
import { VehicleDocumentDetailTable } from '@/components/features/vehicle-document/VehicleDocumentDetailTable';
import { useDealers } from '@/hooks/useDealer';
import { useRegions } from '@/hooks/useRegion';
import { useVendorLookup } from '@/hooks/useVehicleData';
import { useUpdateVehicleDocument, useVehicleDocumentDetail } from '@/hooks/useVehicleDocument';
import type { VehicleDocumentItem, VehicleDocumentPayload } from '@/@types/vehicle-document.types';

const toDateValue = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const toPayloadDate = (value?: Date) => {
  if (!value) return '';
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function EditVehicleDocumentPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const id = typeof router.query.id === 'string' ? router.query.id : null;

  const detailQuery = useVehicleDocumentDetail(id);
  const updateMutation = useUpdateVehicleDocument();

  const [vendorSearch, setVendorSearch] = React.useState('');
  const vendorLookup = useVendorLookup(vendorSearch);
  const dealersQuery = useDealers(null, { page: 1, perPage: 10, sort_order: 'asc' });
  const regionsQuery = useRegions({ page: 1, perPage: 10, sort_order: 'asc' });

  const [vendorId, setVendorId] = React.useState('');
  const [receiptDate, setReceiptDate] = React.useState<Date | undefined>();
  const [description, setDescription] = React.useState('');
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

  React.useEffect(() => {
    if (!detailQuery.data) return;
    setVendorId(String(detailQuery.data.vendorId || ''));
    setReceiptDate(toDateValue(detailQuery.data.receiptDate));
    setDescription(detailQuery.data.description || '');
  }, [detailQuery.data]);

  const vendorOptions = (vendorLookup.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.label,
    subtitle: item.vendor.code || item.vendor.phone || undefined,
  }));

  const dealerMap = React.useMemo(
    () =>
      new Map(
        (dealersQuery.data?.data ?? []).map((dealer) => [Number(dealer.id), dealer.namaDealer || dealer.code || `Dealer ID ${dealer.id}`]),
      ),
    [dealersQuery.data?.data],
  );

  const regionMap = React.useMemo(
    () =>
      new Map(
        (regionsQuery.data?.data ?? []).map((region) => [Number(region.id), region.name || region.code || `Wilayah ID ${region.id}`]),
      ),
    [regionsQuery.data?.data],
  );

  const enrichedItems = React.useMemo<VehicleDocumentItem[]>(() => {
    const items = detailQuery.data?.vehicleDocumentItems ?? [];
    return items.map((item) => ({
      ...item,
      dealerName: item.dealerId != null ? dealerMap.get(Number(item.dealerId)) || item.dealerName : item.dealerName,
      regionName: item.regionId != null ? regionMap.get(Number(item.regionId)) || item.regionName : item.regionName,
    }));
  }, [dealerMap, detailQuery.data?.vehicleDocumentItems, regionMap]);

  const filteredItems = React.useMemo(() => {
    const items = enrichedItems;
    if (!search) return items;
    return items.filter((item) => [item.dealerName, item.stnkName, item.regionName, item.machineNumber, item.tnkbNumber, item.vendorEmployee].some((field) => field.toLowerCase().includes(search)));
  }, [enrichedItems, search]);

  const pagedItems = React.useMemo<VehicleDocumentItem[]>(() => {
    const start = (page - 1) * perPage;
    return filteredItems.slice(start, start + perPage);
  }, [filteredItems, page, perPage]);

  const handleSaveHeader = async () => {
    if (!id) return;
    const payload: VehicleDocumentPayload = {
      vendorId: Number(vendorId),
      receiptDate: toPayloadDate(receiptDate),
      description: description.trim(),
    };

    try {
      await updateMutation.mutateAsync({ id, payload });
      toast.success('Header data penerimaan berhasil disimpan');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan data penerimaan');
    }
  };

  return (
    <DashboardLayout>
      {detailQuery.isLoading ? (
        <div className="flex h-[360px] items-center justify-center text-slate-500">Memuat data penerimaan...</div>
      ) : detailQuery.isError || !detailQuery.data ? (
        <div className="flex h-[360px] flex-col items-center justify-center gap-3 text-center">
          <p className="text-red-500">Data penerimaan tidak ditemukan.</p>
          <button onClick={() => router.back()} className="text-sm text-blue-600 underline">Kembali</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Data Penerimaan</h1>
              <p className="mt-1 text-sm text-slate-500">Kelola data penerimaan BPKP/STNK dengan mudah</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveHeader} disabled={updateMutation.isPending} className="bg-white">
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button onClick={() => window.print()} className="bg-[#1f3b5b] hover:bg-[#18304a]">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>

          <Card className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800">No Penerimaan</Label>
                <Input value={detailQuery.data.code} readOnly className="h-11 rounded-xl border-slate-200 bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800">Vendor</Label>
                <SearchableSelect
                  value={vendorId}
                  onChange={setVendorId}
                  options={vendorOptions}
                  loading={vendorLookup.isLoading}
                  onSearchChange={setVendorSearch}
                  placeholder="Pilih vendor"
                  searchPlaceholder="Cari vendor..."
                  emptyText="Vendor tidak ditemukan."
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800">Tanggal Terima</Label>
                <DatePicker value={receiptDate} onChange={setReceiptDate} placeholder="Pick a date" className="h-11 rounded-xl bg-white" />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <Label className="text-sm font-semibold text-slate-800">Keterangan</Label>
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Type your message here." className="rounded-2xl border-slate-200 bg-white" />
            </div>
          </Card>

          <VehicleDocumentDetailTable
            items={pagedItems}
            search={searchInput}
            page={page}
            perPage={perPage}
            totalData={filteredItems.length}
            onSearchChange={setSearchInput}
            onPageChange={setPage}
            onPerPageChange={(value) => {
              setPerPage(value);
              setPage(1);
            }}
            onEdit={(item) => {
              const registrationId = item.registrationId || item.id;
              router.push(`/dashboard/${slug}/stnk-bpkb/${detailQuery.data?.id}/registration/${registrationId}/edit`);
            }}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
