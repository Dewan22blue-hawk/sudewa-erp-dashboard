export function formatMoneyInput(value: string) {
  const numeric = value.replace(/\D/g, '');
  return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseMoneyInput(value: string): number {
  return Number(value.replace(/\./g, '')) || 0;
}
