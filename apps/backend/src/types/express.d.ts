import type { AuthContext } from "@/types/auth";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      auth?: AuthContext;
    }
  }
}

export {};
