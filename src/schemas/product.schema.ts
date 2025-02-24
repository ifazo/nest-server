import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().nonempty('Name is required'),
  image: z.string().url('Image must be a valid URL'),
  description: z.string().nonempty('Description is required'),
  price: z.number().positive('Price must be a positive number'),
  rating: z
    .number()
    .min(0, 'Rating must be at least 1')
    .max(5, 'Rating must be between 1 and 5'),
  stock: z.number().int().nonnegative('Stock must be a positive number'),
  categoryId: z.string().uuid('Category ID must be a valid UUID'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Product = z.infer<typeof ProductSchema>;
