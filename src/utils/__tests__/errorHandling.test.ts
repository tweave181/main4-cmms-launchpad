import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  // Type Guards
  isError,
  isErrorWithMessage,
  isSupabaseError,
  isErrorWithStatus,
  // Message Extraction
  getErrorMessage,
  getUserFriendlyErrorMessage,
  getSupabaseErrorDetails,
  // Logging
  logError,
  logWarning,
  // Toast Notifications
  showErrorToast,
  showSuccessToast,
  showWarningToast,
  // Error Handling
  handleError,
  withErrorHandling,
  // Validation
  assertDefined,
  requireValue,
  type SupabaseError,
} from '../errorHandling';
import { mockToast } from '@/test/setup';

describe('Error Handling Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============= Type Guards Tests =============
  describe('Type Guards', () => {
    describe('isError', () => {
      it('should return true for Error instances', () => {
        expect(isError(new Error('test'))).toBe(true);
        expect(isError(new TypeError('test'))).toBe(true);
        expect(isError(new RangeError('test'))).toBe(true);
      });

      it('should return false for non-Error types', () => {
        expect(isError({ message: 'test' })).toBe(false);
        expect(isError('error string')).toBe(false);
        expect(isError(null)).toBe(false);
        expect(isError(undefined)).toBe(false);
        expect(isError(123)).toBe(false);
        expect(isError([])).toBe(false);
      });
    });

    describe('isErrorWithMessage', () => {
      it('should return true for objects with string message property', () => {
        expect(isErrorWithMessage({ message: 'test' })).toBe(true);
        expect(isErrorWithMessage({ message: 'test', code: 500 })).toBe(true);
        expect(isErrorWithMessage(new Error('test'))).toBe(true);
      });

      it('should return false for invalid types', () => {
        expect(isErrorWithMessage({ message: 123 })).toBe(false);
        expect(isErrorWithMessage({ msg: 'test' })).toBe(false);
        expect(isErrorWithMessage('test')).toBe(false);
        expect(isErrorWithMessage(null)).toBe(false);
        expect(isErrorWithMessage(undefined)).toBe(false);
        expect(isErrorWithMessage({})).toBe(false);
      });
    });

    describe('isSupabaseError', () => {
      it('should return true for Supabase error objects', () => {
        const supabaseError: SupabaseError = {
          message: 'Database error',
          code: '23505',
          details: 'Duplicate key violation',
          hint: 'Ensure unique constraint',
        };
        expect(isSupabaseError(supabaseError)).toBe(true);
      });

      it('should return true with partial Supabase properties', () => {
        expect(isSupabaseError({ message: 'test', code: '23505' })).toBe(true);
        expect(isSupabaseError({ message: 'test', details: 'details' })).toBe(true);
        expect(isSupabaseError({ message: 'test', hint: 'hint' })).toBe(true);
      });

      it('should return false for non-Supabase errors', () => {
        expect(isSupabaseError(new Error('test'))).toBe(false);
        expect(isSupabaseError({ message: 'test' })).toBe(false);
        expect(isSupabaseError('error')).toBe(false);
        expect(isSupabaseError(null)).toBe(false);
      });
    });

    describe('isErrorWithStatus', () => {
      it('should return true for objects with status property', () => {
        expect(isErrorWithStatus({ status: 404 })).toBe(true);
        expect(isErrorWithStatus({ status: 500, statusText: 'Server Error' })).toBe(true);
      });

      it('should return false for objects without status', () => {
        expect(isErrorWithStatus({ message: 'test' })).toBe(false);
        expect(isErrorWithStatus(new Error('test'))).toBe(false);
        expect(isErrorWithStatus(null)).toBe(false);
        expect(isErrorWithStatus(undefined)).toBe(false);
      });
    });
  });

  // ============= Message Extraction Tests =============
  describe('Message Extraction', () => {
    describe('getErrorMessage', () => {
      it('should extract message from Error instances', () => {
        expect(getErrorMessage(new Error('Test error'))).toBe('Test error');
        expect(getErrorMessage(new TypeError('Type error'))).toBe('Type error');
      });

      it('should extract message from objects with message property', () => {
        expect(getErrorMessage({ message: 'Custom error' })).toBe('Custom error');
      });

      it('should return string errors as-is', () => {
        expect(getErrorMessage('String error')).toBe('String error');
      });

      it('should return default message for unknown types', () => {
        expect(getErrorMessage(null)).toBe('An unknown error occurred');
        expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
        expect(getErrorMessage(123)).toBe('An unknown error occurred');
        expect(getErrorMessage({})).toBe('An unknown error occurred');
        expect(getErrorMessage([])).toBe('An unknown error occurred');
      });
    });

    describe('getSupabaseErrorDetails', () => {
      it('should extract full Supabase error details', () => {
        const error: SupabaseError = {
          message: 'Database error',
          code: '23505',
          details: 'Duplicate key',
          hint: 'Use unique values',
        };

        const details = getSupabaseErrorDetails(error);
        expect(details.message).toBe('Database error');
        expect(details.code).toBe('23505');
        expect(details.details).toBe('Duplicate key');
        expect(details.hint).toBe('Use unique values');
      });

      it('should handle partial Supabase errors', () => {
        const error = { message: 'Error', code: '23505' };
        const details = getSupabaseErrorDetails(error);
        expect(details.message).toBe('Error');
        expect(details.code).toBe('23505');
        expect(details.details).toBeUndefined();
      });

      it('should handle non-Supabase errors', () => {
        const details = getSupabaseErrorDetails(new Error('Regular error'));
        expect(details.message).toBe('Regular error');
        expect(details.code).toBeUndefined();
        expect(details.details).toBeUndefined();
      });
    });

    describe('getUserFriendlyErrorMessage', () => {
      it('should translate tenant_id errors', () => {
        const error = new Error('tenant_id is missing');
        const message = getUserFriendlyErrorMessage(error);
        expect(message).toBe('There was an issue with your account permissions. Please try logging out and back in.');
      });

      it('should translate unique constraint errors', () => {
        const error = new Error('duplicate key violates unique constraint');
        expect(getUserFriendlyErrorMessage(error)).toContain('A record with these details already exists');
      });

      it('should translate unique constraint errors with context', () => {
        const error = new Error('unique constraint violation');
        const message = getUserFriendlyErrorMessage(error, 'Asset');
        expect(message).toBe('Asset: A record with these details already exists.');
      });

      it('should translate null constraint errors', () => {
        const error = new Error('null value in column "name" violates not-null constraint');
        const message = getUserFriendlyErrorMessage(error);
        expect(message).toBe('Some required information is missing. Please check all fields.');
      });

      it('should translate foreign key constraint errors', () => {
        const error = new Error('violates foreign key constraint');
        const message = getUserFriendlyErrorMessage(error);
        expect(message).toBe('Cannot perform this action because the record is referenced elsewhere.');
      });

      it('should translate permission errors', () => {
        expect(getUserFriendlyErrorMessage(new Error('permission denied')))
          .toBe('You do not have permission to perform this action.');
        expect(getUserFriendlyErrorMessage(new Error('insufficient privilege')))
          .toBe('You do not have permission to perform this action.');
      });

      it('should translate network errors', () => {
        expect(getUserFriendlyErrorMessage(new Error('network error')))
          .toBe('Network error. Please check your connection and try again.');
        expect(getUserFriendlyErrorMessage(new Error('fetch failed')))
          .toBe('Network error. Please check your connection and try again.');
      });

      it('should translate timeout errors', () => {
        const error = new Error('Request timeout exceeded');
        const message = getUserFriendlyErrorMessage(error);
        expect(message).toBe('The request took too long. Please try again.');
      });

      it('should return original message for unmatched errors', () => {
        const error = new Error('Custom business logic error');
        const message = getUserFriendlyErrorMessage(error);
        expect(message).toBe('Custom business logic error');
      });
    });
  });

  // ============= Logging Tests =============
  describe('Logging Utilities', () => {
    describe('logError', () => {
      it('should log error with context', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Test error');
        
        logError(error, 'TestContext');
        
        expect(consoleError).toHaveBeenCalledWith(
          '[TestContext] Error:',
          expect.objectContaining({
            message: 'Test error',
            error,
          })
        );
      });

      it('should log Supabase errors with details', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error: SupabaseError = {
          message: 'Database error',
          code: '23505',
          details: 'Duplicate key',
        };
        
        logError(error, 'DatabaseOperation');
        
        expect(consoleError).toHaveBeenCalledWith(
          '[DatabaseOperation] Error:',
          expect.objectContaining({
            message: 'Database error',
            code: '23505',
            details: 'Duplicate key',
          })
        );
      });

      it('should include additional data in logs', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Test error');
        
        logError(error, 'TestContext', {
          userId: '123',
          action: 'update',
        });
        
        expect(consoleError).toHaveBeenCalledWith(
          '[TestContext] Error:',
          expect.objectContaining({
            userId: '123',
            action: 'update',
          })
        );
      });

      it('should include timestamp', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Test error');
        
        logError(error, 'TestContext');
        
        expect(consoleError).toHaveBeenCalledWith(
          '[TestContext] Error:',
          expect.objectContaining({
            timestamp: expect.any(String),
          })
        );
      });
    });

    describe('logWarning', () => {
      it('should log warning with context', () => {
        const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        logWarning('Test warning', 'TestContext');
        
        expect(consoleWarn).toHaveBeenCalledWith(
          '[TestContext] Warning:',
          expect.objectContaining({
            message: 'Test warning',
          })
        );
      });

      it('should include additional data', () => {
        const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        logWarning('Test warning', 'TestContext', { level: 'high' });
        
        expect(consoleWarn).toHaveBeenCalledWith(
          '[TestContext] Warning:',
          expect.objectContaining({
            message: 'Test warning',
            level: 'high',
            timestamp: expect.any(String),
          })
        );
      });
    });
  });

  // ============= Toast Notification Tests =============
  describe('Toast Notifications', () => {
    describe('showErrorToast', () => {
      it('should show error toast with default title', () => {
        const error = new Error('Test error');
        
        showErrorToast(error);
        
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Test error',
          variant: 'destructive',
          duration: undefined,
        });
      });

      it('should show error toast with custom title', () => {
        const error = new Error('Test error');
        
        showErrorToast(error, { title: 'Custom Error' });
        
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Custom Error',
          description: 'Test error',
          variant: 'destructive',
          duration: undefined,
        });
      });

      it('should show user-friendly messages', () => {
        const error = new Error('duplicate key violates unique constraint');
        
        showErrorToast(error, { context: 'Asset' });
        
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Asset: A record with these details already exists.',
          variant: 'destructive',
          duration: undefined,
        });
      });

      it('should accept custom duration', () => {
        const error = new Error('Test error');
        
        showErrorToast(error, { duration: 5000 });
        
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: 5000,
          })
        );
      });
    });

    describe('showSuccessToast', () => {
      it('should show success toast with default title', () => {
        showSuccessToast('Operation successful');
        
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Operation successful',
          duration: undefined,
        });
      });

      it('should show success toast with custom title', () => {
        showSuccessToast('Asset created', { title: 'Created' });
        
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Created',
          description: 'Asset created',
          duration: undefined,
        });
      });

      it('should accept custom duration', () => {
        showSuccessToast('Success', { duration: 3000 });
        
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: 3000,
          })
        );
      });
    });

    describe('showWarningToast', () => {
      it('should show warning toast', () => {
        showWarningToast('Warning message');
        
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Warning',
          description: 'Warning message',
          variant: 'default',
          duration: undefined,
        });
      });

      it('should accept custom options', () => {
        showWarningToast('Warning', { title: 'Caution', duration: 4000 });
        
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Caution',
          description: 'Warning',
          variant: 'default',
          duration: 4000,
        });
      });
    });
  });

  // ============= Error Handling Patterns Tests =============
  describe('Error Handling Patterns', () => {
    describe('handleError', () => {
      it('should log error and show toast by default', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Test error');
        
        handleError(error, 'TestContext');
        
        expect(consoleError).toHaveBeenCalled();
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
          })
        );
      });

      it('should not show toast when showToast is false', () => {
        const error = new Error('Test error');
        
        handleError(error, 'TestContext', { showToast: false });
        
        expect(mockToast).not.toHaveBeenCalled();
      });

      it('should use custom toast title', () => {
        const error = new Error('Test error');
        
        handleError(error, 'TestContext', { toastTitle: 'Custom Title' });
        
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Custom Title',
          })
        );
      });

      it('should include additional data in logs', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Test error');
        
        handleError(error, 'TestContext', {
          additionalData: { assetId: '123' },
        });
        
        expect(consoleError).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            assetId: '123',
          })
        );
      });
    });

    describe('withErrorHandling', () => {
      it('should return result on success', async () => {
        const successFn = vi.fn().mockResolvedValue('success');
        
        const result = await withErrorHandling(successFn, 'TestContext');
        
        expect(result).toBe('success');
        expect(successFn).toHaveBeenCalled();
        expect(mockToast).not.toHaveBeenCalled();
      });

      it('should return null on error', async () => {
        const errorFn = vi.fn().mockRejectedValue(new Error('Test error'));
        
        const result = await withErrorHandling(errorFn, 'TestContext');
        
        expect(result).toBeNull();
        expect(mockToast).toHaveBeenCalled();
      });

      it('should call onError callback', async () => {
        const errorFn = vi.fn().mockRejectedValue(new Error('Test error'));
        const onError = vi.fn();
        
        await withErrorHandling(errorFn, 'TestContext', { onError });
        
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      });

      it('should not show toast when showToast is false', async () => {
        const errorFn = vi.fn().mockRejectedValue(new Error('Test error'));
        
        await withErrorHandling(errorFn, 'TestContext', { showToast: false });
        
        expect(mockToast).not.toHaveBeenCalled();
      });

      it('should use custom toast title', async () => {
        const errorFn = vi.fn().mockRejectedValue(new Error('Test error'));
        
        await withErrorHandling(errorFn, 'TestContext', {
          toastTitle: 'Custom Error',
        });
        
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Custom Error',
          })
        );
      });
    });
  });

  // ============= Validation Tests =============
  describe('Validation Utilities', () => {
    describe('assertDefined', () => {
      it('should not throw for defined values', () => {
        expect(() => assertDefined('value', 'Error')).not.toThrow();
        expect(() => assertDefined(0, 'Error')).not.toThrow();
        expect(() => assertDefined(false, 'Error')).not.toThrow();
        expect(() => assertDefined([], 'Error')).not.toThrow();
        expect(() => assertDefined({}, 'Error')).not.toThrow();
      });

      it('should throw for null', () => {
        expect(() => assertDefined(null, 'Value is null')).toThrow('Value is null');
      });

      it('should throw for undefined', () => {
        expect(() => assertDefined(undefined, 'Value is undefined')).toThrow('Value is undefined');
      });

      it('should not throw for defined values', () => {
        const testValue: string | undefined = 'test';
        expect(() => assertDefined(testValue, 'Error')).not.toThrow();
        // After assertion, value is guaranteed to be defined
      });
    });

    describe('requireValue', () => {
      it('should return value for defined values', () => {
        expect(requireValue('value', 'Error')).toBe('value');
        expect(requireValue(0, 'Error')).toBe(0);
        expect(requireValue(false, 'Error')).toBe(false);
      });

      it('should throw for null', () => {
        expect(() => requireValue(null, 'Value is null')).toThrow('Value is null');
      });

      it('should throw for undefined', () => {
        expect(() => requireValue(undefined, 'Value is undefined')).toThrow('Value is undefined');
      });

      it('should maintain type in return', () => {
        const value: string | undefined = 'test';
        const result = requireValue(value, 'Error');
        // TypeScript should know result is string
        expect(result.length).toBe(4);
      });

      it('should work with complex types', () => {
        const obj: { id: string } | undefined = { id: '123' };
        const result = requireValue(obj, 'Object required');
        expect(result.id).toBe('123');
      });
    });
  });

  // ============= Edge Cases Tests =============
  describe('Edge Cases', () => {
    it('should handle circular reference errors', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;
      
      // Should not crash
      expect(() => getErrorMessage(circular)).not.toThrow();
      expect(() => logError(circular, 'Test')).not.toThrow();
    });

    it('should handle errors with prototype chain', () => {
      class CustomError extends Error {
        code: string;
        constructor(message: string, code: string) {
          super(message);
          this.code = code;
        }
      }
      
      const error = new CustomError('Custom error', 'CUSTOM_001');
      expect(isError(error)).toBe(true);
      expect(getErrorMessage(error)).toBe('Custom error');
    });

    it('should handle errors without stack trace', () => {
      const error = new Error('No stack');
      delete error.stack;
      
      expect(() => logError(error, 'Test')).not.toThrow();
    });

    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(10000);
      const error = new Error(longMessage);
      
      expect(getErrorMessage(error)).toBe(longMessage);
      expect(() => showErrorToast(error)).not.toThrow();
    });

    it('should handle special characters in error messages', () => {
      const specialChars = 'Error with special chars: <>&"\'\n\t\r';
      const error = new Error(specialChars);
      
      expect(getErrorMessage(error)).toBe(specialChars);
    });

    it('should handle empty error messages', () => {
      const error = new Error('');
      expect(getErrorMessage(error)).toBe('');
    });

    it('should handle errors with numeric codes', () => {
      const error = { message: 'Test', code: 404, status: 404 };
      expect(isErrorWithMessage(error)).toBe(true);
    });

    it('should handle async errors in withErrorHandling', async () => {
      const asyncError = async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
        throw new Error('Async error');
      };
      
      const result = await withErrorHandling(asyncError, 'AsyncTest');
      expect(result).toBeNull();
    });

    it('should handle promise rejections with non-Error values', async () => {
      const rejectWithString = () => Promise.reject('String rejection');
      
      const result = await withErrorHandling(rejectWithString, 'StringReject');
      expect(result).toBeNull();
    });

    it('should handle multiple concurrent errors', async () => {
      const errors = [
        new Error('Error 1'),
        new Error('Error 2'),
        new Error('Error 3'),
      ];
      
      const promises = errors.map((error, i) =>
        withErrorHandling(() => Promise.reject(error), `Test${i}`)
      );
      
      const results = await Promise.all(promises);
      expect(results).toEqual([null, null, null]);
    });
  });
});
