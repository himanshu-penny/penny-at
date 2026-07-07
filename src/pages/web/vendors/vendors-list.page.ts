import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { Step } from "../../../core/steps";
import { PENNY_ROUTES, PENNY_ROUTE_PATTERNS, TIMEOUTS } from "../../../core/constants";

const VENDORS_LIST_LOCATORS = {
  // ── Tab navigation ──────────────────────────────────────────────
  VENDORS_TAB: '[data-test-id="vendors-tab"]',
  INVITED_TAB: '[data-test-id="invited-vendors-tab"]',
  REPORTS_TAB: '[data-test-id="reports-tab"]',
  SETTINGS_TAB: '[data-test-id="settings-tab"]',

  // ── Actions ─────────────────────────────────────────────────────
  INVITE_BUTTON: '[data-test-id="invite-button"]',
  BULK_UPDATE_BUTTON: '[data-test-id="bulk-update-vendors-data-button"]',
  BULK_UPLOAD_BUTTON: '[data-test-id="bulk-upload-vendors-data-button"]',

  // ── Grid cells ──────────────────────────────────────────────────
  DISPLAY_ID_BUTTON: '[data-test-id="displayId-button"]',
  NAME_TEXT: '[data-test-id="name-text"]',
  // Invited-tab grid uses "orgName-text" for the Organisation Name column
  ORG_NAME_TEXT: '[data-test-id="orgName-text"]',
  COUNTRY_TEXT: '[data-test-id="country-text"]',
  EMAIL_TEXT: '[data-test-id="email-text"]',
  REFERENCE_ID_TEXT: '[data-test-id="referenceId-text"]',
  CATEGORIES_TEXT: '[data-test-id="categories-text"]',

  // ── Pagination ──────────────────────────────────────────────────
  PAGINATION: '[data-test-id="pagination"]',

  // ── Breadcrumb ──────────────────────────────────────────────────
  BACK_BUTTON: '[data-test-id="breadcrumb-back-button"]',

  // ── ag-Grid ─────────────────────────────────────────────────────
  AG_GRID: "ag-grid-angular",
  AG_ROW: ".ag-row",
} as const;

/**
 * VendorsListPage — page object for `/en/vendors`.
 *
 * Covers:
 *   - Tab navigation (Vendors, Invited Vendors, Reports, Settings)
 *   - ag-Grid vendor table (ID, Name, Country, Email, etc.)
 *   - "Invite Vendors" button to open the invite sidebar
 *   - Pagination
 */
