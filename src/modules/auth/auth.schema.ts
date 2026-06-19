import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  firebaseToken: z.string().min(1, 'Token de Firebase requerido'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  firebaseToken: z.string().min(1, 'Token de Firebase requerido'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;