import { useMemo, useState } from 'react';
import { MoreVertical, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FinanceBillingItem } from '@/@types/finance-billing.types';
import { useCreateFinanceBillingItem, useDeleteFinanceBillingItem, useUpdateFinanceBillingItem } from '@/hooks/useFinanceBilling';
import { formatCurrency } from '@/lib/utils/currency';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';

type EditableRowId = number | 'new';

interface DraftRow {
  note: string;
  amount: number;
}

interface Props {
  items: FinanceBillingItem[];
  financeBillingId?: number;
  paymentAt?: string;
  disabled?: boolean;
}

const defaultDraft: DraftRow = {
  note: '',
  amount: 0,
};

const translateFinanceBillingError = (message: string) => {
  const trimmed = message.trim();

  const balanceMatch = trimmed.match(/^Payment amount exceeds remaining billing balance \(([\d.,]+)\)\.?$/i);
  if (balanceMatch) {
    return `Nominal pembayaran melebihi sisa saldo tagihan (${balanceMatch[1]}).`;
  }

  if (/^Validation failed$/i.test(trimmed)) {
    return 'Validasi gagal. Periksa kembali data yang Anda masukkan.';
  }

  return trimmed
    .replace(/^Payment amount exceeds remaining billing balance/i, 'Nominal pembayaran melebihi sisa saldo tagihan')
    .replace(/^Payment amount is required/i, 'Nominal pembayaran wajib diisi')
    .replace(/^Payment date is required/i, 'Tanggal pembayaran wajib diisi')
    .replace(/^The note field is required/i, 'Catatan wajib diisi');
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') return fallback;

  const details = 'details' in error ? (error as { details?: unknown }).details : undefined;
  if (typeof details === 'string' && details.trim()) {
    return translateFinanceBillingError(details);
  }

  if (details && typeof details === 'object') {
    const firstValue = Object.values(details as Record<string, unknown>)[0];
    if (typeof firstValue === 'string' && firstValue.trim()) {
      return translateFinanceBillingError(firstValue);
    }
    if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') {
      return translateFinanceBillingError(firstValue[0]);
    }
  }

  const message = 'message' in error ? (error as { message?: unknown }).message : undefined;
  if (typeof message === 'string' && message.trim()) {
    return translateFinanceBillingError(message);
  }

  return fallback;
};

