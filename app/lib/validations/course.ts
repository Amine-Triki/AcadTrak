import { z } from 'zod';

export const createCourseSchema = z.object({
  title:       z.string().min(3, "العنوان 3 أحرف على الأقل"),
  description: z.string().min(10, "الوصف 10 أحرف على الأقل"),
  category:    z.string().min(1, "الفئة مطلوبة"),
  type:        z.enum(['free', 'paid']),
  price:       z.number().min(0).optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
