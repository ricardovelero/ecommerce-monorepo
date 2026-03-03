import type { Role } from "@prisma/client";

export interface AuthContext {
  externalId: string;
  email?: string;
}

export interface RequestUser {
  id: string;
  email: string | null;
  role: Role;
}
