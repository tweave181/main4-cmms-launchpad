## Goal
Allow any tenant user to attach multiple external documents to a service contract — either by uploading a file or by pasting a link to a document hosted elsewhere.

## UX

On the Service Contract form/detail modal, add a new **Documents** section:
- List of attached documents showing: icon (file vs link), title, type/source, who added it, date.
- Each row has **Open/Download** and **Delete** actions.
- "Add Document" button opens a small dialog with two tabs:
  - **Upload file** — file picker (PDF, DOC/DOCX, XLS/XLSX, images; ≤20 MB) + optional title/description.
  - **External link** — URL field (validated http/https) + title + optional description.

Surface the same section read-only inside `ContractDetailModal`, and editable inside `ServiceContractModal`.

## Data model

New table `service_contract_documents`:
- `id`, `tenant_id`, `contract_id` (→ service_contracts)
- `document_type` — `'file' | 'link'`
- `title` (required), `description` (nullable)
- `file_path` (storage path, nullable), `file_name`, `file_size`, `mime_type` (nullable, for files)
- `external_url` (nullable, for links)
- `created_by`, `created_at`, `updated_at`

RLS: standard tenant-scoped policies (select/insert/update/delete `tenant_id = get_current_user_tenant_id()`), matching the rest of the contract tables. Any authenticated tenant user can add or delete.

New private storage bucket `contract-documents` with RLS on `storage.objects`:
- Files stored under `{tenant_id}/{contract_id}/{uuid}-{filename}`.
- Authenticated users can SELECT/INSERT/DELETE objects only when the first path segment equals their `get_current_user_tenant_id()`.
- Downloads use signed URLs (60 s).

## Frontend changes

- `src/hooks/useContractDocuments.ts` — list / upload / addLink / delete (React Query).
- `src/components/contracts/ContractDocumentsSection.tsx` — list + Add button (used in both modals; `readOnly` prop).
- `src/components/contracts/AddContractDocumentDialog.tsx` — tabbed upload/link form with zod validation (title ≤200, URL must be http/https, file ≤20 MB, allowed mime types).
- Wire into `ContractDetailModal.tsx` (read-only view + manage) and `ServiceContractModal.tsx` (only enabled after the contract exists / on edit; for new contracts, show after first save).

## Out of scope
- Version history of documents.
- Per-document access control beyond tenant isolation.
- Preview rendering of PDFs/Office files in-app (open in new tab instead).
