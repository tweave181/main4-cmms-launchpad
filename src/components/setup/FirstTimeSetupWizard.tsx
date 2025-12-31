import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { SiteAddressStep } from './steps/SiteAddressStep';
import { MainContactStep } from './steps/MainContactStep';
import { LocalizationStep } from './steps/LocalizationStep';
import { useUpdateProgramSettings } from '@/hooks/useProgramSettings';
import type { ProgramSettings, ProgramSettingsFormData } from '@/hooks/useProgramSettings';

const wizardSchema = z.object({
  // Site Address
  site_address_line_1: z.string().optional(),
  site_address_line_2: z.string().optional(),
  site_address_line_3: z.string().optional(),
  site_town_or_city: z.string().optional(),
  site_county_or_state: z.string().optional(),
  site_postcode: z.string().optional(),
  // Main Contact
  main_contact_first_name: z.string().optional(),
  main_contact_surname: z.string().optional(),
  main_contact_job_title: z.string().optional(),
  main_contact_phone: z.string().optional(),
  main_contact_mobile: z.string().optional(),
  main_contact_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  main_contact_department_id: z.string().optional(),
  // Localization
  country: z.string().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  date_format: z.string().optional(),
  default_fiscal_year_start: z.string().optional(),
  logo_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const STEPS = [
  { id: 'site-address', title: 'Site Address', description: 'Where is your organization located?' },
  { id: 'main-contact', title: 'Main Contact', description: 'Who is the primary contact person?' },
  { id: 'localization', title: 'Preferences', description: 'Configure regional settings' },
];

interface FirstTimeSetupWizardProps {
  settings: ProgramSettings;
  onComplete: () => void;
  onSkip: () => void;
}

export const FirstTimeSetupWizard: React.FC<FirstTimeSetupWizardProps> = ({
  settings,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const updateSettings = useUpdateProgramSettings();

  const form = useForm<ProgramSettingsFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      site_address_line_1: settings.site_address_line_1 || '',
      site_address_line_2: settings.site_address_line_2 || '',
      site_address_line_3: settings.site_address_line_3 || '',
      site_town_or_city: settings.site_town_or_city || '',
      site_county_or_state: settings.site_county_or_state || '',
      site_postcode: settings.site_postcode || '',
      main_contact_first_name: settings.main_contact_first_name || '',
      main_contact_surname: settings.main_contact_surname || '',
      main_contact_job_title: settings.main_contact_job_title || '',
      main_contact_phone: settings.main_contact_phone || '',
      main_contact_mobile: settings.main_contact_mobile || '',
      main_contact_email: settings.main_contact_email || '',
      main_contact_department_id: settings.main_contact_department_id || '',
      country: settings.country || '',
      currency: settings.currency || '',
      language: settings.language || 'English',
      timezone: settings.timezone || 'Europe/London',
      date_format: settings.date_format || 'DD/MM/YYYY',
      default_fiscal_year_start: settings.default_fiscal_year_start || '',
      logo_url: settings.logo_url || '',
    },
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final step - save all data
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    const data = form.getValues();
    
    // Clean up empty strings to null
    const cleanedData = {
      ...data,
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
      main_contact_department_id: data.main_contact_department_id || null,
      default_fiscal_year_start: data.default_fiscal_year_start || null,
      logo_url: data.logo_url || null,
    };

    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        data: cleanedData,
      });
      onComplete();
    } catch (error) {
      console.error('Error saving setup:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <SiteAddressStep form={form} />;
      case 1:
        return <MainContactStep form={form} />;
      case 2:
        return <LocalizationStep form={form} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;
  const isLoading = updateSettings.isPending;

  return (
    <Dialog open onOpenChange={() => onSkip()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              First-Time Setup
            </DialogTitle>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-1 text-xs ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    index < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? <Check className="w-3 h-3" /> : index + 1}
                </div>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Form {...form}>
          <form className="space-y-6 py-4">
            {renderStepContent()}
          </form>
        </Form>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onSkip}>
              <X className="w-4 h-4 mr-2" />
              Skip for now
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                'Saving...'
              ) : isLastStep ? (
                <>
                  Complete Setup
                  <Check className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
