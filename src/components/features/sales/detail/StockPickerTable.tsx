import { ReactNode, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { WarehouseStockUnit } from '@/@types/unit-transaction.types';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { CopyBox } from '@/components/ui/copy-box';

interface StockPickerTableProps {
  units: WarehouseStockUnit[];
  selectedIds: Set<number>;
  onToggleOne: (id: number, checked: boolean) => void;
  onToggleAllPage: (checked: boolean) => void;
  currentPage: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (value: number) => void;
  isLoading?: boolean;
  isError?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchAction?: ReactNode;
}

export function StockPickerTable({
  units,
  selectedIds,
  onToggleOne,
  onToggleAllPage,
  currentPage,
  perPage,
  onPageChange,
  onPerPageChange,
  isLoading,
  isError,
  searchValue,
  onSearchChange,
  searchAction,
}: StockPickerTableProps) {
  const filteredUnits = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return units;

    return units.filter((item) => {
      return [item.color, item.machine_number, item.chassis_number].some((field) => String(field ?? '').toLowerCase().includes(query));
    });
  }, [units, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / perPage));
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredUnits.slice(start, start + perPage);
  }, [filteredUnits, currentPage, perPage]);

  const stringSelectedIds = useMemo(() => {
    return new Set<string>(Array.from(selectedIds).map(String));
  }, [selectedIds]);

  const handleSelectedIdsChange = useCallback((ids: Set<string>) => {
    const numIds = new Set<number>(Array.from(ids).map(Number));
    const allPageIds = new Set(pagedRows.map((r) => r.id));

    const added = Array.from(numIds).filter((id) => !selectedIds.has(id));
    const removed = Array.from(allPageIds).filter((id) => selectedIds.has(id) && !numIds.has(id));

    if (added.length > 0) {
      added.forEach((id) => onToggleOne(id, true));
    }
    if (removed.length > 0) {
      removed.forEach((id) => onToggleOne(id, false));
    }
  }, [pagedRows, selectedIds, onToggleOne]);

  const columns = useMemo<ColumnDef<WarehouseStockUnit>[]>(() => [
    {
      header: 'No',
      alignment: 'center',
      className: 'w-[60px]',
      cell: (_, index) => (currentPage - 1) * perPage + index + 1,
    },
    {
      header: 'Warna',
      accessorKey: 'color',
    },
    {
      header: 'Nomor Mesin',
      accessorKey: 'machine_number',
      className: 'font-medium',
      cell: (item) => (
        <CopyBox text={item?.machine_number ?? '-'} />
      )
    },
    {
      header: 'Nomor Rangka',
      accessorKey: 'chassis_number',
      cell: (item) => (
        <CopyBox text={item?.chassis_number ?? '-'} />
      )
    },
    {
      header: 'Status Stock',
      alignment: 'center',
      cell: (item) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item?.in_stock ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {item?.in_stock ? 'In Stock' : 'Out Stock'}
        </span>
      ),
    },
  ], [currentPage, perPage]);

  return (
    <div className="space-y-4">
      <BaseTable
        data={pagedRows}
        columns={columns}
        loading={isLoading}
        searchPlaceholder="Cari warna/nomor mesin/nomor rangka"
        search={searchValue}
        onSearchChange={onSearchChange}
        showLimitChange
        perPage={perPage}
        onPerPageChange={(val) => {
          onPerPageChange(val);
          onPageChange(1);
        }}
        showCheckbox
        selectedIds={stringSelectedIds}
        onSelectedIdsChange={handleSelectedIdsChange}
        getRowId={(item) => String(item.id)}
        meta={{
          currentPage,
          perPage,
          lastPage: totalPages,
          total: filteredUnits.length,
        }}
        onPageChange={onPageChange}
        headerActions={searchAction ? <div>{searchAction}</div> : undefined}
      />
    </div>
  );
}
