import { z } from 'zod';

export const ReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be between 1 and 5'),
  review: z.string().nonempty('Review is required'),
  userId: z.string().uuid('User ID must be a valid UUID'),
  productId: z.string().uuid('Product ID must be a valid UUID'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Review = z.infer<typeof ReviewSchema>;
