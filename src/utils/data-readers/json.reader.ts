import fs from "fs";
import path from "path";

export function readJsonFile<T>(relativePath: string): T {
  const fullPath = path.resolve(relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`JSON file not found: ${fullPath}`);
  }
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf-8")) as T;
  } catch (err) {
    throw new Error(`Failed to parse JSON at ${fullPath}: ${errorMessage(err)}`);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
