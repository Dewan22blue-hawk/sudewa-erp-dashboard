import { z } from 'zod';

export const doEkspedisiEditSchema = z.object({
  date: z.date({
    required_error: 'Tanggal wajib diisi',
    invalid_type_error: 'Tanggal wajib diisi',
  }),
  vehicleId: z.string().min(1, 'Armada wajib dipilih'),
  driverId: z.string().min(1, 'Driver wajib dipilih'),
  driverNote: z.string().optional().default(''),
});

export type DoEkspedisiEditSchema = z.input<typeof doEkspedisiEditSchema>;
