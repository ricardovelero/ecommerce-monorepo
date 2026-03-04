import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail) {
    const existingByEmail = await prisma.user.findFirst({
      where: { email: adminEmail },
      orderBy: { createdAt: "asc" },
    });

    if (existingByEmail) {
      await prisma.user.update({
        where: { id: existingByEmail.id },
        data: { role: Role.ADMIN },
      });
    } else {
      const seedAdmin = await prisma.user.findUnique({
        where: { externalId: "seed-admin" },
      });

      if (seedAdmin) {
        await prisma.user.update({
          where: { id: seedAdmin.id },
          data: { email: adminEmail, role: Role.ADMIN },
        });
      } else {
        await prisma.user.create({
          data: {
            externalId: "seed-admin",
            email: adminEmail,
            role: Role.ADMIN,
          },
        });
      }
    }
  }

  const categorySkincare = await prisma.category.upsert({
    where: { name: "Skincare" },
    update: {},
    create: { name: "Skincare" },
  });

  const categorySupplements = await prisma.category.upsert({
    where: { name: "Supplements" },
    update: {},
    create: { name: "Supplements" },
  });

  const products = [
    {
      name: "Hydrating Serum",
      description: "Lightweight serum for daily hydration.",
      priceCents: 2290,
      stock: 120,
      imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03",
      categoryId: categorySkincare.id,
    },
    {
      name: "Vitamin C Cream",
      description: "Brightening cream for uneven skin tone.",
      priceCents: 2890,
      stock: 90,
      imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b",
      categoryId: categorySkincare.id,
    },
    {
      name: "Gentle Cleanser",
      description: "Soap-free cleanser for sensitive skin.",
      priceCents: 1790,
      stock: 160,
      imageUrl: "https://images.unsplash.com/photo-1629198735660-e39ea93f5c18",
      categoryId: categorySkincare.id,
    },
    {
      name: "Omega 3 Complex",
      description: "Daily omega formula to support wellness.",
      priceCents: 1990,
      stock: 130,
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae",
      categoryId: categorySupplements.id,
    },
    {
      name: "Magnesium Plus",
      description: "Mineral blend designed for active routines.",
      priceCents: 1590,
      stock: 140,
      imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2",
      categoryId: categorySupplements.id,
    },
    {
      name: "Vitamin D3",
      description: "High quality D3 for daily support.",
      priceCents: 1290,
      stock: 180,
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
      categoryId: categorySupplements.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: product,
      create: product,
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
