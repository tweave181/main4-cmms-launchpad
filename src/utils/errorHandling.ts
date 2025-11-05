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
 * Checks if the provided error is an instance of the Error class.
 * 
 * @param error - The error to check (can be any type)
 * @returns True if error is an Error instance, false otherwise
 * 
 * @example
 * ```typescript
 * try {
 *   throw new Error('Something went wrong');
 * } catch (error: unknown) {
 *   if (isError(error)) {
 *     console.log(error.message); // TypeScript knows this is safe
 *     console.log(error.stack);
 *   }
 * }
 * ```
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * Checks if the error has a message property of type string.
 * This is useful for errors that might not be Error instances but still have a message.
 * 
 * @param error - The error to check (can be any type)
 * @returns True if error has a string message property, false otherwise
 * 
 * @example
 * ```typescript
 * const customError = { message: 'Custom error', code: 500 };
 * if (isErrorWithMessage(customError)) {
 *   console.log(customError.message); // Safe to access
 * }
 * ```
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
 * Checks if the error is a Supabase error with additional properties.
 * Supabase errors typically include details, hint, and code properties.
 * 
 * @param error - The error to check (can be any type)
 * @returns True if error is a Supabase error with details, hint, or code, false otherwise
 * 
 * @example
 * ```typescript
 * try {
 *   const { error } = await supabase.from('users').select();
 *   if (error) throw error;
 * } catch (error: unknown) {
 *   if (isSupabaseError(error)) {
 *     console.log('Code:', error.code);
 *     console.log('Details:', error.details);
 *     console.log('Hint:', error.hint);
 *   }
 * }
 * ```
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
 * Checks if the error has HTTP status information.
 * Useful for handling HTTP response errors with status codes.
 * 
 * @param error - The error to check (can be any type)
 * @returns True if error has a status property, false otherwise
 * 
 * @example
 * ```typescript
 * try {
 *   const response = await fetch('/api/data');
 *   if (!response.ok) throw response;
 * } catch (error: unknown) {
 *   if (isErrorWithStatus(error)) {
 *     console.log('Status:', error.status);
 *     console.log('Status Text:', error.statusText);
 *   }
 * }
 * ```
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
 * Safely extracts an error message from any error type.
 * Handles Error instances, objects with message property, strings, and unknown types.
 * 
 * @param error - The error to extract the message from (can be any type)
 * @returns The error message as a string, or a default message if extraction fails
 * 
 * @example
 * ```typescript
 * const message1 = getErrorMessage(new Error('Failed'));  // "Failed"
 * const message2 = getErrorMessage({ message: 'Custom' }); // "Custom"
 * const message3 = getErrorMessage('String error');        // "String error"
 * const message4 = getErrorMessage(null);                  // "An unknown error occurred"
 * ```
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
 * Extracts detailed error information from Supabase errors.
 * Returns structured error data including message, details, hint, and code.
 * 
 * @param error - The error to extract details from (can be any type)
 * @returns Object containing message and optional Supabase-specific properties
 * 
 * @example
 * ```typescript
 * try {
 *   const { error } = await supabase.from('users').insert(data);
 *   if (error) throw error;
 * } catch (error: unknown) {
 *   const { message, details, hint, code } = getSupabaseErrorDetails(error);
 *   console.log('Message:', message);
 *   console.log('Code:', code);        // e.g., "23505"
 *   console.log('Details:', details);  // Additional error context
 *   console.log('Hint:', hint);        // Suggested fix
 * }
 * ```
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
 * Converts technical error messages into user-friendly messages.
 * Automatically detects common error patterns and provides clear, actionable messages.
 * 
 * @param error - The error to convert (can be any type)
 * @param context - Optional context to prepend to the message (e.g., "Asset", "User")
 * @returns A user-friendly error message suitable for displaying to end users
 * 
 * @example
 * ```typescript
 * // Unique constraint violation
 * const error1 = new Error('duplicate key violates unique constraint');
 * getUserFriendlyErrorMessage(error1, 'Asset');
 * // Returns: "Asset: A record with these details already exists."
 * 
 * // Null constraint violation
 * const error2 = new Error('null value in column "name" violates not-null constraint');
 * getUserFriendlyErrorMessage(error2);
 * // Returns: "Some required information is missing. Please check all fields."
 * 
 * // Permission error
 * const error3 = new Error('permission denied for table users');
 * getUserFriendlyErrorMessage(error3);
 * // Returns: "You do not have permission to perform this action."
 * ```
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
 * Logs an error with structured information for debugging.
 * Automatically extracts Supabase error details and includes timestamp and context.
 * 
 * @param error - The error to log (can be any type)
 * @param context - A descriptive context for where the error occurred (e.g., "AssetForm", "UserService")
 * @param additionalData - Optional additional data to include in the log (e.g., IDs, form data)
 * 
 * @example
 * ```typescript
 * try {
 *   await supabase.from('assets').update(data).eq('id', assetId);
 * } catch (error: unknown) {
 *   logError(error, 'AssetUpdate', {
 *     assetId,
 *     assetType: data.asset_type,
 *     operation: 'update'
 *   });
 *   // Logs: [AssetUpdate] Error: { message, code, details, timestamp, assetId, assetType, operation }
 * }
 * ```
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
 * Logs a warning message with structured information.
 * Use for non-critical issues that should be tracked but don't require error handling.
 * 
 * @param message - The warning message to log
 * @param context - A descriptive context for where the warning occurred
 * @param additionalData - Optional additional data to include in the log
 * 
 * @example
 * ```typescript
 * if (!asset.parent_asset_id && asset.asset_level > 1) {
 *   logWarning(
 *     'Asset at level > 1 has no parent assigned',
 *     'AssetValidator',
 *     { assetId: asset.id, assetLevel: asset.asset_level }
 *   );
 * }
 * // Logs: [AssetValidator] Warning: { message, timestamp, assetId, assetLevel }
 * ```
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
 * Displays an error toast notification with a user-friendly message.
 * Automatically converts technical errors to readable messages.
 * 
 * @param error - The error to display (can be any type)
 * @param options - Optional configuration for the toast
 * @param options.title - Custom title for the toast (default: "Error")
 * @param options.context - Context to prepend to the message (e.g., "Asset", "User")
 * @param options.duration - How long to show the toast in milliseconds
 * 
 * @example
 * ```typescript
 * try {
 *   const { error } = await supabase.from('assets').insert(data);
 *   if (error) throw error;
 * } catch (error: unknown) {
 *   showErrorToast(error, {
 *     title: 'Failed to create asset',
 *     context: 'Asset',
 *     duration: 5000
 *   });
 * }
 * ```
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
 * Displays a success toast notification.
 * Use after successful operations to provide user feedback.
 * 
 * @param message - The success message to display
 * @param options - Optional configuration for the toast
 * @param options.title - Custom title for the toast (default: "Success")
 * @param options.duration - How long to show the toast in milliseconds
 * 
 * @example
 * ```typescript
 * const { error } = await supabase.from('assets').insert(data);
 * if (error) throw error;
 * 
 * showSuccessToast('Asset created successfully', {
 *   title: 'Success',
 *   duration: 3000
 * });
 * ```
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
 * Displays a warning toast notification.
 * Use for non-critical issues that users should be aware of.
 * 
 * @param message - The warning message to display
 * @param options - Optional configuration for the toast
 * @param options.title - Custom title for the toast (default: "Warning")
 * @param options.duration - How long to show the toast in milliseconds
 * 
 * @example
 * ```typescript
 * if (duplicatesFound > 0) {
 *   showWarningToast(
 *     `Found ${duplicatesFound} duplicate assets that were skipped`,
 *     {
 *       title: 'Import Warning',
 *       duration: 5000
 *     }
 *   );
 * }
 * ```
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
 * Comprehensive error handler that logs the error and optionally shows a toast notification.
 * This is the primary error handling function to use in try-catch blocks.
 * 
 * @param error - The error to handle (can be any type)
 * @param context - A descriptive context for where the error occurred
 * @param options - Optional configuration for error handling
 * @param options.showToast - Whether to show a toast notification (default: true)
 * @param options.toastTitle - Custom title for the toast notification
 * @param options.additionalData - Additional data to include in the error log
 * 
 * @example
 * ```typescript
 * try {
 *   const { error } = await supabase.from('assets').update(data).eq('id', assetId);
 *   if (error) throw error;
 *   showSuccessToast('Asset updated successfully');
 * } catch (error: unknown) {
 *   handleError(error, 'AssetUpdate', {
 *     showToast: true,
 *     toastTitle: 'Failed to update asset',
 *     additionalData: {
 *       assetId,
 *       formData: data
 *     }
 *   });
 * }
 * ```
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
 * Wraps an async function with automatic error handling.
 * Returns the result on success, or null on error after handling.
 * 
 * @param fn - The async function to execute
 * @param context - A descriptive context for where the function is called
 * @param options - Optional configuration for error handling
 * @param options.showToast - Whether to show a toast notification on error (default: true)
 * @param options.toastTitle - Custom title for the error toast
 * @param options.onError - Custom error handler callback
 * @returns Promise that resolves to the function result or null on error
 * 
 * @example
 * ```typescript
 * const fetchUserProfile = async (userId: string) => {
 *   const { data, error } = await supabase
 *     .from('profiles')
 *     .select()
 *     .eq('id', userId)
 *     .single();
 *   if (error) throw error;
 *   return data;
 * };
 * 
 * const profile = await withErrorHandling(
 *   () => fetchUserProfile('123'),
 *   'FetchProfile',
 *   {
 *     showToast: true,
 *     toastTitle: 'Failed to load profile',
 *     onError: (error) => {
 *       // Custom error handling
 *       redirectToLogin();
 *     }
 *   }
 * );
 * 
 * if (profile) {
 *   // Use profile data
 * }
 * ```
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
 * Asserts that a value is defined (not null or undefined).
 * Throws an error if the value is null or undefined.
 * After this call, TypeScript knows the value is defined.
 * 
 * @param value - The value to check
 * @param errorMessage - Error message to throw if value is not defined
 * @throws {Error} If value is null or undefined
 * 
 * @example
 * ```typescript
 * function updateUser(userId: string | undefined) {
 *   assertDefined(userId, 'User ID is required');
 *   // TypeScript now knows userId is string (not undefined)
 *   
 *   const { error } = await supabase
 *     .from('users')
 *     .update(data)
 *     .eq('id', userId);  // No TypeScript error
 * }
 * ```
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
 * Validates that a value is defined and returns it.
 * Throws an error if the value is null or undefined.
 * Similar to assertDefined but returns the value for inline usage.
 * 
 * @param value - The value to check
 * @param errorMessage - Error message to throw if value is not defined
 * @returns The validated value
 * @throws {Error} If value is null or undefined
 * 
 * @example
 * ```typescript
 * async function createAsset(formData: AssetFormData) {
 *   try {
 *     const tenantId = requireValue(
 *       userProfile?.tenant_id,
 *       'User must be authenticated'
 *     );
 *     
 *     const { error } = await supabase
 *       .from('assets')
 *       .insert({
 *         ...formData,
 *         tenant_id: tenantId  // TypeScript knows this is defined
 *       });
 *     
 *     if (error) throw error;
 *   } catch (error: unknown) {
 *     handleError(error, 'CreateAsset');
 *   }
 * }
 * ```
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
