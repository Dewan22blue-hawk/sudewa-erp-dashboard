import { toast } from "sonner"

interface ToastOptions {
    description?: string
}

export const showSuccess = (
    message: string,
    options?: ToastOptions
) => {
    toast.success(message, {
        description: options?.description
    })
}

export const showError = (
    message: string,
    options?: ToastOptions
) => {
    toast.error(message, {
        description: options?.description
    })
}
