import type { ClientName, EnvName } from "../../config/client-config";

export interface Credentials {
  email: string;
  password: string;
}

export interface EnvironmentTimeouts {
  pageLoad: number;
  elementVisible: number;
  apiResponse: number;
}

export interface EnvironmentConfig {
  /** Logical name of this configuration (e.g. "test", "ewcf-test", "fb-23") */
  name: string;
  /** Active client when running with CLIENT env var. Undefined for legacy multi-client configs. */
  client?: ClientName;
  webUrl: string;
  apiUrl: string;
  credentials: {
    user: Credentials;
    admin: Credentials;
  };
  timeouts: EnvironmentTimeouts;
}

/** Type alias kept for convenience */
export type { ClientName, EnvName };
