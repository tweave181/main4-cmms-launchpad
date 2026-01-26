
## Plan: Add Export and Import to Asset Tag Prefix Manager

### Overview

Add Export and Import functionality to the Asset Tag Prefix Manager page, following the same pattern as the Category Manager. Only admin users will see these buttons.

---

### Export Functionality

**CSV Format:**
```csv
Prefix,Code,Category,Description
E,1,Electrical Equipment,Equipment for electrical work
E,2,Plumbing,Plumbing supplies and tools
```

The export will include:
- **Prefix** - The prefix letter (e.g., `E`)
- **Code** - The number code without leading zeros (e.g., `1` from `001`)
- **Category** - The linked category name
- **Description** - The prefix description

**Filename format:** `{Site Name}-asset-prefixes-{YYYY-MM-DD}.csv`

---

### Import Functionality

Create a new modal component that allows:
1. Download a CSV template
2. Upload a CSV file with columns: Prefix, Code, Category, Description
3. Preview parsed data with validation
4. Import valid prefixes

**Validation rules:**
- Prefix letter is required (single uppercase letter)
- Code is required (number 1-999)
- Prefix + Code combination must be unique
- Category is optional (if provided, must match existing category name)
- Checks for duplicates in file and against existing prefixes

---

### Implementation Details

#### 1. Update `AssetPrefixManager.tsx`

Add:
- Import `isAdmin` from auth context
- Import `Download`, `Upload` icons from lucide-react
- Add state for import modal: `const [isImportOpen, setIsImportOpen] = useState(false);`
- Add tenant name query (same pattern as CategoryManager)
- Add `handleExport` function
- Add Export/Import buttons (visible only to admins)

```typescript
const handleExport = () => {
  const csvData: string[][] = [
    ['Prefix', 'Code', 'Category', 'Description'],
    ...prefixes.map(prefix => [
      prefix.prefix_letter,
      parseInt(prefix.number_code).toString(),
      prefix.category?.name || '',
      prefix.description || ''
    ])
  ];
  const csv = generateCSV(csvData);
  const date = new Date().toISOString().split('T')[0];
  const siteName = tenantName || 'export';
  downloadCSV(csv, `${siteName}-asset-prefixes-${date}.csv`);
};
```

**Button placement:** Add before "Bulk Setup" button in the header:
```tsx
{isAdmin && (
  <>
    <Button variant="outline" onClick={handleExport} className="rounded-2xl">
      <Download className="w-4 h-4 mr-2" />
      Export
    </Button>
    <Button variant="outline" onClick={() => setIsImportOpen(true)} className="rounded-2xl">
      <Upload className="w-4 h-4 mr-2" />
      Import
    </Button>
  </>
)}
```

---

#### 2. Create `AssetPrefixImportModal.tsx`

**File:** `src/components/asset-prefixes/AssetPrefixImportModal.tsx`

A modal component following the same pattern as `CategoryImportModal.tsx`:

**Features:**
- Download template button with example data:
  ```csv
  Prefix,Code,Category,Description
  E,1,Electrical,Electrical equipment prefix
  P,1,Plumbing,Plumbing items prefix
  ```
- File upload input (CSV only)
- Preview table showing: Status, Prefix, Code, Category, Description
- Validation badges (Valid, Already exists, Invalid prefix, etc.)
- Import button (only imports valid rows)

**Validation logic:**
```typescript
interface ParsedPrefix {
  prefix_letter: string;
  number_code: string;
  category_name: string;
  description: string;
  isValid: boolean;
  error?: string;
}

// Validation checks:
// 1. Prefix letter must be single A-Z character
// 2. Code must be number 1-999
// 3. Prefix + Code combo must be unique (in file and database)
// 4. Category name (if provided) must match existing category
```

---

#### 3. Add `importPrefixes` Mutation to `useAssetPrefixes.ts`

Add a mutation function similar to `importCategories` in useCategories:

```typescript
const importPrefixes = useMutation({
  mutationFn: async (prefixesData: {
    prefix_letter: string;
    number_code: string;
    category_id?: string;
    description: string;
  }[]) => {
    const { data, error } = await supabase
      .from('asset_tag_prefixes')
      .insert(prefixesData.map(p => ({
        tenant_id: userProfile!.tenant_id,
        prefix_letter: p.prefix_letter.toUpperCase(),
        number_code: p.number_code.padStart(3, '0'),
        category_id: p.category_id || null,
        description: p.description,
      })))
      .select();
    
    if (error) throw error;
    return data;
  },
  onSuccess: (data) => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['unlinkedCategories'] });
    toast({ title: 'Success', description: `${data.length} prefix(es) imported` });
  },
});
```

---

### Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/AssetPrefixManager.tsx` | **Modify** | Add Export/Import buttons, export handler, modal state |
| `src/components/asset-prefixes/AssetPrefixImportModal.tsx` | **Create** | New import modal with CSV parsing and validation |
| `src/hooks/useAssetPrefixes.ts` | **Modify** | Add `importPrefixes` mutation |

---

### Technical Notes

- Uses existing `generateCSV` and `downloadCSV` utilities from `src/utils/csvUtils.ts`
- Follows the exact UI pattern from CategoryManager (admin-only, outline buttons)
- Category lookup during import uses case-insensitive name matching
- Number codes are stored with leading zeros (e.g., `001`) but displayed/exported without them
