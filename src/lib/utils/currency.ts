export function formatCurrency(value: number, currency: 'IDR' | 'USD' = 'IDR') {
  if (!value) return currency === 'IDR' ? 'Rp0' : '$0';
  if (currency === 'IDR') return `Rp${value.toLocaleString('id-ID')}`;
  if (currency === 'USD') return `$${value.toLocaleString('en-US')}`;
  return value.toString();
}

export function formatCurrencyCompact(value: number, currency: 'IDR' | 'USD' = 'IDR') {
  const formatter = new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  const prefix = currency === 'IDR' ? 'Rp' : '$';
  return `${prefix}${formatter.format(value || 0)}`;
}
