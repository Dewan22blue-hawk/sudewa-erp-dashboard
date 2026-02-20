import { useState, useEffect } from "react"
import { PenerimaanPiutang, PenerimaanPiutangDetail } from "@/types/penerimaan-piutang.types"
import { PenerimaanPiutangService } from "@/services/penerimaan-piutang.service"

export const usePenerimaanPiutang = () => {
    const [data, setData] = useState<PenerimaanPiutang[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const result = PenerimaanPiutangService.getAll()
                setData(result)
            } catch (error) {
                console.error("Failed to fetch penerimaan piutang:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return { data, loading }
}

export const usePenerimaanPiutangDetail = (id: string) => {
    const [data, setData] = useState<PenerimaanPiutangDetail | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!id) return

        const fetchData = async () => {
            setLoading(true)
            try {
                const result = PenerimaanPiutangService.getById(id)
                setData(result)
            } catch (error) {
                console.error("Failed to fetch detail:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    return { data, loading }
}
