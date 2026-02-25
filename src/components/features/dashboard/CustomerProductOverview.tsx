import { CustomerOverview, ProductOverview } from '@/@types/dashboard';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatMoney } from '@/lib/utils/format';
import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

interface CustomerOverviewCardProps {
  data?: CustomerOverview;
  isLoading?: boolean;
}

interface ProductOverviewCardProps {
  data?: ProductOverview;
  isLoading?: boolean;
}

function StatItem({
  label,
  value,
  value2
}: {
  label: string;
  value: React.ReactNode;
  value2?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-start text-center">
      <p className="mb-3 text-[13px] font-medium text-slate-800">{label}</p>
      <div className="flex flex-col items-center gap-2">
        <p className="text-base font-bold text-slate-900">{value}</p>
        {value2 && <p className="text-base font-bold text-slate-900">{value2}</p>}
      </div>
    </div>
  );
}

function LoadingCard() {
  return <div className="h-80 animate-pulse rounded-[20px] bg-slate-100" />;
}

export function CustomerOverviewCard({ data, isLoading }: CustomerOverviewCardProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  if (isLoading) return <LoadingCard />;
  if (!data) return null;

  const sortedCustomers = [...data.topCustomers].sort((a, b) => {
    if (sortOrder === 'asc') return a.revenue - b.revenue;
    if (sortOrder === 'desc') return b.revenue - a.revenue;
    return 0; // Default if null
  });

  const toggleSort = () => {
    if (sortOrder === null) setSortOrder('desc');
    else if (sortOrder === 'desc') setSortOrder('asc');
    else setSortOrder(null);
  };

  return (
    <Card className="rounded-[20px] border border-slate-200 bg-white p-7 shadow-sm">
      <h3 className="mb-8 text-center text-[17px] font-bold text-slate-900">Customer Overview</h3>
      <div className="mb-8 grid grid-cols-3 gap-4 items-start">
        <StatItem label="Jumlah Customer" value={data.totalCustomers.toString()} />
        <StatItem
          label="Total Pendapatan"
          value={formatMoney(data.totalRevenue.idr, 'IDR')}
          value2={`$ ${data.totalRevenue.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatItem label="Rata-rata pendapatan dari customer" value={data.averageRevenue.toString()} />
      </div>

      <div className="overflow-hidden rounded-xl border-none">
        <Table>
          <TableHeader className="bg-[#f8f9fa]">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="h-10 text-[13px] font-medium text-slate-700">Nama Customer</TableHead>
              <TableHead
                className="h-10 text-right text-[13px] font-medium text-slate-700 cursor-pointer select-none transition-colors hover:text-slate-900"
                onClick={toggleSort}
              >
                <div className="flex items-center justify-end gap-2">
                  Pemasukan
                  <ArrowUpDown className={`h-3 w-3 ${sortOrder !== null ? 'text-slate-700' : 'text-slate-300'}`} />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCustomers.map((customer, idx) => (
              <TableRow key={`${customer.name}-${idx}`} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50">
                <TableCell className="py-[14px] text-[13px] font-medium text-slate-800">{customer.name}</TableCell>
                <TableCell className="py-[14px] text-right text-[13px] text-slate-700">{formatMoney(customer.revenue, 'IDR')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

export function ProductOverviewCard({ data, isLoading }: ProductOverviewCardProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  if (isLoading) return <LoadingCard />;
  if (!data) return null;

  const sortedProducts = [...data.topProducts].sort((a, b) => {
    if (sortOrder === 'asc') return a.quantity - b.quantity;
    if (sortOrder === 'desc') return b.quantity - a.quantity;
    return 0; // Default if null
  });

  const toggleSort = () => {
    if (sortOrder === null) setSortOrder('desc');
    else if (sortOrder === 'desc') setSortOrder('asc');
    else setSortOrder(null);
  };

  return (
    <Card className="rounded-[20px] border border-slate-200 bg-white p-7 shadow-sm h-full">
      <h3 className="mb-8 text-center text-[17px] font-bold text-slate-900">Produk Overview</h3>
      <div className="mb-8 grid grid-cols-2 gap-4 items-start">
        <StatItem label="Jumlah Produk" value={data.totalProducts.toString()} />
        <StatItem label="Jumlah Produk Terjual" value={data.totalSold.toLocaleString('id-ID')} />
      </div>

      <div className="overflow-hidden rounded-xl border-none">
        <Table>
          <TableHeader className="bg-[#f8f9fa]">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="h-10 text-[13px] font-medium text-slate-700">Nama Produk</TableHead>
              <TableHead
                className="h-10 text-right text-[13px] font-medium text-slate-700 cursor-pointer select-none transition-colors hover:text-slate-900"
                onClick={toggleSort}
              >
                <div className="flex items-center justify-end gap-2">
                  Quantity
                  <ArrowUpDown className={`h-3 w-3 ${sortOrder !== null ? 'text-slate-700' : 'text-slate-300'}`} />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.map((product, idx) => (
              <TableRow key={`${product.name}-${idx}`} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50">
                <TableCell className="py-[14px] text-[13px] font-medium text-slate-800">{product.name}</TableCell>
                <TableCell className="py-[14px] text-right text-[13px] text-slate-700">{product.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
