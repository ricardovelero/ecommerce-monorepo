import { prisma } from "@/db/prisma";
import { HttpError } from "@/utils/httpError";

export interface AdminProductDTO {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  currency: string;
  imageUrl: string | null;
  isFeatured: boolean;
  featuredRank: number | null;
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
  stock: number;
  currency: string;
  imageUrl: string | null;
  isFeatured: boolean;
  featuredRank: number | null;
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
    stock: product.stock,
    currency: product.currency,
    imageUrl: product.imageUrl,
    isFeatured: product.isFeatured,
    featuredRank: product.featuredRank,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    createdById: product.createdById,
    updatedById: product.updatedById,
  };
}

function normalizeFeaturedRank(isFeatured: boolean, featuredRank?: number | null): number | null {
  if (!isFeatured) {
    return null;
  }

  return typeof featuredRank === "number" && Number.isInteger(featuredRank) && featuredRank > 0 ? featuredRank : 1;
}

type ProductWithCategory = Parameters<typeof toAdminProductDTO>[0];

type AdminProductDeps = {
  prismaClient: {
    category: {
      findUnique: (args: { where: { id: string } }) => Promise<{ id: string } | null>;
    };
    product: {
      findMany: (args: {
        include: { category: true };
        orderBy: { createdAt: "desc" };
      }) => Promise<ProductWithCategory[]>;
      create: (args: {
        data: {
          name: string;
          description: string;
          priceCents: number;
          stock: number;
          currency: string;
          imageUrl?: string | null;
          isFeatured: boolean;
          featuredRank: number | null;
          categoryId: string;
          createdById: string;
          updatedById: string;
        };
        include: { category: true };
      }) => Promise<ProductWithCategory>;
      findUnique: (args: { where: { id: string } }) => Promise<{ id: string } | null>;
      update: (args: {
        where: { id: string };
        data: {
          name: string;
          description: string;
          priceCents: number;
          stock?: number;
          currency: string;
          imageUrl?: string | null;
          isFeatured: boolean;
          featuredRank: number | null;
          categoryId: string;
          updatedById: string;
        };
        include: { category: true };
      }) => Promise<ProductWithCategory>;
      delete: (args: { where: { id: string } }) => Promise<void>;
    };
  };
};

export function createAdminProductService(
  deps: AdminProductDeps = {
    prismaClient: prisma as unknown as AdminProductDeps["prismaClient"],
  },
) {
  async function ensureCategoryExists(categoryId: string): Promise<void> {
    const category = await deps.prismaClient.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new HttpError(404, "Category not found");
    }
  }

  return {
    async listAdminProducts(): Promise<AdminProductDTO[]> {
      const products = await deps.prismaClient.product.findMany({
        include: { category: true },
        orderBy: { createdAt: "desc" },
      });

      return products.map(toAdminProductDTO);
    },

    async createAdminProduct(input: {
      name: string;
      description: string;
      priceCents: number;
      stock?: number;
      currency: string;
      imageUrl?: string | null;
      isFeatured?: boolean;
      featuredRank?: number | null;
      categoryId: string;
      actorUserId: string;
    }): Promise<AdminProductDTO> {
      await ensureCategoryExists(input.categoryId);

      const product = await deps.prismaClient.product.create({
        data: {
          name: input.name,
          description: input.description,
          priceCents: input.priceCents,
          stock: input.stock ?? 0,
          currency: input.currency,
          imageUrl: input.imageUrl,
          isFeatured: input.isFeatured ?? false,
          featuredRank: normalizeFeaturedRank(input.isFeatured ?? false, input.featuredRank),
          categoryId: input.categoryId,
          createdById: input.actorUserId,
          updatedById: input.actorUserId,
        },
        include: { category: true },
      });

      return toAdminProductDTO(product);
    },

    async updateAdminProduct(input: {
      id: string;
      name: string;
      description: string;
      priceCents: number;
      stock?: number;
      currency: string;
      imageUrl?: string | null;
      isFeatured?: boolean;
      featuredRank?: number | null;
      categoryId: string;
      actorUserId: string;
    }): Promise<AdminProductDTO> {
      const existing = await deps.prismaClient.product.findUnique({ where: { id: input.id } });
      if (!existing) {
        throw new HttpError(404, "Product not found");
      }

      await ensureCategoryExists(input.categoryId);

      const product = await deps.prismaClient.product.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          priceCents: input.priceCents,
          stock: input.stock,
          currency: input.currency,
          imageUrl: input.imageUrl,
          isFeatured: input.isFeatured ?? false,
          featuredRank: normalizeFeaturedRank(input.isFeatured ?? false, input.featuredRank),
          categoryId: input.categoryId,
          updatedById: input.actorUserId,
        },
        include: { category: true },
      });

      return toAdminProductDTO(product);
    },

    async deleteAdminProduct(id: string): Promise<void> {
      const existing = await deps.prismaClient.product.findUnique({ where: { id } });
      if (!existing) {
        throw new HttpError(404, "Product not found");
      }

      await deps.prismaClient.product.delete({ where: { id } });
    },
  };
}

const adminProductService = createAdminProductService();

export async function listAdminProducts(): Promise<AdminProductDTO[]> {
  return adminProductService.listAdminProducts();
}

export async function createAdminProduct(input: {
  name: string;
  description: string;
  priceCents: number;
  stock?: number;
  currency: string;
  imageUrl?: string | null;
  isFeatured?: boolean;
  featuredRank?: number | null;
  categoryId: string;
  actorUserId: string;
}): Promise<AdminProductDTO> {
  return adminProductService.createAdminProduct(input);
}

export async function updateAdminProduct(input: {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stock?: number;
  currency: string;
  imageUrl?: string | null;
  isFeatured?: boolean;
  featuredRank?: number | null;
  categoryId: string;
  actorUserId: string;
}): Promise<AdminProductDTO> {
  return adminProductService.updateAdminProduct(input);
}

export async function deleteAdminProduct(id: string): Promise<void> {
  return adminProductService.deleteAdminProduct(id);
}
