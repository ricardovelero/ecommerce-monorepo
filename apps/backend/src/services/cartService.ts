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
  if (product.stock <= 0) {
    throw new HttpError(409, "Product is out of stock");
  }

  const cart = await getOrCreateOpenCart(input.userId);
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: input.productId,
      },
    },
  });
  const nextQuantity = (existingItem?.quantity ?? 0) + input.quantity;

  if (nextQuantity > product.stock) {
    throw new HttpError(409, "Requested quantity exceeds available stock");
  }

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

export async function updateCartItemQuantity(input: {
  userId: string;
  itemId: string;
  quantity: number;
}): Promise<CartDTO> {
  const cart = await getOrCreateOpenCart(input.userId);

  const item = await prisma.cartItem.findUnique({
    where: { id: input.itemId },
    include: { product: true },
  });

  if (!item || item.cartId !== cart.id) {
    throw new HttpError(404, "Cart item not found");
  }

  if (input.quantity === 0) {
    return removeCartItem({ userId: input.userId, itemId: input.itemId });
  }

  if (input.quantity > item.product.stock) {
    throw new HttpError(409, "Requested quantity exceeds available stock");
  }

  await prisma.cartItem.update({
    where: { id: input.itemId },
    data: {
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
    throw new HttpError(500, "Cart not found after quantity update");
  }

  return toCartDTO(updated);
}
