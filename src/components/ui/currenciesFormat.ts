export function currenciesFormat(currency: 'idr' | 'usd', value: number | undefined | null): string {
  const safeValue = (value === undefined || value === null || isNaN(value)) ? 0 : value;
  const formatted = safeValue
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (currency === 'idr') return `Rp. ${formatted}`;
  return `$ ${formatted}`;
}
