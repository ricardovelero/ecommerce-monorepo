import type { CartDTO } from "@ecommerce/shared-types";
import type { Request, Response } from "express";

import { addCartItem, getCart, removeCartItem } from "@/services/cartService";

function emptyCart(): CartDTO {
  return { id: "dev-empty-cart", status: "OPEN", items: [] };
}

export async function getCartController(req: Request, res: Response): Promise<void> {
  if (!req.auth?.userId) {
    // TODO: remove dev fallback once token validation and user sync are implemented.
    res.json(emptyCart());
    return;
  }

  const cart = await getCart(req.auth.userId);
  res.json(cart);
}

export async function addCartItemController(req: Request, res: Response): Promise<void> {
  const cart = await addCartItem({
    userId: req.auth!.userId,
    productId: req.body.productId,
    quantity: req.body.quantity,
  });
  res.status(201).json(cart);
}

export async function removeCartItemController(req: Request, res: Response): Promise<void> {
  const cart = await removeCartItem({
    userId: req.auth!.userId,
    itemId: req.params.id,
  });
  res.json(cart);
}
