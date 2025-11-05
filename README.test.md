# Testing Documentation

## Running Tests

This project uses [Vitest](https://vitest.dev/) for unit testing.

### Commands

```bash
# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

Tests are located alongside the source files in `__tests__` directories:

```
src/
  utils/
    errorHandling.ts
    __tests__/
      errorHandling.test.ts
```

## Error Handling Tests

The error handling utilities are comprehensively tested with:

### Type Guards Tests
- ✅ `isError` - Tests Error instances vs other types
- ✅ `isErrorWithMessage` - Tests objects with message property
- ✅ `isSupabaseError` - Tests Supabase error format
- ✅ `isErrorWithStatus` - Tests HTTP status errors

### Message Extraction Tests
- ✅ `getErrorMessage` - Tests message extraction from various error types
- ✅ `getUserFriendlyErrorMessage` - Tests error message translation
- ✅ `getSupabaseErrorDetails` - Tests Supabase error detail extraction

### Logging Tests
- ✅ `logError` - Tests structured error logging
- ✅ `logWarning` - Tests warning logging

### Toast Notification Tests
- ✅ `showErrorToast` - Tests error toast display
- ✅ `showSuccessToast` - Tests success toast display
- ✅ `showWarningToast` - Tests warning toast display

### Error Handling Pattern Tests
- ✅ `handleError` - Tests comprehensive error handling
- ✅ `withErrorHandling` - Tests async function wrapper

### Validation Tests
- ✅ `assertDefined` - Tests type assertion
- ✅ `requireValue` - Tests value requirement

### Edge Cases
- ✅ Circular references
- ✅ Custom error classes
- ✅ Missing stack traces
- ✅ Long error messages
- ✅ Special characters
- ✅ Empty messages
- ✅ Async errors
- ✅ Promise rejections
- ✅ Concurrent errors

## Coverage Goals

Target coverage: **90%+** for all utility functions

Current coverage can be viewed by running:
```bash
npm run test:coverage
```

## Writing New Tests

When adding new error handling utilities:

1. Create test file in `__tests__` directory
2. Follow the existing pattern:
   ```typescript
   import { describe, it, expect, vi } from 'vitest';
   import { yourFunction } from '../yourFile';

   describe('Your Function', () => {
     it('should handle normal case', () => {
       expect(yourFunction(input)).toBe(expected);
     });

     it('should handle edge case', () => {
       expect(yourFunction(edgeCase)).toBe(expected);
     });
   });
   ```
3. Test both happy paths and error cases
4. Include edge cases and error scenarios
5. Run coverage to ensure adequate testing

## Mocking

The test setup automatically mocks:
- `toast` function from `@/hooks/use-toast`
- `console.error`
- `console.warn`

Access mocks via:
```typescript
import { mockToast } from '@/test/setup';

expect(mockToast).toHaveBeenCalledWith(...);
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Names**: Use descriptive test names
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Edge Cases**: Test boundary conditions
5. **Error Cases**: Test failure scenarios
6. **Mock Cleanup**: Tests automatically clean up mocks

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Before deployments

Ensure all tests pass before merging.
