import type { PaginationParams } from '@/@types/pagination.types';
import type {
  VehicleDocumentDetail,
  VehicleDocumentFilters,
  VehicleDocumentItem,
  VehicleDocumentListResponse,
  VehicleDocumentPayload,
  VehicleRegistrationFilters,
  VehicleDocumentSummary,
  VehicleRegistrationDetail,
  VehicleRegistrationListResponse,
  VehicleRegistrationPayload,
} from '@/@types/vehicle-document.types';
import { apiClient } from '@/lib/api/client';
import { buildLaravelPaginationQuery } from '@/lib/api/pagination';
import { ApiResponseError, ApiValidationError, ensureSuccess, LaravelApiResponse, toPaginatedResult } from '@/lib/api/response';

const documentBasePath = '/wapi/transaction/vehicle-document';
const registrationBasePath = '/wapi/transaction/vehicle-registration';

const text = (value: unknown) => String(value ?? '').trim();
const numberValue = (value: unknown) => {
  if (value == null || value === '') return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};
const boolValue = (value: unknown): boolean | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  const normalized = String(value).toLowerCase();
  if (['true', '1', 'yes', 'good', 'available'].includes(normalized)) return true;
  if (['false', '0', 'no', 'bad', 'missing'].includes(normalized)) return false;
  return null;
};

const coalesceText = (...values: unknown[]) => {
  for (const value of values) {
    const normalized = text(value);
    if (normalized) return normalized;
  }
  return '';
};

const getVehicleDataNode = (item: any) => item?.vehicle_data ?? item?.vehicleDocumentItem?.vehicle_data ?? item?.vehicle_document_item?.vehicle_data ?? item?.vehicle_document_item ?? item;
const getVendorNode = (item: any) => item?.vendor ?? item?.vendor_employee ?? item?.employee_vendor ?? null;
const getDealerLabel = (vehicle: any, item?: any) =>
  coalesceText(
    vehicle?.dealer?.name,
    vehicle?.dealer?.nama_dealer,
    vehicle?.dealer_name,
    item?.dealer?.name,
    item?.dealer?.nama_dealer,
    item?.dealer_name,
    vehicle?.dealer_id ? `Dealer ID ${vehicle.dealer_id}` : '',
  );
const getRegionLabel = (vehicle: any, item?: any) =>
  coalesceText(
    vehicle?.region?.name,
    vehicle?.region_name,
    item?.region?.name,
    item?.region_name,
    vehicle?.region_id ? `Wilayah ID ${vehicle.region_id}` : '',
  );
const getVendorEmployeeLabel = (item: any, parentVendorName?: string) =>
  coalesceText(
    item?.vendor_employee?.name,
    item?.employee_vendor?.name,
    item?.vendor?.name,
    item?.vendor_employee_name,
    parentVendorName,
  );

const mapVehicleDocumentSummary = (item: any): VehicleDocumentSummary => ({
  id: Number(item.id),
  uuid: text(item.uuid),
  code: text(item.code),
  vendorId: Number(item.vendor_id ?? item.vendor?.id ?? 0),
  receiptDate: text(item.receipt_date),
  description: text(item.description),
  processedCount: numberValue(item.processed_count),
  unprocessedCount: numberValue(item.unprocessed_count),
  createdAt: item.created_at,
  updatedAt: item.updated_at,
  vendor: item.vendor
    ? {
        id: Number(item.vendor.id),
        name: text(item.vendor.name),
        code: text(item.vendor.code),
      }
    : undefined,
});

