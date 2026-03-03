import type { Request, Response } from "express";

import { getMe, updateEmail } from "@/services/userService";

export async function getMeController(req: Request, res: Response): Promise<void> {
  const me = await getMe(req.user!.id);
  res.json(me);
}

export async function updateMeEmailController(req: Request, res: Response): Promise<void> {
  const updated = await updateEmail(req.user!.id, req.body.email);
  res.json(updated);
}
