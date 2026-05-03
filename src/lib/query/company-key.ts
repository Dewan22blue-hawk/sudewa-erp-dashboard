type QueryPrimitive = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryPrimitive>;

export const companyQueryKeys = {
  companyScope: (companyId: string | number) => ['company', String(companyId)] as const,
  list: (companyId: string | number, resource: string, params?: QueryParams) =>
    [...companyQueryKeys.companyScope(companyId), resource, params ?? {}] as const,
  detail: (companyId: string | number, resource: string, id: string | number) =>
    [...companyQueryKeys.companyScope(companyId), resource, 'detail', String(id)] as const,
};
