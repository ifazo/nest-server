import { z } from 'zod';

export const CategorySchema = z.object({
  name: z.string().nonempty('Name is required'),
  image: z.string().url('Image must be a valid URL'),
  description: z.string().nonempty('Description is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Category = z.infer<typeof CategorySchema>;
