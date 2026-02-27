"use client"

import Image from "next/image"
import { format } from "date-fns"

interface Props {
    data: {
        noSo: string
        customer: string
        totalType: number
        totalQty: number
        estimatedDelivery: string
    }[]
}

export default function SOOutstandingView({ data }: Props) {
    return (
        <div className="bg-white border rounded-xl p-12 max-w-5xl mx-auto shadow-sm">

            {/* Header Section */}
            <div className="flex flex-col items-center justify-center mb-10 relative">
                {/* Logo */}
                <Image
                    src="/wajira-logo.png"
                    alt="Wajira Logo"
                    width={80}
                    height={80}
                    className="absolute left-8 top-0 object-contain"
                />

                <div className="text-center space-y-1">
                    <h2 className="font-bold text-lg">SALES ORDER OUTSTANDING</h2>
                    <h3 className="font-bold text-sm uppercase">PT WAJIRA JAGATRARA MORINDO</h3>
                    <p className="text-xs text-gray-500">Periode: Bulan Berjalan</p>
                </div>
            </div>

            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b-2 border-gray-200">
                        <th className="text-left font-semibold py-3 px-4">No</th>
                        <th className="text-left font-semibold py-3 px-4">No. SO</th>
                        <th className="text-left font-semibold py-3 px-4">Customer</th>
                        <th className="text-right font-semibold py-3 px-4">Type Item</th>
                        <th className="text-right font-semibold py-3 px-4">Qty Keluar</th>
                        <th className="text-left font-semibold py-3 px-4">Estimasi Pengiriman</th>
                    </tr>
                </thead>

                <tbody>
                    {data?.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2.5 px-4 text-gray-600">{index + 1}</td>
                            <td className="py-2.5 px-4 text-gray-600 font-medium">{item.noSo}</td>
                            <td className="py-2.5 px-4 text-gray-600">{item.customer}</td>
                            <td className="py-2.5 px-4 text-gray-600 text-right">{item.totalType}</td>
                            <td className="py-2.5 px-4 text-gray-600 text-right">{item.totalQty}</td>
                            <td className="py-2.5 px-4 text-gray-600">
                                {format(new Date(item.estimatedDelivery), "dd MMM yyyy")}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    )
}
