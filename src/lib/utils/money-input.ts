export function formatMoneyInput(value: string | number) {
  const strVal = typeof value === 'number' ? Math.max(0, Math.floor(value)).toString() : value;
  const numeric = strVal.replace(/\D/g, '');
  return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseMoneyInput(value: string | number): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const normalized = String(value).replace(/\D/g, '');
  if (!normalized) return 0;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

/**
 * Membatasi (clamp) nilai angka nominal agar tidak melebihi nilai maksimal (maxLimit).
 * Jika maxLimit ditentukan dan input melebihi maxLimit, nilai akan otomatis diganti menjadi maxLimit.
 */
export function clampMoneyValue(value: number, maxLimit?: number): number {
  const safeVal = Math.max(0, value);
  if (maxLimit !== undefined && maxLimit !== null && maxLimit >= 0) {
    return Math.min(safeVal, maxLimit);
  }
  return safeVal;
}

/**
 * Helper untuk memposting/memproses masukan (input) nominal uang dari komponen form.
 * Mengubah string/number input menjadi number murni dan membatasi nilainya ke maxLimit jika melebihi.
 * 
 * @example
 * const maxAllowed = 5000000;
 * const amount = parseAndClampMoneyInput('10.000.000', maxAllowed); // returns 5000000
 */
export function parseAndClampMoneyInput(value: string | number, maxLimit?: number): number {
  const numericValue = parseMoneyInput(value);
  return clampMoneyValue(numericValue, maxLimit);
}
