import React, { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoneyInput } from '@/components/ui/money-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FinanceAssetPayload } from '@/@types/finance-asset.types';
import { useAssets } from '@/hooks/useAsset';
import { useCompany } from '@/contexts/CompanyContext';
import { Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface FinanceAssetCreateFormProps {
    onSave: (data: FinanceAssetPayload) => void;
    onCancel: () => void;
    isSaving?: boolean;
}

export function FinanceAssetCreateForm({ onSave, onCancel, isSaving = false }: FinanceAssetCreateFormProps) {
    const { companyId } = useCompany();
    // Use large perPage to get all assets for the select dropdown
    const { data: assetsData, isLoading: isLoadingAssets } = useAssets(companyId, { perPage: 1000 }); 
    const assetsList = assetsData?.data || [];

    const { register, handleSubmit, control, setValue, watch } = useForm<FinanceAssetPayload>({
        defaultValues: {
            asset_id: 0,
            price: 0,
            purchase_date: '',
            economic_age: 0,
            description: '',
            serial_number: '',
            depreciation: 0,
            final_value: 0,
        }
    });

    const economicAge = watch('economic_age');
    const depreciation = watch('depreciation') || 0;
    const price = watch('price') || 0;
    const totalMonths = economicAge > 0 ? economicAge * 12 : 0;

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (totalMonths > 0 && Number(price) > 0) {
            const monthlyDepreciation = Math.round(Number(price) / totalMonths);
            setValue('depreciation', monthlyDepreciation);

            const finalValue = Math.max(0, Number(price) - (monthlyDepreciation * totalMonths));
            setValue('final_value', Math.round(finalValue));
            return;
        }

        setValue('depreciation', 0);
        setValue('final_value', Number(price) > 0 ? Math.round(Number(price)) : 0);
    }, [price, setValue, totalMonths]);

    const onSubmit = (data: FinanceAssetPayload) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-md">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Tambah Aset Finance</h2>
                        <div className="h-px bg-gray-100 mt-4" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Master Aset</Label>
                            <Controller
                                control={control}
                                name="asset_id"
                                rules={{ required: 'Pilih master aset', min: { value: 1, message: 'Pilih master aset' } }}
                                render={({ field }) => (
                                    <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(Number(val))}>
                                        <SelectTrigger className="w-full bg-white border-gray-200">
                                            <SelectValue placeholder={isLoadingAssets ? "Memuat..." : "Pilih Master Aset"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {assetsList.map((asset) => (
                                                <SelectItem key={asset.id} value={String(asset.id)}>
                                                    {asset.code} - {asset.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Tanggal Beli</Label>
                            <Input
                                type="date"
                                {...register('purchase_date', { required: 'Tanggal beli wajib diisi' })}
                                className="border-gray-200 bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Harga Beli</Label>
                            <Controller
                                control={control}
                                name="price"
                                rules={{ required: 'Harga beli wajib diisi' }}
                                render={({ field }) => (
                                    <MoneyInput
                                        value={Number(field.value)}
                                        onChangeValue={field.onChange}
                                        placeholder="Masukkan Harga Beli"
                                        className="bg-white border-gray-200"
                                    />
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="serial_number" className="text-sm font-semibold text-gray-900">Serial Number</Label>
                            <Input
                                id="serial_number"
                                placeholder="Masukkan serial number"
                                {...register('serial_number')}
                                className="border-gray-200 bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="economic_age" className="text-sm font-semibold text-gray-900">Umur Ekonomis</Label>
                            <div className="relative">
                                <Input
                                    id="economic_age"
                                    type="number"
                                    placeholder="Contoh: 4"
                                    {...register('economic_age', { valueAsNumber: true, required: 'Umur ekonomis wajib diisi' })}
                                    className="border-gray-200 pr-14 bg-white"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Tahun</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="depreciation" className="text-sm font-semibold text-gray-900">
                                Penyusutan/Bulan <span className="ml-1 text-xs text-blue-500 font-normal">(Auto)</span>
                            </Label>
                            <Controller
                                control={control}
                                name="depreciation"
                                render={({ field }) => (
                                    <MoneyInput
                                        id="depreciation"
                                        value={Number(field.value)}
                                        onChangeValue={field.onChange}
                                        placeholder="Rp 0"
                                        className="bg-white border-gray-200"
                                    />
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="final_value" className="text-sm font-semibold text-gray-900">
                                Nilai Akhir <span className="ml-1 text-xs text-blue-500 font-normal">(Auto)</span>
                            </Label>
                            <Controller
                                control={control}
                                name="final_value"
                                render={({ field }) => (
                                    <MoneyInput
                                        id="final_value"
                                        value={Number(field.value)}
                                        onChangeValue={field.onChange}
                                        placeholder="Rp 0"
                                        className="bg-white border-gray-200"
                                    />
                                )}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description" className="text-sm font-semibold text-gray-900">Keterangan / Deskripsi</Label>
                            <Textarea
                                id="description"
                                placeholder="Masukkan deskripsi"
                                {...register('description')}
                                className="border-gray-200 bg-white"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    className="px-8 text-gray-500 hover:text-gray-700"
                    onClick={onCancel}
                    disabled={isSaving}
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    className="px-8 bg-[#1e3a5f] hover:bg-[#152e4d] flex items-center gap-2"
                    disabled={isSaving}
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                </Button>
            </div>
        </form>
    );
}
