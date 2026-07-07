const REDACTED = "[REDACTED]";

const SENSITIVE_KEY_PATTERNS = [
  /authorization/i,
  /cookie/i,
  /password/i,
  /passwd/i,
  /token/i,
  /secret/i,
  /api[-_]?key/i,
  /access[-_]?token/i,
  /refresh[-_]?token/i,
  /id[-_]?token/i,
  /otp/i,
  /session/i,
];

export function redactSensitiveData<T>(value: T): T {
  return redactValue(value) as T;
}

export function redactHeaders(
  headers?: Record<string, string>,
): Record<string, string> | undefined {
  if (!headers) return undefined;
  return redactSensitiveData(headers);
}

export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    for (const key of parsed.searchParams.keys()) {
      if (isSensitiveKey(key)) {
        parsed.searchParams.set(key, REDACTED);
      }
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function safeJson(value: unknown): string {
  return JSON.stringify(redactSensitiveData(value), null, 2);
}

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      isSensitiveKey(key) ? REDACTED : redactValue(entry),
    ]),
  );
}
