import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SortOrder } from '@/hooks/useTableSort';

interface SortableHeaderProps {
    title: string;
    sortKey: string;
    currentSortKey?: string;
    sortOrder?: SortOrder;
    onSort: (key: any) => void;
    className?: string;
}

export function SortableHeader({
    title,
    sortKey,
    currentSortKey,
    sortOrder,
    onSort,
    className,
}: SortableHeaderProps) {
    const isActive = currentSortKey === sortKey;

    return (
        <Button
            variant="ghost"
            onClick={() => onSort(sortKey)}
            className={cn(
                '-ml-4 h-8 data-[state=open]:bg-accent hover:bg-slate-200/50 uppercase font-semibold text-slate-700',
                className
            )}
        >
            <span>{title}</span>
            {isActive && sortOrder === 'asc' ? (
                <ArrowUp className="ml-2 h-4 w-4 text-emerald-600" />
            ) : isActive && sortOrder === 'desc' ? (
                <ArrowDown className="ml-2 h-4 w-4 text-emerald-600" />
            ) : (
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50 text-slate-400" />
            )}
        </Button>
    );
}
