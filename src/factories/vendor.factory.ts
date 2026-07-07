import { faker } from "@faker-js/faker";
import type {
  VendorInviteRow,
  VendorRegistrationData,
  SabilVendorRegistrationData,
} from "../types/interfaces/vendor.interface";

/**
 * VendorDataFactory — generates test data for vendor invitation and registration flows.
 *
 * Usage:
 *   const inviteRow   = VendorDataFactory.inviteRow();
 *   const regData     = VendorDataFactory.registrationData();
 *   const invalidRows = VendorDataFactory.invalidInviteRows();
 */
export class VendorDataFactory {
  /** Generate a valid vendor invite row (email + org name) */
  static inviteRow(overrides: Partial<VendorInviteRow> = {}): VendorInviteRow {
    return {
      email: `${faker.internet
        .username()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}@yopmail.com`,
      organizationName: faker.company.name(),
      ...overrides,
    };
  }

  /** Generate valid registration form data */
  static registrationData(overrides: Partial<VendorRegistrationData> = {}): VendorRegistrationData {
    const companyName = faker.company.name();
    return {
      companyName,
      organizationType: "LLC",
      entityType: "local",
      tradingName: faker.company.name(),
      entityEmail: `${faker.internet
        .username()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}@yopmail.com`,
      establishmentDate: "2020-01-01",
      city: "Riyadh",
      officeAddress: faker.location.streetAddress(),
      postalCode: faker.string.numeric(5),
      corporateWebsite: `https://${faker.internet.domainName()}`,
      contactEmail: `${faker.internet
        .username()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}@yopmail.com`,
      contactDesignation: faker.person.jobTitle(),
      contactFirstName: faker.person.firstName(),
      contactLastName: faker.person.lastName(),
      contactMobile: `5${faker.string.numeric(8)}`,
      beneficiaryName: companyName,
      bankName: "Al Rajhi Bank",
      bankAccountNo: faker.string.numeric(10),
      iban: `SA${faker.string.numeric(22)}`,
      swiftCode: "RJHISARI",
      ...overrides,
    };
  }

  /** Generate valid registration form data for an international (non-Saudi) entity */
  static internationalRegistrationData(
    overrides: Partial<VendorRegistrationData> = {},
  ): VendorRegistrationData {
    const companyName = faker.company.name();
    return {
      companyName,
      organizationType: "LLC",
      entityType: "international",
      tradingName: faker.company.name(),
      entityEmail: `${faker.internet
        .username()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}@yopmail.com`,
      establishmentDate: "2020-01-01",
      country: "United Arab Emirates",
      city: "Dubai",
      officeAddress: faker.location.streetAddress(),
      postalCode: faker.string.numeric(5),
      corporateWebsite: `https://${faker.internet.domainName()}`,
      contactEmail: `${faker.internet
        .username()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}@yopmail.com`,
      contactDesignation: faker.person.jobTitle(),
      contactFirstName: faker.person.firstName(),
      contactLastName: faker.person.lastName(),
      contactMobile: `5${faker.string.numeric(8)}`,
      beneficiaryName: companyName,
      bankCountry: "United Arab Emirates",
      bankName: "Emirates NBD",
      bankAccountNo: faker.string.numeric(10),
      iban: `AE${faker.string.numeric(21)}`,
      swiftCode: "EBILAEAD",
      ...overrides,
    };
  }

  /** Generate valid registration form data for a SABIL vendor (local by default) */
  static sabilRegistrationData(
    overrides: Partial<SabilVendorRegistrationData> = {},
  ): SabilVendorRegistrationData {
    const companyName = faker.company.name();
    return {
      companyName,
      operatingRegion: "local",
      registrationNumber: faker.string.numeric(10),
      companyEmail: `${faker.internet
        .username()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}@yopmail.com`,
      companyPhone: `5${faker.string.numeric(8)}`,
      headOfficeAddress: faker.location.streetAddress(),
      country: "Saudi Arabia",
      city: "Riyadh",
      postalCode: faker.string.numeric(5),
      contactFirstName: faker.person.firstName(),
      contactLastName: faker.person.lastName(),
      contactTitle: faker.person.jobTitle(),
      contactEmail: `${faker.internet
        .username()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}@yopmail.com`,
      contactMobile: `5${faker.string.numeric(8)}`,
      iban: `SA${faker.string.numeric(22)}`,
      accountName: companyName,
      bankName: "Al Rajhi Bank",
      bankCountry: "Saudi Arabia",
      accountNumber: faker.string.numeric(10),
      ...overrides,
    };
  }

  /** Invalid invite rows for negative tests */
  static invalidInviteRows(): Array<{ label: string; email: string; organizationName: string }> {
    return [
      { label: "missing @ in email", email: "notanemail", organizationName: faker.company.name() },
      { label: "missing domain", email: "user@", organizationName: faker.company.name() },
      { label: "empty email", email: "", organizationName: faker.company.name() },
      { label: "empty org name", email: faker.internet.email(), organizationName: "" },
    ];
  }
}
