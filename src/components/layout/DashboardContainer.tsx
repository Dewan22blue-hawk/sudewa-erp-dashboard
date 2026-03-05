import { ReactNode } from "react"

interface DashboardContainerProps {
    children: ReactNode
    className?: string
}

export function DashboardContainer({ children, className = "" }: DashboardContainerProps) {
    return (
        <div className={`mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8 space-y-6 box-border ${className}`}>
            {children}
        </div>
    )
}
