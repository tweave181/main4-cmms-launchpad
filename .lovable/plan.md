

# Asset Reports Module

Replace the "under construction" placeholder on the Reports page with a full asset reporting section featuring summary KPIs, interactive charts, a filterable/exportable asset list, and a warranty expiry report.

## Data Source

All reports will query the existing `assets` table (with joins to `departments`) using the same `useOfflineAssets` or a dedicated report hook. No database changes needed.

## Components to Build

### 1. Asset Report Summary Cards (KPI row)
A row of stat cards at the top:
- **Total Assets** count
- **Active / Inactive / Maintenance / Disposed** breakdown
- **Critical Priority** count
- **Expiring Warranties** (within 30 days)

### 2. Asset Charts Section
Using `recharts` (already installed):
- **Assets by Status** - Pie chart (active, inactive, maintenance, disposed)
- **Assets by Department** - Bar chart (horizontal)
- **Assets by Category** - Pie chart
- **Assets by Priority** - Bar chart (low, medium, high, critical with color coding)

### 3. Asset List Export
- Filterable table with status/department/category filters
- Export buttons for **PDF** (using `jspdf`, already installed) and **CSV** (manual generation)
- Columns: Asset Tag, Name, Status, Department, Category, Priority, Purchase Date, Warranty Expiry

### 4. Warranty Expiry Report
- Table showing assets with warranty dates, sorted by expiry
- Color-coded rows: red for expired, amber for expiring within 30 days, green for valid
- Filter toggle: show all / expired only / expiring soon

## File Structure

```
src/pages/Reports.tsx                          -- Main page, orchestrates sections
src/components/reports/AssetReportSummary.tsx   -- KPI cards
src/components/reports/AssetCharts.tsx          -- Recharts visualizations
src/components/reports/AssetListExport.tsx      -- Filterable table + export
src/components/reports/WarrantyExpiryReport.tsx -- Warranty-specific report
src/hooks/useAssetReportData.ts                -- Shared hook fetching & computing report data
```

## Technical Approach

- **`useAssetReportData`** hook: fetches assets with department join, computes all aggregations (counts by status, department, category, priority, warranty analysis). Single query, memoized computations.
- **Charts**: `recharts` PieChart, BarChart with responsive containers and custom colors matching the app's design system.
- **PDF Export**: `jspdf` with auto-table layout listing all filtered assets.
- **CSV Export**: Generate CSV string from filtered data, trigger browser download.
- **Warranty logic**: Compare `warranty_expiry` against today using `date-fns`.
- Keep the existing Mermaid relationship diagram at the bottom of the page.

## Layout

The Reports page will have tabs or sections in this order:
1. Summary KPI cards (always visible at top)
2. Charts section
3. Asset List with Export
4. Warranty Expiry Report
5. CMMS Relationship Diagram (existing, kept at bottom)

