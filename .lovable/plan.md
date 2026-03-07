

# Blocker: Database Schema Must Be Restored First

When Lovable Cloud was enabled, it created a fresh empty database. The original database tables (tenants, users, assets, departments, locations, categories, etc.) were not carried over. This is causing **all the build errors** you see -- the generated types file shows no tables, so every database query in the codebase fails to compile.

Before building the Asset Reports module, we need to restore the full database schema.

---

## Step 1: Restore Core Database Schema (migration)

Create a single consolidated migration that recreates all foundational tables and enums in dependency order:

1. **Enums**: `user_role`, `employment_status`, `contract_status`, `app_role`
2. **Core tables**: `tenants`, `users` (with all columns from later migrations like status, phone_number, employment_status, department_id, job_title_id, available_for_time_tracking)
3. **Supporting tables**: `departments`, `locations`, `location_levels`, `categories`, `company_details`, `contacts`, `address_book`
4. **Asset tables**: `assets` (with all columns including hierarchy fields, manufacturer_company_id, service_contract_id, barcode_printed_at, location_id), `asset_tag_prefixes`
5. **Work order tables**: `work_orders`, `work_order_comments`
6. **Inventory tables**: `inventory_parts`, `stock_transactions`, `part_asset_associations`, `part_work_order_usage`
7. **Contract tables**: `service_contracts`, `contract_asset_associations`, `contract_reminders`, `contract_lines`
8. **Auth/permissions tables**: `user_roles`, `user_invitations`, `permissions`, `role_permissions`, `user_permission_overrides`
9. **Other tables**: `maintenance_jobs`, `time_records`, `audit_logs`, `email_templates`, `checklist_records`, job titles, work requests, comment status options, department/job title audit logs
10. **Functions & triggers**: `handle_new_user`, `get_current_user_tenant_id`, `is_current_user_admin`, `has_role`, `update_updated_at_column`, location code generation, etc.
11. **RLS policies**: Tenant-scoped policies for all tables

This will be a large SQL migration (~500-800 lines) that replaces all 120+ existing migration files.

## Step 2: Build the Asset Reports Module (5 files)

Once the schema is restored and types regenerate:

- **`src/hooks/useAssetReportData.ts`** -- Hook that fetches assets with department joins and computes aggregations (counts by status, department, category, priority, warranty analysis)
- **`src/components/reports/AssetReportSummary.tsx`** -- KPI cards row (total assets, status breakdown, critical priority count, expiring warranties)
- **`src/components/reports/AssetCharts.tsx`** -- Recharts pie/bar charts for status, department, category, priority
- **`src/components/reports/AssetListExport.tsx`** -- Filterable table with PDF/CSV export
- **`src/components/reports/WarrantyExpiryReport.tsx`** -- Color-coded warranty expiry table
- **`src/pages/Reports.tsx`** -- Updated to include tabbed layout with all report sections + existing Mermaid diagram

---

## Important Note

The migration will be extensive since it recreates the entire schema from scratch. All existing migration files will remain (they won't conflict since the new migration uses `IF NOT EXISTS` patterns). Your existing data from the previous database will not be restored -- only the schema structure.

