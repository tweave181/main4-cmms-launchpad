import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ChecklistRecordFormData } from "@/hooks/useChecklistRecords";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  asset_type: z.string().optional(),
  frequency_type: z.string().optional(),
  is_active: z.boolean().default(true),
});

interface ChecklistRecordFormProps {
  initialData?: Partial<ChecklistRecordFormData>;
  onSubmit: (data: ChecklistRecordFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ChecklistRecordForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Create Record",
}: ChecklistRecordFormProps) {
  const form = useForm<ChecklistRecordFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      asset_type: initialData?.asset_type || "",
      frequency_type: initialData?.frequency_type || "",
      is_active: initialData?.is_active ?? true,
    },
  });

  const handleSubmit = async (data: ChecklistRecordFormData) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Monthly Pump Inspection" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for this checklist record
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this checklist covers..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="asset_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Pump, HVAC, Motor" {...field} />
                </FormControl>
                <FormDescription>
                  Type of asset this checklist is designed for
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Daily, Weekly, Monthly" {...field} />
                </FormControl>
                <FormDescription>
                  Recommended maintenance frequency
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Only active records can be assigned to maintenance schedules
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
