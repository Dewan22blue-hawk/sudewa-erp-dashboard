import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/router";

interface PageHeaderProps {
    title: string
    description?: string | React.ReactNode
}

export function PageHeader({ title, description }: PageHeaderProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
                <button onClick={() => router.back()} className="mb-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </button>
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
