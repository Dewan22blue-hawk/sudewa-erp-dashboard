import type { PaginatedResult } from './pagination.types';

export interface Armada {
  id: number | string;
  uuid?: string;
  registrationNumber: string;
  type: string;
  machineNumber: string;
  chassisNumber: string;
  stnkAge?: string | null;
  kirAge?: string | null;
  stnkNumber?: string | null;
  kirBook?: string | null;
  equipment: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ArmadaPayload {
  registration_number: string;
  type: string;
  machine_number: string;
  chassis_number: string;
  stnk_age?: string | null;
  kir_age?: string | null;
  stnk_number?: string | null;
  kir_book?: string | null;
  equipment: string[];
}

export type ArmadaListResponse = PaginatedResult<Armada>;
