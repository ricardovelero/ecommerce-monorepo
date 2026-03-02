import { Role } from "@prisma/client";

import { prisma } from "@/db/prisma";
import type { AuthContext, RequestUser } from "@/types/auth";
import { HttpError } from "@/utils/httpError";

function toRequestUser(user: { id: string; email: string; role: Role }): RequestUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

export async function findOrCreateFromAuth(authPayload: AuthContext): Promise<RequestUser> {
  const email = authPayload.email?.trim().toLowerCase();
  const externalId = authPayload.externalId;

  if (email) {
    const existingByEmail = await prisma.user.findUnique({ where: { email } });

    if (existingByEmail) {
      if (externalId && existingByEmail.externalId !== externalId) {
        const existingByExternalId = await prisma.user.findUnique({ where: { externalId } });
        if (existingByExternalId && existingByExternalId.id !== existingByEmail.id) {
          throw new HttpError(409, "Auth identity is already linked to another user");
        }

        const updated = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { externalId },
        });
        return toRequestUser(updated);
      }

      return toRequestUser(existingByEmail);
    }

    const created = await prisma.user.create({
      data: {
        email,
        externalId,
        role: Role.USER,
      },
    });

    return toRequestUser(created);
  }

  const existingByExternalId = await prisma.user.findUnique({
    where: { externalId },
  });

  if (existingByExternalId) {
    return toRequestUser(existingByExternalId);
  }

  throw new HttpError(401, "Token must include an email to create a user");
}

export async function getMe(userId: string): Promise<RequestUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return user;
}
