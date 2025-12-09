import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTenantSetupStatus } from '@/hooks/useTenantSetupStatus';
import { SetupProgressCard } from '@/components/setup/SetupProgressCard';
import { SetupSection } from '@/components/setup/SetupSection';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, LayoutDashboard } from 'lucide-react';

const TenantSetup = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const tenantId = userProfile?.tenant_id;
  const { data: status, isLoading, refetch } = useTenantSetupStatus();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSkipToDashboard = async () => {
    if (dontShowAgain && tenantId) {
      setIsSaving(true);
      try {
        const { error } = await supabase
          .from('program_settings')
          .update({ setup_wizard_dismissed: true })
          .eq('tenant_id', tenantId);
        
        if (error) throw error;
        
        toast({
          title: 'Preference saved',
          description: 'You can always access the setup wizard from Settings.',
        });
      } catch (error) {
        console.error('Error saving preference:', error);
      } finally {
        setIsSaving(false);
      }
    }
    navigate('/');
  };

  const handleContinueSetup = () => {
    // Find first incomplete essential item
    const essentialSections = status?.sections.filter(s => !s.isAutoConfigured) || [];
    for (const section of essentialSections) {
      const incompleteItem = section.items.find(i => !i.isComplete);
      if (incompleteItem?.link) {
        navigate(incompleteItem.link);
        return;
      }
    }
    // All complete, go to dashboard
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Unable to load setup status</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <SetupProgressCard
          tenantName={status.tenantName}
          businessType={status.businessType}
          percentComplete={status.percentComplete}
          completedItems={status.completedItems}
          totalItems={status.totalItems}
        />

        <div className="mt-8 space-y-4">
          {status.sections.map((section, index) => (
            <SetupSection
              key={section.id}
              section={section}
              defaultOpen={index === 1} // Open "Getting Started" by default
            />
          ))}
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              id="dont-show"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <label 
              htmlFor="dont-show" 
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Don't show this page on login
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSkipToDashboard}
              disabled={isSaving}
              className="gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Skip to Dashboard
            </Button>
            <Button
              onClick={handleContinueSetup}
              className="gap-2 flex-1"
            >
              Continue Setup
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          You can always access this page from Settings → Setup Wizard
        </p>
      </div>
    </div>
  );
};

export default TenantSetup;
