

# Import Core Setup Data from External Database

## What's happening

You want to bring over your core setup data (tenants, departments, locations, categories, job titles) from your previous external database into Lovable Cloud. 

**Important note about auth users**: The `auth.users` CSV you uploaded cannot be directly imported — it's a protected system table with hashed passwords that are tied to the original database. Each user will need to **re-register** on the new system. However, I can create matching entries in the `users` (profile) table and `tenants` table so the data structure is ready.

## What I need from you

Please export and upload CSV files for these tables from your external database:

1. **tenants** — organization/company records
2. **departments** — department names and descriptions  
3. **locations** — location hierarchy
4. **location_levels** — level definitions (Building, Floor, Room, etc.)
5. **categories** — asset categories
6. **job_titles** — job title definitions
7. **users** — user profile records (the `public.users` table, not `auth.users`)

Upload each as a separate CSV and I'll import them, preserving the original UUIDs so all foreign key references stay intact.

## How the import will work

1. Parse each CSV, validate data, and map columns to the current schema
2. Insert records using the database insert tool, preserving original IDs
3. Verify row counts match after import
4. Users will need to re-register with the same email addresses — the `handle_new_user` trigger will be temporarily adjusted or bypassed so it doesn't create duplicate tenant/profile records

## Next step

Upload your CSV exports for the tables listed above and I'll begin importing them.

