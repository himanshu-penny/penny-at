import { parameter } from "allure-js-commons";
import { isSensitiveKey, redactSensitiveData } from "../../core/redaction";

const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);
const REDACTED = "[REDACTED]";

export function isAllureRuntimeMetadataEnabled(): boolean {
  return ENABLED_VALUES.has((process.env.ALLURE_RUNTIME_METADATA ?? "").toLowerCase());
}

export async function addAllureParameter(name: string, value: string): Promise<void> {
  if (!isAllureRuntimeMetadataEnabled()) return;
  await parameter(name, redactedParameterValue(name, value));
}

function redactedParameterValue(name: string, value: string): string {
  if (isSensitiveKey(name)) return REDACTED;
  const redacted = redactSensitiveData({ value }).value;
  return typeof redacted === "string" ? redacted : String(redacted);
}
