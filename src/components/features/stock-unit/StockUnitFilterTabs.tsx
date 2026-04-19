import { StockStatus } from '@/@types/stock-unit.types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StockUnitFilterTabsProps {
  active: StockStatus | 'all';
  onChange: (value: StockStatus | 'all') => void;
}

const allStatuses: (StockStatus | 'all')[] = [
  'all',
  'draft',
  'cancel',
  'rejected',
  'prepare',
  'inbound_purcase_order',
  'inbound_incoming_goods',
  'inbound_receipt',
  'inbound_return',
  'outbound_reserved',
  'outbound_in_transit',
  'outbound_delivered',
  'outbound_return',
];

const statusDisplayNames: Record<StockStatus | 'all', string> = {
  all: 'Semua Status',
  draft: 'draft',
  cancel: 'cancel',
  rejected: 'rejected',
  prepare: 'prepare',
  inbound_purcase_order: 'purchase order',
  inbound_incoming_goods: 'in transit',
  inbound_receipt: 'available',
  inbound_return: 'refund',
  outbound_reserved: 'reserved',
  outbound_in_transit: 'in transit',
  outbound_delivered: 'delivered',
  outbound_return: 'return',
};

export default function StockUnitFilterTabs({ active, onChange }: StockUnitFilterTabsProps) {
  return (
    <Tabs value={active} onValueChange={(value) => onChange(value as StockStatus | 'all')} className="w-full">
      <div className="w-full overflow-x-auto pb-1 [scrollbar-width:thin]">
        <TabsList className="inline-flex h-auto min-w-max items-center gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1">
          {allStatuses.map((status) => (
            <TabsTrigger
              key={status}
              value={status}
              className="h-9 flex-shrink-0 rounded-lg px-4 text-l font-semibold capitalize text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              {statusDisplayNames[status]}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}