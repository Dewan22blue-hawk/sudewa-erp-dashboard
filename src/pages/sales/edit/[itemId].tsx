import { useRouter } from "next/router"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { EditUnitForm } from "@/components/features/sales/edit/EditUnitForm"
import { EDIT_UNIT_DATA } from "@/components/features/sales/edit/edit-unit.data"
import { EditUnitFormData } from "@/components/features/sales/edit/edit-unit.schema"

/**
 * Edit Unit Page - EXACT sesuai Figma
 * Layout: Back nav → Title/Invoice → Form card → Actions
 */
export default function EditUnitPage() {
    const router = useRouter()
    const { itemId } = router.query

    /**
     * Handle form submit - API READY
     * TODO: Replace with actual API call when backend ready
     */
    const handleSubmit = async (data: EditUnitFormData) => {
        try {
            console.log("=== SUBMIT DATA ===")
            console.log("Item ID:", itemId)
            console.log("Form Data:", data)

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500))

            // TODO: Replace with actual API call
            // const response = await fetch(`/api/sales/edit/${itemId}`, {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data)
            // })
            // 
            // if (!response.ok) throw new Error('Failed to update')
            // const result = await response.json()

            // Success
            alert("✅ Data berhasil disimpan!\n\nCek console untuk melihat data yang dikirim.")

            // Navigate back to detail page
            router.push(`/sales/${itemId}`)

        } catch (error) {
            console.error("Error updating unit:", error)
            alert("❌ Gagal menyimpan data. Silakan coba lagi.")
        }
    }

    const handleCancel = () => {
        if (confirm("Batalkan perubahan?")) {
            router.back()
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header dengan Back Navigation */}
                <div>
                    {/* Back Navigation */}
                    <button
                        onClick={() => router.back()}
                        className="mb-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>

                    {/* Title */}
                    <h1 className="text-2xl font-semibold">Edit Unit</h1>

                    {/* Invoice Subtitle */}
                    <p className="text-sm text-primary">
                        Invoice {EDIT_UNIT_DATA.invoiceNumber}
                    </p>
                </div>

                {/* Form Card - Border 1px, Radius 12px, Padding 24px */}
                <Card
                    className="rounded-xl"
                    style={{
                        border: '1px solid #E5E5E5',
                    }}
                >
                    <CardContent className="p-6">
                        <EditUnitForm
                            defaultValues={EDIT_UNIT_DATA}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
