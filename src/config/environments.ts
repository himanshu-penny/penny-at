import { EnvironmentConfig } from "../types/interfaces/config.interface";
import { loadClientConfig, ClientConfig } from "./client-config";

/**
 * Maps a ClientConfig (resolved from CLIENT + TEST_ENV) to the
 * framework's EnvironmentConfig shape that all fixtures and tests consume.
 */
function mapClientConfig(cc: ClientConfig): EnvironmentConfig {
  return {
    name: `${cc.client}-${cc.env}`,
    client: cc.client,
    webUrl: cc.webBaseUrl,
    apiUrl: cc.apiBaseUrl,
    credentials: {
      user: { email: cc.userEmail, password: cc.userPassword },
      admin: { email: cc.adminEmail, password: cc.adminPassword },
    },
    timeouts: {
      pageLoad: 45_000,
      elementVisible: 15_000,
      apiResponse: 20_000,
    },
  };
}

/**
 * Returns the resolved EnvironmentConfig for the current run.
 *
 * Set CLIENT + TEST_ENV before running:
 *   CLIENT=ewcf  TEST_ENV=test   npx playwright test
 *   CLIENT=rcmc  TEST_ENV=fb     npx playwright test
 *   CLIENT=ewcf  TEST_ENV=fb-5   npx playwright test
 *   CLIENT=enterprise  TEST_ENV=prod   npx playwright test
 *
 * Valid TEST_ENV values : dev | test | fb | fb-<number> | demo | prod
 * Valid CLIENT values   : ewcf | rcmc | enterprise | sabil
 *
 * Credentials are loaded from: src/config/clients/{client}/{env}.env
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return mapClientConfig(loadClientConfig());
}
