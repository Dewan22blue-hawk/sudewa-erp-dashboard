// src/@types/purchase.types.ts

export type Currency = 'IDR' | 'USD';
export type UnitTransactionType = 'purchase' | 'sales';

export interface PurchaseUnit {
  id: string;
  purchaseId: string;
  typeUnitId: string;
  typeUnitName: string;

  qty: number;
  price: number;

  biayaBBN: number;
  biayaEkspedisi: number;
  biayaLain: number;

  hpp: number;
  dpp: number;
  ppn: number;
  total: number;
}

export interface PurchaseUnitItemDetail {
  id: string;
  uuid?: string;
  purchaseId?: string; // from parent unit_transaction
  unitTransactionItemId?: string;
  color?: string;
  machineNumber?: string;
  chassisNumber?: string;
  inStock?: boolean;
  createdAt?: string;
}

export interface Purchase {
  id: string;
  code: string;
  date: string;
  supplierName: string;
  companyId: string;
  stockState?: string;
  maxCapacity?: number;
  warehouseName?: string;
  warehouseId?: string;

  totalDpp: number;
  totalPpn: number;
  totalBiaya: number;
  totalPurchase: number;

  totalPaid: number;
  remainingPayment: number;

  units: PurchaseUnit[];

  createdAt: string;
  updatedAt: string;
}

/* ============================
   REQUEST TYPES
============================ */

export interface CreatePurchaseRequest {
  warehouse_id: number;
  person_id: number;
  company_id: number;
  code?: string;
  type: UnitTransactionType;
  max_capacity: string;
  stock_state: 'draft';
<<<<<<< HEAD
  unit_type_id?: number;
  sparepart_id?: number;
  qty_total?: number;
  price?: number;
  bbn_price?: number;
  expedition_fee?: number;
  other_fee?: number;
=======
>>>>>>> e6a2b33f9467f195c084c3687a1b0cadbce99988
}

export interface UpdatePurchaseRequest {
  date: string;
  supplierName: string;
}

export interface PurchaseFormValues {
  supplierName: string;
  date: string;
  code: string;
}

export interface CreatePurchaseUnitRequest {
  purchaseId: string;
  typeUnitId: string;
  typeUnitName: string;
  qty: number;
  price: number;
  biayaBBN: number;
  biayaEkspedisi: number;
  biayaLain: number;
}

export interface PurchaseListResponse {
  data: Purchase[];
  total: number;
}

export interface PurchasePaginatedResponse {
  data: Purchase[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}

export interface PurchaseUnitItemRow {
  id: string;
  unitTransactionId: string;
  unitTransactionCode?: string;
  unitTypeId?: string;
  qtyTotal: number;
  price: number;
  bbnPrice: number;
  expeditionFee: number;
  otherFee: number;
  hppPerUnit: number;
  dppPerUnit: number;
  ppnPerUnit: number;
  hppTotal: number;
  dppTotal: number;
  ppnTotal: number;
  totalDpp?: number;
  totalPpn?: number;
  totalPurchase?: number;
  createdAt?: string;
}

export interface PurchaseUnitItemPaginatedResponse {
  data: PurchaseUnitItemRow[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}