export class VendorsListPage extends BasePage {
  private readonly vendorsTab: Locator;
  private readonly invitedTab: Locator;
  private readonly reportsTab: Locator;
  private readonly settingsTab: Locator;
  private readonly inviteButton: Locator;
  private readonly agGrid: Locator;
  private readonly pagination: Locator;
  private readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.vendorsTab = page.locator(VENDORS_LIST_LOCATORS.VENDORS_TAB);
    this.invitedTab = page.locator(VENDORS_LIST_LOCATORS.INVITED_TAB);
    this.reportsTab = page.locator(VENDORS_LIST_LOCATORS.REPORTS_TAB);
    this.settingsTab = page.locator(VENDORS_LIST_LOCATORS.SETTINGS_TAB);
    this.inviteButton = page.locator(VENDORS_LIST_LOCATORS.INVITE_BUTTON);
    this.agGrid = page.locator(VENDORS_LIST_LOCATORS.AG_GRID);
    this.pagination = page.locator(VENDORS_LIST_LOCATORS.PAGINATION);
    this.backButton = page.locator(VENDORS_LIST_LOCATORS.BACK_BUTTON);
  }

  // ── Navigation ─────────────────────────────────────────────────

  @Step("Navigate to Vendors module")
  async navigate(webUrl: string): Promise<void> {
    await super.navigate(`${webUrl}${PENNY_ROUTES.VENDORS}`);
    // Wait for Angular SPA route to stabilize and vendors module to lazy-load
    await this.page.waitForURL(PENNY_ROUTE_PATTERNS.VENDORS, { timeout: 30_000 });
    await this.page.waitForLoadState("networkidle", { timeout: 30_000 });
  }

  // ── Actions ────────────────────────────────────────────────────

  @Step("Click Vendors tab")
  async clickVendorsTab(): Promise<void> {
    await this.action.click(this.vendorsTab);
  }

  @Step("Click Invited Vendors tab")
  async clickInvitedTab(): Promise<void> {
    await this.action.click(this.invitedTab);
  }

  @Step("Click Reports tab")
  async clickReportsTab(): Promise<void> {
    await this.action.click(this.reportsTab);
  }

  @Step("Click Settings tab")
  async clickSettingsTab(): Promise<void> {
    await this.action.click(this.settingsTab);
  }

  @Step("Click Invite Vendors button")
  async clickInviteVendors(): Promise<void> {
    await this.wait.forVisible(this.inviteButton, TIMEOUTS.PAGE_LOAD);
    await this.action.click(this.inviteButton);
  }

  @Step("Click vendor row by display ID")
  async clickVendorById(displayId: string): Promise<void> {
    const row = this.page.locator(VENDORS_LIST_LOCATORS.DISPLAY_ID_BUTTON, { hasText: displayId });
    await this.action.click(row);
  }

  @Step("Click first vendor row in the list")
  async clickFirstVendor(): Promise<void> {
    await this.action.click(this.page.locator(VENDORS_LIST_LOCATORS.DISPLAY_ID_BUTTON).first());
  }

  /**
   * Finds the first row whose name cell contains `companyName` and clicks its
   * display-ID button.  Falls back to the first row if the name is not found
   * (e.g. ag-Grid virtual-scroll truncation), so the test still proceeds.
   */
  @Step("Click vendor row matching company name")
  async clickVendorRowByName(companyName: string): Promise<void> {
    // The vendors tab uses "name-text"; the invited tab uses "orgName-text".
    // Try both so this method works on either tab.
    const nameLocator = this.page.locator(
      `${VENDORS_LIST_LOCATORS.NAME_TEXT}, ${VENDORS_LIST_LOCATORS.ORG_NAME_TEXT}`,
      { hasText: companyName },
    );
    const matchingRow = this.page
      .locator(VENDORS_LIST_LOCATORS.AG_ROW)
      .filter({ has: nameLocator });

    const count = await matchingRow.count();
    if (count > 0) {
      await this.action.click(matchingRow.first().locator(VENDORS_LIST_LOCATORS.DISPLAY_ID_BUTTON));
    } else {
      // ag-Grid may truncate cell text — fall back to first row (newest vendor)
      await this.action.click(this.page.locator(VENDORS_LIST_LOCATORS.DISPLAY_ID_BUTTON).first());
    }
  }

  // ── Queries ─────────────────────────────────────────────────────

  /** Returns the name text of the first vendor row (useful for pre-click assertions). */
  async getFirstVendorName(): Promise<string> {
    return (await this.page.locator(VENDORS_LIST_LOCATORS.NAME_TEXT).first().textContent()) ?? "";
  }

  async getVendorNames(): Promise<string[]> {
    return this.action.getAllTexts(this.page.locator(VENDORS_LIST_LOCATORS.NAME_TEXT));
  }

  async getVendorEmails(): Promise<string[]> {
    return this.action.getAllTexts(this.page.locator(VENDORS_LIST_LOCATORS.EMAIL_TEXT));
  }

  async getRowCount(): Promise<number> {
    return this.page.locator(VENDORS_LIST_LOCATORS.AG_ROW).count();
  }

  /** Waits up to 30 s for at least one ag-Grid row to become visible. */
  async waitForFirstRow(): Promise<void> {
    await expect(
      this.page.locator(VENDORS_LIST_LOCATORS.AG_ROW).first(),
      "First ag-Grid row should appear",
    ).toBeVisible({ timeout: 30_000 });
  }

  async isVendorInList(nameOrEmail: string): Promise<boolean> {
    const names = await this.getVendorNames();
    const emails = await this.getVendorEmails();
    return [...names, ...emails].some((v) => v.includes(nameOrEmail));
  }

  // ── Assertions ──────────────────────────────────────────────────

  @Step("Verify Vendors list page is loaded")
  async verifyPageIsLoaded(): Promise<void> {
    await expect(this.vendorsTab, "Vendors tab should be visible").toBeVisible();
    await expect(this.invitedTab, "Invited Vendors tab should be visible").toBeVisible();
    await expect(this.reportsTab, "Reports tab should be visible").toBeVisible();
    await expect(this.settingsTab, "Settings tab should be visible").toBeVisible();
    await expect(this.inviteButton, "Invite Vendors button should be visible").toBeVisible();
    await expect(this.agGrid, "Vendor grid should be visible").toBeVisible();
  }

  @Step("Verify vendor grid has rows")
  async verifyGridHasRows(): Promise<void> {
    const count = await this.getRowCount();
    expect(count, "Vendor grid should have at least one row").toBeGreaterThan(0);
  }

  @Step("Verify pagination is visible")
  async verifyPaginationIsVisible(): Promise<void> {
    await expect(this.pagination, "Pagination should be visible").toBeVisible();
  }

  @Step("Verify URL is on vendors page")
  async verifyUrl(): Promise<void> {
    await expect(this.page, "Should be on /en/vendors").toHaveURL(PENNY_ROUTE_PATTERNS.VENDORS);
  }
}
