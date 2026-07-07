import { AuthApiClient } from "../api/clients/auth-api.client";
import { PennyRequestsApiClient } from "../api/clients/penny-requests-api.client";
import { RequestHandler } from "../api/support";
import { AuthRole, AuthSession } from "../types/interfaces/auth.interface";
import { test as baseTest } from "./base.fixture";
import { Logger } from "../core/logger";

export type ApiFixtures = {
  /** Fluent request handler for fine-grained API control */
  requestHandler: RequestHandler;
  /** Auth API client for explicit login flows */
  authApi: AuthApiClient;
  /** Common Penny request/RFQ list API client */
  pennyRequestsApi: PennyRequestsApiClient;
  /** Login helper with per-test role token caching */
  loginAs: (role?: AuthRole) => Promise<AuthSession>;
  /** Admin bearer token for authenticated API calls */
  adminAccessToken: string;
  /** User bearer token for authenticated API calls */
  userAccessToken: string;
};

type ApiWorkerFixtures = {
  /** Worker-level auth cache so parallel specs do not login before every test */
  authSessionCache: Map<AuthRole, Promise<AuthSession>>;
};

export const test = baseTest.extend<ApiFixtures, ApiWorkerFixtures>({
  authSessionCache: [
    async ({}, use) => {
      await use(new Map<AuthRole, Promise<AuthSession>>());
    },
    { scope: "worker" },
  ],

  requestHandler: async ({ request, envConfig }, use) => {
    const logger = new Logger("RequestHandler");
    await use(new RequestHandler(request, envConfig.apiUrl, logger));
  },

  authApi: async ({ request, envConfig }, use) => {
    await use(new AuthApiClient(request, envConfig));
  },

  pennyRequestsApi: async ({ request, envConfig }, use) => {
    await use(new PennyRequestsApiClient(request, envConfig.apiUrl));
  },

  loginAs: async ({ authApi, authSessionCache }, use) => {
    await use(async (role: AuthRole = "admin") => {
      const cached = authSessionCache.get(role);
      if (cached) return cached;

      const session = authApi.login(role).catch((error: unknown) => {
        authSessionCache.delete(role);
        throw error;
      });
      authSessionCache.set(role, session);
      return session;
    });
  },

  adminAccessToken: async ({ loginAs }, use) => {
    const session = await loginAs("admin");
    await use(session.accessToken);
  },

  userAccessToken: async ({ loginAs }, use) => {
    const session = await loginAs("user");
    await use(session.accessToken);
  },
});

export { expect } from "./base.fixture";
