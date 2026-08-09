// Placeholder passcode — not real auth. Replace with proper authentication later.
export const ADMIN_PASSCODE = "apuni2026";

export function cleanPhone(phone: string): string {
  return (phone || "").replace(/\D/g, "");
}
