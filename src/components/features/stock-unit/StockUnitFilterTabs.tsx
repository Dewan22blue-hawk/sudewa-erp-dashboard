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
  all: 'All',
  draft: 'Draft',
  cancel: 'Cancel',
  rejected: 'Rejected',
  prepare: 'Prepare',
  inbound_purcase_order: 'Inbound Purchase Order',
  inbound_incoming_goods: 'Inbound Incoming Goods',
  inbound_receipt: 'Inbound Receipt',
  inbound_return: 'Inbound Return',
  outbound_reserved: 'Outbound Reserved',
  outbound_in_transit: 'Outbound In Transit',
  outbound_delivered: 'Outbound Delivered',
  outbound_return: 'Outbound Return',
};

export default function StockUnitFilterTabs({ active, onChange }: StockUnitFilterTabsProps) {
  return (
    <Tabs value={active} onValueChange={(value) => onChange(value as StockStatus | 'all')}>
      <TabsList className="flex h-auto items-center overflow-x-auto rounded-md bg-muted p-1 text-muted-foreground gap-1">
        {allStatuses.map((status) => (
          <TabsTrigger key={status} value={status} className="flex-shrink-0">
            {statusDisplayNames[status]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}