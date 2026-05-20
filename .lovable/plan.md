## Move Documents & Links to Service Contract Detail Page

### What changes

1. **Service Contract Detail page** (`src/pages/ServiceContractDetail.tsx`)
   - Add a new "Documents & Links" card section below "Items covered by this Contract".
   - Reuse the existing `ContractDocumentsSection` component in editable mode (not read-only), so it shows the list of attached files/URLs with an **+ Add** button next to the section title.
   - Any tenant user can add, open/download, or remove documents directly from this page.

2. **Edit Service Contract modal** (`src/components/contracts/ServiceContractModal.tsx`)
   - Remove the embedded `<ContractDocumentsSection />` (and its import) so the edit form is focused purely on contract fields.

3. **Contract Detail modal** (`src/components/contracts/ContractDetailModal.tsx`)
   - Leave as-is (still shows documents read-only when contracts are previewed via the modal from the list page). No behavior change needed there since the request is specifically about the detail page and the edit modal.

### Out of scope
- No database, storage, or hook changes. The existing `service_contract_documents` table, `contract-documents` bucket, and `useContractDocuments` hooks are reused.
- No new route — "its own section" lives on the existing `/admin/service-contracts/:id` page (interpreting "make its own page" as a standalone section on the contract page rather than a separate URL). If you'd prefer a separate URL (e.g. `/admin/service-contracts/:id/documents`), let me know and I'll adjust.
