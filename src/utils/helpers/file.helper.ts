import fs from "fs";
import path from "path";

export class FileHelper {
  static resolvePath(filePath: string): string {
    return path.resolve(filePath);
  }

  static safeFileName(name: string, fallback = "artifact", maxLength = 120): string {
    const normalized = name
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");

    const safeName = normalized || fallback;
    return safeName.slice(0, maxLength);
  }

  static timestampForFile(date = new Date()): string {
    return date.toISOString().replace(/[:.]/g, "-");
  }

  static readJson<T>(filePath: string): T {
    const fullPath = this.resolvePath(filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }
    try {
      return JSON.parse(fs.readFileSync(fullPath, "utf-8")) as T;
    } catch (err) {
      throw new Error(`Failed to parse JSON at ${fullPath}: ${errorMessage(err)}`);
    }
  }

  static writeJson(filePath: string, data: unknown): void {
    const fullPath = this.resolvePath(filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
  }

  static readText(filePath: string): string {
    const fullPath = this.resolvePath(filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }
    return fs.readFileSync(fullPath, "utf-8");
  }

  static writeText(filePath: string, content: string): void {
    const fullPath = this.resolvePath(filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, "utf-8");
  }

  static deleteFile(filePath: string): void {
    const fullPath = this.resolvePath(filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  static listFiles(dirPath: string): string[] {
    const fullPath = this.resolvePath(dirPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Directory not found: ${fullPath}`);
    }
    return fs.readdirSync(fullPath);
  }

  static exists(filePath: string): boolean {
    return fs.existsSync(this.resolvePath(filePath));
  }

  static ensureDir(dirPath: string): void {
    fs.mkdirSync(this.resolvePath(dirPath), { recursive: true });
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
