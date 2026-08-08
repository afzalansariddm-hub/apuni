/** Soft tints for avatar circles — keyed by known categories, with a fallback. */
const CATEGORY_AVATAR: Record<string, { bg: string; fg: string }> = {
  Electrician: { bg: "#FCE8C8", fg: "#8A4B12" },
  Plumber: { bg: "#D7E8F5", fg: "#1E4A6E" },
  "Home Tutor": { bg: "#E8DFF5", fg: "#4A2F78" },
  "Event Planner": { bg: "#F8DDE4", fg: "#8A2A45" },
  "AC & Appliance Repair": { bg: "#DCEEE6", fg: "#1F4F3A" },
  Photographer: { bg: "#E8E4D8", fg: "#4A4335" },
};

const FALLBACK = { bg: "#E8E4D8", fg: "#4A4335" };

export function getCategoryAvatar(category: string): { bg: string; fg: string } {
  return CATEGORY_AVATAR[category] ?? FALLBACK;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
