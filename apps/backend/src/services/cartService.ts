import type { CartDTO } from "@ecommerce/shared-types";
import { CartStatus } from "@prisma/client";

import { prisma } from "@/db/prisma";
import { HttpError } from "@/utils/httpError";

function toCartDTO(cart: {
  id: string;
  status: CartStatus;
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      priceCents: number;
    };
  }>;
}): CartDTO {
  return {
    id: cart.id,
    status: cart.status,
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      productName: item.product.name,
      priceCents: item.product.priceCents,
      quantity: item.quantity,
    })),
  };
}

async function getOrCreateOpenCart(userId: string) {
  const existing = await prisma.cart.findFirst({
    where: { userId, status: CartStatus.OPEN },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.cart.create({
    data: {
      userId,
      status: CartStatus.OPEN,
    },
    include: {
      items: {
        include: { product: true },
      },
    },
  });
}

export async function getCart(userId: string): Promise<CartDTO> {
  const cart = await getOrCreateOpenCart(userId);
  return toCartDTO(cart);
}

export async function addCartItem(input: {
  userId: string;
  productId: string;
  quantity: number;
}): Promise<CartDTO> {
  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  const cart = await getOrCreateOpenCart(input.userId);

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: input.productId,
      },
    },
    update: {
      quantity: {
        increment: input.quantity,
      },
    },
    create: {
      cartId: cart.id,
      productId: input.productId,
      quantity: input.quantity,
    },
  });

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!updated) {
    throw new HttpError(500, "Cart not found after update");
  }

  return toCartDTO(updated);
}

export async function removeCartItem(input: { userId: string; itemId: string }): Promise<CartDTO> {
  const cart = await getOrCreateOpenCart(input.userId);

  const item = await prisma.cartItem.findUnique({ where: { id: input.itemId } });
  if (!item || item.cartId !== cart.id) {
    throw new HttpError(404, "Cart item not found");
  }

  await prisma.cartItem.delete({ where: { id: input.itemId } });

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!updated) {
    throw new HttpError(500, "Cart not found after delete");
  }

  return toCartDTO(updated);
}