const mapVehicleRegistrationDetail = (item: any, parentVendorName?: string): VehicleRegistrationDetail => {
  const vehicle = getVehicleDataNode(item);
  const vendor = getVendorNode(item);

  return {
    id: Number(item.id),
    uuid: text(item.uuid),
    vehicleDocumentId: item.vehicle_document_id == null ? null : Number(item.vehicle_document_id),
    vendorId: item.vendor_id == null ? null : Number(item.vendor_id),
    dealerId: vehicle?.dealer_id == null ? null : Number(vehicle.dealer_id),
    regionId: vehicle?.region_id == null ? null : Number(vehicle.region_id),
    dealerName: getDealerLabel(vehicle, item),
    regionName: getRegionLabel(vehicle, item),
    vendorName: coalesceText(vendor?.name, parentVendorName),
    vehicleType: coalesceText(vehicle?.vehicle_type, item.vehicle_type),
    stnkName: coalesceText(vehicle?.stnk_name, item.stnk_name),
    machineNumber: coalesceText(vehicle?.machine_number, item.machine_number),
    invoiceDate: coalesceText(vehicle?.invoice_date, item.invoice_date),
    invoiceReceiveDate: coalesceText(vehicle?.invoice_receive_date, item.invoice_receive_date),
    customerDeliveryDate: text(item.customer_delivery_date),
    bpkbNumber: text(item.bpkb_number),
    bpkbRegistrationDate: text(item.bpkb_registration_date),
    bpkbReceivedDate: text(item.bpkb_received_date),
    bpkbPhysicalStatus: boolValue(item.bpkb_physical_status),
    stnkRegistrationDate: text(item.stnk_registration_date),
    stnkReceivedDate: text(item.stnk_received_date),
    stnkPhysicalStatus: boolValue(item.stnk_physical_status),
    skpdPaymentDate: text(item.skpd_payment_date),
    skpdReceivedDate: text(item.skpd_received_date),
    skpdPhysicalStatus: boolValue(item.skpd_physical_status),
    tnkbReceivedDate: text(item.tnkb_received_date),
    tnkbNumber: text(item.tnkb_number),
    tnkbPhysicalStatus: boolValue(item.tnkb_physical_status),
    stckFee: numberValue(item.stck_fee),
    bbnRegistrationFee: numberValue(item.bbn_registration_fee),
    noticeFee: numberValue(item.notice_fee),
    pmiFee: numberValue(item.pmi_fee),
    physicalCheckFee: numberValue(item.physical_check_fee),
    nikValidationFee: numberValue(item.nik_validation_fee),
    garwilFee: numberValue(item.garwil_fee),
    builtUpFee: numberValue(item.built_up_fee),
    accelerationFee: numberValue(item.acceleration_fee),
    plateRecommendationFee: numberValue(item.plate_recommendation_fee),
    serviceFee: numberValue(item.service_fee),
    skpdFee: numberValue(item.skpd_fee),
  };
};

const mapVehicleDocumentItem = (item: any, parentVendorName?: string): VehicleDocumentItem => {
  const vehicle = getVehicleDataNode(item);

  return {
    id: Number(item.id ?? item.vehicle_registration_id ?? 0),
    registrationId: Number(item.vehicle_registration_id ?? item.registration_id ?? item.id ?? 0),
    vehicleDataId: item.vehicle_data_id == null ? null : Number(item.vehicle_data_id),
    dealerId: vehicle?.dealer_id == null ? null : Number(vehicle.dealer_id),
    regionId: vehicle?.region_id == null ? null : Number(vehicle.region_id),
    dealerName: getDealerLabel(vehicle, item),
    stnkName: coalesceText(vehicle?.stnk_name, item.stnk_name),
    regionName: getRegionLabel(vehicle, item),
    machineNumber: coalesceText(vehicle?.machine_number, item.machine_number),
    invoiceReceiveDate: coalesceText(vehicle?.invoice_receive_date, item.invoice_receive_date),
    bpkbRegistrationDate: text(item.bpkb_registration_date),
    stnkRegistrationDate: text(item.stnk_registration_date),
    skpdPaymentDate: text(item.skpd_payment_date),
    bpkbReceivedDate: text(item.bpkb_received_date),
    stnkReceivedDate: text(item.stnk_received_date),
    skpdReceivedDate: text(item.skpd_received_date),
    tnkbReceivedDate: text(item.tnkb_received_date),
    tnkbNumber: text(item.tnkb_number),
    noticeFee: numberValue(item.notice_fee),
    vendorEmployee: getVendorEmployeeLabel(item, parentVendorName),
    vehicleType: coalesceText(vehicle?.vehicle_type, item.vehicle_type),
  };
};

const mergeDocumentTableItems = (detail: any): VehicleDocumentItem[] => {
  const parentVendorName = text(detail?.vendor?.name);
  const registrations = Array.isArray(detail?.vehicle_registrations) ? detail.vehicle_registrations.map((item: any) => mapVehicleDocumentItem(item, parentVendorName)) : [];
  if (registrations.length) return registrations;
  return Array.isArray(detail?.vehicle_document_items) ? detail.vehicle_document_items.map((item: any) => mapVehicleDocumentItem(item, parentVendorName)) : [];
};

