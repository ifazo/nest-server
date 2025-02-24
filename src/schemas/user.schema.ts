import { z } from 'zod';

export const UserSchema = z.object({
  name: z.string().nonempty('Name is required'),
  image: z.string().optional(),
  email: z.string().email('Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'seller', 'buyer']).default('buyer'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;
