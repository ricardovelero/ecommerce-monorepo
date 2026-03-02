export interface AuthUser {
  id: string;
  email?: string;
}

export interface AuthClient {
  isAuthenticated(): boolean;
  getSessionToken(): Promise<string | null>;
  getUser(): Promise<AuthUser | null>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}