export const getVehicleDocuments = async (
  params: PaginationParams & VehicleDocumentFilters = { page: 1, perPage: 25 },
): Promise<VehicleDocumentListResponse> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(documentBasePath, {
    params: buildLaravelPaginationQuery(params),
  });
  const data = ensureSuccess(response.data);

  return toPaginatedResult(
    {
      data: data.data ?? [],
      current_page: data.current_page,
      per_page: data.per_page,
      total: data.total,
      last_page: data.last_page,
    },
    mapVehicleDocumentSummary,
  );
};

export const getVehicleRegistrations = async (
  params: PaginationParams & VehicleRegistrationFilters = { page: 1, perPage: 25 },
): Promise<VehicleRegistrationListResponse> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(registrationBasePath, {
    params: {
      ...buildLaravelPaginationQuery(params),
      vendor_id: params.vendorId ?? undefined,
      vehicle_document_id: params.vehicleDocumentId ?? undefined,
      is_already_processed: params.isAlreadyProcessed == null ? undefined : String(params.isAlreadyProcessed),
    },
  });
  const data = ensureSuccess(response.data);

  return toPaginatedResult(
    {
      data: data.data ?? [],
      current_page: data.current_page,
      per_page: data.per_page,
      total: data.total,
      last_page: data.last_page,
    },
    (item) => mapVehicleRegistrationDetail(item),
  );
};

export const getVehicleDocumentDetail = async (id: string | number): Promise<VehicleDocumentDetail> => {
  const response = await apiClient.get<LaravelApiResponse<any>>(`${documentBasePath}/${id}`);
  const data = ensureSuccess(response.data);

  return {
    ...mapVehicleDocumentSummary(data),
    vendorDetail: data.vendor
      ? {
          id: Number(data.vendor.id),
          uuid: text(data.vendor.uuid),
          code: text(data.vendor.code),
          type: text(data.vendor.type),
          name: text(data.vendor.name),
          address: text(data.vendor.address),
          npwp: text(data.vendor.npwp),
          phone: text(data.vendor.phone),
          picName: text(data.vendor.pic_name),
          identityNumber: data.vendor.identity_number,
          driveLicenseIdentityNumber: data.vendor.drive_license_identity_number,
          image: data.vendor.image,
          mapLink: data.vendor.map_link,
          socialMedia1Link: data.vendor.social_media_1_link,
          socialMedia2Link: data.vendor.social_media_2_link,
          socialMedia3Link: data.vendor.social_media_3_link,
          socialMedia4Link: data.vendor.social_media_4_link,
          websiteLink: data.vendor.website_link,
          createdAt: data.vendor.created_at,
          updatedAt: data.vendor.updated_at,
        }
      : undefined,
    vehicleDocumentItems: mergeDocumentTableItems(data),
    vehicleRegistrations: Array.isArray(data.vehicle_registrations) ? data.vehicle_registrations.map((item: any) => mapVehicleRegistrationDetail(item, text(data.vendor?.name))) : [],
  };
};

const buildVehicleDocumentPayload = (payload: Partial<VehicleDocumentPayload>, withMethodSpoof = false) => {
  const body = new URLSearchParams();
  if (withMethodSpoof) body.append('_method', 'PUT');
  if (payload.vendorId) body.append('vendor_id', String(payload.vendorId));
  if (payload.receiptDate) body.append('receipt_date', payload.receiptDate);
  if (payload.description != null) body.append('description', payload.description);
  return body;
};

