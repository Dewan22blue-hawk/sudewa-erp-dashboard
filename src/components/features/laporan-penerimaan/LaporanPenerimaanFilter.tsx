import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Search, Printer, Download, RefreshCw } from 'lucide-react';
import { getSuppliers, getUnitTypes } from '@/services/laporan-penerimaan.service';

interface LaporanPenerimaanFilterProps {
  onDateRangeChange: (start: string | null, end: string | null) => void;
  onSupplierChange: (supplierId: number | null) => void;
  onUnitTypeChange: (unitTypeId: number | null) => void;
  onPerPageChange: (perPage: number) => void;
  activeTab: string;
  onPrint: () => void;
  onDownload: () => void;
}

interface Supplier {
  id: number;
  name: string;
}

interface UnitType {
  id: number;
  name: string;
}

export default function LaporanPenerimaanFilter({
  onDateRangeChange,
  onSupplierChange,
  onUnitTypeChange,
  onPerPageChange,
  activeTab,
  onPrint,
  onDownload,
}: LaporanPenerimaanFilterProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedUnitType, setSelectedUnitType] = useState<string>('all');
  const [perPage, setPerPage] = useState('10');
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingSuppliers(true);
        const suppliersData = await getSuppliers();
        setSuppliers(suppliersData);
      } catch (err) {
        console.error('Error fetching suppliers:', err);
      } finally {
        setLoadingSuppliers(false);
      }

      try {
        setLoadingTypes(true);
        const typesData = await getUnitTypes();
        setUnitTypes(typesData);
      } catch (err) {
        console.error('Error fetching unit types:', err);
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchData();
  }, []);

  const handleApplyFilter = () => {
    const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
    const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null;
    onDateRangeChange(startDate, endDate);
    onSupplierChange(selectedSupplier === 'all' ? null : parseInt(selectedSupplier));
    onUnitTypeChange(selectedUnitType === 'all' ? null : parseInt(selectedUnitType));
    onPerPageChange(parseInt(perPage));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Periode Penerimaan</label>
          <DatePickerWithRange date={dateRange} onChange={setDateRange} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Supplier</label>
          <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
            <SelectTrigger disabled={loadingSuppliers}>
              <SelectValue placeholder="Semua Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Supplier</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={String(supplier.id)}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {activeTab === 'per-tipe' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tipe Unit</label>
            <Select value={selectedUnitType} onValueChange={setSelectedUnitType}>
              <SelectTrigger disabled={loadingTypes}>
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                {unitTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tampilkan per halaman</label>
          <Select value={perPage} onValueChange={setPerPage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 data</SelectItem>
              <SelectItem value="25">25 data</SelectItem>
              <SelectItem value="50">50 data</SelectItem>
              <SelectItem value="100">100 data</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 flex-wrap">
        <Button onClick={handleApplyFilter} className="gap-2">
          <Search className="h-4 w-4" />
          Tampilkan
        </Button>
        <Button variant="outline" size="icon" onClick={() => window.location.reload()} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onPrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={onDownload}>
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}
