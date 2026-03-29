import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTypeUnits, getTypeUnitById, createTypeUnit, updateTypeUnit, deleteTypeUnit } from '@/services/type-unit.service';
import { TypeUnitPayload } from '@/@types/type-unit.types';

const TYPE_UNIT_LIST_KEY = 'type-units';
const TYPE_UNIT_ITEM_KEY = 'type-unit';

export function useTypeUnits() {
  return useQuery({
    queryKey: [TYPE_UNIT_LIST_KEY],
    queryFn: () => getTypeUnits(),
    placeholderData: keepPreviousData,
  });
}

export function useTypeUnit(id: string | number, options?: { companyId?: number | string }) {
  return useQuery({
    queryKey: [TYPE_UNIT_ITEM_KEY, id, options?.companyId ?? ''],
    queryFn: () => getTypeUnitById(id, options),
    enabled: !!id,
  });
}

export function useCreateTypeUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TypeUnitPayload) => createTypeUnit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TYPE_UNIT_LIST_KEY] });
    },
  });
}

export function useUpdateTypeUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: TypeUnitPayload }) => updateTypeUnit(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TYPE_UNIT_LIST_KEY] });
      queryClient.invalidateQueries({ queryKey: [TYPE_UNIT_ITEM_KEY, variables.id] });
    },
  });
}

export function useDeleteTypeUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteTypeUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TYPE_UNIT_LIST_KEY] });
    },
  });
}
