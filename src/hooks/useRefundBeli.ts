import { useQuery } from "@tanstack/react-query"
import { getRefundBeli } from "@/services/refund-beli.service"

export const useRefundBeli = () => {
    return useQuery({
        queryKey: ["refund-beli"],
        queryFn: getRefundBeli,
        staleTime: 1000 * 60 * 5,
    })
}
