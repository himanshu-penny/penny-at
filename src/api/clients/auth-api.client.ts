import { APIRequestContext } from "@playwright/test";
import { API_PATHS } from "../../core/constants/urls";
import { ApiError, AuthenticationError } from "../../core/errors";
import { EnvironmentConfig } from "../../types/interfaces/config.interface";
import {
  AuthRole,
  AuthSession,
  LoginRequest,
  LoginResponseBody,
  PennyStorageState,
} from "../../types/interfaces/auth.interface";
import { BaseApiClient } from "./base-api.client";

export class AuthApiClient extends BaseApiClient {
  constructor(
    request: APIRequestContext,
    private readonly envConfig: EnvironmentConfig,
  ) {
    super(request, envConfig.apiUrl);
  }

  async login(role: AuthRole = "admin"): Promise<AuthSession> {
    const credentials = this.envConfig.credentials[role];
    const payload: LoginRequest = {
      email: credentials.email,
      password: credentials.password,
      platform: "web",
    };

    const response = await this.post<LoginResponseBody>(API_PATHS.AUTH.LOGIN, payload).catch(
      (error: unknown) => {
        if (error instanceof ApiError) {
          throw new AuthenticationError(
            `Login failed for ${role} (${credentials.email}) with status ${error.statusCode}. ` +
              "Check the client credential file and Penny environment.",
          );
        }
        throw error;
      },
    );
    const accessToken = response.data.accessToken ?? response.data.token;

    if (!accessToken) {
      throw new AuthenticationError(
        `Login response for ${role} did not include accessToken or token.`,
      );
    }

    return {
      role,
      email: credentials.email,
      accessToken,
      refreshToken: response.data.refreshToken,
      expiresIn: response.data.expiresIn,
    };
  }
}

export function buildPennyStorageState(session: AuthSession, webUrl: string): PennyStorageState {
  return {
    cookies: [],
    origins: [
      {
        origin: new URL(webUrl).origin,
        localStorage: [
          { name: "access_token", value: session.accessToken },
          { name: "enableNotificationDialogShown", value: "true" },
        ],
      },
    ],
  };
}