export const createVehicleDocument = async (payload: Partial<VehicleDocumentPayload>): Promise<VehicleDocumentDetail> => {
  try {
    const response = await apiClient.post<LaravelApiResponse<any>>(documentBasePath, buildVehicleDocumentPayload(payload), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return getVehicleDocumentDetail(ensureSuccess(response.data).id ?? ensureSuccess(response.data).data?.id ?? 0);
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const updateVehicleDocument = async (id: string | number, payload: Partial<VehicleDocumentPayload>): Promise<void> => {
  try {
    const response = await apiClient.post<LaravelApiResponse<any>>(`${documentBasePath}/${id}`, buildVehicleDocumentPayload(payload, true), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!response.data.status) {
      throw new ApiResponseError(response.data.message ?? 'Failed to update vehicle document');
    }
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};

export const deleteVehicleDocument = async (id: string | number): Promise<void> => {
  const response = await apiClient.delete<LaravelApiResponse<any>>(`${documentBasePath}/${id}`);
  if (!response.data.status) {
    throw new ApiResponseError(response.data.message ?? 'Failed to delete vehicle document');
  }
};

export const importVehicleDocument = async (file: File): Promise<void> => {
  const body = new FormData();
  body.append('file', file);
  const response = await apiClient.post<LaravelApiResponse<any>>(`${documentBasePath}/import`, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (!response.data.status) {
    throw new ApiResponseError(response.data.message ?? 'Failed to import vehicle document');
  }
};

export const exportVehicleDocument = async (): Promise<void> => {
  const response = await apiClient.get(`${documentBasePath}/export`, { responseType: 'blob' });
  const contentType = response.headers['content-type'];
  const isJson = contentType && contentType.includes('application/json');

  if (isJson) {
    const textData = await (response.data as Blob).text();
    const jsonResponse = JSON.parse(textData);
    throw new ApiResponseError(jsonResponse.message ?? 'Failed to export vehicle document');
  }

  const url = window.URL.createObjectURL(new Blob([response.data as Blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Vehicle_Document_${Date.now()}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const buildVehicleRegistrationPayload = (payload: Partial<VehicleRegistrationPayload>) => {
  const body = new URLSearchParams();
  body.append('_method', 'PUT');
  if (payload.bpkbNumber != null) body.append('bpkb_number', payload.bpkbNumber);
  if (payload.bpkbRegistrationDate) body.append('bpkb_registration_date', payload.bpkbRegistrationDate);
  if (payload.bpkbReceivedDate) body.append('bpkb_received_date', payload.bpkbReceivedDate);
  if (payload.bpkbPhysicalStatus != null) body.append('bpkb_physical_status', String(payload.bpkbPhysicalStatus));
  if (payload.stnkRegistrationDate) body.append('stnk_registration_date', payload.stnkRegistrationDate);
  if (payload.stnkReceivedDate) body.append('stnk_received_date', payload.stnkReceivedDate);
  if (payload.stnkPhysicalStatus != null) body.append('stnk_physical_status', String(payload.stnkPhysicalStatus));
  if (payload.skpdPaymentDate) body.append('skpd_payment_date', payload.skpdPaymentDate);
  if (payload.skpdReceivedDate) body.append('skpd_received_date', payload.skpdReceivedDate);
  if (payload.skpdPhysicalStatus != null) body.append('skpd_physical_status', String(payload.skpdPhysicalStatus));
  if (payload.tnkbReceivedDate) body.append('tnkb_received_date', payload.tnkbReceivedDate);
  if (payload.tnkbNumber != null) body.append('tnkb_number', payload.tnkbNumber);
  if (payload.tnkbPhysicalStatus != null) body.append('tnkb_physical_status', String(payload.tnkbPhysicalStatus));
  if (payload.stckFee != null) body.append('stck_fee', payload.stckFee);
  if (payload.bbnRegistrationFee != null) body.append('bbn_registration_fee', payload.bbnRegistrationFee);
  if (payload.noticeFee != null) body.append('notice_fee', payload.noticeFee);
  if (payload.pmiFee != null) body.append('pmi_fee', payload.pmiFee);
  if (payload.physicalCheckFee != null) body.append('physical_check_fee', payload.physicalCheckFee);
  if (payload.nikValidationFee != null) body.append('nik_validation_fee', payload.nikValidationFee);
  if (payload.garwilFee != null) body.append('garwil_fee', payload.garwilFee);
  if (payload.builtUpFee != null) body.append('built_up_fee', payload.builtUpFee);
  if (payload.accelerationFee != null) body.append('acceleration_fee', payload.accelerationFee);
  if (payload.plateRecommendationFee != null) body.append('plate_recommendation_fee', payload.plateRecommendationFee);
  if (payload.serviceFee != null) body.append('service_fee', payload.serviceFee);
  if (payload.skpdFee != null) body.append('skpd_fee', payload.skpdFee);
  if (payload.customerDeliveryDate) body.append('customer_delivery_date', payload.customerDeliveryDate);
  return body;
};

export const updateVehicleRegistration = async (id: string | number, payload: Partial<VehicleRegistrationPayload>): Promise<void> => {
  try {
    const response = await apiClient.post<LaravelApiResponse<any>>(`${registrationBasePath}/${id}`, buildVehicleRegistrationPayload(payload), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!response.data.status) {
      throw new ApiResponseError(response.data.message ?? 'Failed to update vehicle registration');
    }
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw error;
  }
};
