import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PaginationParams } from '@/@types/pagination.types';
import type { VehicleDocumentFilters, VehicleDocumentPayload, VehicleRegistrationPayload } from '@/@types/vehicle-document.types';
import {
  createVehicleDocument,
  deleteVehicleDocument,
  exportVehicleDocument,
  getVehicleDocumentDetail,
  getVehicleDocuments,
  importVehicleDocument,
  updateVehicleDocument,
  updateVehicleRegistration,
} from '@/services/vehicle-document.service';

export function useVehicleDocuments(params: PaginationParams & VehicleDocumentFilters) {
  return useQuery({
    queryKey: ['vehicle-document', params],
    queryFn: () => getVehicleDocuments(params),
  });
}

export function useVehicleDocumentDetail(id: string | number | null) {
  return useQuery({
    queryKey: ['vehicle-document', 'detail', id],
    queryFn: () => getVehicleDocumentDetail(id as string | number),
    enabled: !!id,
  });
}

export function useCreateVehicleDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<VehicleDocumentPayload>) => createVehicleDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-document'] });
    },
  });
}

export function useUpdateVehicleDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Partial<VehicleDocumentPayload> }) => updateVehicleDocument(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-document'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-document', 'detail', variables.id] });
    },
  });
}

export function useDeleteVehicleDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteVehicleDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-document'] });
    },
  });
}

export function useImportVehicleDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importVehicleDocument(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-document'] });
    },
  });
}

export function useExportVehicleDocument() {
  return useMutation({ mutationFn: () => exportVehicleDocument() });
}

export function useUpdateVehicleRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Partial<VehicleRegistrationPayload> }) => updateVehicleRegistration(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-document'] });
    },
  });
}
