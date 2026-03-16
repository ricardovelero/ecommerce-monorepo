import type { Request, Response } from "express";

import { getHomeMerchandising } from "@/services/merchandisingService";

export async function getHomeMerchandisingController(_req: Request, res: Response): Promise<void> {
  const merchandising = await getHomeMerchandising();
  res.json(merchandising);
}
