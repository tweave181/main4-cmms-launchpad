import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { ProgramSettings, ProgramSettingsFormData } from '@/hooks/useProgramSettings';
import { useCreateProgramSettings, useUpdateProgramSettings } from '@/hooks/useProgramSettings';
import { useDepartments } from '@/hooks/useDepartments';

const systemSettingsSchema = z.object({
  country: z.string().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  date_format: z.string().optional(),
  default_fiscal_year_start: z.string().optional(),
  organization_name: z.string().optional(),
  system_contact_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  logo_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  // Site Address fields
  site_address_line_1: z.string().optional(),
  site_address_line_2: z.string().optional(),
  site_address_line_3: z.string().optional(),
  site_town_or_city: z.string().optional(),
  site_county_or_state: z.string().optional(),
  site_postcode: z.string().optional(),
  // Main Contact fields
  main_contact_first_name: z.string().optional(),
  main_contact_surname: z.string().optional(),
  main_contact_job_title: z.string().optional(),
  main_contact_phone: z.string().optional(),
  main_contact_mobile: z.string().optional(),
  main_contact_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  main_contact_department_id: z.string().optional()
});

interface SystemSettingsFormProps {
  settings?: ProgramSettings | null;
}

export const SystemSettingsForm: React.FC<SystemSettingsFormProps> = ({
  settings
}) => {
  const createSettings = useCreateProgramSettings();
  const updateSettings = useUpdateProgramSettings();
  const { departments } = useDepartments();
  
  const [openSections, setOpenSections] = useState({
    siteAddress: true,
    mainContact: true,
    localization: true
  });

  const form = useForm<ProgramSettingsFormData>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      country: settings?.country || '',
      currency: settings?.currency || '',
      language: settings?.language || 'English',
      timezone: settings?.timezone || 'Europe/London',
      date_format: settings?.date_format || 'DD/MM/YYYY',
      default_fiscal_year_start: settings?.default_fiscal_year_start || '',
      organization_name: settings?.organization_name || '',
      system_contact_email: settings?.system_contact_email || '',
      logo_url: settings?.logo_url || '',
      // Site Address
      site_address_line_1: settings?.site_address_line_1 || '',
      site_address_line_2: settings?.site_address_line_2 || '',
      site_address_line_3: settings?.site_address_line_3 || '',
      site_town_or_city: settings?.site_town_or_city || '',
      site_county_or_state: settings?.site_county_or_state || '',
      site_postcode: settings?.site_postcode || '',
      // Main Contact
      main_contact_first_name: settings?.main_contact_first_name || '',
      main_contact_surname: settings?.main_contact_surname || '',
      main_contact_job_title: settings?.main_contact_job_title || '',
      main_contact_phone: settings?.main_contact_phone || '',
      main_contact_mobile: settings?.main_contact_mobile || '',
      main_contact_email: settings?.main_contact_email || '',
      main_contact_department_id: settings?.main_contact_department_id || ''
    }
  });

  const { formState: { isDirty } } = form;

  const onSubmit = async (data: ProgramSettingsFormData) => {
    try {
      // Clean up empty strings to null for optional fields
      const cleanedData = {
        ...data,
        default_fiscal_year_start: data.default_fiscal_year_start || null,
        logo_url: data.logo_url || null,
        system_contact_email: data.system_contact_email || null,
        site_address_line_1: data.site_address_line_1 || null,
        site_address_line_2: data.site_address_line_2 || null,
        site_address_line_3: data.site_address_line_3 || null,
        site_town_or_city: data.site_town_or_city || null,
        site_county_or_state: data.site_county_or_state || null,
        site_postcode: data.site_postcode || null,
        main_contact_first_name: data.main_contact_first_name || null,
        main_contact_surname: data.main_contact_surname || null,
        main_contact_job_title: data.main_contact_job_title || null,
        main_contact_phone: data.main_contact_phone || null,
        main_contact_mobile: data.main_contact_mobile || null,
        main_contact_email: data.main_contact_email || null,
        main_contact_department_id: data.main_contact_department_id || null
      };
      if (settings?.id) {
        await updateSettings.mutateAsync({
          id: settings.id,
          data: cleanedData
        });
      } else {
        await createSettings.mutateAsync(cleanedData);
      }
      form.reset(data);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const isLoading = createSettings.isPending || updateSettings.isPending;

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Card className="rounded-2xl shadow-sm border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            System Configuration
          </CardTitle>
          <div className="flex gap-3">
            {isDirty && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit"
              form="system-settings-form"
              className={cn("px-6", isDirty && "bg-green-600 hover:bg-green-700")}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form id="system-settings-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground bg-lime-300">Organization Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="organization_name" render={({
                  field
                }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter organization name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="system_contact_email" render={({
                  field
                }) => (
                  <FormItem>
                    <FormLabel>System Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Site Address Section */}
            <Collapsible 
              open={openSections.siteAddress} 
              onOpenChange={() => toggleSection('siteAddress')}
            >
              <CollapsibleTrigger className="flex items-center gap-2 cursor-pointer w-full">
                <ChevronDown className={cn("h-5 w-5 transition-transform", !openSections.siteAddress && "-rotate-90")} />
                <h3 className="text-foreground font-bold text-xl">Site Address</h3>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="space-y-3">
                  {/* Address fields in table-like layout */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-start">
                    <FormLabel className="text-right pt-2">Address:</FormLabel>
                    <div className="space-y-2">
                      <FormField control={form.control} name="site_address_line_1" render={({
                        field
                      }) => (
                        <FormItem>
                          <FormControl>
                            <Input className="max-w-md" placeholder="Street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="site_address_line_2" render={({
                        field
                      }) => (
                        <FormItem>
                          <FormControl>
                            <Input className="max-w-md" placeholder="Address line 2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="site_address_line_3" render={({
                        field
                      }) => (
                        <FormItem>
                          <FormControl>
                            <Input className="max-w-md" placeholder="Address line 3" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* Town / City */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">Town / City:</FormLabel>
                    <FormField control={form.control} name="site_town_or_city" render={({
                      field
                    }) => (
                      <FormItem>
                        <FormControl>
                          <Input className="max-w-md" placeholder="Town or city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* County / State */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">County / State:</FormLabel>
                    <FormField control={form.control} name="site_county_or_state" render={({
                      field
                    }) => (
                      <FormItem>
                        <FormControl>
                          <Input className="max-w-md" placeholder="County or state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Postcode */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">Postcode:</FormLabel>
                    <FormField control={form.control} name="site_postcode" render={({
                      field
                    }) => (
                      <FormItem>
                        <FormControl>
                          <Input className="max-w-[200px]" placeholder="Postcode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Main Contact Section */}
            <Collapsible 
              open={openSections.mainContact} 
              onOpenChange={() => toggleSection('mainContact')}
            >
              <CollapsibleTrigger className="flex items-center gap-2 cursor-pointer w-full">
                <ChevronDown className={cn("h-5 w-5 transition-transform", !openSections.mainContact && "-rotate-90")} />
                <h3 className="text-foreground font-bold text-xl">Main Contact</h3>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="space-y-3">
                  {/* First Name */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">First Name:</FormLabel>
                    <FormField control={form.control} name="main_contact_first_name" render={({
                      field
                    }) => (
                      <FormItem>
                        <FormControl>
                          <Input className="max-w-[200px]" placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Surname */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">Surname:</FormLabel>
                    <FormField control={form.control} name="main_contact_surname" render={({
                      field
                    }) => (
                      <FormItem>
                        <FormControl>
                          <Input className="max-w-[200px]" placeholder="Surname" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Job Title */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">Job Title:</FormLabel>
                    <FormField control={form.control} name="main_contact_job_title" render={({
                      field
                    }) => (
                      <FormItem>
                        <FormControl>
                          <Input className="max-w-[250px]" placeholder="Job title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Department */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">Department:</FormLabel>
                    <FormField control={form.control} name="main_contact_department_id" render={({
                      field
                    }) => (
                      <FormItem>
                        <Select onValueChange={value => field.onChange(value === "none" ? "" : value)} value={field.value || "none"}>
                          <FormControl>
                            <SelectTrigger className="max-w-[250px]">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {departments.map(dept => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Phone */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">Phone:</FormLabel>
                    <FormField control={form.control} name="main_contact_phone" render={({
                      field
                    }) => (
                      <FormItem>
                        <FormControl>
                          <Input className="max-w-[200px]" placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Mobile */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">Mobile:</FormLabel>
                    <FormField control={form.control} name="main_contact_mobile" render={({
                      field
                    }) => (
                      <FormItem>
                        <FormControl>
                          <Input className="max-w-[200px]" placeholder="Mobile number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Email */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">Email:</FormLabel>
                    <FormField control={form.control} name="main_contact_email" render={({
                      field
                    }) => (
                      <FormItem>
                        <FormControl>
                          <Input className="max-w-md" type="email" placeholder="contact@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Localization Section */}
            <Collapsible 
              open={openSections.localization} 
              onOpenChange={() => toggleSection('localization')}
            >
              <CollapsibleTrigger className="flex items-center gap-2 cursor-pointer w-full">
                <ChevronDown className={cn("h-5 w-5 transition-transform", !openSections.localization && "-rotate-90")} />
                <h3 className="text-foreground font-bold text-xl">Localization</h3>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="space-y-3">
                  {/* Country */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">Country:</FormLabel>
                    <FormField control={form.control} name="country" render={({
                      field
                    }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="max-w-[250px]">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="FR">France</SelectItem>
                            <SelectItem value="ES">Spain</SelectItem>
                            <SelectItem value="IT">Italy</SelectItem>
                            <SelectItem value="NL">Netherlands</SelectItem>
                            <SelectItem value="BE">Belgium</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Currency */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">Currency:</FormLabel>
                    <FormField control={form.control} name="currency" render={({
                      field
                    }) => (
                      <FormItem>
                        <FormControl>
                          <Input className="max-w-[100px]" placeholder="£, $, €" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Language */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">Language:</FormLabel>
                    <FormField control={form.control} name="language" render={({
                      field
                    }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="max-w-[250px]">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                            <SelectItem value="German">German</SelectItem>
                            <SelectItem value="Italian">Italian</SelectItem>
                            <SelectItem value="Dutch">Dutch</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Timezone */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">Timezone:</FormLabel>
                    <FormField control={form.control} name="timezone" render={({
                      field
                    }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="max-w-[300px]">
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                            <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                            <SelectItem value="America/Chicago">America/Chicago (CST)</SelectItem>
                            <SelectItem value="America/Denver">America/Denver (MST)</SelectItem>
                            <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                            <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                            <SelectItem value="Europe/Berlin">Europe/Berlin (CET)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                            <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Date Format */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">Date Format:</FormLabel>
                    <FormField control={form.control} name="date_format" render={({
                      field
                    }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="max-w-[200px]">
                              <SelectValue placeholder="Select date format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Fiscal Year Start */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">Fiscal Year Start:</FormLabel>
                    <FormField control={form.control} name="default_fiscal_year_start" render={({
                      field
                    }) => (
                      <FormItem className="flex flex-col">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className={cn("max-w-[200px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar 
                              mode="single" 
                              selected={field.value ? new Date(field.value) : undefined} 
                              onSelect={date => {
                                field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                              }} 
                              initialFocus 
                              className="p-3 pointer-events-auto" 
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Logo URL */}
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
                    <FormLabel className="text-right">Logo URL:</FormLabel>
                    <FormField control={form.control} name="logo_url" render={({
                      field
                    }) => (
                      <FormItem>
                        <FormControl>
                          <Input className="max-w-md" type="url" placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
