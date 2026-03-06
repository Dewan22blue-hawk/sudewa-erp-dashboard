import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBrand, getBrands, type CreateBrandPayload } from '@/services/brand.service';

export const brandKeys = {
  all: ['brands'] as const,
};

export function useBrands() {
  return useQuery({
    queryKey: brandKeys.all,
    queryFn: () => getBrands(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBrandPayload) => createBrand(payload),
    onSuccess: (brand) => {
      qc.setQueryData(brandKeys.all, (prev: any) => {
        if (Array.isArray(prev)) return [...prev, brand];
        return [brand];
      });
      qc.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
}
