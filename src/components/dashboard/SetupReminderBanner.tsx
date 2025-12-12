import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { useTenantSetupStatus } from '@/hooks/useTenantSetupStatus';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const SetupReminderBanner = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { data: setupStatus, isLoading } = useTenantSetupStatus();
  const [isDismissing, setIsDismissing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Only show for admin users
  if (userProfile?.role !== 'admin') {
    return null;
  }

  // Don't show while loading
  if (isLoading || !setupStatus) {
    return null;
  }

  // Don't show if setup is complete or already dismissed
  if (setupStatus.isFullySetup || setupStatus.setupWizardDismissed || dismissed) {
    return null;
  }

  const percentRemaining = 100 - setupStatus.percentComplete;

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      const { error } = await supabase
        .from('program_settings')
        .update({ setup_wizard_dismissed: true })
        .eq('tenant_id', userProfile.tenant_id);

      if (error) throw error;
      setDismissed(true);
    } catch (error) {
      console.error('Failed to dismiss banner:', error);
      toast.error('Failed to dismiss banner');
    } finally {
      setIsDismissing(false);
    }
  };

  return (
    <div className="mb-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
          <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
            Your account setup is {setupStatus.percentComplete}% complete.{' '}
            <span className="text-amber-600 dark:text-amber-400">
              {percentRemaining}% remaining
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/setup')}
            className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
          >
            Complete Setup
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            disabled={isDismissing}
            className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
