import type { Provider } from "./types";

export const SEED_TOWNS: string[] = [
  "Tinsukia",
  "Doomdooma",
  "Hansara",
  "Barhapjan",
  "Makum",
  "Hijuguri",
  "Borguri",
];

export const SEED_CATEGORIES: string[] = [
  "Electrician",
  "Plumber",
  "Home Tutor",
  "Event Planner",
  "AC & Appliance Repair",
  "Photographer",
];

// Placeholder passcode — not real auth. Replace with proper authentication later.
export const ADMIN_PASSCODE = "apuni2026";

export const SEED_PROVIDERS: Provider[] = [
  {
    id: "p1",
    name: "Dilip Gogoi",
    phone: "9435012345",
    category: "Electrician",
    town: "Tinsukia",
    description:
      "12 years experience — house wiring, fan installation, and emergency repairs.",
    verified: true,
  },
  {
    id: "p2",
    name: "Rekha Devi",
    phone: "9854098765",
    category: "Home Tutor",
    town: "Doomdooma",
    description:
      "Class 6–10 Maths and Science, Assamese and English medium.",
    verified: true,
  },
  {
    id: "p3",
    name: "Mintu Sonowal",
    phone: "8638011223",
    category: "Plumber",
    town: "Makum",
    description:
      "Pipe fitting, leak repair, and bathroom fittings across Makum and nearby areas.",
    verified: true,
  },
  {
    id: "p4",
    name: "Purabi Studios",
    phone: "9707044556",
    category: "Photographer",
    town: "Tinsukia",
    description:
      "Weddings, Bihu functions, and birthday events — candid and traditional.",
    verified: false,
  },
  {
    id: "p5",
    name: "Bittu Hazarika",
    phone: "7002456789",
    category: "AC & Appliance Repair",
    town: "Barhapjan",
    description:
      "AC servicing, fridge and washing machine repair. Same-day visits when possible.",
    verified: false,
  },
];

export function cleanPhone(phone: string): string {
  return (phone || "").replace(/\D/g, "");
}
