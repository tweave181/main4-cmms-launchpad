
## Plan: Enhance Department Details Page with Linked Records

### Overview

Fix the navigation issue where clicking on a department doesn't work, and enhance the Department Details page to display linked records (Assets, Users, and Locations) similar to how Location Level Details shows linked locations.

---

### Current Issues

1. **Broken Navigation**: `Departments.tsx` navigates to `/departments/${id}` which redirects to `/admin/preferences/departments` (loses the ID)
2. **Missing Linked Records**: The detail page only shows department info without showing related records

### After Implementation

- Clicking a department navigates correctly to the detail page
- Detail page shows sections for:
  - Linked Assets (with asset tag, name, status)
  - Linked Users (with name, email, job title)
  - Linked Locations (with name, code)
- Back button navigates to correct route
- Delete button is disabled if department is in use (has any linked records)

---

### Database Tables with department_id

| Table | Columns to Display |
|-------|-------------------|
| `assets` | asset_tag, asset_name, status |
| `users` | first_name, last_name, email, job_title_id |
| `locations` | name, location_code |

---

### Implementation Details

#### 1. Fix Navigation in `Departments.tsx`

Update the navigation to use the correct route:

```typescript
const handleDepartmentClick = (departmentId: string) => {
  navigate(`/admin/preferences/departments/${departmentId}`);
};
```

---

#### 2. Fix Navigation in `DepartmentDetails.tsx`

Update all back navigation to use the correct route:

```typescript
navigate('/admin/preferences/departments');
```

---

#### 3. Add Linked Records Queries

Add three new queries to fetch linked records:

```typescript
// Linked Assets
const { data: linkedAssets = [] } = useQuery({
  queryKey: ['department-assets', id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('assets')
      .select('id, asset_tag, asset_name, status')
      .eq('department_id', id)
      .order('asset_tag');
    if (error) throw error;
    return data || [];
  },
  enabled: !!id,
});

// Linked Users
const { data: linkedUsers = [] } = useQuery({
  queryKey: ['department-users', id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, job_title:job_title_id(title_name)')
      .eq('department_id', id)
      .order('first_name');
    if (error) throw error;
    return data || [];
  },
  enabled: !!id,
});

// Linked Locations
const { data: linkedLocations = [] } = useQuery({
  queryKey: ['department-locations', id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, location_code')
      .eq('department_id', id)
      .order('name');
    if (error) throw error;
    return data || [];
  },
  enabled: !!id,
});
```

---

#### 4. Update Delete Protection Logic

Check if department is in use by any of the three tables:

```typescript
const isInUse = linkedAssets.length > 0 || linkedUsers.length > 0 || linkedLocations.length > 0;
```

---

#### 5. Add Linked Records UI Sections

Add three Card sections below the department info, following the LocationLevelDetails pattern:

**Linked Assets Section:**
```text
+--------------------------------------------------+
| Linked Assets (3)                                |
+--------------------------------------------------+
| Asset Tag    | Asset Name           | Status     |
|--------------|----------------------|------------|
| E1-001       | Forklift A           | Active     |
| E1-002       | Generator B          | Maintenance|
| E2-001       | HVAC Unit 1          | Active     |
+--------------------------------------------------+
```

**Linked Users Section:**
```text
+--------------------------------------------------+
| Linked Users (2)                                 |
+--------------------------------------------------+
| Name              | Email              | Job Title|
|-------------------|--------------------| ---------|
| John Smith        | john@example.com   | Manager  |
| Jane Doe          | jane@example.com   | Technician|
+--------------------------------------------------+
```

**Linked Locations Section:**
```text
+--------------------------------------------------+
| Linked Locations (1)                             |
+--------------------------------------------------+
| Location Name      | Code                        |
|--------------------|------------------------------|
| Main Building      | MB-01                        |
+--------------------------------------------------+
```

Each table row is clickable to navigate to the respective detail page:
- Assets: `/assets?assetId=${id}`
- Users: `/users?userId=${id}`
- Locations: `/admin/preferences/locations?locationId=${id}`

---

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Departments.tsx` | Fix navigation to use `/admin/preferences/departments/${id}` |
| `src/pages/DepartmentDetails.tsx` | Fix back navigation, add linked record queries and UI sections |

---

### Technical Notes

- Uses the same UI pattern as `LocationLevelDetails.tsx` for consistency
- Imports Table components from `@/components/ui/table`
- Imports Badge for status display
- The delete button will be disabled with a tooltip when any linked records exist
- Empty sections show "No [items] are assigned to this department."
