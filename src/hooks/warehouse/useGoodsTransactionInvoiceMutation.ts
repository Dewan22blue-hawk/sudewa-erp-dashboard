import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadGoodsTransactionInvoice } from '@/services/warehouse/goodsTransactionInvoice.service';
import { goodsIssueEquipmentKeys } from './useGoodsIssueEquipment';

export function useUploadGoodsTransactionInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number | string; file: File }) => uploadGoodsTransactionInvoice(id, file),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: goodsIssueEquipmentKeys.all });
      qc.invalidateQueries({ queryKey: goodsIssueEquipmentKeys.detail(variables.id) });
    },
  });
}
