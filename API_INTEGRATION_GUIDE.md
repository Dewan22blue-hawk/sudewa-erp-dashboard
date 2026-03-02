# API Integration Guide (Frontend)

Panduan ringkas untuk mengintegrasikan endpoint backend (master data dan fitur lain) di Next.js.

## Blueprint Cepat (Checklist Praktis)

Gunakan langkah ini setiap menambah fitur API baru:

1. **Kenali endpoint**: catat base path, metode (GET/POST/PUT/DELETE), Content-Type yang diminta (JSON vs form-url-encoded vs multipart), dan field wajib + optional.
2. **Tipe & kontrak**: tambah tipe domain di `src/@types` (response + payload). Sertakan mapper bila nama field backend snake_case.
3. **Service**: buat fungsi di `src/services/<domain>.service.ts`:

- Tetapkan `basePath`.
- Mapper raw → domain.
- Bangun payload sesuai Content-Type (URLSearchParams untuk form-url-encoded; FormData bila upload; JSON default).
- Tangani validation/response error (lempar `ApiValidationError` / `ApiResponseError`).

4. **Hooks (React Query)**: di `src/hooks/` buat `use<Domain>s`, `use<Domain>`, `useCreate/Update/Delete<Domain>` dengan `queryKey` konsisten dan invalidasi pada `onSuccess`.
5. **Schema (Form)**: definisikan Zod schema di `src/scheme/` dan turunan tipe form. Tambahkan normalisasi (mis. `debit` → `debet`).
6. **UI**: komponen feature (Form modal, Table/List) konsumsi hooks + schema. Map error backend field snake_case ke camelCase sebelum setError.
7. **Env & base URL**: pastikan `NEXT_PUBLIC_API_URL` menunjuk host yang benar; fallback sudah hawk-dev. Restart dev server jika env berubah.
8. **QA cepat**:

- Cek Network: host, path, method, Content-Type, payload.
- Jika 200 tapi data tak berubah: periksa Content-Type & field yang dikirim.
- Pastikan query invalidation dijalankan setelah mutasi.

9. **Dokumentasi mini**: catat di komentar service atau README singkat tentang payload/Content-Type khusus agar reuse mudah.

## Struktur Folder

- `src/lib/api/`
  - `client.ts`: axios instance + interceptor auth.
  - `pagination.ts`, `response.ts`: helper query & mapper pagination.
- `src/@types/`: definisi tipe domain (mis. `account.types.ts`, `account-group.types.ts`).
- `src/services/`: pemanggilan API per domain + mapping response/payload.
- `src/hooks/`: React Query hooks per domain (GET list/detail, POST/PUT/DELETE) + invalidasi cache.
- `src/scheme/`: skema validasi form (Zod) + tipe turunan form.
- `src/components/ui/`: komponen UI atomik.
- `src/components/features/`: komponen domain (Form modal, Table, List page section).
- `src/pages` atau `src/app`: routing & wiring halaman.

## Konvensi Endpoint Master Data (contoh: Akun)

- Base path: `/wapi/master-data/account`
- GET list: query `page`, `per_page`, `search?` (tanpa `company_id`).
- POST/PUT: `application/x-www-form-urlencoded` (gunakan `URLSearchParams`).
- Field wajib: `account_group_id`, `code`, `name`, `description?`, `type` (`debet`/`credit`; normalisasi `debit` → `debet`).
- DELETE: `/wapi/master-data/account/:id`.

## Contoh Service (ringkas)

```ts
const basePath = '/wapi/master-data/account';

export const mapAccount = (p: AccountApiModel): Account => ({
  id: p.id,
  code: p.code,
  name: p.name,
  accountGroupId: p.account_group_id,
  accountGroupName: p.account_group_name ?? p.account_group?.name,
  type: p.type === 'debit' ? 'debet' : p.type,
  description: p.description ?? null,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
});

export const getAccounts = async (params: PaginationParams & { search?: string }) => {
  const res = await apiClient.get<PaginatedAccountResponse>(basePath, {
    params: buildLaravelPaginationQuery(params),
  });
  return toPaginatedResult(ensureSuccess(res.data), mapAccount);
};

export const updateAccount = async (id: number | string, payload: AccountPayload) => {
  const type = payload.type === 'debit' ? 'debet' : (payload.type ?? 'debet');
  const body = new URLSearchParams();
  body.append('account_group_id', String(payload.accountGroupId));
  body.append('code', payload.code);
  body.append('name', payload.name);
  if (payload.description) body.append('description', payload.description);
  body.append('type', type);
  const res = await apiClient.put<AccountItemResponse>(`${basePath}/${id}`, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return mapAccount(ensureSuccess(res.data));
};
```

## Contoh Hook (React Query)

```ts
export const useAccounts = (params: PaginationParams & { search?: string; enabled?: boolean }) => {
  const { enabled = true, ...rest } = params;
  return useQuery({
    queryKey: ['accounts', rest],
    queryFn: () => getAccounts(rest),
    enabled,
    placeholderData: (p) => p,
  });
};

export const useUpdateAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: AccountPayload }) => updateAccount(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
};
```

## Contoh Schema (Form)

```ts
export const accountSchema = z.object({
  accountGroupId: z.number().positive('Grup akun wajib dipilih'),
  code: z.string().min(1, 'Kode akun wajib diisi'),
  name: z.string().min(1, 'Nama akun wajib diisi'),
  description: z.string().optional(),
  type: z.enum(['debet', 'credit', 'debit']), // normalize ke debet saat kirim
});
export type AccountFormValues = z.infer<typeof accountSchema>;
```

## Pola UI (Modal + Table)

- Form modal: gunakan `react-hook-form` + `zodResolver(accountSchema)`, onSubmit panggil mutation (create/update).
- Table: tampilkan `accountGroupName` di kolom grup, `type` di kolom kategori, gunakan `onEdit`/`onDelete` handler untuk buka modal/hapus.

## Error Handling

- Laravel validation: map field snake_case ke camelCase di form (mis. `account_group_id` → `accountGroupId`).
- Tampilkan toast/inline error; lempar `ApiValidationError`/`ApiResponseError` dari layer service.

## Invalidasi Cache

- Setelah POST/PUT/DELETE: `invalidateQueries(['accounts'])`, dan detail jika ada.

## Content-Type Checklist

- Form data sederhana (tanpa file): pakai `application/x-www-form-urlencoded` (`URLSearchParams`).
- Upload file: gunakan `FormData` dan biarkan browser set boundary.
- JSON: default axios (tidak perlu atur header kecuali khusus).

## Base URL & Auth

- Env: `NEXT_PUBLIC_API_URL` menunjuk ke host backend. Fallback diset ke hawk-dev.
- Auth: Bearer token ditambahkan via interceptor (`lib/api/client.ts`).

## Flow Implementasi Fitur Baru

1. Tambah tipe di `@types`.
2. Buat service (endpoint, mapper, payload normalisasi).
3. Buat hooks React Query (list/detail/mutasi + invalidasi).
4. Buat schema Zod untuk form.
5. Buat komponen feature (Form, Table/List).
6. Wire di page/app (state modal, handler CRUD, pagination/search).

## Catatan Normalisasi

- Field `type`: jika input `debit`, kirim sebagai `debet` (sesuai backend).
- Jangan sertakan `company_id` untuk master data kecuali diminta oleh endpoint.

## Debug Cepat

- Pastikan base URL benar (env).
- Cek Network tab: host, path, method, Content-Type, body sesuai.
- Jika 200 tetapi data tidak berubah: periksa Content-Type & payload field.
- Invalidasi query setelah mutasi untuk refresh UI.
