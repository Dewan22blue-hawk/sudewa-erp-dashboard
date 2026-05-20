import type { Customer } from './customer.types';
import type { PaginatedResult, PaginationParams } from './pagination.types';

export type OrderListStatus = 'deliver' | 'process' | 'pending' | 'reject';
export type OrderListVehicleType = 'towing' | 'cdd' | 'fuso';

export interface OrderListCustomer extends Partial<Customer> {
  id: number;
  name: string;
  code?: string;
  address?: string | null;
}

export interface OrderListVehicle {
  id: number;
  uuid?: string;
  registrationNumber: string;
  type: string;
}

export interface OrderListTarifReference {
  id: number;
  uuid?: string;
  customerId?: number;
  loadingIn: string;
  loadingOut: string;
  distance?: number;
  ujTowing?: number | null;
  ujCdd?: number | null;
  ujFuso?: number | null;
  invCdd?: number | null;
  invFuso?: number | null;
  customer?: Partial<Customer>;
}

export interface OrderListTarifItem {
  id: number;
  uuid?: string;
  doOrderListId: number;
  tarifId: number;
  qty: number;
  loadContent: string;
  deliveryDestination: string;
  vehicleType?: OrderListVehicleType | null;
  loadingIn: string;
  loadingOut: string;
  driverFee: number;
  expeditionInvoice: number;
  tarif?: OrderListTarifReference;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderList {
  id: number;
  uuid?: string;
  code: string;
  customerId: number;
  status: OrderListStatus;
  billInvoice: number;
  ppn: number;
  note: string;
  ujDriver: number;
  loadingIn: string;
  loadingOut: string;
  vehicles: OrderListVehicle[];
  customer?: OrderListCustomer;
  tarifs: OrderListTarifItem[];
  expeditions: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderListListParams extends PaginationParams {
  order_by?: string;
  order_sort?: 'asc' | 'desc';
}

export interface OrderListTarifListParams extends PaginationParams {
  order_by?: string;
  order_sort?: 'asc' | 'desc';
  do_orderlist_id?: number | string;
}

export interface CreateOrderListPayload {
  customer_id: number;
  status: OrderListStatus;
  bill_invoice: number;
  note?: string;
  ppn?: number;
  uj_driver?: number;
  loading_in?: string;
  loading_out?: string;
}

export interface UpdateOrderListPayload {
  customer_id: number;
  status: Exclude<OrderListStatus, 'reject'> | OrderListStatus;
  invoice_bill: number;
  bill_invoice?: number;
  note?: string;
  ppn?: number;
  uj_driver?: number;
  loading_in?: string;
  loading_out?: string;
}

export interface CreateOrderListTarifPayload {
  do_orderlist_id: number;
  tarif_id: number;
  qty: number;
  load_content: string;
  delivery_destination: string;
  vehicle_type?: OrderListVehicleType;
}

export interface UpdateOrderListTarifPayload {
  qty: number;
  vehicle_type: OrderListVehicleType;
  load_content: string;
  delivery_destination: string;
}

export type OrderListListResponse = PaginatedResult<OrderList>;
export type OrderListTarifListResponse = PaginatedResult<OrderListTarifItem>;
