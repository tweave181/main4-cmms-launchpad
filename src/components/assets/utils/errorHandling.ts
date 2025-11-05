/**
 * Asset-specific error handling utilities
 * @deprecated Use centralized error handling from @/utils/errorHandling instead
 * This file is kept for backward compatibility
 */

import { toast } from '@/components/ui/use-toast';
import type { AssetFormData } from '../types';
import type { UserProfile } from '@/contexts/auth/types';
import {
  getErrorMessage as getBaseErrorMessage,
  getUserFriendlyErrorMessage,
  logError as baseLogError,
  isSupabaseError,
  getSupabaseErrorDetails,
} from '@/utils/errorHandling';

export const getErrorMessage = (error: unknown): string => {
  return getUserFriendlyErrorMessage(error, 'Asset');
};

export const logError = (error: unknown, data: AssetFormData, userProfile: UserProfile | null): void => {
  baseLogError(error, 'AssetForm', {
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
