/**
 * Custom error hierarchy for the framework.
 * Use specific error types to give clear failure context.
 */

import { redactSensitiveData } from "./redaction";

export class FrameworkError extends Error {
  constructor(
    message: string,
    public readonly context?: string,
  ) {
    super(message);
    this.name = "FrameworkError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ApiError extends FrameworkError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly responseBody?: unknown,
    public readonly responseHeaders?: Record<string, string>,
  ) {
    super(message, "API");
    this.name = "ApiError";
  }

  toString(): string {
    return `${this.name}[${this.statusCode}]: ${this.message} - ${JSON.stringify(
      redactSensitiveData(this.responseBody),
    )}`;
  }
}

export class SchemaValidationError extends FrameworkError {
  constructor(
    message: string,
    public readonly errors: unknown[],
  ) {
    super(message, "SchemaValidation");
    this.name = "SchemaValidationError";
  }
}

export class PageNotLoadedError extends FrameworkError {
  constructor(url: string, reason?: string) {
    super(`Page at "${url}" did not load: ${reason ?? "unknown"}`, "Navigation");
    this.name = "PageNotLoadedError";
  }
}

export class ElementNotFoundError extends FrameworkError {
  constructor(selector: string, context?: string) {
    super(`Element "${selector}" not found${context ? ` in ${context}` : ""}`, "DOM");
    this.name = "ElementNotFoundError";
  }
}

export class AuthenticationError extends FrameworkError {
  constructor(message = "Authentication failed") {
    super(message, "Auth");
    this.name = "AuthenticationError";
  }
}
