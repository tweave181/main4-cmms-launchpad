
import { z } from 'zod';

export const workOrderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  asset_id: z.string().optional(),
  assigned_to: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  work_type: z.enum(['corrective', 'preventive', 'emergency', 'inspection']),
  estimated_hours: z.string().optional(),
  estimated_cost: z.string().optional(),
  due_date: z.string().optional(),
});
