## Network document folder linking — Service Contracts

### What the user gets
1. In **System Settings → System Settings tab**, a new "Document Storage" section with one field:
   - **Network documents root** — e.g. `\\fileserver\Main4\Contracts` or `file:///Z:/Main4/Contracts` or an `https://...` SharePoint root.
   - Helper text explains: each contract gets its own subfolder named after the contract; tenant is responsible for actually creating the folder on the share.
2. On each **Service Contract detail page**, a new card "Network Folder" shows:
   - The full computed path: `{root}/{sanitized contract name}`
   - An **Open folder** button (opens the path in a new tab — works for `http(s)://` directly; for UNC/`file://` we render a clickable link and copy-to-clipboard button, since browsers block `file://` navigation from https pages).
   - A **Copy path** button.
   - If no root is configured tenant-wide, show a muted hint linking admins to System Settings.

### Technical details

**DB (migration)**
- Add column `program_settings.network_documents_root TEXT NULL`.

**Types / hook**
- Extend `ProgramSettings` and `ProgramSettingsFormData` in `src/hooks/useProgramSettings.ts` with `network_documents_root?: string`.

**System Settings UI** (`src/components/program-settings/SystemSettingsForm.tsx`)
- Add a "Document Storage" section with a single input bound to `network_documents_root`.
- Save via existing `useUpdateProgramSettings`.

**Path helper** (new `src/utils/networkFolderUtils.ts`)
- `sanitizeFolderName(name)` → strips/replaces characters illegal on Windows (`<>:"/\\|?*`, control chars), trims, collapses whitespace, caps length ~120.
- `buildContractFolderUrl(root, contractName)` → joins with correct separator: backslash for UNC (`\\...`), forward slash for `file://`/`http(s)://`. Returns `{ displayPath, href, isWebUrl }`.

**Service Contract detail** (`src/pages/ServiceContractDetail.tsx`)
- New `NetworkFolderCard` component (small, colocated under `src/components/contracts/`) that reads program settings via `useProgramSettings` and the current contract name, renders the computed path with Open/Copy buttons.
- Placed next to / under the existing "Documents & Links" card.

### Out of scope
- No auto-creation of folders on the share (browser cannot do this).
- No file listing/browsing — Main4 just produces the link.
- No changes to Assets or Work Orders (Service Contracts only, per your choice).
- No changes to the existing `service_contract_documents` upload/link feature; this lives alongside it.
