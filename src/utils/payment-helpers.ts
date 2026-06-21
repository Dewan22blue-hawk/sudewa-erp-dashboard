import { formatCurrency as formatCurrencyBase } from '@/lib/utils/currency';

export function isUsdPayment(pivot?: { original_amount?: number; exchange_amount?: number } | null) {
  return Number(pivot?.original_amount || 0) > 0 && Number(pivot?.exchange_amount || 0) > 0;
}

export function getPaymentCurrency(pivot?: { original_amount?: number; exchange_amount?: number } | null) {
  return isUsdPayment(pivot) ? 'USD' : 'IDR';
}

export function getPaymentDisplayAmount(pivot?: { amount?: number; original_amount?: number; exchange_amount?: number } | null) {
  if (!pivot) return '-';
  if (isUsdPayment(pivot)) {
    return formatCurrencyBase(pivot.amount || 0, 'USD');
  }
  return formatCurrencyBase(pivot.amount || 0, 'IDR');
}

export function getPaymentIdrValue(pivot?: { amount?: number; original_amount?: number; exchange_amount?: number } | null) {
  if (!pivot) return '-';
  if (isUsdPayment(pivot)) {
    return formatCurrencyBase(pivot.original_amount || 0, 'IDR');
  }
  return formatCurrencyBase(pivot.amount || 0, 'IDR');
}

export function getExchangeRateDisplay(pivot?: { original_amount?: number; exchange_amount?: number } | null) {
  if (!pivot || !isUsdPayment(pivot)) return '-';
  return `${formatCurrencyBase(pivot.exchange_amount || 0, 'IDR')} / USD`;
}
