import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { Step } from "../../../core/steps";
import { PENNY_ROUTES, PENNY_ROUTE_PATTERNS, TIMEOUTS } from "../../../core/constants";

const VENDOR_REVIEW_LOCATORS = {
  // ── Admin action buttons ──────────────────────────────────────
  RETURN_BUTTON: '[data-test-id="return-invite"]',
  APPROVE_BUTTON: '[data-test-id="approve-invite"]',
  ACTIONS_BUTTON: '[data-test-id="actions-button"]',
  ACTION_CONFIRM: '[data-test-id="action-button"]',

  // ── Note/comment editor (Quill rich text) ─────────────────────
  NOTE_EDITOR: ".ql-editor",

  // ── Status badge ──────────────────────────────────────────────
  STATUS_TEXT: '[data-test-id="status-text"]',
} as const;

/**
 * VendorReviewPage — base page object for the admin-facing vendor detail/review page.
 *
 * URL pattern: `/en/vendors/invited/:orgId`
 *
 * Contains common admin actions shared across all clients:
 *   - Return for Revision — send the form back to the vendor with a note
 *   - Approve — approve the vendor registration with an optional note
 *
 * Extend this class with client-specific subclasses for client-specific detail field
 * locators and assertions (e.g. EwcfVendorReviewPage, SabilVendorReviewPage).
 *
 * Navigation: reach this page via VendorsListPage → Invited tab → clickVendorById().
 */
export class VendorReviewPage extends BasePage {
  protected readonly returnButton: Locator;
  protected readonly approveButton: Locator;
  private readonly actionsButton: Locator;
  private readonly actionConfirm: Locator;
  private readonly noteEditor: Locator;

  constructor(page: Page) {
    super(page);
    this.returnButton = page.locator(VENDOR_REVIEW_LOCATORS.RETURN_BUTTON);
    this.approveButton = page.locator(VENDOR_REVIEW_LOCATORS.APPROVE_BUTTON);
    this.actionsButton = page.locator(VENDOR_REVIEW_LOCATORS.ACTIONS_BUTTON);
    this.actionConfirm = page.locator(VENDOR_REVIEW_LOCATORS.ACTION_CONFIRM);
    this.noteEditor = page.locator(VENDOR_REVIEW_LOCATORS.NOTE_EDITOR);
  }

  // ── Navigation ──────────────────────────────────────────────

  /**
   * Navigate directly to a vendor's review page by org ID.
   * Prefer reaching this page via VendorsListPage.clickVendorById() in E2E flows.
   */
  @Step("Navigate to vendor review page")
  async navigateToVendor(webUrl: string, orgId: string): Promise<void> {
    await super.navigate(`${webUrl}${PENNY_ROUTES.VENDORS}/invited/${orgId}`);
    await this.page.waitForURL(PENNY_ROUTE_PATTERNS.VENDOR_INVITED_DETAIL, {
      timeout: TIMEOUTS.PAGE_LOAD,
    });
    await this.page.waitForLoadState("networkidle", { timeout: TIMEOUTS.PAGE_LOAD });
  }

  // ── Admin Actions ────────────────────────────────────────────

  @Step("Click Return for Revision button")
  async clickReturnForRevision(): Promise<void> {
    await this.action.click(this.returnButton);
  }

  @Step("Click Approve button")
  async clickApprove(): Promise<void> {
    await this.action.click(this.approveButton);
  }

  @Step("Click Actions menu")
  async clickActionsMenu(): Promise<void> {
    await this.action.click(this.actionsButton);
  }

  /**
   * Fill the Quill rich-text note field (shown in both Return and Approve modals).
   */
  @Step("Fill action note")
  async fillNote(text: string): Promise<void> {
    await this.action.click(this.noteEditor);
    await this.action.fill(this.noteEditor, text);
  }

  /**
   * Confirm the active modal action (shared by Return and Approve flows).
   */
  @Step("Confirm action")
  async confirmAction(): Promise<void> {
    await this.action.click(this.actionConfirm);
  }

  // ── Composite flows ──────────────────────────────────────────

  /**
   * Full Return for Revision flow: click return button → fill note → confirm.
   */
  @Step("Return vendor registration for revision")
  async returnForRevision(note: string): Promise<void> {
    await this.clickReturnForRevision();
    await this.fillNote(note);
    await this.confirmAction();
  }

  /**
   * Full Approve flow: click approve button → fill note → confirm.
   */
  @Step("Approve vendor registration")
  async approve(note: string): Promise<void> {
    await this.clickApprove();
    await this.fillNote(note);
    await this.confirmAction();
  }

  // ── Assertions ───────────────────────────────────────────────

  @Step("Verify Return for Revision button is visible")
  async verifyReturnButtonVisible(): Promise<void> {
    await expect(
      this.returnButton,
      "Return for Revision button should be available for this vendor",
    ).toBeVisible();
  }

  @Step("Verify Approve button is visible")
  async verifyApproveButtonVisible(): Promise<void> {
    await expect(
      this.approveButton,
      "Approve button should be available for this vendor",
    ).toBeVisible();
  }

  @Step("Verify revision request was sent successfully")
  async verifyRevisionRequestSent(): Promise<void> {
    await expect(
      this.page.getByText(/revision request has been/i),
      "Success message confirming the revision request was sent should appear",
    ).toBeVisible({ timeout: TIMEOUTS.API_RESPONSE });
  }

  @Step("Verify approval was submitted successfully")
  async verifyApprovalSent(): Promise<void> {
    // After approval the Approve button leaves the DOM (vendor can't be re-approved),
    // while the Return for Revision button may remain for post-approval workflows.
    await expect(
      this.approveButton,
      "Approve button should be removed after the vendor is approved",
    ).not.toBeAttached({ timeout: TIMEOUTS.API_RESPONSE });
  }

  @Step("Verify vendor status badge shows expected text")
  async verifyStatus(expectedText: string | RegExp): Promise<void> {
    await expect(
      this.page.locator(VENDOR_REVIEW_LOCATORS.STATUS_TEXT),
      `Vendor status badge should display "${expectedText}"`,
    ).toContainText(expectedText);
  }
}
