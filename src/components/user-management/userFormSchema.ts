
import * as z from 'zod';

export const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  role: z.enum(['admin', 'manager', 'technician', 'contractor'] as const),
  employment_status: z.enum(['Full Time', 'Part Time', 'Bank Staff', 'Contractor'] as const).optional(),
  department_id: z.string().optional(),
  phone_number: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type UserFormData = z.infer<typeof userFormSchema>;
