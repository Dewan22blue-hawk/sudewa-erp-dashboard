import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Printer, Download, Eye, ChevronsUpDown, Check } from 'lucide-react';
import { getSuppliers, getUnitTypes } from '@/services/laporan-pembelian.service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface LaporanPembelianFilterProps {
  activeTab: string;
  startDate: string | null;
  endDate: string | null;
  onApplyFilters: (filters: {
    startDate: string | null;
    endDate: string | null;
    supplierId: number | null;
    search: string;
  }) => void;
  onPrint: () => void;
  onDownload?: () => void;
}

export default function LaporanPembelianFilter({
  activeTab,
  startDate,
  endDate,
  onApplyFilters,
  onPrint,
  onDownload,
}: LaporanPembelianFilterProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (startDate && endDate) return { from: new Date(startDate), to: new Date(endDate) };
    if (startDate) return { from: new Date(startDate), to: undefined };
    return undefined;
  });

  useEffect(() => {
    if (!startDate && !endDate) {
      setDateRange(undefined);
    } else if (startDate && endDate && (!dateRange?.from || !dateRange?.to)) {
      setDateRange({ from: new Date(startDate), to: new Date(endDate) });
    }
  }, [startDate, endDate]);
  const [suppliers, setSuppliers] = useState<Array<{ id: number; name: string }>>([]);
  const [unitTypes, setUnitTypes] = useState<Array<{ id: number; name: string }>>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Combobox local state
  const [openBox, setOpenBox] = useState(false);
  const [searchTermInside, setSearchTermInside] = useState('');

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getSuppliers();
        setSuppliers(Array.isArray(data) ? data : (data?.data || []));
      } catch (e) {
        console.error(e);
      }
    };
    const fetchUnitTypes = async () => {
      try {
        const data = await getUnitTypes();
        setUnitTypes(Array.isArray(data) ? data : (data?.data || []));
      } catch (e) {
        console.error(e);
      }
    };

    if (activeTab === 'per-supplier') {
      fetchSuppliers();
    } else if (activeTab === 'per-tipe') {
      fetchUnitTypes();
    }
  }, [activeTab]);

  // Handle clear local inputs when tab changes
  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  // Clear inner search term when popover closes
  useEffect(() => {
    if (!openBox) setSearchTermInside('');
  }, [openBox]);

  const rawOptions = activeTab === 'per-supplier' ? suppliers : unitTypes;
  const currentOptions = Array.isArray(rawOptions) ? rawOptions : [];

  const handleApplyFilter = () => {
    const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
    const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : startDate;

    let supplierId: number | null = null;
    let search = '';

    if (activeTab === 'per-supplier') {
      const matchedSupplier = currentOptions.find(s => s.name?.toLowerCase() === searchQuery.trim().toLowerCase());
      if (matchedSupplier) {
        supplierId = matchedSupplier.id;
      } else {
        search = searchQuery.trim();
      }
    } else if (activeTab === 'per-tipe') {
      search = searchQuery.trim();
    }

    onApplyFilters({
      startDate,
      endDate,
      supplierId,
      search,
    });
  };

  const filteredOptions = currentOptions.filter(opt =>
    opt?.name?.toLowerCase().includes(searchTermInside.toLowerCase())
  );

  return (
    <div className="flex items-end justify-between w-full">
      <div className="flex items-end gap-6">
        
        {/* Periode Transaksi */}
        <div className="flex flex-col space-y-2">
          <label className="text-[13px] font-bold text-gray-900">Periode Transaksi</label>
          <div className="w-[280px]">
            <DatePickerWithRange date={dateRange} onChange={setDateRange} />
          </div>
        </div>

        {/* Dynamic Searchable Select Field (Hidden for 'per-nota') */}
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
                  className="w-[250px] justify-between text-left font-normal bg-white"
                >
                  <span className="truncate">
                    {searchQuery 
                      ? (currentOptions.find(o => o.name === searchQuery)?.name || searchQuery) 
                      : (activeTab === 'per-tipe' ? 'Pilih atau cari tipe...' : 'Pilih atau cari supplier...')}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0" align="start">
                <div className="flex flex-col w-full">
                  <div className="p-2 border-b">
                     <Input 
                        placeholder="Ketik untuk mencari..." 
                        value={searchTermInside}
                        onChange={e => setSearchTermInside(e.target.value)}
                        className="h-8 shadow-none focus-visible:ring-0"
                     />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto p-1">
                    {filteredOptions.length === 0 && (
                       <div className="p-4 text-center text-sm text-gray-500">
                          Data tidak ditemukan.
                       </div>
                    )}
                    {filteredOptions.map(opt => (
                      <Button
                        key={opt.id}
                        variant="ghost"
                        className="w-full justify-start rounded-sm font-normal py-1.5 px-2 h-auto text-sm"
                        onClick={() => {
                          setSearchQuery(opt.name);
                          setOpenBox(false);
                        }}
                      >
                        <Check 
                           className={cn(
                             "mr-2 h-4 w-4",
                             searchQuery === opt.name ? "opacity-100 text-blue-600" : "opacity-0"
                           )} 
                        />
                        <span className="truncate">{opt.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Tombol Show (Dipindah ke paling kanan filter group) */}
        <Button 
          variant="outline" 
          onClick={handleApplyFilter} 
          className="bg-[#f8f9fa] shadow-sm text-gray-700 gap-2 px-4 whitespace-nowrap mb-[1px]"
        >
          <Eye className="h-4 w-4" />
          Show
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onPrint} className="gap-2 px-4 bg-white text-gray-700 shadow-sm border-gray-200">
          <Printer className="h-4 w-4" /> Print
        </Button>
        <Button onClick={onDownload} className="gap-2 px-4 shadow-sm bg-[#16a34a] hover:bg-[#15803d] text-white border-0">
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>
    </div>
  );
}
