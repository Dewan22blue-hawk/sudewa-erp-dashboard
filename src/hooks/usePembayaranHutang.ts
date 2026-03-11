import { useState, useEffect } from 'react';
import { PembayaranHutang } from '@/types/pembayaran-hutang.types';
import { PembayaranHutangService } from '@/services/pembayaran-hutang.service';

export const usePembayaranHutang = () => {
  const [data, setData] = useState<PembayaranHutang[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    const fetchData = async () => {
      setLoading(true);
      try {
        // In real app, await API call
        const result = PembayaranHutangService.getAll();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch pembayaran hutang:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const deletePembayaranHutang = (id: string) => {
    const success = PembayaranHutangService.deleteById(id);
    if (success) {
      setData((prev) => prev.filter((item) => item.id !== id));
    }
    return success;
  };

  return { data, loading, deletePembayaranHutang };
};
