import type { Request, Response } from "express";

import { getMe } from "@/services/userService";

export async function getMeController(req: Request, res: Response): Promise<void> {
  const me = await getMe(req.user!.id);
  res.json(me);
}
