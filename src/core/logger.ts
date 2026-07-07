/* eslint-disable no-console */
import chalk from "chalk";
import { redactHeaders, redactSensitiveData, redactUrl } from "./redaction";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR",
};

/**
 * Structured, colour-coded logger.
 *
 * Usage:
 *   const log = new Logger("MyPage");
 *   log.info("Navigating to login page");
 *   log.error("Element not found", { selector: "#submit" });
 */
export class Logger {
  private static globalLevel: LogLevel = LogLevel.INFO;
  private readonly context: string;

  constructor(context: string) {
    this.context = context;
  }

  static setLevel(level: LogLevel): void {
    Logger.globalLevel = level;
  }

  static fromEnv(): Logger {
    const level = (process.env.LOG_LEVEL?.toUpperCase() as keyof typeof LogLevel) ?? "INFO";
    Logger.setLevel(LogLevel[level] ?? LogLevel.INFO);
    return new Logger("Root");
  }

  private format(level: LogLevel, message: string, meta?: unknown): string {
    const ts = new Date().toISOString();
    const lvlName = LOG_LEVEL_NAMES[level];
    const base = `[${ts}] [${lvlName}] [${this.context}] ${message}`;
    return meta ? `${base} ${JSON.stringify(meta)}` : base;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= Logger.globalLevel;
  }

  debug(message: string, meta?: unknown): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    console.debug(chalk.gray(this.format(LogLevel.DEBUG, message, meta)));
  }

  info(message: string, meta?: unknown): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    console.info(chalk.blue(this.format(LogLevel.INFO, message, meta)));
  }

  warn(message: string, meta?: unknown): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    console.warn(chalk.yellow(this.format(LogLevel.WARN, message, meta)));
  }

  error(message: string, meta?: unknown): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    console.error(chalk.red(this.format(LogLevel.ERROR, message, meta)));
  }

  success(message: string, meta?: unknown): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    console.log(chalk.green(this.format(LogLevel.INFO, `✓ ${message}`, meta)));
  }

  /** Log API request details with sensitive values redacted. */
  logRequest(method: string, url: string, headers?: Record<string, string>, body?: unknown): void {
    this.info(`-> ${method} ${redactUrl(url)}`, {
      headers: redactHeaders(headers),
      body: redactSensitiveData(body),
    });
  }

  /** Log API response details */
  logResponse(status: number, body?: unknown, expectedStatus?: number): void {
    const is2xx = status >= 200 && status < 300;
    const isExpected = expectedStatus !== undefined ? status === expectedStatus : is2xx;
    const label = is2xx ? "OK" : isExpected ? "EXPECTED" : "ERROR";
    const msg = `<- ${status} ${label}`;
    const safeBody = redactSensitiveData(body);
    if (is2xx) {
      this.success(msg, safeBody);
    } else if (isExpected) {
      this.info(msg, safeBody);
    } else {
      this.error(msg, safeBody);
    }
  }
}
