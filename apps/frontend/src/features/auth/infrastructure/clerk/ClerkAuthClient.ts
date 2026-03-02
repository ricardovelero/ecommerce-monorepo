import type {
  AuthClient,
  AuthUser,
  MeResponse,
  UserRole,
} from "@/features/auth/domain/AuthClient";

interface ClerkAuthDeps {
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
  user: { id: string; emailAddresses: Array<{ emailAddress: string }> } | null;
  openSignIn: () => void;
  performSignOut: () => Promise<void>;
}

let cachedMe: MeResponse | null = null;
let cachedToken: string | null = null;

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

  async getMe(): Promise<MeResponse> {
    const token = await this.getSessionToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    if (cachedMe && cachedToken === token) {
      return cachedMe;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
    const response = await fetch(`${baseUrl}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Unable to fetch authenticated user");
    }

    const me = (await response.json()) as MeResponse;
    cachedMe = me;
    cachedToken = token;
    return me;
  }

  async getUserRole(): Promise<UserRole> {
    const me = await this.getMe();
    return me.role;
  }

  async signIn(): Promise<void> {
    this.deps.openSignIn();
  }

  async signOut(): Promise<void> {
    await this.deps.performSignOut();
    cachedMe = null;
    cachedToken = null;
  }
}
