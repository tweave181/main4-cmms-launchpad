
## Plan: Add Prefix Column to Category Export

### Overview

Update the category export function to include the asset tag prefix in the CSV output, matching the format displayed in the table (e.g., `E1`, `E2`).

---

### Current State

The export currently outputs:
```csv
Category Name,Description
Electrical Equipment,Equipment for electrical work
Plumbing,Plumbing supplies
```

### After Implementation

The export will output:
```csv
Category Name,Prefix,Description
Electrical Equipment,E1,Equipment for electrical work
Plumbing,E2,Plumbing supplies
HVAC,,Climate control equipment
```

Categories without a prefix will have an empty value in that column.

---

### Implementation Details

**File:** `src/pages/CategoryManager.tsx`

Update the `handleExport` function to:

1. Add "Prefix" to the CSV header row
2. Format the prefix as `{letter}{number}` (without leading zeros), matching the table display
3. Use empty string for categories without a prefix

```typescript
const handleExport = () => {
  const csvData: string[][] = [
    ['Category Name', 'Prefix', 'Description'],
    ...categories.map(cat => [
      cat.name,
      cat.prefix_letter && cat.prefix_number_code 
        ? `${cat.prefix_letter}${parseInt(cat.prefix_number_code)}`
        : '',
      cat.description || ''
    ])
  ];
  const csv = generateCSV(csvData);
  const date = new Date().toISOString().split('T')[0];
  const siteName = tenantName || 'export';
  downloadCSV(csv, `${siteName}-categories-${date}.csv`);
};
```

---

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/CategoryManager.tsx` | Update `handleExport` function to include Prefix column |

---

### Technical Notes

- The prefix format (`E1`, `E2`) uses `parseInt()` to remove leading zeros from `prefix_number_code`, matching the existing display logic in `CategoryList.tsx`
- No changes needed to the Category interface or hook - the data is already available
- Single file change, minimal impact
