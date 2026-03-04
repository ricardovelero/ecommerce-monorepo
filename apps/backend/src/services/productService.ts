import type { ProductDTO } from "@ecommerce/shared-types";

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

export async function listProducts(): Promise<ProductDTO[]> {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return products.map(toProductDTO);
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
