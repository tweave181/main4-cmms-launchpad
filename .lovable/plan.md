

## Customer Portal: Work Request Submission System

### Overview

Create a customer portal where authenticated users within an organization can submit work requests for issues like equipment breakdowns, environmental problems (heating, blocked toilets), plumbing issues, and safety hazards. Requests go to a review queue where staff can approve and convert them to work orders.

---

### Architecture Summary

```text
+-------------------+     +----------------------+     +------------------+
|  Customer Portal  | --> |   work_requests      | --> |  Review Queue    |
|  (Logged-in User) |     |   (New Table)        |     |  (Admin Page)    |
+-------------------+     +----------------------+     +------------------+
                                    |
                                    v
                          +------------------+
                          |   work_orders    |
                          |   (Existing)     |
                          +------------------+
```

---

### Database Design

#### New Table: `work_requests`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tenant_id | uuid | Tenant reference (required) |
| request_number | text | Auto-generated (e.g., "REQ-001") |
| title | text | Brief summary of issue |
| description | text | Detailed description |
| category | text | Equipment Breakdown, Environmental Issues, Plumbing/Water, Safety Hazard, General, Other |
| priority | text | low, medium, high, urgent (default: medium) |
| location_id | uuid | Optional link to locations table |
| location_description | text | Free-text location if not in system |
| submitted_by | uuid | User who submitted (from auth) |
| status | text | pending, approved, rejected, converted |
| reviewed_by | uuid | Admin who reviewed |
| reviewed_at | timestamptz | When reviewed |
| work_order_id | uuid | Link to created work order (after conversion) |
| created_at | timestamptz | Submission time |
| updated_at | timestamptz | Last update time |

#### New Table: `work_request_categories`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tenant_id | uuid | Tenant reference |
| name | text | Category name |
| description | text | Category description |
| icon | text | Icon identifier (optional) |
| is_active | boolean | Whether category is available |
| sort_order | integer | Display order |
| created_at | timestamptz | Creation time |

#### RLS Policies for `work_requests`

```sql
-- Users can view their own requests
CREATE POLICY "Users can view own requests"
ON work_requests FOR SELECT
USING (tenant_id = get_current_user_tenant_id() AND submitted_by = auth.uid());

-- Admins/Managers can view all requests in tenant
CREATE POLICY "Staff can view all tenant requests"
ON work_requests FOR SELECT
USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin_or_manager());

-- Users can create requests in their tenant
CREATE POLICY "Users can submit requests"
ON work_requests FOR INSERT
WITH CHECK (tenant_id = get_current_user_tenant_id());

-- Only staff can update requests
CREATE POLICY "Staff can update requests"
ON work_requests FOR UPDATE
USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin_or_manager());
```

---

### Implementation Components

#### 1. Navigation and Routes

**New Route:** `/portal` or `/work-requests`

Add to `App.tsx`:
```typescript
<Route path="/portal" element={<CustomerPortal />} />
<Route path="/admin/work-requests" element={<WorkRequestsReview />} />
```

Add to navigation menu:
- "Submit Request" link for all users
- "Work Requests" link for admins/managers in Admin menu

---

#### 2. Customer Portal Page (`src/pages/CustomerPortal.tsx`)

A user-friendly page for submitting work requests:

**UI Components:**
- Header with branding and user info
- Category selection cards (visual icons for each category)
- Simple form with:
  - Title (required)
  - Description (required)
  - Category dropdown
  - Priority selector (optional, defaults to medium)
  - Location selector or free-text
  - Optional photo upload capability
- Submit button
- "My Requests" section showing user's submitted requests

**Features:**
- Mobile-friendly responsive design
- Clear, simple language (not technical)
- Confirmation message after submission
- Ability to view status of previous requests

---

#### 3. Work Requests Review Page (`src/pages/WorkRequestsReview.tsx`)

Admin page for reviewing submitted requests:

