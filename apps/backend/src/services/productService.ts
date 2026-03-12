import type { ProductDTO, ProductListQueryDTO, ProductListResponseDTO, ProductSort } from "@ecommerce/shared-types";
import { Prisma } from "@prisma/client";

import { prisma } from "@/db/prisma";
import { HttpError } from "@/utils/httpError";

function toProductDTO(product: {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  currency: string;
  imageUrl: string | null;
  categoryId: string;
  category: { name: string };
}): ProductDTO {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    priceCents: product.priceCents,
    stock: product.stock,
    currency: product.currency,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    categoryName: product.category.name,
  };
}

function getOrderBy(sort: ProductSort): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { priceCents: "asc" };
    case "price_desc":
      return { priceCents: "desc" };
    case "name_asc":
      return { name: "asc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export async function listProducts(input: ProductListQueryDTO): Promise<ProductListResponseDTO> {
  const pageSize = Math.min(24, Math.max(1, input.pageSize ?? 9));
  const sort = input.sort ?? "newest";
  const search = input.search?.trim();
  const categoryId = input.categoryId?.trim();

  const where: Prisma.ProductWhereInput = {
    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [totalItems, categories] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(1, input.page ?? 1), totalPages);

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: getOrderBy(sort),
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    items: products.map(toProductDTO),
    categories,
    page,
    pageSize,
    totalItems,
    totalPages,
  };
}

export async function getProductById(id: string): Promise<ProductDTO> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  return toProductDTO(product);
}
