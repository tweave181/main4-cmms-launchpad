# Integration Tests Documentation

## Overview

Integration tests verify that error handling works correctly with real Supabase database operations, form submissions, and React Query mutations.

## Test Setup

### Environment Configuration

Create a `.env.test` file for test environment variables:

```bash
VITE_SUPABASE_URL=https://your-test-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-test-anon-key
```

**Important:** Use a separate Supabase project for testing, never use production database!

### Running Integration Tests

```bash
# Run all tests (unit + integration)
npm run test

# Run only integration tests
npm run test -- src/test/integration

# Run integration tests with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## Test Structure

### Test Files

```
src/test/
├── setup.ts                          # Unit test setup
├── integration/
│   ├── setup.ts                      # Integration test setup & helpers
│   ├── errorHandling.integration.test.ts  # Database operations
│   └── reactQuery.integration.test.ts     # React Query mutations
```

### Test Database Setup

The integration tests use helper functions to manage test data:

```typescript
import {
  setupTestUser,
  signInTestUser,
  cleanupTestUser,
  createTestAsset,
  cleanupTestAssets,
} from './setup';

beforeAll(async () => {
  await setupTestUser();
  await signInTestUser();
});

afterAll(async () => {
  await cleanupTestAssets();
  await cleanupTestUser();
});
```

## Test Coverage

### Database Operations (errorHandling.integration.test.ts)

✅ **Insert Operations**
- Successful asset creation
- Duplicate key constraint violations
- Null constraint violations

✅ **Update Operations**
- Successful updates
- Invalid foreign key constraints
- RLS permission checks

✅ **Delete Operations**
- Successful deletions
- Foreign key constraint violations
- Cascading deletes

✅ **Query Operations**
- Empty results with `maybeSingle()`
- Query filtering
- Tenant isolation (RLS)

✅ **Form Submissions**
- Validation errors
- Successful submissions
- Concurrent submissions

✅ **Async Wrappers**
- Success with `withErrorHandling()`
- Failure with error callbacks
- Custom error handling

✅ **Background Operations**
- Silent error logging
- No user notifications

✅ **Permission Errors**
- RLS permission denied
- Unauthenticated access

✅ **Network Errors**
- Request timeouts
- Connection failures

✅ **Complex Scenarios**
- Transaction-like rollbacks
- Bulk operations with partial failures

### React Query (reactQuery.integration.test.ts)

✅ **Mutations**
- Successful create/update/delete
- Mutation errors with toast
- Sequential mutations
- Concurrent mutations

✅ **Queries**
- Successful data fetching
- No results handling
- Query errors
- List queries with filtering

✅ **Optimistic Updates**
- Optimistic UI updates
- Rollback on error

## Best Practices

### 1. Test Isolation

Each test should be independent and clean up after itself:

```typescript
it('should create asset', async () => {
  const asset = await createTestAsset();
  
  // Test logic here
  
  // Cleanup
  if (asset?.id) {
    await supabaseTest.from('assets').delete().eq('id', asset.id);
  }
});
```

### 2. Use maybeSingle() for Single Records

```typescript
// ✅ CORRECT - handles no results gracefully
const { data, error } = await supabase
  .from('assets')
  .select()
  .eq('id', assetId)
  .maybeSingle();

// ❌ AVOID - throws error if no results
const { data, error } = await supabase
  .from('assets')
  .select()
  .eq('id', assetId)
  .single();
```

### 3. Test Error Messages

Verify that user-friendly error messages are displayed:

```typescript
expect(mockToast).toHaveBeenCalledWith(
  expect.objectContaining({
    description: expect.stringContaining('already exists'),
  })
);
```

### 4. Test RLS Policies

Verify tenant isolation:

```typescript
it('should respect RLS policies', async () => {
  const asset = await createTestAsset();
  
  // Query with wrong tenant (should fail)
  const wrongTenantId = '00000000-0000-0000-0000-000000000000';
  const { data } = await supabase
    .from('assets')
    .select()
    .eq('tenant_id', wrongTenantId)
    .eq('id', asset.id)
    .maybeSingle();
  
  expect(data).toBeNull(); // RLS blocked access
});
```

### 5. Clean Up Test Data

Always clean up in `afterAll` or `afterEach`:

```typescript
afterAll(async () => {
  await cleanupTestAssets();
  await cleanupTestDepartments();
  await cleanupTestUser();
});
```

## Common Issues & Solutions

### Issue: Tests Failing Locally

**Solution:** Ensure test database is configured correctly:
1. Create a separate Supabase project for testing
2. Copy `.env.example` to `.env.test`
3. Update with test project credentials
4. Run migrations on test database

### Issue: RLS Tests Failing

**Solution:** Verify RLS policies are applied:
1. Check that test user is authenticated
2. Verify tenant_id in JWT claims
3. Ensure RLS policies are enabled on tables

### Issue: Cleanup Failing

**Solution:** Check foreign key constraints:
1. Delete child records before parent records
2. Use CASCADE on foreign keys where appropriate
3. Verify tenant_id matches

### Issue: Timeout Errors

**Solution:** Increase test timeout:
```typescript
// In vitest.config.ts
test: {
  testTimeout: 30000, // 30 seconds
}
```

## Debugging Integration Tests

### 1. View Database Logs

```typescript
// Enable detailed logging
const { data, error } = await supabase
  .from('assets')
  .insert(data)
  .select();

console.log('Result:', { data, error });
```

### 2. Check Supabase Dashboard

- Review table data
- Check RLS policies
- View auth logs
- Monitor real-time queries

### 3. Use Test UI

```bash
npm run test:ui
```

Navigate to failing test and view:
- Console logs
- Error messages
- Test execution timeline

### 4. Run Single Test

```bash
npm run test -- -t "should handle duplicate key"
```

## CI/CD Integration

Integration tests run automatically in CI:

```yaml
# .github/workflows/test.yml
- name: Run integration tests
  run: npm run test -- src/test/integration
  env:
    VITE_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
    VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.TEST_SUPABASE_KEY }}
```

### Required Secrets

Add to GitHub repository secrets:
- `TEST_SUPABASE_URL`
- `TEST_SUPABASE_KEY`

## Performance Considerations

- Integration tests are slower than unit tests (30s vs 1s)
- Run unit tests more frequently during development
- Run integration tests before commits/PRs
- Use parallel execution when possible

## Writing New Integration Tests

### Template

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  setupTestUser,
  signInTestUser,
  cleanupTestUser,
  createTestAsset,
} from './setup';
import { handleError, showSuccessToast } from '@/utils/errorHandling';

describe('My Integration Test', () => {
  beforeAll(async () => {
    await setupTestUser();
    await signInTestUser();
  });

  afterAll(async () => {
    await cleanupTestUser();
  });

  it('should test something', async () => {
    // Arrange
    const asset = await createTestAsset();
    
    // Act
    try {
      // Perform operation
    } catch (error: unknown) {
      handleError(error, 'TestContext');
    }
    
    // Assert
    expect(mockToast).toHaveBeenCalled();
    
    // Cleanup
    if (asset?.id) {
      await supabaseTest.from('assets').delete().eq('id', asset.id);
    }
  });
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
- [React Query Testing](https://tanstack.com/query/latest/docs/react/guides/testing)
