import type { AuthContext, RequestUser } from "@/types/auth";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      auth?: AuthContext;
      user?: RequestUser;
    }
  }
}

export {};
