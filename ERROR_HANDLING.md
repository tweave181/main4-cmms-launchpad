# Error Handling Documentation

## Overview

This project uses a centralized, type-safe error handling system located in `src/utils/errorHandling.ts`. This system replaces unsafe `catch (error: any)` patterns with proper type guards and provides consistent error handling across the entire application.

## Table of Contents

- [Why Centralized Error Handling?](#why-centralized-error-handling)
- [Core Concepts](#core-concepts)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Usage Patterns](#usage-patterns)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)
- [Examples](#examples)

---

## Why Centralized Error Handling?

### Problems with Traditional Error Handling

```typescript
// ❌ BAD: Unsafe error handling
try {
  await someOperation();
} catch (error: any) {  // Type safety lost!
  console.error(error);  // No structured logging
  toast({
    title: "Error",
    description: error.message,  // Might not exist!
    variant: "destructive"
  });
}
```

### Benefits of Centralized Error Handling

✅ **Type Safety**: Proper type guards instead of `any`  
✅ **Consistency**: Same error handling patterns across the app  
✅ **User-Friendly Messages**: Automatic translation of technical errors  
✅ **Structured Logging**: Better debugging with contextual information  
✅ **Maintainability**: Single source of truth for error handling logic  

---

## Core Concepts

### Type Guards

Type guards safely check error types without using `any`:

```typescript
import { isError, isErrorWithMessage, isSupabaseError } from '@/utils/errorHandling';

try {
  await operation();
} catch (error: unknown) {  // ✅ Use 'unknown' instead of 'any'
  if (isSupabaseError(error)) {
    // TypeScript now knows error has Supabase properties
    console.log(error.code, error.details, error.hint);
  } else if (isError(error)) {
    // TypeScript knows this is an Error instance
    console.log(error.message, error.stack);
  }
}
```

### Error Message Extraction

Safe extraction of error messages from any error type:

```typescript
import { getErrorMessage, getUserFriendlyErrorMessage } from '@/utils/errorHandling';

const message = getErrorMessage(error);  // Always returns a string
const friendly = getUserFriendlyErrorMessage(error, 'User Profile');  // Context-aware
```

### Automatic User-Friendly Messages

The system automatically translates technical errors into user-friendly messages:

| Technical Error | User-Friendly Message |
|----------------|----------------------|
| `violates unique constraint` | "A record with these details already exists." |
| `violates not-null constraint` | "Some required information is missing. Please check all fields." |
| `foreign key constraint` | "Cannot perform this action because the record is referenced elsewhere." |
| `permission denied` | "You do not have permission to perform this action." |
| `network error` | "Network error. Please check your connection and try again." |
| `timeout` | "The request took too long. Please try again." |
| Contains `tenant_id` | "There was an issue with your account permissions. Please try logging out and back in." |

---

## Quick Start

### Basic Usage in Try-Catch Blocks

```typescript
import { handleError, showSuccessToast } from '@/utils/errorHandling';

async function updateProfile(data: ProfileData) {
  try {
    const result = await supabase
      .from('profiles')
      .update(data)
      .eq('id', profileId);

    if (result.error) throw result.error;

    showSuccessToast('Profile updated successfully');
  } catch (error: unknown) {  // ✅ Always use 'unknown'
    handleError(error, 'UpdateProfile', {
      showToast: true,
      toastTitle: 'Update Failed',
    });
  }
}
```

### Usage in React Query Mutations

```typescript
import { showSuccessToast, showErrorToast } from '@/utils/errorHandling';

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async (data: UserData) => {
      const { data: result, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', userId);

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      showSuccessToast('User updated successfully');
    },
    onError: (error: unknown) => {  // ✅ Remove ': any'
      showErrorToast(error, {
        title: 'Update Failed',
        context: 'User',
      });
    },
  });
};
```

---

## API Reference

### Type Guards

#### `isError(error: unknown): error is Error`
Checks if error is an Error instance.

```typescript
if (isError(error)) {
  console.log(error.message, error.stack);
}
```

#### `isErrorWithMessage(error: unknown): error is ErrorWithMessage`
Checks if error has a message property.

```typescript
if (isErrorWithMessage(error)) {
  console.log(error.message);
}
```

#### `isSupabaseError(error: unknown): error is SupabaseError`
Checks if error is a Supabase error with details, hint, or code.

```typescript
if (isSupabaseError(error)) {
  console.log(error.code, error.details, error.hint);
}
```

#### `isErrorWithStatus(error: unknown): error is ErrorWithStatus`
Checks if error has HTTP status information.

```typescript
if (isErrorWithStatus(error)) {
  console.log(error.status, error.statusText);
}
```

---

### Message Extraction

#### `getErrorMessage(error: unknown): string`
Safely extracts error message from any error type.

```typescript
const message = getErrorMessage(error);  // Always returns string
```

#### `getUserFriendlyErrorMessage(error: unknown, context?: string): string`
Gets user-friendly error message with automatic translation.

```typescript
const friendly = getUserFriendlyErrorMessage(error, 'Asset');
// "Asset: A record with these details already exists."
```

#### `getSupabaseErrorDetails(error: unknown): { message, details?, hint?, code? }`
Extracts detailed information from Supabase errors.

```typescript
const { message, details, hint, code } = getSupabaseErrorDetails(error);
```

---

### Logging

#### `logError(error: unknown, context: string, additionalData?: Record<string, unknown>): void`
Logs error with structured information.

```typescript
logError(error, 'AssetForm', {
  assetId: asset.id,
  operation: 'update',
});
// Logs: [AssetForm] Error: { message, error, timestamp, assetId, operation }
```

#### `logWarning(message: string, context: string, additionalData?: Record<string, unknown>): void`
Logs warning with structured information.

```typescript
logWarning('Duplicate asset detected', 'AssetValidator', {
  assetTag: 'A-001',
});
```

---

### Toast Notifications

#### `showErrorToast(error: unknown, options?: { title?, context?, duration? }): void`
Shows error toast with user-friendly message.

```typescript
showErrorToast(error, {
  title: 'Update Failed',
  context: 'Asset',
  duration: 5000,
});
```

#### `showSuccessToast(message: string, options?: { title?, duration? }): void`
Shows success toast.

```typescript
showSuccessToast('Asset created successfully', {
  title: 'Success',
});
```

#### `showWarningToast(message: string, options?: { title?, duration? }): void`
Shows warning toast.

```typescript
showWarningToast('Asset has no parent assigned', {
  title: 'Warning',
});
```

---

### Complete Error Handling

#### `handleError(error: unknown, context: string, options?: { showToast?, toastTitle?, additionalData? }): void`
Handles error with logging and optional user notification.

```typescript
handleError(error, 'AssetForm', {
  showToast: true,
  toastTitle: 'Failed to create asset',
  additionalData: { assetTag: formData.asset_tag },
});
```

#### `withErrorHandling<T>(fn: () => Promise<T>, context: string, options?): Promise<T | null>`
Wraps async function with automatic error handling.

```typescript
const result = await withErrorHandling(
  () => fetchUserProfile(userId),
  'FetchProfile',
  {
    showToast: true,
    toastTitle: 'Failed to load profile',
    onError: (error) => {
      // Custom error handling
    },
  }
);
```

---

### Validation

#### `assertDefined<T>(value: T | null | undefined, errorMessage: string): asserts value is T`
Validates that value is not null/undefined, throws if invalid.

```typescript
assertDefined(userProfile, 'User profile is required');
// TypeScript now knows userProfile is defined
```

#### `requireValue<T>(value: T | null | undefined, errorMessage: string): T`
Validates and returns value or throws.

```typescript
const tenantId = requireValue(userProfile?.tenant_id, 'No tenant ID found');
```

---

## Usage Patterns

### Pattern 1: Simple Try-Catch

```typescript
import { handleError, showSuccessToast } from '@/utils/errorHandling';

async function createAsset(data: AssetData) {
  try {
    const { error } = await supabase
      .from('assets')
      .insert(data);

    if (error) throw error;

    showSuccessToast('Asset created successfully');
  } catch (error: unknown) {
    handleError(error, 'CreateAsset', {
      showToast: true,
      toastTitle: 'Failed to create asset',
    });
  }
}
```

### Pattern 2: React Query Mutation

```typescript
import { showSuccessToast, showErrorToast } from '@/utils/errorHandling';

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssetData) => {
      const { data: result, error } = await supabase
        .from('assets')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      showSuccessToast('Asset created successfully');
    },
    onError: (error: unknown) => {
      showErrorToast(error, {
        title: 'Create Failed',
        context: 'Asset',
      });
    },
  });
};
```

### Pattern 3: Form Submission

```typescript
import { handleError, showSuccessToast, requireValue } from '@/utils/errorHandling';

const onSubmit = async (data: FormData) => {
  try {
    // Validate required values
    const tenantId = requireValue(
      userProfile?.tenant_id,
      'No tenant found'
    );

    const { error } = await supabase
      .from('assets')
      .insert({
        ...data,
        tenant_id: tenantId,
      });

    if (error) throw error;

    showSuccessToast('Asset created successfully');
    onClose();
  } catch (error: unknown) {
    handleError(error, 'AssetForm', {
      showToast: true,
      toastTitle: 'Failed to create asset',
      additionalData: { formData: data },
    });
  }
};
```

### Pattern 4: Error Handling with Logging Only

```typescript
import { logError } from '@/utils/errorHandling';

async function backgroundSync() {
  try {
    await syncData();
  } catch (error: unknown) {
    // Log error but don't show toast for background operations
    logError(error, 'BackgroundSync', {
      timestamp: Date.now(),
      retryCount: 3,
    });
  }
}
```

### Pattern 5: Custom Error Handling

```typescript
import { 
  isSupabaseError, 
  getErrorMessage, 
  showErrorToast,
  logError 
} from '@/utils/errorHandling';

async function duplicateAsset(assetId: string) {
  try {
    const { error } = await supabase.rpc('duplicate_asset', {
      asset_id: assetId,
    });

    if (error) throw error;
  } catch (error: unknown) {
    logError(error, 'DuplicateAsset', { assetId });

    if (isSupabaseError(error) && error.code === '23505') {
      showErrorToast(error, {
        title: 'Duplicate Asset',
        context: 'An asset with this tag already exists',
      });
    } else {
      showErrorToast(error, {
        title: 'Duplication Failed',
      });
    }
  }
}
```

---

## Best Practices

### ✅ DO

1. **Always use `unknown` for caught errors**
   ```typescript
   catch (error: unknown) {  // ✅ Correct
   ```

2. **Use type guards before accessing error properties**
   ```typescript
   if (isSupabaseError(error)) {
     console.log(error.code);
   }
   ```

3. **Provide context in error handling**
   ```typescript
   handleError(error, 'AssetForm', { additionalData: { assetId } });
   ```

4. **Use `showSuccessToast` for success messages**
   ```typescript
   showSuccessToast('Asset created successfully');
   ```

5. **Validate required values with `requireValue` or `assertDefined`**
   ```typescript
   const tenantId = requireValue(userProfile?.tenant_id, 'No tenant found');
   ```

6. **Log errors with structured data for debugging**
   ```typescript
   logError(error, 'AssetForm', {
     assetId: asset.id,
     operation: 'update',
     formData: data,
   });
   ```

### ❌ DON'T

1. **Don't use `error: any`**
   ```typescript
   catch (error: any) {  // ❌ Never use 'any'
   ```

2. **Don't access error properties without type guards**
   ```typescript
   catch (error: unknown) {
     console.log(error.message);  // ❌ TypeScript error!
   }
   ```

3. **Don't use direct toast calls in error handlers**
   ```typescript
   catch (error: unknown) {
     toast({  // ❌ Use showErrorToast instead
       title: "Error",
       description: getErrorMessage(error),
       variant: "destructive"
     });
   }
   ```

4. **Don't use console.error directly in production code**
   ```typescript
   catch (error: unknown) {
     console.error(error);  // ❌ Use logError instead
   }
   ```

5. **Don't throw generic errors without context**
   ```typescript
   throw new Error('Error');  // ❌ Be specific!
   throw new Error('Failed to create asset: missing tenant_id');  // ✅
   ```

---

## Migration Guide

### Migrating Existing Error Handlers

#### Before (Unsafe)
```typescript
try {
  await operation();
} catch (error: any) {
  console.error('Operation failed:', error);
  toast({
    title: "Error",
    description: error.message || 'Operation failed',
    variant: "destructive"
  });
}
```

#### After (Type-Safe)
```typescript
import { handleError, showSuccessToast } from '@/utils/errorHandling';

try {
  await operation();
  showSuccessToast('Operation completed successfully');
} catch (error: unknown) {
  handleError(error, 'OperationName', {
    showToast: true,
    toastTitle: 'Operation Failed',
  });
}
```

### Migrating React Query Mutations

#### Before
```typescript
onError: (error: any) => {
  console.error('Mutation failed:', error);
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  });
}
```

#### After
```typescript
import { showErrorToast } from '@/utils/errorHandling';

onError: (error: unknown) => {
  showErrorToast(error, {
    title: 'Update Failed',
    context: 'Asset',
  });
}
```

---

## Examples

### Example 1: Asset Creation

```typescript
import { 
  handleError, 
  showSuccessToast, 
  requireValue 
} from '@/utils/errorHandling';

const createAsset = async (formData: AssetFormData) => {
  try {
    const tenantId = requireValue(
      userProfile?.tenant_id,
      'User must be authenticated'
    );

    const { data, error } = await supabase
      .from('assets')
      .insert({
        ...formData,
        tenant_id: tenantId,
        created_by: userProfile.id,
      })
      .select()
      .single();

    if (error) throw error;

    showSuccessToast('Asset created successfully');
    return data;
  } catch (error: unknown) {
    handleError(error, 'CreateAsset', {
      showToast: true,
      toastTitle: 'Failed to create asset',
      additionalData: {
        assetTag: formData.asset_tag,
        assetType: formData.asset_type,
      },
    });
    return null;
  }
};
```

### Example 2: Bulk Operations

```typescript
import { 
  logError, 
  showErrorToast, 
  showSuccessToast,
  showWarningToast 
} from '@/utils/errorHandling';

const bulkDeleteAssets = async (assetIds: string[]) => {
  const errors: string[] = [];
  const successful: string[] = [];

  for (const id of assetIds) {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      successful.push(id);
    } catch (error: unknown) {
      logError(error, 'BulkDeleteAssets', { assetId: id });
      errors.push(id);
    }
  }

  if (errors.length === 0) {
    showSuccessToast(`Successfully deleted ${successful.length} assets`);
  } else if (successful.length === 0) {
    showErrorToast(
      new Error('All deletions failed'),
      { title: 'Deletion Failed' }
    );
  } else {
    showWarningToast(
      `Deleted ${successful.length} assets, ${errors.length} failed`
    );
  }

  return { successful, errors };
};
```

### Example 3: Nested Operations with Rollback

```typescript
import { 
  handleError, 
  showSuccessToast, 
  logError 
} from '@/utils/errorHandling';

const createAssetWithChildren = async (
  parentData: AssetData,
  childrenData: AssetData[]
) => {
  let createdParentId: string | null = null;

  try {
    // Create parent
    const { data: parent, error: parentError } = await supabase
      .from('assets')
      .insert(parentData)
      .select()
      .single();

    if (parentError) throw parentError;
    createdParentId = parent.id;

    // Create children
    const childrenWithParent = childrenData.map(child => ({
      ...child,
      parent_asset_id: parent.id,
    }));

    const { error: childrenError } = await supabase
      .from('assets')
      .insert(childrenWithParent);

    if (childrenError) throw childrenError;

    showSuccessToast(
      `Created asset with ${childrenData.length} children`
    );
    return parent;
  } catch (error: unknown) {
    // Rollback: delete parent if created
    if (createdParentId) {
      try {
        await supabase
          .from('assets')
          .delete()
          .eq('id', createdParentId);
      } catch (rollbackError: unknown) {
        logError(rollbackError, 'RollbackAssetCreation', {
          parentId: createdParentId,
        });
      }
    }

    handleError(error, 'CreateAssetWithChildren', {
      showToast: true,
      toastTitle: 'Failed to create asset hierarchy',
    });
    return null;
  }
};
```

### Example 4: Retry Logic with Error Handling

```typescript
import { 
  logError, 
  showErrorToast, 
  getErrorMessage 
} from '@/utils/errorHandling';

const fetchWithRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isLastAttempt = attempt === maxRetries;

      logError(error, 'FetchWithRetry', {
        attempt,
        maxRetries,
        errorMessage: getErrorMessage(error),
      });

      if (isLastAttempt) {
        showErrorToast(error, {
          title: 'Request Failed',
          context: `Failed after ${maxRetries} attempts`,
        });
        return null;
      }

      // Wait before retry
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  return null;
};
```

---

## Troubleshooting

### Common Issues

**Issue**: TypeScript error "Property 'message' does not exist on type 'unknown'"

**Solution**: Use type guards before accessing properties
```typescript
if (isError(error)) {
  console.log(error.message);  // ✅ Now safe
}
```

**Issue**: User sees technical error messages

**Solution**: Use `getUserFriendlyErrorMessage` or `showErrorToast`
```typescript
showErrorToast(error, { context: 'Asset' });  // Automatically friendly
```

**Issue**: Can't find error details in logs

**Solution**: Use `logError` with additional context
```typescript
logError(error, 'AssetForm', {
  assetId: asset.id,
  operation: 'update',
  formData: data,
});
```

---

## Contributing

When adding new error handling patterns:

1. Add type guards if introducing new error types
2. Update `getUserFriendlyErrorMessage` for new error patterns
3. Document new patterns in this file
4. Add examples showing usage

---

## Related Files

- `src/utils/errorHandling.ts` - Main error handling utility
- `src/hooks/use-toast.ts` - Toast notification hook
- `src/components/ui/toaster.tsx` - Toast UI component

---

## Support

For questions or issues:
1. Check this documentation first
2. Review examples in existing code
3. Ask the team in #engineering channel
