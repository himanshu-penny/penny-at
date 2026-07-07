import { Page, expect } from "@playwright/test";
import { Step } from "../../../core/steps";
import { TIMEOUTS } from "../../../core/constants";
import { VendorReviewPage } from "./vendor-review.page";

const EWCF_VENDOR_REVIEW_LOCATORS = {
  // ── Vendor detail view fields ─────────────────────────────────
  VIEW_TRADING_NAME: '[data-test-id="view-tradingName"]',
  VIEW_ORG_NAME: '[data-test-id="view-orgData_orgName"]',
  VIEW_CONTACT_EMAIL: '[data-test-id="view-contacts_0_email"]',
  VIEW_IBAN: '[data-test-id="view-orgData_bankInfo_iban"]',
  VIEW_BANK_NAME: '[data-test-id="view-orgData_bankInfo_bankName"]',
  VIEW_ENTITY_EMAIL: '[data-test-id="view-orgData_email"]',
} as const;

/**
 * EwcfVendorReviewPage — EWCF-specific extension of VendorReviewPage.
 *
 * Adds EWCF vendor detail field locators and the assertions that target them.
 * All common admin actions (approve, return for revision, etc.) are inherited
 * from VendorReviewPage.
 */
export class EwcfVendorReviewPage extends VendorReviewPage {
  constructor(page: Page) {
    super(page);
  }

  // ── Assertions ───────────────────────────────────────────────

  @Step("Verify vendor detail page has loaded")
  async verifyPageIsLoaded(): Promise<void> {
    await expect(
      this.page.locator(EWCF_VENDOR_REVIEW_LOCATORS.VIEW_ORG_NAME),
      "Vendor company name should be visible on the review page",
    ).toBeVisible({ timeout: TIMEOUTS.PAGE_LOAD });
  }

  @Step("Verify vendor contact email is shown in detail view")
  async verifyContactEmailVisible(): Promise<void> {
    await expect(
      this.page.locator(EWCF_VENDOR_REVIEW_LOCATORS.VIEW_CONTACT_EMAIL),
      "Contact email should be visible in the vendor detail view",
    ).toBeVisible();
  }

  @Step("Verify vendor IBAN shows expected value in detail view")
  async verifyIban(expectedIban: string): Promise<void> {
    await expect(
      this.page.locator(EWCF_VENDOR_REVIEW_LOCATORS.VIEW_IBAN),
      `IBAN field should show the vendor's submitted value "${expectedIban}"`,
    ).toContainText(expectedIban);
  }

  @Step("Verify key vendor details are visible on the review page")
  async verifyVendorDetailsSummary(): Promise<void> {
    await expect(
      this.page.locator(EWCF_VENDOR_REVIEW_LOCATORS.VIEW_ORG_NAME),
      "Organisation name should be visible",
    ).toBeVisible();
    await expect(
      this.page.locator(EWCF_VENDOR_REVIEW_LOCATORS.VIEW_CONTACT_EMAIL),
      "Contact email should be visible",
    ).toBeVisible();
    await expect(
      this.page.locator(EWCF_VENDOR_REVIEW_LOCATORS.VIEW_ENTITY_EMAIL),
      "Entity email should be visible",
    ).toBeVisible();
    await expect(
      this.page.locator(EWCF_VENDOR_REVIEW_LOCATORS.VIEW_BANK_NAME),
      "Bank name should be visible",
    ).toBeVisible();
  }
}