**UI Components:**
- Filters: Status (Pending/Approved/Rejected), Category, Date range
- Table/Card list of requests showing:
  - Request number
  - Title
  - Category
  - Submitted by
  - Date
  - Status badge
- Detail panel/modal showing:
  - Full request details
  - Submitted by info
  - Action buttons: Approve, Reject, Convert to Work Order

**Workflow:**
1. Admin clicks on pending request
2. Reviews details
3. Can either:
   - **Approve**: Mark as approved (request stays in queue for later conversion)
   - **Reject**: Mark as rejected with optional reason
   - **Convert to Work Order**: Opens pre-filled work order form, creates work order, links to request

---

#### 4. Data Hook (`src/hooks/useWorkRequests.ts`)

```typescript
// Queries
- useWorkRequests(filters?) - fetch requests with filtering
- useMyWorkRequests() - fetch current user's requests only
- useWorkRequestCategories() - fetch available categories

// Mutations
- useCreateWorkRequest() - submit new request
- useUpdateWorkRequest() - update request status
- useConvertToWorkOrder() - create work order from request
```

---

#### 5. Types (`src/types/workRequest.ts`)

```typescript
export interface WorkRequest {
  id: string;
  tenant_id: string;
  request_number: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location_id?: string;
  location_description?: string;
  submitted_by: string;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  reviewed_by?: string;
  reviewed_at?: string;
  work_order_id?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  location?: { name: string } | null;
  submitter?: { name: string; email: string } | null;
  reviewer?: { name: string } | null;
  work_order?: { work_order_number: string } | null;
}

export interface WorkRequestCategory {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
}

export interface WorkRequestFormData {
  title: string;
  description: string;
  category: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  location_id?: string;
  location_description?: string;
}
```

---

### Default Request Categories

When a tenant is created, seed these default categories:

| Name | Description | Icon |
|------|-------------|------|
| Equipment Breakdown | Machinery, lifts, doors, electrical equipment failures | wrench |
| Environmental Issues | Heating, cooling, ventilation, lighting problems | thermometer |
| Plumbing / Water | Blocked toilets, leaks, drainage issues | droplet |
| Safety Hazard | Trip hazards, damaged fixtures, urgent safety concerns | alert-triangle |
| Cleaning | Spillage, mess, cleaning required | sparkles |
| General Maintenance | Other maintenance requests | hammer |
| Other | Requests that don't fit other categories | help-circle |

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/CustomerPortal.tsx` | Main portal page for submitting requests |
| `src/pages/WorkRequestsReview.tsx` | Admin review queue page |
| `src/types/workRequest.ts` | TypeScript interfaces |
| `src/hooks/useWorkRequests.ts` | Data fetching and mutations |
| `src/components/work-requests/WorkRequestForm.tsx` | Form component for submissions |
| `src/components/work-requests/WorkRequestCard.tsx` | Card display component |
| `src/components/work-requests/WorkRequestDetail.tsx` | Detail view component |
| `src/components/work-requests/WorkRequestFilters.tsx` | Filter controls |
| `src/components/work-requests/ConvertToWorkOrderModal.tsx` | Conversion dialog |
| `src/components/work-requests/CategorySelector.tsx` | Visual category picker |

---

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add portal and admin routes |
| `src/components/layout/Sidebar.tsx` | Add navigation links |
| Database migration | Create tables, RLS policies, seed categories |

---

### Security Considerations

1. **RLS Policies**: Regular users only see their own requests; admins/managers see all tenant requests
2. **Tenant Isolation**: All requests scoped to tenant_id
3. **Input Validation**: Zod schema validation on form inputs
4. **Role-Based Access**: Only admin/manager roles can review and convert requests

---

### Future Enhancements (Not in Initial Scope)

- Email notifications when request status changes
- Photo/attachment uploads
- QR code generation for quick access links
- Request templates for common issues
- Auto-assignment rules based on category

