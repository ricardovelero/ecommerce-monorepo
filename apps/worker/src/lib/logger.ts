import pino from "pino";

import { env } from "@/config/env";

export const logger = pino({
  name: "worker",
  level: env.NODE_ENV === "development" ? "debug" : "info",
});
