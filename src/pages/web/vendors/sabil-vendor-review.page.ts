import { Page } from "@playwright/test";
import { VendorReviewPage } from "./vendor-review.page";

/**
 * SabilVendorReviewPage — Sabil-specific extension of VendorReviewPage.
 *
 * Add Sabil vendor detail field locators and assertions here as the UI is defined.
 * All common admin actions (approve, return for revision, etc.) are inherited
 * from VendorReviewPage.
 */
export class SabilVendorReviewPage extends VendorReviewPage {
  constructor(page: Page) {
    super(page);
  }
}
