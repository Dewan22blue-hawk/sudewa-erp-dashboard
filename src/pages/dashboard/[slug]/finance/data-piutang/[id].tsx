"use client"

import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { PiutangService } from "@/services/piutang.service"
import PiutangDetailHeader from "@/components/features/piutang/PiutangDetailHeader"
import PiutangPaymentTable from "@/components/features/piutang/PiutangPaymentTable"
import TerimaPiutangDialog from "@/components/features/piutang/TerimaPiutangDialog"
import { v4 as uuid } from "uuid"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { TerimaPiutangFormValues } from "@/scheme/piutang.schema"
import { format } from "date-fns"

export default function PiutangDetailPage() {
    const router = useRouter()
    const { id } = router.query as { id: string }

    const [data, setData] = useState<any>(null)
    const [payments, setPayments] = useState<any[]>([])
    const [openModal, setOpenModal] = useState(false)

    useEffect(() => {
        if (!id) return

        const detail = PiutangService.getById(id)
        const paymentList = PiutangService.getPayments(id)

        setData(detail)
        setPayments(paymentList)
    }, [id])

    const handlePayment = (values: TerimaPiutangFormValues) => {
        PiutangService.addPayment(id, {
            id: uuid(),
            kodeBayar: "PTU-" + Math.floor(Math.random() * 1000000),
            tanggal: format(values.tanggal, "dd/MM/yyyy"),
            kasMasuk: values.kasMasuk,
            jumlahBayar: values.jumlahTerima,
        })

        const updated = PiutangService.getById(id)
        const paymentList = PiutangService.getPayments(id)

        setData(updated)
        setPayments(paymentList)
    }

    if (!data) return null

    return (
        <DashboardLayout>
            <div className="space-y-6">

                <PiutangDetailHeader
                    data={data}
                    onTerima={() => setOpenModal(true)}
                />

                <PiutangPaymentTable data={payments} />

                <TerimaPiutangDialog
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    onSubmit={handlePayment}
                />

            </div>
        </DashboardLayout >
    )
}
