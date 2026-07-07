import fs from "fs";
import path from "path";
import { FileHelper } from "./file.helper";

export type TestAttachment = {
  name: string;
  fileType: string;
  image: string;
};

const TINY_PDF_BASE64 =
  "JVBERi0xLjEKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgMjAwIDIwMF0+PmVuZG9iagp0cmFpbGVyPDwvUm9vdCAxIDAgUj4+CiUlRU9GCg==";

export function tinyPdfBase64(): string {
  return TINY_PDF_BASE64;
}

export function corruptedBase64(): string {
  return "not-base64-content";
}

export function unsafeAttachmentName(): string {
  return "../../unsafe.pdf";
}

export function validPdfAttachment(name = "automation-test.pdf"): TestAttachment {
  return {
    name,
    fileType: "pdf",
    image: tinyPdfBase64(),
  };
}

export function corruptedPdfAttachment(name = "corrupted.pdf"): TestAttachment {
  return {
    name,
    fileType: "pdf",
    image: corruptedBase64(),
  };
}

export function unsupportedFileTypeAttachment(name = "unsafe.exe"): TestAttachment {
  return {
    name,
    fileType: "exe",
    image: tinyPdfBase64(),
  };
}

export function unsafeNameAttachment(): TestAttachment {
  return {
    ...validPdfAttachment(),
    name: unsafeAttachmentName(),
  };
}

export function writeTestFile(
  filePath: string,
  options: { sizeBytes?: number; content?: Buffer | string } = {},
): string {
  const fullPath = path.resolve(filePath);
  FileHelper.ensureDir(path.dirname(fullPath));

  const content = options.content ?? Buffer.alloc(options.sizeBytes ?? 0);
  fs.writeFileSync(fullPath, content);
  return fullPath;
}

export function writeTinyPdf(filePath: string): string {
  return writeTestFile(filePath, { content: Buffer.from(tinyPdfBase64(), "base64") });
}

export function writeSizedFile(filePath: string, sizeBytes: number): string {
  return writeTestFile(filePath, { sizeBytes });
}
