// ============================================================
// NETIZENCITY - Form & Data Validation (Zod)
// ============================================================

import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z
  .object({
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
    username: z
      .string()
      .min(3, 'Username minimal 3 karakter')
      .max(20, 'Username maksimal 20 karakter')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
    displayName: z.string().min(2, 'Nama tampilan minimal 2 karakter').max(30),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

export const citizenProfileSchema = z.object({
  displayName: z.string().min(2).max(30),
  biography: z.string().max(200).optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type CitizenProfileFormData = z.infer<typeof citizenProfileSchema>
