
import { toast } from '@/components/ui/use-toast';
import type { AssetFormData } from '../types';
import type { UserProfile } from '@/contexts/auth/types';

export const getErrorMessage = (error: any): string => {
  if (!error?.message) {
    return "An error occurred while saving the asset";
  }

  if (error.message.includes('tenant_id')) {
    return "There was an issue with your account permissions. Please try logging out and back in.";
  } else if (error.message.includes('unique')) {
    return "An asset with these details already exists. Please check your input.";
  } else if (error.message.includes('null')) {
    return "Some required information is missing. Please check all fields and try again.";
  } else {
    return error.message;
  }
};

export const logError = (error: any, data: AssetFormData, userProfile: UserProfile | null): void => {
  console.error('Form submission error details:', {
    error: error,
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
    formData: data,
    userProfile: userProfile
  });
};

export const showErrorToast = (error: any): void => {
  const errorMessage = getErrorMessage(error);
  
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
};
