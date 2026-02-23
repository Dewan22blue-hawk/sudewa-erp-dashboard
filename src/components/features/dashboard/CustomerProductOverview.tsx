import { CustomerOverview, ProductOverview } from '@/@types/dashboard';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatMoney } from '@/lib/utils/format';

interface CustomerOverviewCardProps {
  data?: CustomerOverview;
  isLoading?: boolean;
}

interface ProductOverviewCardProps {
  data?: ProductOverview;
  isLoading?: boolean;
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-lg bg-slate-50 px-4 py-3 text-center md:text-left">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function LoadingCard() {
  return <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />;
}

export function CustomerOverviewCard({ data, isLoading }: CustomerOverviewCardProps) {
  if (isLoading) return <LoadingCard />;
  if (!data) return null;

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Customer Overview</h3>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <StatItem label="Jumlah Customer" value={data.totalCustomers.toString()} />
        <StatItem label="Total Pendapatan" value={formatMoney(data.totalRevenue, 'IDR')} />
        <StatItem label="Rata-rata pendapatan dari customer" value={formatMoney(data.averageRevenue, 'IDR')} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-1/2 text-slate-700">Nama Customer</TableHead>
              <TableHead className="text-right text-slate-700">Pemasukan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.topCustomers.map((customer, idx) => (
              <TableRow key={`${customer.name}-${idx}`} className="hover:bg-slate-50/50">
                <TableCell className="font-medium text-slate-800">{customer.name}</TableCell>
                <TableCell className="text-right text-slate-700">{formatMoney(customer.revenue, 'IDR')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

export function ProductOverviewCard({ data, isLoading }: ProductOverviewCardProps) {
  if (isLoading) return <LoadingCard />;
  if (!data) return null;

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Produk Overview</h3>
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <StatItem label="Jumlah Produk" value={data.totalProducts.toString()} />
        <StatItem label="Jumlah Produk Terjual" value={data.totalSold.toLocaleString('id-ID')} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-3/4 text-slate-700">Nama Produk</TableHead>
              <TableHead className="text-right text-slate-700">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.topProducts.map((product, idx) => (
              <TableRow key={`${product.name}-${idx}`} className="hover:bg-slate-50/50">
                <TableCell className="font-medium text-slate-800">{product.name}</TableCell>
                <TableCell className="text-right text-slate-700">{product.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
