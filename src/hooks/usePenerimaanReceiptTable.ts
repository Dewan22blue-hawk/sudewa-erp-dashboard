import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReceiptTableQueryParams, getReceiptUnitTableRows } from '@/services/penerimaan-unit-receipt.service';

export const usePenerimaanReceiptTable = (params: ReceiptTableQueryParams, enabled = true) => {
  const query = useQuery({
    queryKey: ['penerimaan-receipt-table', params.companyId, params.personId || '', params.page, params.perPage, params.search || ''],
    queryFn: () => getReceiptUnitTableRows(params),
    enabled,
  });

  const rows = useMemo(() => query.data?.rows ?? [], [query.data?.rows]);
  const meta = useMemo(
    () =>
      query.data?.meta ?? {
        currentPage: params.page,
        perPage: params.perPage,
        total: 0,
        lastPage: 1,
      },
    [query.data?.meta, params.page, params.perPage],
  );

  return {
    ...query,
    rows,
    meta,
  };
};
