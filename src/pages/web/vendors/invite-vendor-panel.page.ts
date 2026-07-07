import { Page, Locator, Route, expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { Step } from "../../../core/steps";
import type { VendorInviteRow } from "../../../types/interfaces/vendor.interface";

const INVITE_PANEL_LOCATORS = {
  // ── Sidebar container ───────────────────────────────────────────
  SIDEBAR: 'div[role="complementary"].p-sidebar-active',
  TITLE: "h1",

  // ── Tabs ────────────────────────────────────────────────────────
  EMAIL_TAB: "a#email",
  LINK_TAB: "a#link",

  // ── Email tab — row inputs (confirmed from real HTML) ────────────
  // Inputs have no data-test-id; identified by placeholder text
  EMAIL_INPUT: 'input[type="email"][placeholder="Enter Email ID"]',
  ORG_INPUT: 'input[type="text"][placeholder="Enter Organization Name"]',
  ADD_BUTTON: '[data-test-id="add-item-button"]',
  ROW_DELETE_ICON: 'mat-icon:text(" close ")',

  // ── Footer actions ──────────────────────────────────────────────
  CANCEL_BUTTON: '[data-test-id="cancel-button"]',
  SEND_BUTTON: '[data-test-id="send-button"]',

  // ── Public link tab (confirmed from real HTML) ───────────────────
  PUBLIC_LINK_INPUT: '[data-test-id="public-link-input"]',
} as const;

/**
 * InviteVendorPanel — page object for the "Invite Vendors" right-hand sidebar.
 *
 * Opened by clicking the "Invite Vendors" button on the Vendors list page.
 * Contains two tabs:
 *   - "Invite by E-mail" — add rows with email + org name, then send
 *   - "Public Invite Link" — shows a readonly URL the user can copy; this link
 *     is the vendor registration URL (with embedded invite token) that vendors
 *     click to access the registration form
 */
export class InviteVendorPanel extends BasePage {
  private readonly sidebar: Locator;
  private readonly emailTab: Locator;
  private readonly linkTab: Locator;
  private readonly addButton: Locator;
  private readonly cancelButton: Locator;
  private readonly sendButton: Locator;
  private readonly publicLinkInput: Locator;
  private readonly copyLinkButton: Locator;

  constructor(page: Page) {
    super(page);
    this.sidebar = page.locator(INVITE_PANEL_LOCATORS.SIDEBAR);
    this.emailTab = page.locator(INVITE_PANEL_LOCATORS.EMAIL_TAB);
    this.linkTab = page.locator(INVITE_PANEL_LOCATORS.LINK_TAB);
    this.addButton = page.locator(INVITE_PANEL_LOCATORS.ADD_BUTTON);
    this.cancelButton = page.locator(INVITE_PANEL_LOCATORS.CANCEL_BUTTON);
    this.sendButton = page.locator(INVITE_PANEL_LOCATORS.SEND_BUTTON);
    this.publicLinkInput = page.locator(INVITE_PANEL_LOCATORS.PUBLIC_LINK_INPUT);
    this.copyLinkButton = page.getByRole("button", { name: /copy/i });
  }

  // ── Actions ─────────────────────────────────────────────────────

  @Step("Switch to Invite by E-mail tab")
  async switchToEmailTab(): Promise<void> {
    await this.action.click(this.emailTab);
  }

  @Step("Switch to Public Invite Link tab")
  async switchToPublicLinkTab(): Promise<void> {
    await this.action.click(this.linkTab);
  }

  @Step("Click Add row button")
  async clickAdd(): Promise<void> {
    await this.action.click(this.addButton);
  }

  /**
   * Fill the Nth invite row (0-indexed).
   * Inputs are identified by placeholder text inside the sidebar.
   */
  @Step("Fill invite row with email and org name")
  async fillInviteRow(rowIndex: number, data: VendorInviteRow): Promise<void> {
    const emailInputs = this.sidebar.locator(INVITE_PANEL_LOCATORS.EMAIL_INPUT);
    const orgInputs = this.sidebar.locator(INVITE_PANEL_LOCATORS.ORG_INPUT);
    await this.action.fill(emailInputs.nth(rowIndex), data.email);
    await this.action.fill(orgInputs.nth(rowIndex), data.organizationName);
  }

  @Step("Remove invite row by index")
  async removeInviteRow(rowIndex: number): Promise<void> {
    const deleteIcons = this.sidebar.locator(INVITE_PANEL_LOCATORS.ROW_DELETE_ICON);
    await this.action.click(deleteIcons.nth(rowIndex));
  }

  @Step("Click Send Invite(s)")
  async clickSend(): Promise<void> {
    await this.action.click(this.sendButton);
  }

  @Step("Click Cancel")
  async clickCancel(): Promise<void> {
    await this.action.click(this.cancelButton);
  }

  @Step("Click Copy public link button")
  async clickCopyLink(): Promise<void> {
    await this.action.click(this.copyLinkButton);
  }

  /**
   * Full flow: add N invite rows and send.
   */
  @Step("Send vendor invitations by email")
  async sendInvitations(invites: VendorInviteRow[]): Promise<void> {
    await this.switchToEmailTab();
    for (let i = 0; i < invites.length; i++) {
      await this.clickAdd();
      await this.fillInviteRow(i, invites[i]);
    }
    await this.clickSend();
  }

  /**
   * Intercepts POST requests to `**\/invite**`, aborts them (no real side effects),
   * and returns a getter that reports whether the POST was fired.
   * Call before the action that would trigger the invite POST.
   */
  async interceptInvitePost(): Promise<() => boolean> {
    let postFired = false;
    await this.page.route("**/invite**", async (route: Route) => {
      if (route.request().method() === "POST") {
        postFired = true;
        await route.abort();
      } else {
        await route.continue();
      }
    });
    return () => postFired;
  }

  // ── Queries ─────────────────────────────────────────────────────

  async isSendButtonEnabled(): Promise<boolean> {
    return !(await this.sendButton.isDisabled());
  }

  async getSidebarTitle(): Promise<string> {
    const title = this.sidebar.locator(INVITE_PANEL_LOCATORS.TITLE).first();
    return this.action.getText(title);
  }

  /**
   * Returns the public invite link URL from the readonly input.
   * This is the vendor registration URL that vendors receive via email or copy.
   */
  async getPublicInviteLink(): Promise<string> {
    await this.switchToPublicLinkTab();
    await this.wait.forVisible(this.publicLinkInput);
    return this.action.getInputValue(this.publicLinkInput);
  }

  // ── Assertions ──────────────────────────────────────────────────

  @Step("Verify invite panel is open")
  async verifyPanelIsOpen(): Promise<void> {
    await expect(this.sidebar, "Invite sidebar should be visible").toBeVisible();
    await expect(this.emailTab, "Email tab should be visible").toBeVisible();
    await expect(this.linkTab, "Public Link tab should be visible").toBeVisible();
    await expect(this.addButton, "Add button should be visible").toBeVisible();
    await expect(this.cancelButton, "Cancel button should be visible").toBeVisible();
  }

  @Step("Verify panel title is 'Invite Vendors'")
  async verifyTitle(): Promise<void> {
    const title = await this.getSidebarTitle();
    expect(title, "Panel title should be 'Invite Vendors'").toContain("Invite Vendors");
  }

  @Step("Verify Send button is disabled")
  async verifySendIsDisabled(): Promise<void> {
    await expect(
      this.sendButton,
      "Send button should be disabled when no data entered",
    ).toBeDisabled();
  }

  @Step("Verify Send button is enabled")
  async verifySendIsEnabled(): Promise<void> {
    await expect(
      this.sendButton,
      "Send button should be enabled when valid data is entered",
    ).not.toBeDisabled();
  }

  @Step("Verify public link tab is active and shows invite URL")
  async verifyPublicLinkTabIsActive(): Promise<void> {
    await expect(this.publicLinkInput, "Public link input should be visible").toBeVisible();
    const url = await this.action.getInputValue(this.publicLinkInput);
    expect(url, "Public link should contain a non-empty URL").not.toBe("");
  }

  @Step("Verify public link contains vendor URL")
  async verifyPublicLinkContains(expectedUrlFragment: string): Promise<void> {
    const url = await this.action.getInputValue(this.publicLinkInput);
    expect(url, `Public link should contain "${expectedUrlFragment}"`).toContain(
      expectedUrlFragment,
    );
  }

  @Step("Verify panel is closed")
  async verifyPanelIsClosed(): Promise<void> {
    await expect(this.sidebar, "Invite sidebar should be hidden after cancel").not.toBeVisible();
  }
}
