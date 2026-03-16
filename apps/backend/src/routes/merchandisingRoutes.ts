import { Router } from "express";

import { getHomeMerchandisingController } from "@/controllers/merchandisingController";
import { asyncHandler } from "@/utils/asyncHandler";

export const merchandisingRoutes: Router = Router();

merchandisingRoutes.get("/merchandising/homepage", asyncHandler(getHomeMerchandisingController));
