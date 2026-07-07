/**
 * client-config.ts — Multi-client, multi-environment URL and credential resolver.
 *
 * Resolves the correct web/API URLs and credentials for a given CLIENT + TEST_ENV combination.
 * Credential files live at src/config/clients/{client}/{env}.env (gitignored).
 *
 * Usage:
 *   CLIENT=ewcf TEST_ENV=test npx playwright test
 *   CLIENT=rcmc TEST_ENV=fb-23 npx playwright test
 *   CLIENT=rcmc TEST_ENV=fb FB_NUMBER=23 npx playwright test
 *
 * URL mapping:
 *   dev  — shared localhost for all clients
 *   test — shared https://test.penny.co for all clients
 *   fb   — client-specific slot on .tst.penny.co
 *   fb-N — numbered feature-branch slot on .tst.penny.co
 *   demo — client-specific slot
 *   prod — client-specific slot
 */

import { config as dotenvConfig } from "dotenv";
import path from "path";
import fs from "fs";

export type ClientName = "ewcf" | "rcmc" | "enterprise" | "sabil";
export type BaseEnvName = "dev" | "fb" | "test" | "demo" | "prod";
export type EnvName = BaseEnvName | `fb-${number}`;

const CLIENT_NAMES: ClientName[] = ["ewcf", "rcmc", "enterprise", "sabil"];
const BASE_ENV_NAMES: BaseEnvName[] = ["dev", "fb", "test", "demo", "prod"];

// ── Shared URLs (same for every client) ──────────────────────────────────────
const COMMON: Record<"dev" | "test", { web: string; api: string }> = {
  dev: { web: "http://localhost:3000", api: "http://localhost:8080" },
  test: { web: "https://test.penny.co", api: "https://api-test.penny.co" },
};

// ── Client-specific URLs (fb + demo + prod) ───────────────────────────────────
const CLIENT_URLS: Record<
  ClientName,
  Record<"fb" | "demo" | "prod", { web: string; api: string }>
> = {
  enterprise: {
    fb: { web: "https://test.penny.co", api: "https://api-test.penny.co" },
    demo: { web: "https://demo.penny.co", api: "https://api-demo.penny.co" },
    prod: { web: "https://penny.co", api: "https://api.penny.co" },
  },
  ewcf: {
    fb: { web: "https://fb-5.tst.penny.co", api: "https://api-fb-5.tst.penny.co" },
    demo: { web: "https://ewcf.demo.penny.co", api: "https://api-ewcf.demo.penny.co" },
    prod: {
      web: "https://procurement.esportsfoundation.com",
      api: "https://api.procurement.esportsfoundation.com",
    },
  },
  rcmc: {
    fb: { web: "https://rcmc.tst.penny.co", api: "https://api-rcmc.tst.penny.co" },
    demo: { web: "https://rcmc.demo.penny.co", api: "https://api-rcmc.demo.penny.co" },
    prod: { web: "https://rcmc.penny.co", api: "https://api-rcmc.penny.co" },
  },
  sabil: {
    fb: {
      web: "https://sabil.tst.penny.co",
      api: "https://api-sabil.tst.penny.co",
    },
    demo: {
      web: "https://sabil.demo.penny.co",
      api: "https://api-sabil.demo.penny.co",
    },
    prod: {
      web: "https://sabil.penny.co",
      api: "https://api-sabil.penny.co",
    },
  },
};

function resolveUrls(
  client: ClientName,
  env: BaseEnvName,
  fbNumber?: string,
): { web: string; api: string } {
  if (env === "dev" || env === "test") return COMMON[env];
  if (env === "fb" && fbNumber) return resolveNumberedFbUrls(client, fbNumber);
  return CLIENT_URLS[client][env];
}

function resolveNumberedFbUrls(client: ClientName, fbNumber: string): { web: string; api: string } {
  const slot = `${client}${fbNumber}`;
  return {
    web: `https://${slot}.tst.penny.co`,
    api: `https://api-${slot}.tst.penny.co`,
  };
}

export interface ClientConfig {
  client: ClientName;
  env: EnvName;
  webBaseUrl: string;
  apiBaseUrl: string;
  userEmail: string;
  userPassword: string;
  adminEmail: string;
  adminPassword: string;
}

const REQUIRED_CREDENTIAL_KEYS = [
  "USER_EMAIL",
  "USER_PASSWORD",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
] as const;

/**
 * Resolves URLs and loads per-client credentials.
 *
 * Credential files are read from:
 *   src/config/clients/{client}/{env}.env
 * For TEST_ENV=fb-5, prefers fb-5.env, then fb.env, then test.env.
 *
 * Call this inside getEnvironmentConfig() when process.env.CLIENT is set.
 */
