import { faker } from "@faker-js/faker";
import { User } from "../types/interfaces/user.interface";
import { UserRole } from "../types/enums/user.enum";
import { randomUsername, randomPassword } from "../utils/helpers/data.generator";

/**
 * TestDataFactory — generates structured test data objects.
 *
 * Usage in fixtures:
 *   testData: async ({}, use) => { await use(new TestDataFactory()); }
 *
 * Usage in tests:
 *   const user = testData.user();
 */
export class TestDataFactory {
  /** Generate a random user */
  user(overrides: Partial<User> = {}): User & { password: string } {
    return {
      email: faker.internet.email(),
      password: randomPassword(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      username: randomUsername(),
      role: UserRole.USER,
      ...overrides,
    } as User & { password: string };
  }

  /** Generate an admin user */
  adminUser(overrides: Partial<User> = {}): User & { password: string } {
    return this.user({ role: UserRole.ADMIN, ...overrides });
  }

  /** Generate multiple users */
  users(count: number, overrides: Partial<User> = {}): (User & { password: string })[] {
    return Array.from({ length: count }, () => this.user(overrides));
  }

  /** Generate valid email */
  email(): string {
    return `${faker.internet
      .username()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")}@yopmail.com`;
  }

  /** Generate strong password */
  password(length = 12): string {
    return randomPassword(length);
  }

  /** Generate a past date (useful for date inputs) */
  pastDate(years = 1): Date {
    return faker.date.past({ years });
  }

  /** Generate a future date */
  futureDate(years = 1): Date {
    return faker.date.future({ years });
  }
}
