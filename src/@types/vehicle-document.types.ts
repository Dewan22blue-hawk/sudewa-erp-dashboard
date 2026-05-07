import type { PaginatedResult } from './pagination.types';
import type { Vendor } from './vendor.types';

export interface VehicleDocumentSummary {
  id: number;
  uuid: string;
  code: string;
  vendorId: number;
  receiptDate: string;
  description: string;
  processedCount: number;
  unprocessedCount: number;
  createdAt?: string;
  updatedAt?: string;
  vendor?: {
    id: number;
    name: string;
    code?: string;
  };
}

export interface VehicleDocumentItem {
  id: number;
  registrationId: number;
  vehicleDataId?: number | null;
  dealerId?: number | null;
  regionId?: number | null;
  dealerName: string;
  stnkName: string;
  regionName: string;
  machineNumber: string;
  invoiceReceiveDate: string;
  bpkbRegistrationDate: string;
  stnkRegistrationDate: string;
  skpdPaymentDate: string;
  bpkbReceivedDate: string;
  stnkReceivedDate: string;
  skpdReceivedDate: string;
  tnkbReceivedDate: string;
  tnkbNumber: string;
  noticeFee: number;
  vendorEmployee: string;
  vehicleType: string;
}

export interface VehicleRegistrationDetail {
  id: number;
  uuid?: string;
  vehicleDocumentId?: number | null;
  vendorId?: number | null;
  dealerId?: number | null;
  regionId?: number | null;
  dealerName: string;
  regionName: string;
  vendorName: string;
  vehicleType: string;
  stnkName: string;
  machineNumber: string;
  invoiceDate: string;
  invoiceReceiveDate: string;
  customerDeliveryDate: string;
  bpkbNumber: string;
  bpkbRegistrationDate: string;
  bpkbReceivedDate: string;
  bpkbPhysicalStatus: boolean | null;
  stnkRegistrationDate: string;
  stnkReceivedDate: string;
  stnkPhysicalStatus: boolean | null;
  skpdPaymentDate: string;
  skpdReceivedDate: string;
  skpdPhysicalStatus: boolean | null;
  tnkbReceivedDate: string;
  tnkbNumber: string;
  tnkbPhysicalStatus: boolean | null;
  stckFee: number;
  bbnRegistrationFee: number;
  noticeFee: number;
  pmiFee: number;
  physicalCheckFee: number;
  nikValidationFee: number;
  garwilFee: number;
  builtUpFee: number;
  accelerationFee: number;
  plateRecommendationFee: number;
  serviceFee: number;
  skpdFee: number;
}

export interface VehicleDocumentDetail extends VehicleDocumentSummary {
  vendorDetail?: Vendor;
  vehicleDocumentItems: VehicleDocumentItem[];
  vehicleRegistrations: VehicleRegistrationDetail[];
}

export interface VehicleDocumentPayload {
  vendorId: number;
  receiptDate: string;
  description: string;
}

export interface VehicleRegistrationPayload {
  bpkbNumber: string;
  bpkbRegistrationDate: string;
  bpkbReceivedDate: string;
  bpkbPhysicalStatus: boolean;
  stnkRegistrationDate: string;
  stnkReceivedDate: string;
  stnkPhysicalStatus: boolean;
  skpdPaymentDate: string;
  skpdReceivedDate: string;
  skpdPhysicalStatus: boolean;
  tnkbReceivedDate: string;
  tnkbNumber: string;
  tnkbPhysicalStatus: boolean;
  stckFee: string;
  bbnRegistrationFee: string;
  noticeFee: string;
  pmiFee: string;
  physicalCheckFee: string;
  nikValidationFee: string;
  garwilFee: string;
  builtUpFee: string;
  accelerationFee: string;
  plateRecommendationFee: string;
  serviceFee: string;
  skpdFee: string;
  customerDeliveryDate: string;
}

export interface VehicleDocumentFilters {
  search?: string;
}

export type VehicleDocumentListResponse = PaginatedResult<VehicleDocumentSummary>;

export interface VehicleRegistrationFilters {
  search?: string;
  vendorId?: number | null;
  vehicleDocumentId?: number | null;
  isAlreadyProcessed?: boolean | null;
}

export type VehicleRegistrationListResponse = PaginatedResult<VehicleRegistrationDetail>;
