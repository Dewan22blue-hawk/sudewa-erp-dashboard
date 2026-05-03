import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Save, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useCustomers } from '@/hooks/useCustomer';
import { useCompany } from '@/contexts/CompanyContext';
import type { TarifPayload, Tarif } from '@/@types/tarif.types';
import type { Customer } from '@/@types/customer.types';

export interface TarifFormData {
    customerId: string;
    distance: string;
    loadingIn: string;
    loadingOut: string;
    ujTowing: string;
    ujCdd: string;
    ujFuso: string;
    invCdd: string;
    invFuso: string;
    isActive: boolean;
}

interface TarifFormProps {
    initialData?: Tarif;
    onSubmit: (data: TarifPayload) => void;
    isSubmitting: boolean;
    title: string;
}

// ── Searchable customer select ─────────────────────────────────────────────────
interface CustomerSelectProps {
    value: string;
    onChange: (value: string) => void;
    customers: Customer[];
    error?: boolean;
}

function CustomerSelect({ value, onChange, customers, error }: CustomerSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = customers.find((c) => String(c.id) === value);

    const filtered = query
        ? customers.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
        : customers;

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (customer: Customer) => {
        onChange(String(customer.id));
        setOpen(false);
        setQuery('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setQuery('');
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`
                    w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border bg-white
                    focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 transition-colors
                    ${error ? 'border-red-500' : 'border-input hover:border-gray-400'}
                `}
            >
                <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
                    {selected ? selected.name : 'Masukkan data'}
                </span>
                <div className="flex items-center gap-1">
                    {selected && (
                        <X
                            className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600"
                            onClick={handleClear}
                        />
                    )}
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="p-2 border-b border-gray-100">
                        <input
                            type="text"
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari customer..."
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                        />
                    </div>
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {filtered.length > 0 ? (
                            filtered.map((customer) => (
                                <li
                                    key={customer.id}
                                    onClick={() => handleSelect(customer)}
                                    className={`
                                        px-3 py-2 text-sm cursor-pointer transition-colors
                                        ${String(customer.id) === value
                                            ? 'bg-[#1e3a5f] text-white'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {customer.name}
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-2 text-sm text-gray-400 text-center">
                                Tidak ada customer ditemukan
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ── Main Form Component ────────────────────────────────────────────────────────
export function TarifForm({ initialData, onSubmit, isSubmitting, title }: TarifFormProps) {
    const router = useRouter();
    const { companyId: localCompanyId } = useCompany();

    const { data: customersResponse } = useCustomers({
        page: 1,
        perPage: 100,
        company_id: localCompanyId ?? undefined,
        enabled: Boolean(localCompanyId),
    });
    const customers = (customersResponse as any)?.data || [];

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TarifFormData>({
        defaultValues: {
            customerId: '',
            distance: '',
            loadingIn: '',
            loadingOut: '',
            ujTowing: '',
            ujCdd: '',
            ujFuso: '',
            invCdd: '',
            invFuso: '',
            isActive: true,
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                customerId: String(initialData.customerId),
                distance: String(initialData.distance),
                loadingIn: initialData.loadingIn,
                loadingOut: initialData.loadingOut,
                ujTowing: initialData.ujTowing !== null && initialData.ujTowing !== undefined ? String(initialData.ujTowing) : '',
                ujCdd: initialData.ujCdd !== null && initialData.ujCdd !== undefined ? String(initialData.ujCdd) : '',
                ujFuso: initialData.ujFuso !== null && initialData.ujFuso !== undefined ? String(initialData.ujFuso) : '',
                invCdd: initialData.invCdd !== null && initialData.invCdd !== undefined ? String(initialData.invCdd) : '',
                invFuso: initialData.invFuso !== null && initialData.invFuso !== undefined ? String(initialData.invFuso) : '',
                isActive: initialData.isActive ?? true,
            });
        }
    }, [initialData, reset]);

    const handleFormSubmit = (data: TarifFormData) => {
        const parseNum = (v: string) => (v === '' || v === null || v === undefined ? null : Number(v));
        onSubmit({
            customer_id: Number(data.customerId),
            loading_in: data.loadingIn,
            loading_out: data.loadingOut,
            distance: Number(data.distance),
            uj_towing: parseNum(data.ujTowing),
            uj_cdd: parseNum(data.ujCdd),
            uj_fuso: parseNum(data.ujFuso),
            inv_cdd: parseNum(data.invCdd),
            inv_fuso: parseNum(data.invFuso),
            is_active: data.isActive,
        });
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Page Title */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <Card className="p-6">
                    {/* Section Header */}
                    <h2 className="text-base font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                        Form Detail Tarif
                    </h2>

                    {/* Form grid — matching the UI design exactly */}
                    <div className="space-y-6">
                        {/* Row 1: Nama Customer | Jarak */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-gray-700">
                                    Nama Customer <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    name="customerId"
                                    control={control}
                                    rules={{ required: 'Customer wajib dipilih' }}
                                    render={({ field }) => (
                                        <CustomerSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            customers={customers}
                                            error={!!errors.customerId}
                                        />
                                    )}
                                />
                                {errors.customerId && (
                                    <p className="text-red-500 text-xs">{errors.customerId.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="distance" className="text-sm font-medium text-gray-700">
                                    Jarak <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="distance"
                                    type="number"
                                    placeholder="Masukkan data"
                                    {...register('distance', {
                                        required: 'Jarak wajib diisi',
                                        min: { value: 0, message: 'Jarak tidak boleh negatif' },
                                    })}
                                    className={`bg-white ${errors.distance ? 'border-red-500' : ''}`}
                                />
                                {errors.distance && (
                                    <p className="text-red-500 text-xs">{errors.distance.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Row 2: Loading In | Loading Out */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label htmlFor="loadingIn" className="text-sm font-medium text-gray-700">
                                    Loading in <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="loadingIn"
                                    placeholder="Masukkan data"
                                    {...register('loadingIn', {
                                        required: 'Loading in wajib diisi',
                                        maxLength: { value: 249, message: 'Maksimal 249 karakter' },
                                    })}
                                    className={`bg-white ${errors.loadingIn ? 'border-red-500' : ''}`}
                                />
                                {errors.loadingIn && (
                                    <p className="text-red-500 text-xs">{errors.loadingIn.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="loadingOut" className="text-sm font-medium text-gray-700">
                                    Loading out <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="loadingOut"
                                    placeholder="Masukkan data"
                                    {...register('loadingOut', {
                                        required: 'Loading out wajib diisi',
                                        maxLength: { value: 249, message: 'Maksimal 249 karakter' },
                                    })}
                                    className={`bg-white ${errors.loadingOut ? 'border-red-500' : ''}`}
                                />
                                {errors.loadingOut && (
                                    <p className="text-red-500 text-xs">{errors.loadingOut.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Row 3: UJ Towing | UJ CDD | UJ Fuso */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <Label htmlFor="ujTowing" className="text-sm font-medium text-gray-700">
                                    UJ Towing
                                </Label>
                                <Input
                                    id="ujTowing"
                                    type="number"
                                    placeholder="Masukkan data"
                                    {...register('ujTowing')}
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="ujCdd" className="text-sm font-medium text-gray-700">
                                    UJ CDD
                                </Label>
                                <Input
                                    id="ujCdd"
                                    type="number"
                                    placeholder="Masukkan data"
                                    {...register('ujCdd')}
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="ujFuso" className="text-sm font-medium text-gray-700">
                                    UJ Fuso
                                </Label>
                                <Input
                                    id="ujFuso"
                                    type="number"
                                    placeholder="Masukkan data"
                                    {...register('ujFuso')}
                                    className="bg-white"
                                />
                            </div>
                        </div>

                        {/* Row 4: Invoice Towing (placeholder) | Invoice CDD | Invoice Fuso */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-gray-700">
                                    Invoice Towing
                                </Label>
                                {/* Reserved for future use — API doesn't have inv_towing yet */}
                                <Input
                                    type="number"
                                    placeholder="Masukkan data"
                                    disabled
                                    className="bg-gray-50 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="invCdd" className="text-sm font-medium text-gray-700">
                                    Invoice CDD
                                </Label>
                                <Input
                                    id="invCdd"
                                    type="number"
                                    placeholder="Masukkan data"
                                    {...register('invCdd')}
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="invFuso" className="text-sm font-medium text-gray-700">
                                    Invoice Fuso
                                </Label>
                                <Input
                                    id="invFuso"
                                    type="number"
                                    placeholder="Masukkan data"
                                    {...register('invFuso')}
                                    className="bg-white"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-center items-center gap-6 pt-8">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#1e3a5f] hover:bg-[#152e4d] min-w-[130px] gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
