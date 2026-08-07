import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingState } from '@/components/ui/loading-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMoneyInput } from '@/lib/utils/money-input';
import { formatDate } from '@/lib/utils/format';
import { useSparepartTransaction, useCreateSparepartTransactionBillingHistory, useUpdateSparepartTransactionBillingHistory, useDeleteSparepartTransactionBillingHistory } from '@/hooks/useSparepartTransaction';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Plus, MoreVertical } from 'lucide-react';
import { PaymentModal } from '@/components/features/sparepart-transaction/PaymentModal';
import DeletePaymentDialog from '@/components/features/sparepart-transaction/DeletePaymentDialog';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { currenciesFormat } from '@/components/ui/currenciesFormat';
import { CopyBox } from '@/components/ui/copy-box';

export default function DetailSalesSparepartPage() {
  const router = useRouter();
  const { slug, id } = router.query;
  
  const { data: transaction, isLoading } = useSparepartTransaction(id as string, !!id);
  const createPaymentMutation = useCreateSparepartTransactionBillingHistory();
  const updatePaymentMutation = useUpdateSparepartTransactionBillingHistory();
  const deletePaymentMutation = useDeleteSparepartTransactionBillingHistory();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);

  const handleBack = () => router.push(`/dashboard/${slug}/transaksi/penjualan-sparepart`);

  const openAddPayment = () => {
    setSelectedPayment(null);
    setPaymentModalOpen(true);
  };

  const openEditPayment = (payment: any) => {
    setSelectedPayment(payment);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (data: any) => {
    if (!transaction?.sparepart_transaction_billing?.id) {
       toast.error("Billing ID tidak valid");
       return;
    }

    try {
      if (selectedPayment) {
        await updatePaymentMutation.mutateAsync({
          id: selectedPayment.id,
          payload: {
             sparepart_transaction_billing_id: transaction.sparepart_transaction_billing.id,
             payment_at: data.payment_at,
             cash_payment_amount: data.cash_payment_amount,
             bca_payment_amount: data.bca_payment_amount,
             bca_payment_usd_amount: data.bca_payment_usd_amount,
             note: data.note,
          }
        });
        toast.success("Pembayaran berhasil diubah");
      } else {
        await createPaymentMutation.mutateAsync({
           sparepart_transaction_billing_id: transaction.sparepart_transaction_billing.id,
           payment_at: data.payment_at,
           cash_payment_amount: data.cash_payment_amount,
           bca_payment_amount: data.bca_payment_amount,
           bca_payment_usd_amount: data.bca_payment_usd_amount,
           note: data.note,
        });
        toast.success("Pembayaran berhasil ditambahkan");
      }
      setPaymentModalOpen(false);
    } catch {
      toast.error("Gagal memproses pembayaran");
    }
  };

  const handleDeletePayment = async () => {
    if (!deletePaymentId) return;
    try {
      await deletePaymentMutation.mutateAsync(deletePaymentId);
      toast.success("Pembayaran berhasil dihapus");
      setDeletePaymentId(null);
    } catch {
      toast.error("Gagal menghapus pembayaran");
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState variant="page" />
      </DashboardLayout>
    );
  }

  if (!transaction) {
    return (
      <DashboardLayout>
         <div className="p-10 text-center">Data tidak ditemukan</div>
      </DashboardLayout>
    )
  }

  // Calculate billing summary since API doesn't provide it wrapped
  const sparepartBilling = transaction?.sparepart_transaction_billing;
  const histories = sparepartBilling?.sparepart_transaction_billing_histories || [];
  const totalTagihan = sparepartBilling?.grand_total || transaction.transaction_netto_total || 0;
  const totalPaid = histories.reduce((acc: number, curr: any) => acc + (curr.grand_total || curr.cash_payment_amount || curr.bca_payment_amount || 0), 0);
  const remainingPayment = sparepartBilling?.is_paid ? 0 : Math.max(0, totalTagihan - totalPaid);
  const isPaid = sparepartBilling?.is_paid || (totalTagihan > 0 && remainingPayment === 0);

  const billingStatusLabel = isPaid ? 'Lunas' : 'Belum Lunas';

  const columns: ColumnDef<any>[] = [
    {
      header: 'Tanggal Pembayaran',
      accessorKey: 'payment_at',
      sortable: false,
      cell: (item: any) => formatDate(item.payment_at || item.created_at) || '-'
    },
    {
      header: 'Nominal Dibayar',
      accessorKey: 'grand_total',
      alignment: 'center',
      sortable: false,
      cell: (item: any) => currenciesFormat('idr', item.grand_total || item.cash_payment_amount || item.bca_payment_amount || 0)
    },
    {
      header: 'Keterangan',
      accessorKey: 'note',
      sortable: false,
      cell: (item: any) => item.note || '-'
    },
    {
      header: 'Aksi',
      alignment: 'center',
      sticky: 'right',
      cell: (item: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditPayment(item)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              onClick={() => setDeletePaymentId(String(item.id))}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  // histories is already computed above

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader 
          title="Detail Penjualan Sparepart" 
          subtitle={
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span className="text-sm font-medium text-slate-500">Kode Transaksi:</span>
              <CopyBox text={transaction.code} />
              <Badge
                className={cn(
                  'font-medium ml-2',
                  billingStatusLabel === 'Lunas' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                )}
              >
                {billingStatusLabel}
              </Badge>
            </div>
          }
          onBack={handleBack}
          breadcrumbs={[
            { label: 'Penjualan Sparepart', onClick: handleBack },
            { label: 'Detail Transaksi' },
          ]}
          actions={
            <Button variant="outline" onClick={() => router.push(`/dashboard/${slug}/transaksi/penjualan-sparepart/edit/${transaction.id}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Data
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 space-y-6">
             <Card className="shadow-none border-gray-200">
               <CardHeader className="bg-slate-50/50 border-b border-gray-100 py-4 px-6">
                 <CardTitle className="text-lg font-semibold">Informasi Transaksi</CardTitle>
               </CardHeader>
               <CardContent className="text-slate-700 p-6 pt-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                   <div>
                     <p className="text-sm font-medium text-slate-500 mb-1">Tanggal Transaksi</p>
                     <p className="text-base text-slate-900 font-medium">{formatDate(transaction.transaction_date || transaction.created_at)}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-500 mb-1">No Nota</p>
                     <p className="text-base text-slate-900 font-medium">{transaction.nota_number || '-'}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-500 mb-1">Customer</p>
                     <p className="text-base text-slate-900 font-medium">{transaction.person?.name || '-'}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-500 mb-1">Gudang Penyimpanan</p>
                     <p className="text-base text-slate-900 font-medium">{transaction.warehouse?.name || '-'}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-500 mb-1">Sparepart</p>
                     <p className="text-base text-slate-900 font-medium">{transaction.sparepart?.name || '-'} ({transaction.sparepart?.code})</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-500 mb-1">Kuantitas</p>
                     <p className="text-base text-slate-900 font-medium">{transaction.qty} {transaction.sparepart?.unit_type || ''}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-500 mb-1">Tipe Pembayaran</p>
                     <p className="text-base text-slate-900 font-medium capitalize">{transaction.billing_type || '-'}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-500 mb-1">Catatan</p>
                     <p className="text-base text-slate-900 font-medium">{transaction.note || '-'}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>

             <Card className="shadow-none border-gray-200">
               <CardHeader className="bg-slate-50/50 border-b border-gray-100 py-4 px-6 flex flex-row items-center justify-between">
                 <CardTitle className=" text-lg font-semibold">Riwayat Pembayaran</CardTitle>
                 {remainingPayment > 0 && (
                   <Button onClick={openAddPayment} className="bg-[#1e3a5f] hover:bg-[#152e4d]" size="sm">
                     <Plus className="mr-2 h-4 w-4" />
                     Bayar
                   </Button>
                 )}
               </CardHeader>
               <CardContent className="p-6 pt-6">
                  <div className="overflow-x-auto">
                    <BaseTable 
                      data={histories}
                      columns={columns}
                    />
                  </div>
               </CardContent>
             </Card>
           </div>
           
           <div className="space-y-6">
             <Card className="shadow-none border-gray-200">
                <CardHeader className="bg-slate-50/50 border-b border-gray-100 py-4 px-6">
                  <CardTitle className="text-lg font-semibold">Rincian Transaksi</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-6 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Harga Satuan</span>
                    <span className="font-medium text-slate-900">{currenciesFormat('idr', transaction.price)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Kuantitas</span>
                    <span className="font-medium text-slate-900">{transaction.qty}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Total Bruto</span>
                    <span className="font-medium text-slate-900">{currenciesFormat('idr', transaction.transaction_bruto_total)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Diskon</span>
                    <span className="font-medium text-slate-900">{transaction.discount}%</span>
                  </div>
                  
                  <div className="h-px bg-slate-200 my-2"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">TOTAL PENJUALAN</span>
                    <span className="font-bold text-base text-slate-900">{currenciesFormat('idr', transaction.transaction_netto_total)}</span>
                  </div>
                </CardContent>
             </Card>

             <Card className="shadow-none border-gray-200">
                 <CardHeader className="bg-slate-50/50 border-b border-gray-100 py-4 px-6">
                  <CardTitle className="text-lg font-semibold">Rincian Pembayaran</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-6 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Total Tagihan</span>
                    <span className="font-medium text-slate-900">{currenciesFormat('idr', totalTagihan)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Total Dibayar</span>
                    <span className="font-medium text-emerald-600">{currenciesFormat('idr', totalPaid)}</span>
                  </div>
                  
                  <div className="h-px bg-slate-200 my-2"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">KURANG BAYAR</span>
                    <span className="font-bold text-base text-red-600">{currenciesFormat('idr', remainingPayment)}</span>
                  </div>
                </CardContent>
             </Card>
           </div>
        </div>

        <PaymentModal 
          open={paymentModalOpen} 
          onClose={() => setPaymentModalOpen(false)} 
          onSubmit={handlePaymentSubmit} 
          defaultValues={selectedPayment}
          loading={createPaymentMutation.isPending || updatePaymentMutation.isPending}
        />

        <DeletePaymentDialog 
          open={!!deletePaymentId} 
          onClose={() => setDeletePaymentId(null)} 
          onConfirm={handleDeletePayment} 
          loading={deletePaymentMutation.isPending} 
        />
      </div>
    </DashboardLayout>
  )
}
