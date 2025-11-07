# Snapshot Testing Guide

This guide covers snapshot testing for UI components to ensure consistency across changes.

## Overview

Snapshot tests capture the rendered output of components and compare them against stored snapshots. When components change, snapshots must be reviewed and updated if the changes are intentional.

## Running Snapshot Tests

```bash
# Run all snapshot tests
npm run test src/test/snapshot

# Run snapshot tests in watch mode
npm run test:watch src/test/snapshot

# Update snapshots (after reviewing changes)
npm run test -- -u src/test/snapshot

# Run with UI
npm run test:ui
```

## Snapshot Test Structure

Snapshot tests are located in `src/test/snapshot/` and follow this pattern:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent Snapshots', () => {
  it('renders default state', () => {
    const { container } = render(<MyComponent />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with props', () => {
    const { container } = render(<MyComponent variant="primary" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

## What to Snapshot Test

### ✅ Good Candidates for Snapshot Testing

1. **UI Components**
   - Buttons with different variants
   - Badges with different styles
   - Cards and containers
   - Form inputs and controls

2. **Display Components**
   - Data displays (addresses, user info)
   - Empty states
   - Loading states
   - Error states

3. **Static Content**
   - Headers and footers
   - Navigation menus
   - Status indicators

### ❌ Poor Candidates for Snapshot Testing

1. **Dynamic Content**
   - Components with timestamps
   - Components with random IDs
   - Components with animations

2. **Complex Interactive Components**
   - Forms with validation
   - Components with complex state
   - Components with side effects

3. **Third-Party Components**
   - External libraries (test integration instead)

## Best Practices

### 1. Keep Snapshots Small and Focused

```typescript
// ✅ Good - Test individual component states
it('renders primary button', () => {
  const { container } = render(<Button variant="primary">Click</Button>);
  expect(container.firstChild).toMatchSnapshot();
});

// ❌ Bad - Snapshot of entire page
it('renders entire dashboard', () => {
  const { container } = render(<Dashboard />);
  expect(container).toMatchSnapshot();
});
```

### 2. Test All Variants

```typescript
describe('Badge', () => {
  it('renders default badge', () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders secondary badge', () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders outline badge', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

### 3. Use Meaningful Test Names

```typescript
// ✅ Good - Descriptive test names
it('renders Full Time employment status', () => { ... });
it('renders with complete address including all fields', () => { ... });

// ❌ Bad - Vague test names
it('renders correctly', () => { ... });
it('works', () => { ... });
```

### 4. Mock Dynamic Data

```typescript
// ✅ Good - Use consistent mock data
const mockAddress = {
  id: '1',
  address_line_1: '123 Main Street',
  town_or_city: 'London',
  postcode: 'SW1A 1AA',
  created_at: '2024-01-01', // Fixed date
};

// ❌ Bad - Dynamic data causes snapshot changes
const mockAddress = {
  id: crypto.randomUUID(),
  created_at: new Date().toISOString(),
};
```

## Reviewing Snapshot Changes

When snapshots fail:

1. **Review the diff carefully**
   ```bash
   npm run test src/test/snapshot
   ```

2. **Verify changes are intentional**
   - Did you update component styles?
   - Did you change component structure?
   - Did you add/remove props?

3. **Update snapshots if changes are correct**
   ```bash
   npm run test -- -u src/test/snapshot
   ```

4. **Commit updated snapshots**
   ```bash
   git add src/test/snapshot/__snapshots__
   git commit -m "Update snapshots after UI changes"
   ```

## Common Issues

### Issue: Snapshots fail on CI but pass locally

**Cause**: Different Node versions or dependencies

**Solution**: Ensure CI and local environments match:
```yaml
# .github/workflows/test.yml
- uses: actions/setup-node@v3
  with:
    node-version: '18.x'
```

### Issue: Snapshots change unexpectedly

**Cause**: Dynamic data or timestamps

**Solution**: Mock all dynamic values:
```typescript
// Mock dates
vi.useFakeTimers();
vi.setSystemTime(new Date('2024-01-01'));

// Mock random values
vi.spyOn(Math, 'random').mockReturnValue(0.5);
```

### Issue: Large snapshot diffs are hard to read

**Cause**: Testing too much in one snapshot

**Solution**: Break into smaller, focused tests:
```typescript
// Instead of one large snapshot
it('renders entire form', () => { ... });

// Break into smaller snapshots
describe('UserForm', () => {
  it('renders name field', () => { ... });
  it('renders email field', () => { ... });
  it('renders submit button', () => { ... });
});
```

## Integration with CI/CD

Snapshot tests should run in your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Run snapshot tests
  run: npm run test src/test/snapshot
  
- name: Check for snapshot changes
  run: |
    if [[ $(git diff --name-only | grep __snapshots__) ]]; then
      echo "Snapshots have changed. Please review and commit them."
      exit 1
    fi
```

## Snapshot File Management

Snapshots are stored in `__snapshots__` directories:

```
src/test/snapshot/
├── components.snapshot.test.tsx
└── __snapshots__/
    └── components.snapshot.test.tsx.snap
```

### Rules:
- ✅ Commit snapshot files to version control
- ✅ Review snapshot diffs in PRs
- ❌ Don't manually edit snapshot files
- ❌ Don't ignore snapshot test failures

## Example Workflow

1. **Make UI changes**
   ```bash
   # Edit component
   vim src/components/ui/button.tsx
   ```

2. **Run tests**
   ```bash
   npm run test src/test/snapshot
   # Tests fail due to snapshot mismatch
   ```

3. **Review changes**
   ```bash
   # Review the diff in terminal output
   # Verify changes are intentional
   ```

4. **Update snapshots**
   ```bash
   npm run test -- -u src/test/snapshot
   ```

5. **Commit changes**
   ```bash
   git add src/components/ui/button.tsx
   git add src/test/snapshot/__snapshots__
   git commit -m "Update button styles and snapshots"
   ```

## Additional Resources

- [Vitest Snapshot Testing](https://vitest.dev/guide/snapshot.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Snapshot Testing Best Practices](https://kentcdodds.com/blog/effective-snapshot-testing)

## Coverage

Current snapshot coverage includes:

- ✅ UI Components (Badge, Button, Card, Separator, Progress, Skeleton)
- ✅ Feature Components (CompanyTypeBadges, UserEmploymentBadge)
- ✅ Display Components (AddressDisplay)
- ✅ Empty States (AssetEmptyState, InventoryEmptyState)

To add more snapshot tests, follow the patterns in `src/test/snapshot/components.snapshot.test.tsx`.
