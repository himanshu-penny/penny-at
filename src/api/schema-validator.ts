import Ajv, { AnySchema, ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import { Logger } from "../core/logger";
import { SchemaValidationError } from "../core/errors";
import { ApiResponse } from "../types/interfaces/api-response.interface";
import fs from "fs";
import path from "path";

const logger = new Logger("SchemaValidator");

// Singleton AJV instance with formats support
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Cache compiled validators to avoid recompiling the same schema on every call
const validatorCache = new Map<AnySchema, ReturnType<typeof ajv.compile>>();

function getValidator(schema: AnySchema): ReturnType<typeof ajv.compile> {
  if (!validatorCache.has(schema)) {
    validatorCache.set(schema, ajv.compile(schema));
  }
  return validatorCache.get(schema)!;
}

/**
 * Validates a response body against a JSON Schema.
 *
 * @throws SchemaValidationError if validation fails
 *
 * Usage:
 *   validateSchema(responseBody, mySchema, "GET /vendors");
 *   validateSchema(responseBody, loadSchema("vendors/GET_vendors_schema.json"), "GET /vendors");
 */
export function validateSchema(
  data: unknown,
  schema: AnySchema,
  context: string = "response",
): void {
  const validate = getValidator(schema);
  const valid = validate(data);

  if (!valid) {
    const errors = validate.errors ?? [];
    logger.error(`Schema validation failed for: ${context}`, errors);
    throw new SchemaValidationError(
      `Schema validation failed for "${context}": ${formatErrors(errors)}`,
      errors,
    );
  }

  logger.success(`Schema validation passed for: ${context}`);
}

export function validateApiResponseSchema<T>(
  response: ApiResponse<T>,
  schema: AnySchema,
  context: string = "response",
): void {
  validateSchema(response.data, schema, context);
}

/**
 * Load a JSON schema from the test-data/response-schemas directory.
 *
 * @example
 *   const schema = loadSchema("vendors/GET_vendors_schema.json");
 */
export function loadSchema(schemaRelativePath: string): AnySchema {
  const fullPath = path.resolve("test-data/response-schemas", schemaRelativePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Schema file not found: ${fullPath}`);
  }

  const raw = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as AnySchema;
}

/**
 * Generate a basic JSON schema from a sample response body.
 * For richer schema generation, run `npm run generate:schema` instead.
 */
export function generateSchema(data: unknown): AnySchema {
  if (Array.isArray(data)) return { type: "array" };
  if (data === null) return { type: "null" };
  return { type: typeof data };
}

function formatErrors(errors: ErrorObject[]): string {
  return errors.map((e) => `  • ${e.instancePath || "root"}: ${e.message}`).join("\n");
}
