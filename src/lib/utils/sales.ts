export const generateSalesCode = (slug?: string | string[]) => {
  const now = new Date();
  const ymd = now.toISOString().split('T')[0].replace(/-/g, '');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  const seq = String(now.getSeconds()).padStart(2, '0');
  const slugValue = Array.isArray(slug) ? slug[0] : slug;
  const slugCode = String(slugValue || 'UNK')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const companyCode = slugCode ? slugCode.slice(0, 3) : 'UNK';
  return `INV-${companyCode}/${ymd}-${seq}${ms}`;
};
