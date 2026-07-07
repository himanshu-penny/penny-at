import { faker } from "@faker-js/faker";

/**
 * Standalone data generation functions.
 * Use TestDataFactory for structured test data objects.
 */

export function uniqueId(prefix = "id"): string {
  const now = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${now}-${rnd}`;
}

export function randomEmail(): string {
  return faker.internet.email();
}

export function randomPassword(length = 12): string {
  return `${faker.internet.password({ length })}@1Aa`;
}

export function randomUsername(): string {
  return faker.internet.username().replace(/[^a-zA-Z0-9]/g, "") + faker.number.int(999);
}

export function randomTitle(words = 5): string {
  return faker.lorem.words(words);
}

export function randomSentence(): string {
  return faker.lorem.sentence();
}

export function randomParagraph(): string {
  return faker.lorem.paragraph();
}

export function randomTags(count = 3): string[] {
  return Array.from({ length: count }, () => faker.lorem.word().toLowerCase());
}

export function randomPhoneNumber(): string {
  return faker.phone.number();
}

export function randomInt(min: number, max: number): number {
  return faker.number.int({ min, max });
}

export function randomBoolean(): boolean {
  return faker.datatype.boolean();
}

export function randomDate(from?: Date, to?: Date): Date {
  return faker.date.between({
    from: from ?? new Date("2020-01-01"),
    to: to ?? new Date(),
  });
}

/** Generate a URL-friendly slug (e.g. "my-article-title") */
export function randomSlug(words = 3): string {
  return faker.lorem.words(words).toLowerCase().replace(/\s+/g, "-");
}

/** Pick a random element from a non-empty array */
export function pickRandom<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error("pickRandom called with an empty array");
  return arr[Math.floor(Math.random() * arr.length)];
}
