import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Printer, Download, Eye, ChevronsUpDown, Check } from 'lucide-react';
import { getSuppliers, getUnitTypes } from '@/services/laporan-penerimaan.service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface LaporanPenerimaanFilterProps {
  activeTab: string;
  startDate: string | null;
  endDate: string | null;
  onApplyFilters: (filters: {
    startDate: string | null;
    endDate: string | null;
    supplierId: number | null;
    unitTypeId: number | null;
    perPage: number;
  }) => void;
  onPrint: () => void;
  onDownload?: () => void;
}

interface OptionItem {
  id: number;
  name: string;
}

export default function LaporanPenerimaanFilter({
  activeTab,
  startDate,
  endDate,
  onApplyFilters,
  onPrint,
  onDownload,
}: LaporanPenerimaanFilterProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (startDate && endDate) return { from: new Date(startDate), to: new Date(endDate) };
    if (startDate) return { from: new Date(startDate), to: undefined };
    return undefined;
  });
  const [suppliers, setSuppliers] = useState<OptionItem[]>([]);
  const [unitTypes, setUnitTypes] = useState<OptionItem[]>([]);
  const [openBox, setOpenBox] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTermInside, setSearchTermInside] = useState('');
  const [perPage, setPerPage] = useState('50');

  useEffect(() => {
    if (!startDate && !endDate) {
      setDateRange(undefined);
    } else if (startDate && endDate && (!dateRange?.from || !dateRange?.to)) {
      setDateRange({ from: new Date(startDate), to: new Date(endDate) });
    }
  }, [startDate, endDate, dateRange?.from, dateRange?.to]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getSuppliers();
        setSuppliers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setSuppliers([]);
      }
    };

    const fetchUnitTypes = async () => {
      try {
        const data = await getUnitTypes();
        setUnitTypes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setUnitTypes([]);
      }
    };

    if (activeTab === 'per-supplier') {
      fetchSuppliers();
    } else if (activeTab === 'per-tipe') {
      fetchUnitTypes();
    }
  }, [activeTab]);

  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  useEffect(() => {
    if (!openBox) setSearchTermInside('');
  }, [openBox]);

  const currentOptions = activeTab === 'per-supplier' ? suppliers : unitTypes;

  const filteredOptions = currentOptions.filter((option) =>
    option.name?.toLowerCase().includes(searchTermInside.toLowerCase())
  );

  const handleApplyFilter = () => {
    const appliedStartDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
    const appliedEndDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : appliedStartDate;

    let supplierId: number | null = null;
    let unitTypeId: number | null = null;

    if (activeTab === 'per-supplier') {
      const matchedSupplier = suppliers.find(
        (supplier) => supplier.name?.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      supplierId = matchedSupplier ? matchedSupplier.id : null;
    }

    if (activeTab === 'per-tipe') {
      const matchedType = unitTypes.find(
        (unitType) => unitType.name?.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      unitTypeId = matchedType ? matchedType.id : null;
    }

    onApplyFilters({
      startDate: appliedStartDate,
      endDate: appliedEndDate,
      supplierId,
      unitTypeId,
      perPage: parseInt(perPage, 10),
    });
  };

  return (
    <div className="flex items-end justify-between w-full no-print gap-4">
      <div className="flex items-end gap-6 flex-wrap">
        <div className="flex flex-col space-y-2">
          <label className="text-[13px] font-bold text-gray-900">Periode Transaksi</label>
          <div className="w-[280px]">
            <DatePickerWithRange date={dateRange} onChange={setDateRange} />
          </div>
        </div>

        {activeTab !== 'per-nota' && (
          <div className="flex flex-col space-y-2">
            <label className="text-[13px] font-bold text-gray-900">
              {activeTab === 'per-tipe' ? 'Masukkan Tipe ' : 'Masukkan Supplier '}
              <span className="text-red-500">*</span>
            </label>

            <Popover open={openBox} onOpenChange={setOpenBox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openBox}
                  className="w-[260px] justify-between text-left font-normal bg-white"
                >
                  <span className="truncate">
                    {searchQuery
                      ? currentOptions.find((option) => option.name === searchQuery)?.name || searchQuery
                      : activeTab === 'per-tipe'
                        ? 'Pilih atau cari tipe...'
                        : 'Pilih atau cari supplier...'}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] p-0" align="start">
                <div className="flex flex-col w-full">
                  <div className="p-2 border-b">
                    <Input
                      placeholder="Ketik untuk mencari..."
                      value={searchTermInside}
                      onChange={(event) => setSearchTermInside(event.target.value)}
                      className="h-8 shadow-none focus-visible:ring-0"
                    />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto p-1">
                    {filteredOptions.length === 0 && (
                      <div className="p-4 text-center text-sm text-gray-500">Data tidak ditemukan.</div>
                    )}
                    {filteredOptions.map((option) => (
                      <Button
                        key={option.id}
                        variant="ghost"
                        className="w-full justify-start rounded-sm font-normal py-1.5 px-2 h-auto text-sm"
                        onClick={() => {
                          setSearchQuery(option.name);
                          setOpenBox(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            searchQuery === option.name ? 'opacity-100 text-blue-600' : 'opacity-0'
                          )}
                        />
                        <span className="truncate">{option.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <label className="text-[13px] font-bold text-gray-900">Per Halaman</label>
          <Select value={perPage} onValueChange={setPerPage}>
            <SelectTrigger className="w-[130px] bg-white">
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

        <Button
          variant="outline"
          onClick={handleApplyFilter}
          className="bg-[#f8f9fa] shadow-sm text-gray-700 gap-2 px-4 whitespace-nowrap mb-[1px]"
        >
          <Eye className="h-4 w-4" />
          Show
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onPrint}
          className="gap-2 px-4 bg-white text-gray-700 shadow-sm border-gray-200"
        >
          <Printer className="h-4 w-4" /> Print
        </Button>
        <Button
          onClick={onDownload}
          className="gap-2 px-4 shadow-sm bg-[#16a34a] hover:bg-[#15803d] text-white border-0"
        >
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>
    </div>
  );
}
