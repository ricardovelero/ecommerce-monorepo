export interface AuthUser {
  id: string;
  email?: string;
}

export type UserRole = "USER" | "ADMIN";

export interface MeResponse {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthClient {
  isAuthenticated(): boolean;
  getSessionToken(): Promise<string | null>;
  getUser(): Promise<AuthUser | null>;
  getUserRole(): Promise<UserRole>;
  getMe(): Promise<MeResponse>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}
