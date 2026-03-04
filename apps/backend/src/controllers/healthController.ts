import type { Request, Response } from "express";

import { prisma } from "@/db/prisma";
import { redisConnection } from "@/redis/connection";

export async function getHealth(_req: Request, res: Response): Promise<void> {
  const [databaseStatus, redisStatus] = await Promise.all([
    prisma.$queryRaw`SELECT 1`
      .then(() => "up")
      .catch(() => "down"),
    redisConnection
      .ping()
      .then(() => "up")
      .catch(() => "down"),
  ]);

  const isHealthy = databaseStatus === "up" && redisStatus === "up";

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    dependencies: {
      database: databaseStatus,
      redis: redisStatus,
    },
  });
}
