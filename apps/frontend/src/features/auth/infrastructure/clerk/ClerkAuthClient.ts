import type { AuthClient, AuthUser } from "@/features/auth/domain/AuthClient";

interface ClerkAuthDeps {
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
  user: { id: string; emailAddresses: Array<{ emailAddress: string }> } | null;
  openSignIn: () => void;
  performSignOut: () => Promise<void>;
}

export class ClerkAuthClient implements AuthClient {
  constructor(private readonly deps: ClerkAuthDeps) {}

  isAuthenticated(): boolean {
    return this.deps.isSignedIn;
  }

  async getSessionToken(): Promise<string | null> {
    if (!this.deps.isSignedIn) {
      return null;
    }
    return this.deps.getToken();
  }

  async getUser(): Promise<AuthUser | null> {
    if (!this.deps.user) {
      return null;
    }

    return {
      id: this.deps.user.id,
      email: this.deps.user.emailAddresses[0]?.emailAddress,
    };
  }

  async signIn(): Promise<void> {
    this.deps.openSignIn();
  }

  async signOut(): Promise<void> {
    await this.deps.performSignOut();
  }
}
