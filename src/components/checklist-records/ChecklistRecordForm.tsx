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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChecklistRecordFormData } from "@/hooks/useChecklistRecords";
import { useCategories } from "@/hooks/useCategories";
import { useFrequencyTypes } from "@/hooks/useFrequencyTypes";
import { DayOfWeekSelector } from "./DayOfWeekSelector";

const WORK_TIMING_OPTIONS = [
  { value: "in_hours", label: "In Hours (Normal Working)" },
  { value: "out_of_hours", label: "Out of Hours" },
  { value: "at_night", label: "At Night" },
  { value: "weekend", label: "Over the Weekend" },
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  asset_type: z.string().optional(),
  frequency_type: z.string().optional(),
  is_active: z.boolean().default(true),
  working_days: z.array(z.string()).default(["monday", "tuesday", "wednesday", "thursday", "friday"]),
  work_timing: z.string().default("in_hours"),
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
  const { categories } = useCategories();
  const { data: frequencyTypes = [] } = useFrequencyTypes();
  
  const form = useForm<ChecklistRecordFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      asset_type: initialData?.asset_type || "",
      frequency_type: initialData?.frequency_type || "",
      is_active: initialData?.is_active ?? true,
      working_days: initialData?.working_days || ["monday", "tuesday", "wednesday", "thursday", "friday"],
      work_timing: initialData?.work_timing || "in_hours",
    },
  });

  const frequencyType = form.watch("frequency_type");
  const showDaySelector = frequencyType?.toLowerCase() === "daily" || frequencyType?.toLowerCase() === "weekly";

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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {frequencyTypes.map((freq) => (
                      <SelectItem key={freq.id} value={freq.name}>
                        {freq.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Recommended maintenance frequency
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {showDaySelector && (
          <FormField
            control={form.control}
            name="working_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Working Days</FormLabel>
                <FormControl>
                  <DayOfWeekSelector
                    value={field.value || []}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  Select which days this work should be carried out
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="work_timing"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work To Be Carried Out</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timing..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {WORK_TIMING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                When should this maintenance work be carried out
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
