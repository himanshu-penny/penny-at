export type EnvValueOptions = {
  trim?: boolean;
};

const DEFAULT_OPTIONS: Required<EnvValueOptions> = {
  trim: true,
};

export function optionalEnv(name: string, options?: EnvValueOptions): string | undefined {
  const value = process.env[name];
  if (value === undefined) return undefined;

  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };
  const normalized = resolvedOptions.trim ? value.trim() : value;
  return normalized.length > 0 ? normalized : undefined;
}

export function requireEnv(name: string, options?: EnvValueOptions): string {
  const value = optionalEnv(name, options);
  if (value !== undefined) return value;

  throw new Error(`Missing required environment variable: ${name}`);
}

export function envNumber(name: string, fallback: number, options?: EnvValueOptions): number {
  const value = optionalEnv(name, options);
  if (value === undefined) return fallback;

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${name} must be a number when provided.`);
  }

  return parsed;
}

export function envFlag(name: string, fallback = false): boolean {
  const value = optionalEnv(name);
  if (value === undefined) return fallback;

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}
