import { useMemo } from 'react';
import { useProgramSettings } from '@/hooks/useProgramSettings';

export const useFirstTimeSetupRequired = () => {
  const { data: settings, isLoading } = useProgramSettings();

  const isRequired = useMemo(() => {
    if (!settings) return false;

    // Check if key fields are missing
    const hasSiteAddress = !!settings.site_address_line_1;
    const hasMainContact = !!settings.main_contact_first_name;

    return !hasSiteAddress || !hasMainContact;
  }, [settings]);

  return { isRequired, settings, isLoading };
};
