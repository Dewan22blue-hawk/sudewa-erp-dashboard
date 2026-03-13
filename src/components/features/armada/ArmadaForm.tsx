import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Armada, ArmadaEquipment } from './armada.data';
import { useRouter } from 'next/router';

export type ArmadaFormData = Omit<Armada, 'id'>;

interface ArmadaFormProps {
    initialData?: Armada;
    title: string;
    onSubmit: (data: ArmadaFormData) => void;
}

export function ArmadaForm({ initialData, title, onSubmit }: ArmadaFormProps) {
    const router = useRouter();
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ArmadaFormData>({
        defaultValues: initialData || {
            noPolisi: '',
            noMesin: '',
            noRangka: '',
            nomorSTNK: '',
            masaSTNK: '',
            bukuKIR: '',
            masaKIR: '',
            type: '',
            perlengkapan: {
                radioTape: 0, toolkit: 0, kotakP3K: 0, dongkrak: 0, pipaDongkrak: 0, pemantikRokok: 0, banSerep: 0, pipaPress1: 0, pipaPress2: 0,
                pelanaJok: 0, taliIkatBesar: 0, taliIkatKecil: 0, selangStang: 0, spion: 0, gembokToolBox: 0, tabungAPAR: 0, sponATI: 0, bukuService: 0
            }
        }
    });

    const typeValue = watch("type");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Header Content can be overridden but standard structure applies */}

            {/* Data Kendaraan */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-4">Data Kendaraan</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="noPolisi">Nomor Polisi</Label>
                        <Input id="noPolisi" placeholder="Tambah nomor polisi" {...register('noPolisi', { required: 'Wajib diisi' })} className={errors.noPolisi ? 'border-red-500' : ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="noMesin">Nomor Mesin</Label>
                        <Input id="noMesin" placeholder="Tambah nomor mesin" {...register('noMesin', { required: 'Wajib diisi' })} className={errors.noMesin ? 'border-red-500' : ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="noRangka">Nomor Rangka</Label>
                        <Input id="noRangka" placeholder="Tambah nomor rangka" {...register('noRangka', { required: 'Wajib diisi' })} className={errors.noRangka ? 'border-red-500' : ''} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nomorSTNK">Nomor STNK</Label>
                        <Input id="nomorSTNK" placeholder="Tambah nomor STNK" {...register('nomorSTNK', { required: 'Wajib diisi' })} className={errors.nomorSTNK ? 'border-red-500' : ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="masaSTNK">Masa STNK</Label>
                        <Input id="masaSTNK" placeholder="Tambah masa STNK" {...register('masaSTNK', { required: 'Wajib diisi' })} className={errors.masaSTNK ? 'border-red-500' : ''} />
                    </div>
                    <div className="hidden md:block"></div> {/* Empty column */}

                    <div className="space-y-2">
                        <Label htmlFor="bukuKIR">Buku KIR</Label>
                        <Input id="bukuKIR" placeholder="Tambah buku KIR" {...register('bukuKIR', { required: 'Wajib diisi' })} className={errors.bukuKIR ? 'border-red-500' : ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="masaKIR">Masa KIR</Label>
                        <Input id="masaKIR" placeholder="Tambah masa KIR" {...register('masaKIR', { required: 'Wajib diisi' })} className={errors.masaKIR ? 'border-red-500' : ''} />
                    </div>
                    <div className="hidden md:block"></div> {/* Empty column */}

                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={typeValue} onValueChange={(val) => setValue('type', val, { shouldValidate: true })}>
                            <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Pilih tipe kendaraan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CDD">CDD</SelectItem>
                                <SelectItem value="Fuso">Fuso</SelectItem>
                                <SelectItem value="Tronton">Tronton</SelectItem>
                                <SelectItem value="Trailer">Trailer</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                    </div>
                </div>
            </div>

            {/* Perlengkapan Opsional */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-4">Perlengkapan Opsional</h3>

                {/* Kategori 1 */}
                <div className="mb-8 p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">Kategori 1</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                        {[
                            { name: 'radioTape', label: 'Radio tape' },
                            { name: 'toolkit', label: 'Toolkit' },
                            { name: 'kotakP3K', label: 'Kotak P3K' },
                            { name: 'dongkrak', label: 'Dongkrak' },
                            { name: 'pipaDongkrak', label: 'Pipa Dongkrak' },
                            { name: 'pemantikRokok', label: 'Pemantik Rokok' },
                            { name: 'banSerep', label: 'Ban Serep' },
                            { name: 'pipaPress1', label: 'Pipa Press 1' },
                            { name: 'pipaPress2', label: 'Pipa Press 2' },
                        ].map((field) => (
                            <div key={field.name} className="space-y-2">
                                <Label htmlFor={`cat1-${field.name}`}>{field.label}</Label>
                                <Input
                                    id={`cat1-${field.name}`}
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    {...register(`perlengkapan.${field.name as keyof ArmadaEquipment}`, { valueAsNumber: true })}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Kategori 2 */}
                <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">Kategori 2</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                        {[
                            { name: 'pelanaJok', label: 'Pelana Jok' },
                            { name: 'taliIkatBesar', label: 'Tali Ikat Besar' },
                            { name: 'taliIkatKecil', label: 'Tali Ikat Kecil' },
                            { name: 'selangStang', label: 'Selang Stang' },
                            { name: 'spion', label: 'Spion' },
                            { name: 'gembokToolBox', label: 'Gembok Tool Box' },
                            { name: 'tabungAPAR', label: 'Tabung APAR' },
                            { name: 'sponATI', label: 'Spon ATI' },
                            { name: 'bukuService', label: 'Buku Service' },
                        ].map((field) => (
                            <div key={field.name} className="space-y-2">
                                <Label htmlFor={`cat2-${field.name}`}>{field.label}</Label>
                                <Input
                                    id={`cat2-${field.name}`}
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    {...register(`perlengkapan.${field.name as keyof ArmadaEquipment}`, { valueAsNumber: true })}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-4 pt-4 pb-8">
                <Button type="button" variant="outline" className="w-[120px]" onClick={() => router.back()}>
                    Batal
                </Button>
                <Button type="submit" className="w-[120px] bg-[#1e3a5f] hover:bg-[#152e4d]">
                    Simpan
                </Button>
            </div>
        </form>
    );
}
