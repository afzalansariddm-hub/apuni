import "dotenv/config";
import cors from "cors";
import express from "express";
import { prisma } from "./db.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

function toProviderDto(p: {
  id: string;
  name: string;
  phone: string;
  description: string;
  verified: boolean;
  category: { name: string };
  town: { name: string };
}) {
  return {
    id: p.id,
    name: p.name,
    phone: p.phone,
    category: p.category.name,
    town: p.town.name,
    description: p.description,
    verified: p.verified,
  };
}

const providerInclude = {
  category: true,
  town: true,
} as const;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/bootstrap", async (_req, res) => {
  try {
    const [providers, categories, towns] = await Promise.all([
      prisma.provider.findMany({
        include: providerInclude,
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.town.findMany({ orderBy: { name: "asc" } }),
    ]);

    res.json({
      providers: providers.map(toProviderDto),
      categories: categories.map((c) => c.name),
      towns: towns.map((t) => t.name),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load data" });
  }
});

app.get("/api/providers", async (_req, res) => {
  try {
    const providers = await prisma.provider.findMany({
      include: providerInclude,
      orderBy: { createdAt: "desc" },
    });
    res.json(providers.map(toProviderDto));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list providers" });
  }
});

app.post("/api/providers", async (req, res) => {
  try {
    const { name, phone, category, town, description, verified } = req.body as {
      name?: string;
      phone?: string;
      category?: string;
      town?: string;
      description?: string;
      verified?: boolean;
    };

    if (!name?.trim() || !phone?.trim() || !category?.trim() || !town?.trim()) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const [categoryRow, townRow] = await Promise.all([
      prisma.category.findUnique({ where: { name: category.trim() } }),
      prisma.town.findUnique({ where: { name: town.trim() } }),
    ]);

    if (!categoryRow || !townRow) {
      res.status(400).json({ error: "Invalid category or town" });
      return;
    }

    const provider = await prisma.provider.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        description: (description ?? "").trim(),
        verified: Boolean(verified),
        categoryId: categoryRow.id,
        townId: townRow.id,
      },
      include: providerInclude,
    });

    res.status(201).json(toProviderDto(provider));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create provider" });
  }
});

app.put("/api/providers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, category, town, description, verified } = req.body as {
      name?: string;
      phone?: string;
      category?: string;
      town?: string;
      description?: string;
      verified?: boolean;
    };

    if (!name?.trim() || !phone?.trim() || !category?.trim() || !town?.trim()) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const [categoryRow, townRow] = await Promise.all([
      prisma.category.findUnique({ where: { name: category.trim() } }),
      prisma.town.findUnique({ where: { name: town.trim() } }),
    ]);

    if (!categoryRow || !townRow) {
      res.status(400).json({ error: "Invalid category or town" });
      return;
    }

    const provider = await prisma.provider.update({
      where: { id },
      data: {
        name: name.trim(),
        phone: phone.trim(),
        description: (description ?? "").trim(),
        verified: Boolean(verified),
        categoryId: categoryRow.id,
        townId: townRow.id,
      },
      include: providerInclude,
    });

    res.json(toProviderDto(provider));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update provider" });
  }
});

app.delete("/api/providers/:id", async (req, res) => {
  try {
    await prisma.provider.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete provider" });
  }
});

app.patch("/api/providers/:id/verified", async (req, res) => {
  try {
    const existing = await prisma.provider.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      res.status(404).json({ error: "Provider not found" });
      return;
    }

    const provider = await prisma.provider.update({
      where: { id: req.params.id },
      data: { verified: !existing.verified },
      include: providerInclude,
    });

    res.json(toProviderDto(provider));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle verified" });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const existing = await prisma.category.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    if (existing) {
      res.status(409).json({ error: "Category already exists" });
      return;
    }

    const category = await prisma.category.create({ data: { name } });
    res.status(201).json({ name: category.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create category" });
  }
});

app.put("/api/categories/:name", async (req, res) => {
  try {
    const oldName = decodeURIComponent(req.params.name);
    const newName = String(req.body?.name ?? "").trim();
    if (!newName || newName === oldName) {
      res.status(400).json({ error: "Valid new name is required" });
      return;
    }

    const clash = await prisma.category.findFirst({
      where: { name: { equals: newName, mode: "insensitive" } },
    });
    if (clash && clash.name !== oldName) {
      res.status(409).json({ error: "Category already exists" });
      return;
    }

    const category = await prisma.category.update({
      where: { name: oldName },
      data: { name: newName },
    });
    res.json({ name: category.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to rename category" });
  }
});

app.delete("/api/categories/:name", async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const category = await prisma.category.findUnique({
      where: { name },
      include: { _count: { select: { providers: true } } },
    });
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    if (category._count.providers > 0) {
      res.status(400).json({
        error: "Cannot delete category while providers still use it",
      });
      return;
    }

    await prisma.category.delete({ where: { name } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

app.post("/api/towns", async (req, res) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const existing = await prisma.town.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    if (existing) {
      res.status(409).json({ error: "Town already exists" });
      return;
    }

    const town = await prisma.town.create({ data: { name } });
    res.status(201).json({ name: town.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create town" });
  }
});

app.put("/api/towns/:name", async (req, res) => {
  try {
    const oldName = decodeURIComponent(req.params.name);
    const newName = String(req.body?.name ?? "").trim();
    if (!newName || newName === oldName) {
      res.status(400).json({ error: "Valid new name is required" });
      return;
    }

    const clash = await prisma.town.findFirst({
      where: { name: { equals: newName, mode: "insensitive" } },
    });
    if (clash && clash.name !== oldName) {
      res.status(409).json({ error: "Town already exists" });
      return;
    }

    const town = await prisma.town.update({
      where: { name: oldName },
      data: { name: newName },
    });
    res.json({ name: town.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to rename town" });
  }
});

app.delete("/api/towns/:name", async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const town = await prisma.town.findUnique({
      where: { name },
      include: { _count: { select: { providers: true } } },
    });
    if (!town) {
      res.status(404).json({ error: "Town not found" });
      return;
    }
    if (town._count.providers > 0) {
      res.status(400).json({
        error: "Cannot delete town while providers still use it",
      });
      return;
    }

    await prisma.town.delete({ where: { name } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete town" });
  }
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