export function loadClientConfig(
  client = process.env.CLIENT as ClientName | undefined,
  env = process.env.TEST_ENV as EnvName | undefined,
): ClientConfig {
  const clientName = parseClientName(client);
  const envConfig = parseEnvName(env, process.env.FB_NUMBER);
  const { baseEnvName, displayEnvName, fbNumber } = envConfig;

  // ── Load per-client credentials ───────────────────────────────────────────
  const clientsDir = path.resolve(__dirname, "clients", clientName);
  const credentialFile = resolveCredentialFile(clientsDir, envConfig);

  if (credentialFile) {
    dotenvConfig({ path: credentialFile, override: true });
  } else if (hasCredentialEnvironment()) {
    process.stdout.write(
      `ℹ [client-config] No local credential file for "${clientName}/${displayEnvName}", using environment variables\n`,
    );
  } else {
    const candidates = credentialFileCandidates(envConfig)
      .map((name) => `${name}.env`)
      .join(", ");
    throw new Error(
      `Missing credential file under src/config/clients/${clientName}/. Tried: ${candidates}\n` +
        `Copy the matching .env.example and fill in credentials, ` +
        `or provide ${REQUIRED_CREDENTIAL_KEYS.join(", ")} as environment variables.`,
    );
  }

  // ── Resolve URLs ──────────────────────────────────────────────────────────
  const urls = resolveUrls(clientName, baseEnvName, fbNumber);
  const webBaseUrl = process.env.WEB_BASE_URL || urls.web;
  const apiBaseUrl = process.env.API_BASE_URL || urls.api;

  const missing: string[] = [];
  for (const key of REQUIRED_CREDENTIAL_KEYS) {
    if (!process.env[key]) missing.push(key);
  }
  if (missing.length) {
    throw new Error(
      `Missing credentials for ${clientName}/${displayEnvName}: ${missing.join(", ")}`,
    );
  }

  return {
    client: clientName,
    env: displayEnvName,
    webBaseUrl,
    apiBaseUrl,
    userEmail: process.env.USER_EMAIL!,
    userPassword: process.env.USER_PASSWORD!,
    adminEmail: process.env.ADMIN_EMAIL!,
    adminPassword: process.env.ADMIN_PASSWORD!,
  };
}

type ParsedEnvConfig = {
  baseEnvName: BaseEnvName;
  displayEnvName: EnvName;
  fbNumber?: string;
};

function hasCredentialEnvironment(): boolean {
  return REQUIRED_CREDENTIAL_KEYS.every((key) => Boolean(process.env[key]));
}

function parseClientName(client: string | undefined): ClientName {
  const value = (client || "ewcf").toLowerCase();
  if (isClientName(value)) return value;
  throw new Error(`Invalid CLIENT "${client}". Expected one of: ${CLIENT_NAMES.join(", ")}`);
}

function parseEnvName(env: string | undefined, fbNumber: string | undefined): ParsedEnvConfig {
  const value = (env || "test").toLowerCase();
  const normalizedFbNumber = normalizeFbNumber(fbNumber);

  if (value === "fb") {
    return normalizedFbNumber
      ? {
          baseEnvName: "fb",
          displayEnvName: fbEnvName(normalizedFbNumber),
          fbNumber: normalizedFbNumber,
        }
      : { baseEnvName: "fb", displayEnvName: "fb" };
  }

  const fbMatch = value.match(/^fb-(\d+)$/);
  if (fbMatch) {
    return { baseEnvName: "fb", displayEnvName: fbEnvName(fbMatch[1]), fbNumber: fbMatch[1] };
  }

  if (isBaseEnvName(value)) return { baseEnvName: value, displayEnvName: value };
  throw new Error(
    `Invalid TEST_ENV "${env}". Expected one of: ${BASE_ENV_NAMES.join(", ")}, fb-<number>`,
  );
}

function isClientName(value: string): value is ClientName {
  return CLIENT_NAMES.includes(value as ClientName);
}

function isBaseEnvName(value: string): value is BaseEnvName {
  return BASE_ENV_NAMES.includes(value as BaseEnvName);
}

function normalizeFbNumber(fbNumber: string | undefined): string | undefined {
  if (!fbNumber) return undefined;
  const value = fbNumber.trim();
  if (/^\d+$/.test(value)) return value;
  throw new Error(`Invalid FB_NUMBER "${fbNumber}". Expected digits only, for example FB_NUMBER=5`);
}

function fbEnvName(fbNumber: string): `fb-${number}` {
  return `fb-${Number(fbNumber)}`;
}

function resolveCredentialFile(clientsDir: string, envConfig: ParsedEnvConfig): string | undefined {
  for (const candidate of credentialFileCandidates(envConfig)) {
    const candidatePath = path.join(clientsDir, `${candidate}.env`);
    if (fs.existsSync(candidatePath)) return candidatePath;
  }
  return undefined;
}

function credentialFileCandidates(envConfig: ParsedEnvConfig): string[] {
  if (envConfig.baseEnvName !== "fb") return [envConfig.baseEnvName];

  return envConfig.fbNumber ? [`fb-${envConfig.fbNumber}`, "fb", "test"] : ["fb", "test"];
}
