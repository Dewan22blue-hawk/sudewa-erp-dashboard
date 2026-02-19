import { useQuery } from "@tanstack/react-query"
import { refundJualService } from "@/services/refund-jual.service"

export function useRefundJual() {
    return useQuery({
        queryKey: ["refund-jual"],
        queryFn: () => refundJualService.getAll(),
        staleTime: 1000 * 60 * 5,
    })
}
