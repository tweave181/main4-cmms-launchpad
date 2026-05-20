// Helpers to build a per-record network folder link from a tenant-wide root.

export const sanitizeFolderName = (name: string): string => {
  if (!name) return '';
  return name
    // strip Windows-illegal chars: <>:"/\|?*  and control chars
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, ' ')
    // collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // avoid trailing dots/spaces (illegal on Windows)
    .replace(/[. ]+$/g, '')
    .slice(0, 120);
};

export interface BuiltFolderLink {
  /** Human-readable path shown to the user. */
  displayPath: string;
  /** href safe to put in an anchor (may be file:/// or http(s)://). */
  href: string;
  /** True if the link opens directly in a browser (http/https). */
  isWebUrl: boolean;
  /** True if the root looks like a Windows UNC path (\\server\share). */
  isUnc: boolean;
}

export const buildContractFolderUrl = (
  root: string | null | undefined,
  contractName: string | null | undefined,
): BuiltFolderLink | null => {
  if (!root || !root.trim()) return null;
  const folder = sanitizeFolderName(contractName || '');
  const r = root.trim();

  const isWeb = /^https?:\/\//i.test(r);
  const isFile = /^file:\/\//i.test(r);
  const isUnc = /^\\\\/.test(r);

  if (isWeb || isFile) {
    const base = r.replace(/\/+$/, '');
    const displayPath = folder ? `${base}/${folder}` : base;
    return { displayPath, href: encodeURI(displayPath), isWebUrl: isWeb, isUnc: false };
  }

  if (isUnc) {
    const base = r.replace(/[\\/]+$/, '');
    const displayPath = folder ? `${base}\\${folder}` : base;
    // Browsers will typically refuse to navigate to file:// from https,
    // but we still provide a file:/// href as best effort.
    const fileHref = 'file:///' + displayPath.replace(/\\/g, '/').replace(/^\/+/, '');
    return { displayPath, href: encodeURI(fileHref), isWebUrl: false, isUnc: true };
  }

  // Local/mapped drive path like Z:\Main4\Contracts or /mnt/share/...
  const sep = r.includes('\\') ? '\\' : '/';
  const base = r.replace(/[\\/]+$/, '');
  const displayPath = folder ? `${base}${sep}${folder}` : base;
  const fileHref = 'file:///' + displayPath.replace(/\\/g, '/').replace(/^\/+/, '');
  return { displayPath, href: encodeURI(fileHref), isWebUrl: false, isUnc: false };
};