export default function TransactionDetailInlineTable({ items, financeBillingId, paymentAt, disabled }: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<EditableRowId | null>(null);
  const [draft, setDraft] = useState<DraftRow>(defaultDraft);

  const createMutation = useCreateFinanceBillingItem(financeBillingId);
  const updateMutation = useUpdateFinanceBillingItem();
  const deleteMutation = useDeleteFinanceBillingItem();

  const isBusy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const hasRows = items.length > 0;
  const allSelected = hasRows && selectedIds.length === items.length;

  const rows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        totalAmount: Number(item.cash_payment_amount || 0) + Number(item.bca_payment_amount || 0) + Number(item.bca_payment_usd_amount || 0),
      })),
    [items],
  );

  const resetEditor = () => {
    setEditingId(null);
    setDraft(defaultDraft);
  };

  const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, rowId: EditableRowId) => {
    if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    event.preventDefault();
    if (isBusy) return;
    void handleSave(rowId);
  };

  const handleAddRow = () => {
    if (disabled || isBusy) return;
    setEditingId('new');
    setDraft(defaultDraft);
  };

  const handleEditRow = (item: FinanceBillingItem) => {
    if (disabled || isBusy) return;
    setEditingId(item.id);
    setDraft({
      note: item.note || '',
      amount: Number(item.cash_payment_amount || 0) + Number(item.bca_payment_amount || 0) + Number(item.bca_payment_usd_amount || 0),
    });
  };

  const handleToggleSelected = (id: number, checked: boolean) => {
    setSelectedIds((previous) => (checked ? [...previous, id] : previous.filter((itemId) => itemId !== id)));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? items.map((item) => item.id) : []);
  };

  const handleDeleteOne = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Rincian transaksi berhasil dihapus');
      setSelectedIds((previous) => previous.filter((itemId) => itemId !== id));
      if (editingId === id) {
        resetEditor();
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal menghapus rincian transaksi'));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(selectedIds.map((id) => deleteMutation.mutateAsync(id)));
      toast.success('Rincian transaksi terpilih berhasil dihapus');
      setSelectedIds([]);
      resetEditor();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal menghapus rincian transaksi'));
    }
  };

  const handleSave = async (rowId: EditableRowId) => {
    if (!financeBillingId || !paymentAt) {
      toast.error('Data finance billing belum lengkap');
      return;
    }

    if (!draft.note.trim()) {
      toast.error('Keterangan wajib diisi');
      return;
    }

    if (draft.amount <= 0) {
      toast.error('Nominal bayar wajib lebih dari 0');
      return;
    }

    try {
      if (rowId === 'new') {
        await createMutation.mutateAsync({
          finance_billing_id: financeBillingId,
          cash_payment_amount: draft.amount,
          payment_at: paymentAt,
          note: draft.note.trim(),
        });
        toast.success('Rincian transaksi berhasil ditambahkan');
      } else {
        await updateMutation.mutateAsync({
          id: rowId,
          payload: {
            finance_billing_id: financeBillingId,
            cash_payment_amount: draft.amount,
            payment_at: paymentAt,
            note: draft.note.trim(),
          },
        });
        toast.success('Rincian transaksi berhasil diperbarui');
      }

      resetEditor();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal menyimpan rincian transaksi'));
    }
  };

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-[30px] font-semibold text-slate-950">Detail Transaksi</h2>
          <p className="text-sm text-slate-500">Rincian lengkap unit yang dibeli</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="destructive"
            className="h-11 rounded-xl bg-[#ec2f2f] px-4 hover:bg-[#d62828]"
            disabled={disabled || isBusy || selectedIds.length === 0}
            onClick={() => void handleDeleteSelected()}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete ({selectedIds.length})
          </Button>
          <Button type="button" variant="outline" className="h-11 rounded-xl border-slate-200 bg-slate-50 px-4 hover:bg-slate-100" disabled={disabled || isBusy || editingId === 'new'} onClick={handleAddRow}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      {disabled ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Detail transaksi inline hanya tersedia untuk data transaksi kas harian yang berasal dari fractal pembayaran.
        </div>
      ) : null}

      <div className="mt-5 flex items-center gap-3 text-sm text-slate-700">
        <span>Show</span>
        <div className="flex h-11 w-[58px] items-center justify-center rounded-xl border border-slate-200 bg-white">10</div>
        <span>Page</span>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-[#f3f6fb] text-[13px] font-semibold uppercase text-slate-800">
            <tr>
              <th className="w-12 px-4 py-3 text-center">
                <Checkbox checked={allSelected} onCheckedChange={(checked) => handleSelectAll(Boolean(checked))} disabled={disabled || !hasRows || isBusy} />
              </th>
              <th className="w-16 px-4 py-3 text-left">No</th>
              <th className="px-4 py-3 text-left">Keterangan</th>
              <th className="w-[320px] px-4 py-3 text-left">Nominal Bayar</th>
              <th className="w-20 px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((item, index) => {
              const isEditing = editingId === item.id;
              return (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-center">
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={(checked) => handleToggleSelected(item.id, Boolean(checked))}
                      disabled={disabled || isBusy || isEditing}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <Input
                        value={draft.note}
                        onChange={(event) => setDraft((previous) => ({ ...previous, note: event.target.value }))}
                        onKeyDown={(event) => handleEditorKeyDown(event, item.id)}
                        placeholder="Tulis rincian transaksi"
                        className="h-11 rounded-xl border-slate-200"
                      />
                    ) : (
                      <span className="text-slate-800">{item.note || '-'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <MoneyInput
                        value={draft.amount}
                        onChangeValue={(value) => setDraft((previous) => ({ ...previous, amount: value }))}
                        onKeyDown={(event) => handleEditorKeyDown(event, item.id)}
                        placeholder="Masukkan nominal bayar"
                        className="h-11 rounded-xl border-slate-200"
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{formatCurrency(item.totalAmount)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-2">
                        <Button type="button" size="sm" className="h-9 rounded-lg bg-[#18385b] px-3 hover:bg-[#102843]" disabled={isBusy} onClick={() => void handleSave(item.id)}>
                          Simpan
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="h-9 rounded-lg border-slate-200 px-3" disabled={isBusy} onClick={resetEditor}>
                          Batal
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={disabled || isBusy}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[150px] rounded-2xl p-2">
                          <DropdownMenuItem onClick={() => handleEditRow(item)} className="cursor-pointer rounded-xl px-3 py-2.5">
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => void handleDeleteOne(item.id)} className="cursor-pointer rounded-xl px-3 py-2.5 text-red-600 focus:text-red-700">
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              );
            })}

            {editingId === 'new' ? (
              <tr className="bg-slate-50/60">
                <td className="px-4 py-3 text-center">
                  <Checkbox checked={false} disabled />
                </td>
                <td className="px-4 py-3 text-slate-600">{rows.length + 1}</td>
                <td className="px-4 py-3">
                  <Input
                    value={draft.note}
                    onChange={(event) => setDraft((previous) => ({ ...previous, note: event.target.value }))}
                    onKeyDown={(event) => handleEditorKeyDown(event, 'new')}
                    placeholder="Tulis rincian transaksi"
                    className="h-11 rounded-xl border-slate-200 bg-white"
                  />
                </td>
                <td className="px-4 py-3">
                  <MoneyInput
                    value={draft.amount}
                    onChangeValue={(value) => setDraft((previous) => ({ ...previous, amount: value }))}
                    onKeyDown={(event) => handleEditorKeyDown(event, 'new')}
                    placeholder="Masukkan nominal bayar"
                    className="h-11 rounded-xl border-slate-200 bg-white"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button type="button" size="sm" className="h-9 rounded-lg bg-[#18385b] px-3 hover:bg-[#102843]" disabled={isBusy} onClick={() => void handleSave('new')}>
                      Simpan
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="h-9 rounded-lg border-slate-200 px-3" disabled={isBusy} onClick={resetEditor}>
                      Batal
                    </Button>
                  </div>
                </td>
              </tr>
            ) : null}

            {!hasRows && editingId !== 'new' ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Belum ada rincian transaksi.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
