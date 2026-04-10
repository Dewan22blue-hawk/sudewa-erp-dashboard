import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { BrandTable } from './BrandTable';
import { BrandFormModal } from './BrandFormModal';
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from '@/hooks/useBrand';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';
import { brandSchema, type BrandFormValues } from '@/scheme/brand.schema';
import type { Brand } from '@/@types/brand.types';
import { toast } from 'sonner';
import { ApiResponseError, ApiValidationError } from '@/lib/api/response';

export const BrandListPage = () => {
    const { page, perPage, search, setPage, setPerPage, setSearch } = useQueryParamsTable({ defaultPerPage: 10 });

    const { data, isLoading, isError, isFetching } = useBrands({ page, perPage, search });
    const createMutation = useCreateBrand();
    const updateMutation = useUpdateBrand();
    const deleteMutation = useDeleteBrand();

    const [selectedToDelete, setSelectedToDelete] = useState<Brand | null>(null);
    const [editing, setEditing] = useState<Brand | null>(null);
    const [openForm, setOpenForm] = useState(false);

    const form = useForm<BrandFormValues>({
        resolver: zodResolver(brandSchema),
        defaultValues: {
            name: '',
            image: null,
        },
    });

    const handleDelete = async () => {
        if (!selectedToDelete) return;
        try {
            await deleteMutation.mutateAsync(selectedToDelete.id);
            toast.success('Merk berhasil dihapus');
        } catch (error) {
            const message = error instanceof ApiResponseError ? error.message : 'Gagal menghapus merk';
            toast.error(message);
        } finally {
            setSelectedToDelete(null);
        }
    };

    const handleAdd = () => {
        setEditing(null);
        form.reset({
            name: '',
            image: null,
        });
        setOpenForm(true);
    };

    const handleEdit = (item: Brand) => {
        setEditing(item);
        form.reset({
            name: item.name,
            image: item.image ?? null,
        });
        setOpenForm(true);
    };

    const handleSubmit = async (values: BrandFormValues) => {
        try {
            if (editing) {
                await updateMutation.mutateAsync({ id: editing.id, payload: values });
                toast.success('Merk berhasil diperbarui');
            } else {
                await createMutation.mutateAsync(values);
                toast.success('Merk berhasil dibuat');
            }
            setOpenForm(false);
            setEditing(null);
        } catch (error) {
            if (error instanceof ApiValidationError) {
                Object.entries(error.fieldErrors).forEach(([field, messages]) => {
                    form.setError(field as keyof BrandFormValues, { message: messages?.[0] || 'Validasi gagal' });
                });
                toast.error(error.message || 'Validasi gagal');
                return;
            }
            toast.error(editing ? 'Gagal memperbarui merk' : 'Gagal membuat merk');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Merk Unit Tipe</h1>
                        <p className="text-sm text-muted-foreground">Kelola semua merk unit tipe</p>
                    </div>
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Merk
                    </Button>
                </div>

                <Card className="p-6">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari merk..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {isError ? (
                        <div className="py-10 text-center text-red-600">Gagal memuat data merk</div>
                    ) : (
                        <BrandTable
                            data={data?.data ?? []}
                            meta={data?.meta}
                            search={search}
                            page={page}
                            perPage={perPage}
                            isLoading={isLoading || isFetching}
                            onEdit={handleEdit}
                            onDelete={setSelectedToDelete}
                            onPageChange={setPage}
                            onPerPageChange={setPerPage}
                        />
                    )}
                </Card>
            </div>

            <BrandFormModal
                open={openForm}
                onOpenChange={setOpenForm}
                form={form}
                onSubmit={handleSubmit}
                title={editing ? 'Edit Merk Unit' : 'Tambah Merk Unit'}
                description={editing ? 'Perbarui informasi merk unit' : 'Masukkan informasi merk unit baru'}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                submitLabel={editing ? 'Perbarui' : 'Simpan'}
            />

            <AlertDialog open={!!selectedToDelete} onOpenChange={(open) => !open && setSelectedToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Merk?</AlertDialogTitle>
                        <AlertDialogDescription>Tindakan ini tidak dapat dikembalikan. Data yang dihapus akan hilang permanen.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
};
