import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoneyInput } from '@/components/ui/money-input';
import type { FinanceAsset } from '@/@types/finance-asset.types';
import { ArrowLeft } from 'lucide-react';

interface FinanceAssetDetailFormProps {
    asset: FinanceAsset;
    onBack: () => void;
}

export function FinanceAssetDetailForm({ asset, onBack }: FinanceAssetDetailFormProps) {
    return (
        <div className="space-y-6">
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
                                value={asset.code}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed uppercase"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Tanggal Beli</Label>
                            <Input
                                value={asset.purchase_date}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Tipe Aset</Label>
                            <Input
                                value={asset.type}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed capitalize"
                            />
                        </div>

                        {/* Row 2 */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Nama Barang</Label>
                            <Input
                                value={asset.name}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Serial Number</Label>
                            <Input
                                value={asset.serial_number || '-'}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed uppercase"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Harga Beli</Label>
                            <MoneyInput
                                value={asset.price}
                                onChangeValue={() => {}}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        {/* Row 3 */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Umur Ekonomis</Label>
                            <div className="relative">
                                <Input
                                    value={asset.economic_age || 0}
                                    disabled
                                    className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed pr-14"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Tahun</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Penyusutan/Bulan</Label>
                            <MoneyInput
                                value={asset.depreciation_per_month ?? asset.depreciation ?? 0}
                                onChangeValue={() => {}}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Nilai Akhir</Label>
                            <MoneyInput
                                value={asset.final_value ?? 0}
                                onChangeValue={() => {}}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex items-center justify-center pt-4">
                <Button
                    type="button"
                    onClick={onBack}
                    className="px-8 bg-[#1e3a5f] hover:bg-[#152e4d] flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </Button>
            </div>
        </div>
    );
}
