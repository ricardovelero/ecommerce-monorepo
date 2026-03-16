import type { Request, Response } from "express";

import { getRobotsTxt, getSitemapXml } from "@/services/seoService";

export function getRobotsController(_req: Request, res: Response): void {
  res.type("text/plain").send(getRobotsTxt());
}

export async function getSitemapController(_req: Request, res: Response): Promise<void> {
  res.type("application/xml").send(await getSitemapXml());
}
