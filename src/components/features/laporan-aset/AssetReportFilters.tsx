import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Printer, Download, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AssetReportFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  perPage: string;
  setPerPage: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onPrint: () => void;
  onDownload: () => void;
}

export default function AssetReportFilters({
  dateRange,
  setDateRange,
  perPage,
  setPerPage,
  searchQuery,
  setSearchQuery,
  onPrint,
  onDownload
}: AssetReportFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-4">
      <div className="flex flex-col md:flex-row items-start md:items-end gap-4 w-full md:w-auto">
        
        {/* Periode Transaksi */}
        <div className="flex flex-col space-y-2 w-full md:w-auto">
          <label className="text-[13px] font-bold text-gray-900">Periode Transaksi</label>
          <div className="w-full md:w-[280px]">
            <DatePickerWithRange 
              date={dateRange} 
              onChange={setDateRange} 
              className="h-10 rounded-xl border-gray-200"
            />
          </div>
        </div>

        {/* Per Halaman */}
        <div className="flex flex-col space-y-2 w-full md:w-auto">
          <label className="text-[13px] font-bold text-gray-900">Per Halaman</label>
          <Select value={perPage} onValueChange={setPerPage}>
            <SelectTrigger className="w-full md:w-[80px] h-10 rounded-xl border-gray-200 bg-white">
              <SelectValue placeholder="25" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="flex flex-col space-y-2 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search here" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl border-gray-200 bg-white w-full md:w-[250px]"
            />
          </div>
        </div>
        
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
        <Button onClick={onPrint} variant="outline" className="w-full sm:w-auto">
          <Printer className="h-4 w-4" /> Print
        </Button>
        <Button onClick={onDownload} variant="outline" className="w-full sm:w-auto">
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>
    </div>
  );
}
