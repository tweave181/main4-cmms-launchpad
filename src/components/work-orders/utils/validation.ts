
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
  assigned_to_contractor: z.boolean().optional(),
  contractor_company_id: emptyStringToUndefined.optional(),
}).refine((data) => {
  // If assigned to contractor is true, contractor company must be selected
  if (data.assigned_to_contractor && !data.contractor_company_id) {
    return false;
  }
  return true;
}, {
  message: "Contractor company is required when assigning to contractor",
  path: ["contractor_company_id"],
});
