import type { AuthClient, AuthUser, MeResponse, UserRole } from "@/features/auth/domain/AuthClient";

export class AnonymousAuthClient implements AuthClient {
  isAuthenticated(): boolean {
    return false;
  }

  async getSessionToken(): Promise<string | null> {
    return null;
  }

  async getUser(): Promise<AuthUser | null> {
    return null;
  }

  async getMe(): Promise<MeResponse> {
    throw new Error("Not authenticated");
  }

  async getUserRole(): Promise<UserRole> {
    throw new Error("Not authenticated");
  }

  async signIn(): Promise<void> {
    return;
  }

  async signOut(): Promise<void> {
    return;
  }
}
