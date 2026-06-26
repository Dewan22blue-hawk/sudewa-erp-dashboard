import { format } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format tanggal standar untuk tampilan UI Bahasa Indonesia.
 * Output: DD MMMM YYYY (contoh: 03 Juli 2026)
 * 
 * @param date - Objek Date atau string ISO
 * @returns String tanggal terformat
 */
export function formatDateUI(date: Date | string | number | null | undefined): string {
  if (!date) return '-';
  
  try {
    const d = new Date(date);
    // Cek apakah date valid
    if (isNaN(d.getTime())) return '-';
    
    return format(d, 'dd MMMM yyyy', { locale: id });
  } catch (error) {
    return '-';
  }
}
