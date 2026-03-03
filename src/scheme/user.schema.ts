import { z } from 'zod';

const toOptionalString = (schema: z.ZodString) => z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : val), schema.optional());

const passwordSchema = z.string().min(6, 'Password minimal 6 karakter');

const baseUserShape = {
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  username: z.string().min(3, 'Username minimal 3 karakter'),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  roles: z.string().optional(),
};

const passwordMatchRefinement = (schema: z.ZodTypeAny) =>
  schema.refine((data: any) => !data.password || !data.password_confirmation || data.password === data.password_confirmation, {
    message: 'Konfirmasi password tidak sama',
    path: ['password_confirmation'],
  });

// Create: password wajib
export const createUserSchema = passwordMatchRefinement(
  z.object({
    ...baseUserShape,
    password: passwordSchema,
    password_confirmation: z.string(),
  }),
);

// Update: password opsional, bisa dikosongkan
export const updateUserSchema = passwordMatchRefinement(
  z
    .object({
      ...baseUserShape,
      password: toOptionalString(passwordSchema),
      password_confirmation: toOptionalString(z.string()),
    })
    .partial(),
);

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
