import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PenerimaanItem } from '@/services/laporan-penerimaan.service';

interface Props {
  data: PenerimaanItem[];
  isLoading: boolean;
}

export default function LaporanPenerimaanPerTipe({
  data,
  isLoading,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white rounded-xl border">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Aggregate data by unit type and color
  const aggregatedData = new Map<string, Map<string, number>>();
  data.forEach((item) => {
    const typeName = item.unit_type.name;
    if (!aggregatedData.has(typeName)) {
      aggregatedData.set(typeName, new Map());
    }
    const colorMap = aggregatedData.get(typeName)!;
    const colorKey = item.color || 'Tidak Ada Warna';
    colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
  });

  if (aggregatedData.size === 0) {
    return (
      <div className="flex justify-center items-center py-20 bg-white rounded-xl border">
        <p className="text-gray-500">Tidak ada data penerimaan</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="text-center w-12">NO</TableHead>
              <TableHead>TIPE UNIT</TableHead>
              <TableHead>WARNA</TableHead>
              <TableHead className="text-right">QTY</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from(aggregatedData.entries()).map((typeEntry, typeIdx) => {
              const [typeName, colorMap] = typeEntry;
              return Array.from(colorMap.entries()).map((colorEntry, colorIdx) => {
                const [color, qty] = colorEntry;
                return (
                  <TableRow key={`${typeName}-${color}`}>
                    <TableCell className="text-center">
                      {typeIdx + colorIdx + 1}
                    </TableCell>
                    <TableCell>{typeName}</TableCell>
                    <TableCell>{color}</TableCell>
                    <TableCell className="text-right font-semibold">{qty}</TableCell>
                  </TableRow>
                );
              });
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
