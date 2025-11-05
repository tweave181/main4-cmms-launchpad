/**
 * Centralized Type-Safe Error Handling Utility
 * 
 * This module provides type-safe error handling utilities for the entire application.
 * It replaces unsafe `catch (error: any)` patterns with proper type guards.
 */

import { toast } from '@/hooks/use-toast';

// ============= Type Definitions =============

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface ErrorWithMessage {
  message: string;
}

export interface ErrorWithStatus {
  status?: number;
  statusText?: string;
}

// ============= Type Guards =============

/**
 * Checks if error is an Error instance
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * Checks if error has a message property
 */
export const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
};

/**
 * Checks if error is a Supabase error
 */
export const isSupabaseError = (error: unknown): error is SupabaseError => {
  return (
    isErrorWithMessage(error) &&
    typeof error === 'object' &&
    error !== null &&
    ('details' in error || 'hint' in error || 'code' in error)
  );
};

/**
 * Checks if error has HTTP status information
 */
export const isErrorWithStatus = (error: unknown): error is ErrorWithStatus => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error
  );
};

// ============= Error Message Extraction =============

/**
 * Safely extracts error message from any error type
 */
export const getErrorMessage = (error: unknown): string => {
  if (isError(error)) {
    return error.message;
  }

  if (isErrorWithMessage(error)) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unknown error occurred';
};

/**
 * Extracts detailed error information from Supabase errors
 */
export const getSupabaseErrorDetails = (error: unknown): {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
} => {
  if (!isSupabaseError(error)) {
    return { message: getErrorMessage(error) };
  }

  return {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  };
};

/**
 * Gets user-friendly error message with context-specific handling
 */
export const getUserFriendlyErrorMessage = (error: unknown, context?: string): string => {
  const message = getErrorMessage(error);

  // Handle common Supabase errors
  if (message.includes('tenant_id')) {
    return 'There was an issue with your account permissions. Please try logging out and back in.';
  }

  if (message.includes('unique constraint') || message.includes('duplicate key')) {
    return `${context ? `${context}: ` : ''}A record with these details already exists.`;
  }

  if (message.includes('violates not-null constraint') || message.includes('null value')) {
    return 'Some required information is missing. Please check all fields.';
  }

  if (message.includes('foreign key constraint')) {
    return 'Cannot perform this action because the record is referenced elsewhere.';
  }

  if (message.includes('permission denied') || message.includes('insufficient privilege')) {
    return 'You do not have permission to perform this action.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (message.includes('timeout')) {
    return 'The request took too long. Please try again.';
  }

  // Return original message if no specific pattern matches
  return message;
};

// ============= Logging Utilities =============

/**
 * Safely logs error with structured information
 */
export const logError = (
  error: unknown,
  context: string,
  additionalData?: Record<string, unknown>
): void => {
  const errorDetails = isSupabaseError(error)
    ? getSupabaseErrorDetails(error)
    : { message: getErrorMessage(error) };

  console.error(`[${context}] Error:`, {
    ...errorDetails,
    error,
    timestamp: new Date().toISOString(),
    ...additionalData,
  });
};

/**
 * Logs error with warning level
 */
export const logWarning = (
  message: string,
  context: string,
  additionalData?: Record<string, unknown>
): void => {
  console.warn(`[${context}] Warning:`, {
    message,
    timestamp: new Date().toISOString(),
    ...additionalData,
  });
};

// ============= Toast Notification Utilities =============

/**
 * Shows error toast with user-friendly message
 */
export const showErrorToast = (
  error: unknown,
  options?: {
    title?: string;
    context?: string;
    duration?: number;
  }
): void => {
  const message = getUserFriendlyErrorMessage(error, options?.context);

  toast({
    title: options?.title || 'Error',
    description: message,
    variant: 'destructive',
    duration: options?.duration,
  });
};

/**
 * Shows success toast
 */
export const showSuccessToast = (
  message: string,
  options?: {
    title?: string;
    duration?: number;
  }
): void => {
  toast({
    title: options?.title || 'Success',
    description: message,
    duration: options?.duration,
  });
};

/**
 * Shows warning toast
 */
export const showWarningToast = (
  message: string,
  options?: {
    title?: string;
    duration?: number;
  }
): void => {
  toast({
    title: options?.title || 'Warning',
    description: message,
    variant: 'default',
    duration: options?.duration,
  });
};

// ============= Error Handling Patterns =============

/**
 * Handles error with logging and user notification
 */
export const handleError = (
  error: unknown,
  context: string,
  options?: {
    showToast?: boolean;
    toastTitle?: string;
    additionalData?: Record<string, unknown>;
  }
): void => {
  logError(error, context, options?.additionalData);

  if (options?.showToast !== false) {
    showErrorToast(error, {
      title: options?.toastTitle,
      context,
    });
  }
};

/**
 * Wraps async function with error handling
 */
export const withErrorHandling = <T>(
  fn: () => Promise<T>,
  context: string,
  options?: {
    showToast?: boolean;
    toastTitle?: string;
    onError?: (error: unknown) => void;
  }
): Promise<T | null> => {
  return fn().catch((error: unknown) => {
    handleError(error, context, {
      showToast: options?.showToast,
      toastTitle: options?.toastTitle,
    });

    options?.onError?.(error);
    return null;
  });
};

// ============= Validation Utilities =============

/**
 * Validates that value is not null or undefined
 */
export const assertDefined = <T>(
  value: T | null | undefined,
  errorMessage: string
): asserts value is T => {
  if (value === null || value === undefined) {
    throw new Error(errorMessage);
  }
};

/**
 * Validates and returns value or throws
 */
export const requireValue = <T>(
  value: T | null | undefined,
  errorMessage: string
): T => {
  if (value === null || value === undefined) {
    throw new Error(errorMessage);
  }
  return value;
};
