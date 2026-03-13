import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { DOEkspedisi } from './do-ekspedisi.data';
import { Calendar } from 'lucide-react';

interface DOEkspedisiDetailCardProps {
    data: DOEkspedisi;
}

export function DOEkspedisiDetailCard({ data }: DOEkspedisiDetailCardProps) {
    return (
        <Card className="rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">Tanggal</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            readOnly
                            className="bg-white text-gray-600 pl-9 focus-visible:ring-0 shadow-sm"
                            value={format(new Date(data.tanggal), 'MMM dd, yyyy')}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">Nomor Polisi</Label>
                    <Input
                        readOnly
                        className="bg-white text-gray-600 focus-visible:ring-0 shadow-sm"
                        value={data.noPolisi}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">Driver</Label>
                    <Input
                        readOnly
                        className="bg-white text-gray-600 focus-visible:ring-0 shadow-sm"
                        value={data.driver}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">Jenis Kendaraan</Label>
                    <Input
                        readOnly
                        className="bg-white text-gray-600 focus-visible:ring-0 shadow-sm"
                        value={data.tipeKendaraan}
                    />
                </div>
            </div>
        </Card>
    );
}
