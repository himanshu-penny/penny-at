export type AuthRole = "user" | "admin";

export interface LoginRequest {
  email: string;
  password: string;
  platform: "web";
}

export interface LoginResponseBody {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  [key: string]: unknown;
}

export interface AuthSession {
  role: AuthRole;
  email: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface PennyStorageState {
  cookies: [];
  origins: Array<{
    origin: string;
    localStorage: Array<{
      name: string;
      value: string;
    }>;
  }>;
}
