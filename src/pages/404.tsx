import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/router"

export default function NotFoundPage() {
    const router = useRouter()

    return (
        // <DashboardLayout>
        // </DashboardLayout>
        <div className="flex h-[80vh] flex-col items-center justify-center text-center">
            <p className="mb-4 text-5xl font-bold uppercase tracking-widest text-primary">
                404
            </p>

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <FileQuestion className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight">
                Halaman Tidak Ditemukan
            </h1>
            <p className="mt-2 text-muted-foreground max-w-sm">
                Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
            </p>
            <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => router.back()}>
                    Kembali
                </Button>
                <Link href="/dashboard">
                    <Button>
                        Ke Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    )
}
