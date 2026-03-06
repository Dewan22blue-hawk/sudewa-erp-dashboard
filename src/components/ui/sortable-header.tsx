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
                'px-0 hover:bg-transparent font-semibold uppercase text-slate-700 flex items-center gap-1',
                className
            )}
        >
            <span>{title}</span>
            {isActive && sortOrder === 'asc' ? (
                <ArrowUp className="h-4 w-4 text-emerald-600" />
            ) : isActive && sortOrder === 'desc' ? (
                <ArrowDown className="h-4 w-4 text-emerald-600" />
            ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50 text-slate-400" />
            )}
        </Button>
    );
}
