
import { z } from 'zod';

// Helper function to transform empty strings to undefined
const emptyStringToUndefined = z.string().transform((val) => val === '' ? undefined : val);

export const workOrderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  asset_id: emptyStringToUndefined.optional(),
  assigned_to: emptyStringToUndefined.optional(),
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  work_type: z.enum(['corrective', 'preventive', 'emergency', 'inspection']),
  estimated_hours: emptyStringToUndefined.optional(),
  estimated_cost: emptyStringToUndefined.optional(),
  due_date: emptyStringToUndefined.optional(),
});
