import { liabilityService } from './liability.service';

export const PembayaranHutangService = {
  getAll: async () => {
    const result = await liabilityService.getList();
    return result.data;
  },

  deleteById: async (id: string | number): Promise<boolean> => {
    await liabilityService.delete(Number(id));
    return true;
  },

  getById: async (id: string | number) => {
    return liabilityService.getDetail(Number(id));
  },
};
