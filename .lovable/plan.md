## Add New Vendor flow from Service Contract modal

### What changes
On the Add/Edit Service Contract modal, add an **"+ Add New Vendor"** button directly above the "Select vendor..." dropdown. Clicking it preserves the in-progress contract form, sends the user to the Address Book to create a new vendor (company + address marked as Supplier/Contractor), then returns to the Service Contract modal with the new vendor pre-selected.

### User flow
1. User opens "Add New Service Contract", types Contract Title, Dates, etc.
2. Vendor isn't in the list → clicks **+ Add New Vendor** above the dropdown.
3. Contract form draft is saved; user is taken to `/addresses` with the Add Address modal opened automatically (company field required, "Supplier" type pre-checked).
4. On save, user is returned to `/admin/service-contracts` (or `/admin/service-contracts/:id` if editing); the contract modal reopens with all previous field values restored and the newly-created vendor pre-selected in the Vendor Company dropdown.
5. User finishes and clicks Create Contract.

### Technical details

**`src/components/contracts/ServiceContractModal.tsx`**
- Above the Vendor Company Popover, add a small outline button: `<Button variant="outline" size="sm" onClick={handleAddNewVendor}><Plus/> Add New Vendor</Button>`.
- `handleAddNewVendor`:
  - Snapshot current form values via `getValues()` plus `{ returnPath: location.pathname, contractId: contract?.id ?? null }` into `sessionStorage` under key `pendingServiceContractDraft`.
  - `onClose()` the modal and `navigate('/addresses?addVendor=1')`.
- On mount (and when `companies` list changes), check `sessionStorage` for `pendingNewVendorId`. If present and modal is open: `reset(savedDraft)` then `setValue('vendor_company_id', pendingNewVendorId)` and clear both storage keys.

**`src/pages/Addresses.tsx`**
- Read `?addVendor=1` from URL. If present, auto-open `AddressFormModal` and pass an `initialType="supplier"` prop.
- On successful create, if `sessionStorage.pendingServiceContractDraft` exists:
  - Store the new `company_id` in `sessionStorage.pendingNewVendorId`.
  - Navigate back to `draft.returnPath` (e.g. `/admin/service-contracts`).

**`src/pages/ServiceContracts.tsx` / `ServiceContractDetail.tsx`**
- On mount, if `sessionStorage.pendingServiceContractDraft` exists, automatically open the Service Contract modal (create or edit based on saved `contractId`). The modal itself handles restoring values + selecting the new vendor.

**`src/components/addresses/AddressFormModal.tsx`**
- Accept optional `initialType` prop and `onCreated?: (result) => void` callback so the Addresses page can intercept the new company id and trigger the return navigation.

### Out of scope
- No DB schema changes.
- No edits to vendor list query — refetch happens automatically because `useCompanies` invalidates on insert.
- Edit-contract flow uses the same mechanism but returns to the detail page's edit modal.
