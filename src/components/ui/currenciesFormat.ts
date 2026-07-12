export function currenciesFormat(currency: 'idr' | 'usd', value: number): string {
  const formatted = value
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (currency === 'idr') return `Rp. ${formatted}`;
  return `$ ${formatted}`;
}
