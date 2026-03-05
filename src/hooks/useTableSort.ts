import { useState, useMemo } from 'react';

export type SortOrder = 'asc' | 'desc' | null;

export interface UseTableSortProps<T> {
    data: T[];
    defaultSortKey?: keyof T;
    defaultSortOrder?: SortOrder;
    onSortChange?: (key: keyof T, order: SortOrder) => void;
}

export function useTableSort<T>({
    data,
    defaultSortKey = undefined,
    defaultSortOrder = null,
    onSortChange
}: UseTableSortProps<T>) {
    const [sortKey, setSortKey] = useState<keyof T | undefined>(defaultSortKey);
    const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);

    const handleSort = (key: keyof T) => {
        let newOrder: SortOrder = 'asc';

        if (sortKey === key) {
            if (sortOrder === 'asc') newOrder = 'desc';
            else if (sortOrder === 'desc') newOrder = null;
        }

        setSortKey(newOrder ? key : undefined);
        setSortOrder(newOrder);

        if (onSortChange) {
            onSortChange(key, newOrder);
        }
    };

    const sortedData = useMemo(() => {
        if (!sortKey || !sortOrder || !data) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];

            // Handle nulls/undefined
            if (aVal == null) return sortOrder === 'asc' ? 1 : -1;
            if (bVal == null) return sortOrder === 'asc' ? -1 : 1;

            // Auto-detect DD/MM/YYYY format
            const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
            if (typeof aVal === 'string' && typeof bVal === 'string' && datePattern.test(aVal) && datePattern.test(bVal)) {
                const [d1, m1, y1] = aVal.split('/').map(Number);
                const [d2, m2, y2] = bVal.split('/').map(Number);
                const time1 = new Date(y1, m1 - 1, d1).getTime();
                const time2 = new Date(y2, m2 - 1, d2).getTime();
                return sortOrder === 'asc' ? time1 - time2 : time2 - time1;
            }

            // Handle strings
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                const result = aVal.localeCompare(bVal);
                return sortOrder === 'asc' ? result : -result;
            }

            // Handle numbers/booleans/dates
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortKey, sortOrder]);

    return {
        sortedData,
        sortKey,
        sortOrder,
        handleSort,
    };
}
