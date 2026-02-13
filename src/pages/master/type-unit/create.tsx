import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/router"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { useCompany } from "@/contexts/CompanyContext"
import { useCreateTypeUnit } from "@/hooks/useTypeUnit"
import { typeUnitSchema, type TypeUnitFormValues } from "@/scheme/type-unit.schema"
import { TypeUnitForm } from "@/components/features/type-unit/TypeUnitForm"
import { ChevronLeft } from "lucide-react"

export default function CreateTypeUnitPage() {
    const router = useRouter()
    const { companyId } = useCompany()
    const createTypeUnit = useCreateTypeUnit()

    const form = useForm<TypeUnitFormValues>({
        resolver: zodResolver(typeUnitSchema),
        defaultValues: {
            code: "",
            merk: "",
            type: "",
            jenis: "",
            model: "",
            bruto: undefined,
            netto: undefined,
        },
    })

    const onSubmit = async (values: TypeUnitFormValues) => {
        if (!companyId) {
            toast.error("Company ID tidak ditemukan")
            return
        }

        try {
            await createTypeUnit.mutateAsync({
                ...values,
                companyId,
            })
            toast.success("Data berhasil ditambahkan")
            router.push("/master/type-unit")
        } catch (error) {
            console.error("Failed to create type unit:", error)
            toast.error("Gagal menambahkan data tipe unit")
        }
    }

    const handleCancel = () => {
        router.push("/master/type-unit")
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* HEADER */}
                <div className="flex items-center gap-4">
                    <div
                        className="rounded-full bg-muted p-2 cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={handleCancel}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Tambahkan Tipe Unit</h1>
                        <p className="text-sm text-muted-foreground">
                            Masukkan detail tipe baru
                        </p>
                    </div>
                </div>

                {/* FORM CARD */}
                <Card className="rounded-xl p-8">
                    <TypeUnitForm
                        form={form}
                        onSubmit={onSubmit}
                        onCancel={handleCancel}
                        isSubmitting={createTypeUnit.isPending}
                        submitLabel="Simpan"
                    />
                </Card>
            </div>
        </DashboardLayout>
    )
}
