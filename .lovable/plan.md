
## Separate Customer Table for Work Request Submitters

### Overview
You want to create a dedicated **customers** table for people who submit work requests. These users:
- Will only access the portal/submit request area
- Use their name as their username (simpler login)
- Have a complete profile for audit trail purposes

This separates "internal staff" (admins, managers, technicians) from "customers/requesters" who only submit work requests.

---

### What We Will Build

**1. New Database Table: `customers`**

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tenant_id | uuid | Multi-tenant isolation |
| name | text | Full name (also serves as username) |
| email | text | Contact email |
| phone | text | Phone number |
| phone_extension | text | Internal extension |
| department_id | uuid | FK to departments table |
| job_title_id | uuid | FK to job_titles table |
| work_area_id | uuid | FK to locations table |
| reports_to | uuid | FK to customers table (supervisor) |
| password_hash | text | Hashed password for login |
| is_active | boolean | Account status |
| created_at | timestamp | Record creation |
| updated_at | timestamp | Last update |

**2. Separate Customer Authentication**
- New login page at `/customer-login` specifically for customers
- Simple login: name + password (no email-based Supabase auth)
- Session stored in app state (not Supabase auth)

**3. Customer Portal Access**
- Route `/portal` will detect customer vs staff login
- Customers can only see the submit request page and their own requests
- No access to admin areas

**4. Work Request Updates**
- Change `submitted_by` in `work_requests` to reference `customers` table instead of `users`
- OR add a new column `customer_id` to track customer submissions separately

**5. Admin Review Enhancement**
- Display full customer profile on review cards
- Show department, job title, work area, supervisor

---

### Recommended Approach: Dual Submitter Support

Since you may want both staff AND customers to submit requests, I recommend:

| Column | Purpose |
|--------|---------|
| submitted_by | UUID - for staff (existing `users` table) |
| customer_id | UUID - for customers (new `customers` table) |

This way:
- Staff can still submit requests using their regular login
- Customers use the new customer login
- RLS policies can handle both scenarios

---

### Files to Create/Modify

| File | Action |
|------|--------|
| **Database Migration** | Create `customers` table with all profile fields |
| `src/types/customer.ts` | NEW - Customer type definitions |
| `src/hooks/useCustomers.ts` | NEW - CRUD hooks for customers |
| `src/contexts/CustomerAuthContext.tsx` | NEW - Customer authentication context |
| `src/pages/CustomerLogin.tsx` | NEW - Customer login page |
| `src/pages/CustomerPortal.tsx` | UPDATE - Support customer auth |
| `src/components/work-requests/WorkRequestForm.tsx` | UPDATE - Capture customer_id |
| `src/components/work-requests/WorkRequestReviewCard.tsx` | UPDATE - Display customer details |
| `src/hooks/useWorkRequests.ts` | UPDATE - Handle customer submissions |
| `src/App.tsx` | UPDATE - Add customer routes |

---

### Customer Management Admin Page

We will also create an admin page to manage customers:
- Add/edit/deactivate customers
- Set their department, job title, work area
- Set who they report to
- Reset passwords

---

### Security Considerations

| Aspect | Implementation |
|--------|----------------|
| Password storage | Hashed using bcrypt (Edge Function) |
| RLS Policies | Customers can only see their own requests |
| Session management | Separate from Supabase auth |
| Admin access | Only admins can manage customer accounts |

---

### Technical Details

**Customer Login Flow:**
```
1. Customer enters name + password on /customer-login
2. Edge Function validates credentials
3. Returns customer profile on success
4. CustomerAuthContext stores session
5. Portal components check customer context
```

**Work Request Submission:**
- If customer is logged in: set `customer_id` on request
- If staff is logged in: set `submitted_by` (existing behavior)
- RLS policies updated to allow both types

**Admin Review Display:**
Shows customer profile with:
- Name, email, phone + extension
- Department name
- Job title
- Work area location
- Supervisor name (from reports_to)
