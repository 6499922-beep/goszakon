const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);

export function isAdminPanelEnabled() {
  const value = process.env.ADMIN_PANEL_ENABLED?.trim().toLowerCase();
  return value ? ENABLED_VALUES.has(value) : false;
}

export function isAdminPath(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/api/admin" ||
    pathname.startsWith("/api/admin/") ||
    pathname === "/api/upload-pdf"
  );
}
