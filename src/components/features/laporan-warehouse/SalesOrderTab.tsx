"use client";

import OutstandingTable from './OutstandingTable';

type SalesOrderTabProps = {
  perPage: number;
  dateRange?: { from?: Date; to?: Date };
  onActionsChange?: (actions: { print: () => void; download: () => void }) => void;
};

export default function SalesOrderTab(props: SalesOrderTabProps) {
  return <OutstandingTable type="sales" {...props} />;
}
