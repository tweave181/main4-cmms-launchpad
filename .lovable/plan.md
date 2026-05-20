## Goal
When the user opens the "Add New Address" form and no Company records exist, show a clear message and a button to create a Company first.

## Behavior
- On opening the Add Address modal (new address only, not edit), check for existing Company records using the existing `useCompanies()` hook.
- If `companies.length === 0`:
  - Replace the address form body with a friendly empty-state panel:
    - Title: "No companies found"
    - Message: "Addresses are linked to companies. Please add a company first before creating an address."
    - Primary button: "Add Company" — opens the existing `CompanyForm` modal (already used in `src/pages/Companies.tsx`) inline.
    - Secondary button: "Cancel" — closes the address modal.
  - On successful company creation, the companies query invalidates, the empty-state disappears, and the address form fields become available (preselecting the new company in the company dropdown if applicable).
- If companies exist, behavior is unchanged.

## Files to change
- `src/components/addresses/AddressFormModal.tsx`
  - Import `useCompanies` and `CompanyForm`.
  - Add `const { data: companies = [], isLoading } = useCompanies();`
  - When `!isEditing && !isLoading && companies.length === 0`, render the empty-state panel instead of the form.
  - Manage local `showCompanyForm` state to open the `CompanyForm` modal.

## Out of scope
- No backend / schema changes.
- Edit-address flow is untouched.
- Other entry points (e.g. `addVendorMode` from contracts) still go through the same modal, so they get the same guard automatically.
