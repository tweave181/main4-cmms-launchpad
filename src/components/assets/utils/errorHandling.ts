
import { toast } from '@/components/ui/use-toast';
import type { AssetFormData } from '../types';
import type { UserProfile } from '@/contexts/auth/types';

interface ErrorWithMessage {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
};

export const getErrorMessage = (error: unknown): string => {
  if (!isErrorWithMessage(error)) {
    return "An error occurred while saving the asset";
  }

  const message = error.message;

  if (message.includes('tenant_id')) {
    return "There was an issue with your account permissions. Please try logging out and back in.";
  } else if (message.includes('unique')) {
    return "An asset with these details already exists. Please check your input.";
  } else if (message.includes('null')) {
    return "Some required information is missing. Please check all fields and try again.";
  } else {
    return message;
  }
};

export const logError = (error: unknown, data: AssetFormData, userProfile: UserProfile | null): void => {
  const errorDetails = isErrorWithMessage(error) ? {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  } : { message: 'Unknown error' };

  console.error('Form submission error details:', {
    error: error,
    ...errorDetails,
    formData: data,
    userProfile: userProfile
  });
};

export const showErrorToast = (error: unknown): void => {
  const errorMessage = getErrorMessage(error);
  
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
};
