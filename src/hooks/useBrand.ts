import { useQuery } from '@tanstack/react-query';
import { getBrands } from '@/services/brand.service';

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
