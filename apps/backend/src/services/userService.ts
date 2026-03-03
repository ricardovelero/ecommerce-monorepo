import { Role } from "@prisma/client";

import { prisma } from "@/db/prisma";
import type { AuthContext, RequestUser } from "@/types/auth";
import { HttpError } from "@/utils/httpError";

function toRequestUser(user: { id: string; email: string | null; role: Role }): RequestUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

export async function findOrCreateFromAuth(authPayload: AuthContext): Promise<RequestUser> {
  const externalId = authPayload.externalId.trim();
  if (!externalId) {
    throw new HttpError(401, "Missing auth externalId");
  }

  const email = authPayload.email?.trim().toLowerCase();
  const existingByExternalId = await prisma.user.findUnique({
    where: { externalId },
  });

  if (existingByExternalId) {
    if (email && existingByExternalId.email !== email) {
      const updated = await prisma.user.update({
        where: { id: existingByExternalId.id },
        data: { email },
      });
      return toRequestUser(updated);
    }

    return toRequestUser(existingByExternalId);
  }

  if (email) {
    const existingByEmail = await prisma.user.findFirst({
      where: { email },
      orderBy: { createdAt: "asc" },
    });

    if (existingByEmail) {
      const updated = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          externalId,
          email,
        },
      });
      return toRequestUser(updated);
    }
  }

  const created = await prisma.user.create({
    data: {
      externalId,
      ...(email ? { email } : {}),
      role: Role.USER,
    },
  });

  return toRequestUser(created);
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

export async function updateEmail(userId: string, email: string): Promise<RequestUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!current) {
    throw new HttpError(404, "User not found");
  }

  if (current.email === normalizedEmail) {
    return current;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  return updated;
}
