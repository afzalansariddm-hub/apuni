import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_TOWNS = [
  "Tinsukia",
  "Doomdooma",
  "Hansara",
  "Barhapjan",
  "Makum",
  "Hijuguri",
  "Borguri",
];

const SEED_CATEGORIES = [
  "Electrician",
  "Plumber",
  "Home Tutor",
  "Event Planner",
  "AC & Appliance Repair",
  "Photographer",
];

const SEED_PROVIDERS = [
  {
    name: "Dilip Gogoi",
    phone: "9435012345",
    category: "Electrician",
    town: "Tinsukia",
    description:
      "12 years experience — house wiring, fan installation, and emergency repairs.",
    verified: true,
  },
  {
    name: "Rekha Devi",
    phone: "9854098765",
    category: "Home Tutor",
    town: "Doomdooma",
    description: "Class 6–10 Maths and Science, Assamese and English medium.",
    verified: true,
  },
  {
    name: "Mintu Sonowal",
    phone: "8638011223",
    category: "Plumber",
    town: "Makum",
    description:
      "Pipe fitting, leak repair, and bathroom fittings across Makum and nearby areas.",
    verified: true,
  },
  {
    name: "Purabi Studios",
    phone: "9707044556",
    category: "Photographer",
    town: "Tinsukia",
    description:
      "Weddings, Bihu functions, and birthday events — candid and traditional.",
    verified: false,
  },
  {
    name: "Bittu Hazarika",
    phone: "7002456789",
    category: "AC & Appliance Repair",
    town: "Barhapjan",
    description:
      "AC servicing, fridge and washing machine repair. Same-day visits when possible.",
    verified: false,
  },
];

async function main() {
  for (const name of SEED_CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const name of SEED_TOWNS) {
    await prisma.town.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const providerCount = await prisma.provider.count();
  if (providerCount === 0) {
    const categories = await prisma.category.findMany();
    const towns = await prisma.town.findMany();
    const categoryByName = Object.fromEntries(
      categories.map((c) => [c.name, c.id]),
    );
    const townByName = Object.fromEntries(towns.map((t) => [t.name, t.id]));

    await prisma.provider.createMany({
      data: SEED_PROVIDERS.map((p) => ({
        name: p.name,
        phone: p.phone,
        description: p.description,
        verified: p.verified,
        categoryId: categoryByName[p.category],
        townId: townByName[p.town],
      })),
    });
  }

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
