import { prisma } from "@/db/prisma";
import { HttpError } from "@/utils/httpError";

export interface AdminCategoryDTO {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
  updatedById: string | null;
}

export async function listAdminCategories(): Promise<AdminCategoryDTO[]> {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createAdminCategory(input: {
  name: string;
  actorUserId: string;
}): Promise<AdminCategoryDTO> {
  return prisma.category.create({
    data: {
      name: input.name,
      createdById: input.actorUserId,
      updatedById: input.actorUserId,
    },
  });
}

export async function updateAdminCategory(input: {
  id: string;
  name: string;
  actorUserId: string;
}): Promise<AdminCategoryDTO> {
  const existing = await prisma.category.findUnique({ where: { id: input.id } });
  if (!existing) {
    throw new HttpError(404, "Category not found");
  }

  return prisma.category.update({
    where: { id: input.id },
    data: {
      name: input.name,
      updatedById: input.actorUserId,
    },
  });
}

export async function deleteAdminCategory(id: string): Promise<void> {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, "Category not found");
  }

  const productsCount = await prisma.product.count({ where: { categoryId: id } });
  if (productsCount > 0) {
    throw new HttpError(409, "Category cannot be deleted while products still reference it");
  }

  await prisma.category.delete({ where: { id } });
}
