export function currenciesFormat(currency: 'idr' | 'usd', value: number | undefined | null): string {
  const safeValue = (value === undefined || value === null || isNaN(value)) ? 0 : value;
  if (currency === 'idr') {
    const parts = safeValue.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp. ${integerPart},${parts[1]}`;
  } else {
    const parts = safeValue.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$ ${integerPart}.${parts[1]}`;
  }
}
