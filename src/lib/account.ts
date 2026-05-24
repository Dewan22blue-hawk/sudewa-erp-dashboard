export const ACCOUNT_CATEGORY_OPTIONS = [
  {
    value: 'general_administration',
    label: 'Administrasi dan Umum',
    type: 'debet',
  },
  {
    value: 'current_assets',
    label: 'Aktiva Lancar',
    type: 'debet',
  },
  {
    value: 'liabilities',
    label: 'Pasiva Kewajiban',
    type: 'credit',
  },
] as const;

export type AccountCategoryValue = (typeof ACCOUNT_CATEGORY_OPTIONS)[number]['value'];

export const getAccountCategoryLabel = (category?: string | null) => {
  if (!category) return '-';
  return ACCOUNT_CATEGORY_OPTIONS.find((item) => item.value === category)?.label ?? category;
};

export const getAccountTypeFromCategory = (category?: string | null) => {
  if (!category) return 'debet' as const;
  return ACCOUNT_CATEGORY_OPTIONS.find((item) => item.value === category)?.type ?? 'debet';
};
