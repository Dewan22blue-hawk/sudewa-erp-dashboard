import React, { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoneyInput } from '@/components/ui/money-input';
import type { FinanceAsset, FinanceAssetPayload } from '@/@types/finance-asset.types';
import { Save } from 'lucide-react';

interface FinanceAssetEditFormProps {
    initialData: FinanceAsset;
    onSave: (data: Partial<FinanceAssetPayload>) => void;
    onCancel: () => void;
    isSaving?: boolean;
}

export function FinanceAssetEditForm({ initialData, onSave, onCancel, isSaving = false }: FinanceAssetEditFormProps) {
    const { register, handleSubmit, control, setValue, watch } = useForm<FinanceAssetPayload>({
        defaultValues: {
            economic_age: initialData.economic_age || 0,
            depreciation: initialData.depreciation || 0,
            description: initialData.description || '',
            serial_number: initialData.serial_number || '',
            final_value: initialData.final_value || 0,
        }
    });

    const economicAge = watch('economic_age');
    const depreciation = watch('depreciation');
    const price = initialData.price || 0;
    const totalMonths = economicAge > 0 ? economicAge * 12 : 0;

    // Ref to track first render — skip auto-calculate on initial page load
    // so we don't override saved data from the database.
    const isFirstRender = useRef(true);

    // UX Helper: Auto-calculate when economic_age changes
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return; // Skip: preserve the saved depreciation & final_value
        }
        if (totalMonths > 0 && price > 0) {
            const monthlyDepreciation = Math.round(price / totalMonths);
            setValue('depreciation', monthlyDepreciation);

            // Nilai akhir buku = harga beli - akumulasi penyusutan.
            const finalValue = Math.max(0, price - (monthlyDepreciation * totalMonths));
            setValue('final_value', Math.round(finalValue));
            return;
        }

        setValue('depreciation', 0);
        setValue('final_value', price > 0 ? Math.round(price) : 0);
    }, [price, setValue, totalMonths]);

    // UX Helper: Recalculate final_value when user manually overrides depreciation
    const isFirstDepreciationRender = useRef(true);
    useEffect(() => {
        if (isFirstDepreciationRender.current) {
            isFirstDepreciationRender.current = false;
            return;
        }
        if (totalMonths > 0 && depreciation >= 0 && price > 0) {
            const finalValue = Math.max(0, price - (depreciation * totalMonths));
            setValue('final_value', Math.round(finalValue));
            return;
        }

        if (price >= 0) {
            setValue('final_value', Math.round(price));
        }
    }, [depreciation, price, setValue, totalMonths]);

    const onSubmit = (data: FinanceAssetPayload) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Detail Informasi</h2>
                        <div className="h-px bg-gray-100 mt-4" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Row 1 */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Kode Aset</Label>
                            <Input
                                value={initialData.code}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed uppercase"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Tanggal Beli</Label>
                            <Input
                                value={initialData.purchase_date}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Tipe Aset</Label>
                            <Input
                                value={initialData.type}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed capitalize"
                            />
                        </div>

                        {/* Row 2 */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Nama Barang</Label>
                            <Input
                                value={initialData.name}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="serial_number" className="text-sm font-semibold text-gray-900">Serial Number</Label>
                            <Input
                                id="serial_number"
                                placeholder="Masukkan serial number"
                                {...register('serial_number')}
                                className="border-gray-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Harga Beli</Label>
                            <MoneyInput
                                value={initialData.price}
                                onChangeValue={() => {}}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        {/* Row 3 */}
                        <div className="space-y-2">
                            <Label htmlFor="economic_age" className="text-sm font-semibold text-gray-900">Umur Ekonomis</Label>
                            <div className="relative">
                                <Input
                                    id="economic_age"
                                    type="number"
                                    placeholder="Contoh: 4"
                                    {...register('economic_age', { valueAsNumber: true })}
                                    className="border-gray-200 pr-14"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Tahun</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="depreciation" className="text-sm font-semibold text-gray-900">
                                Penyusutan/Bulan
                                <span className="ml-1 text-xs text-blue-500 font-normal">(Auto)</span>
                            </Label>
                            <Controller
                                control={control}
                                name="depreciation"
                                render={({ field }) => (
                                    <MoneyInput
                                        id="depreciation"
                                        value={field.value}
                                        onChangeValue={field.onChange}
                                        placeholder="Contoh: Rp 100.000"
                                    />
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="final_value" className="text-sm font-semibold text-gray-900">
                                Nilai Akhir
                                <span className="ml-1 text-xs text-blue-500 font-normal">(Auto)</span>
                            </Label>
                            <Controller
                                control={control}
                                name="final_value"
                                render={({ field }) => (
                                    <MoneyInput
                                        id="final_value"
                                        value={field.value}
                                        onChangeValue={field.onChange}
                                        placeholder="Masukkan nilai akhir"
                                    />
                                )}
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
