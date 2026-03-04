export interface Permission {
  id: number | string;
  name: string;
  guard_name?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PermissionListResponse {
  data: Permission[];
}
