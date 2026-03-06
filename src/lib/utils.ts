import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency helpers have moved to `@/lib/utils/currency`
export { formatCurrency, formatCurrencyCompact } from './utils/currency';
