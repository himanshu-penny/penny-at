/**
 * auth.setup.api.ts — Headless API login (zero browser UI).
 *
 * POSTs credentials directly to the Penny auth endpoint, extracts the access
 * token, then writes a storage-state file that exactly mirrors what the Angular
 * app stores in localStorage after a real browser login:
 *
 *   access_token                 — JWT bearer token (snake_case key the app reads)
 *   enableNotificationDialogShown — suppresses the "Enable Notifications" modal
 *
 * No browser is opened; no login page is ever shown.
 * The saved storage-state is usable by any test that needs an authenticated
 * admin session (admin UI or API tests).
 *
 * Runs automatically as the "auth-setup-api" project dependency before smoke.
 * Manual run:
 *   TEST_ENV=test npx playwright test src/config/auth.setup.api.ts --project=auth-setup-api
 */

import { test as setup, request } from "@playwright/test";
import { getEnvironmentConfig } from "./environments";
import { API_STORAGE_STATE } from "./auth-paths";
import { AuthApiClient, buildPennyStorageState } from "../api/clients/auth-api.client";
import path from "path";
import fs from "fs";

export { API_STORAGE_STATE } from "./auth-paths";

setup("api-login: authenticate via REST API", async () => {
  const envConfig = getEnvironmentConfig();

  fs.mkdirSync(path.dirname(API_STORAGE_STATE), { recursive: true });

  const apiContext = await request.newContext();

  try {
    const authApi = new AuthApiClient(apiContext, envConfig);
    const session = await authApi.login("user");
    const storageState = buildPennyStorageState(session, envConfig.webUrl);

    fs.writeFileSync(API_STORAGE_STATE, JSON.stringify(storageState, null, 2));

    process.stdout.write(`✅ [api-login] Logged in as ${session.email}\n`);
    process.stdout.write(
      `✅ [api-login] Token injected into localStorage for ${new URL(envConfig.webUrl).origin}\n`,
    );
    process.stdout.write(`✅ [api-login] Session saved → ${API_STORAGE_STATE}\n`);
  } finally {
    await apiContext.dispose();
  }
});
