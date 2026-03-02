import { prisma } from "@/db/prisma";
import { HttpError } from "@/utils/httpError";

export interface AdminProductDTO {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
  updatedById: string | null;
}

function toAdminProductDTO(product: {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  categoryId: string;
  category: { name: string };
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
  updatedById: string | null;
}): AdminProductDTO {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    priceCents: product.priceCents,
    currency: product.currency,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    createdById: product.createdById,
    updatedById: product.updatedById,
  };
}

async function ensureCategoryExists(categoryId: string): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw new HttpError(404, "Category not found");
  }
}

export async function listAdminProducts(): Promise<AdminProductDTO[]> {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return products.map(toAdminProductDTO);
}

export async function createAdminProduct(input: {
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  imageUrl?: string | null;
  categoryId: string;
  actorUserId: string;
}): Promise<AdminProductDTO> {
  await ensureCategoryExists(input.categoryId);

  const product = await prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      priceCents: input.priceCents,
      currency: input.currency,
      imageUrl: input.imageUrl,
      categoryId: input.categoryId,
      createdById: input.actorUserId,
      updatedById: input.actorUserId,
    },
    include: { category: true },
  });

  return toAdminProductDTO(product);
}

export async function updateAdminProduct(input: {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  imageUrl?: string | null;
  categoryId: string;
  actorUserId: string;
}): Promise<AdminProductDTO> {
  const existing = await prisma.product.findUnique({ where: { id: input.id } });
  if (!existing) {
    throw new HttpError(404, "Product not found");
  }

  await ensureCategoryExists(input.categoryId);

  const product = await prisma.product.update({
    where: { id: input.id },
    data: {
      name: input.name,
      description: input.description,
      priceCents: input.priceCents,
      currency: input.currency,
      imageUrl: input.imageUrl,
      categoryId: input.categoryId,
      updatedById: input.actorUserId,
    },
    include: { category: true },
  });

  return toAdminProductDTO(product);
}

export async function deleteAdminProduct(id: string): Promise<void> {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, "Product not found");
  }

  await prisma.product.delete({ where: { id } });
}
