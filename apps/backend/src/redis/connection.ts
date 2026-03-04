import { createRedisConnection } from "@ecommerce/queue";

import { env } from "@/config/env";

export const redisConnection: any = createRedisConnection(env.REDIS_URL);
