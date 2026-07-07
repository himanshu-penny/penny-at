export type VendorFormType = "ewcf" | "enterprise" | "rcmc" | "mm" | "sabil";

export interface SabilVendorRegistrationData {
  // Company Information
  companyName: string;
  companyNameAr?: string;
  operatingRegion: "local" | "international";
  registrationNumber: string;
  companyEmail: string;
  companyPhone: string;
  companyPhoneExtension?: string;
  numberOfEmployees?: number;
  websiteUrl?: string;
  // Address
  headOfficeAddress: string;
  country?: string;
  city: string;
  postalCode?: string;
  // Contact (primary)
  contactFirstName: string;
  contactLastName: string;
  contactTitle: string;
  contactEmail: string;
  contactMobile: string;
  // Bank Information
  iban: string;
  accountName: string;
  bankName: string;
  bankCountry?: string;
  accountNumber?: string;
}

export interface VendorInviteRow {
  email: string;
  organizationName: string;
}

export interface VendorRegistrationData {
  // Company Information
  companyName: string;
  organizationType: string;
  entityType: "local" | "international";
  entityEmail: string;
  establishmentDate?: string; // p-calendar input, e.g. "01/01/2020"
  tradingName?: string; // optional — "if applicable"
  // Address
  country?: string; // defaults to "Saudi Arabia" if omitted
  city: string;
  officeAddress: string;
  postalCode?: string; // optional
  // Additional Information
  corporateWebsite?: string; // optional
  // Contact (primary representative)
  contactEmail: string;
  contactDesignation: string;
  contactFirstName: string;
  contactLastName: string;
  contactMobile: string;
  // Bank Information
  bankCountry?: string; // defaults to "Saudi Arabia" if omitted
  beneficiaryName: string;
  bankName: string;
  bankAccountNo: string;
  iban: string;
  swiftCode: string;
}
