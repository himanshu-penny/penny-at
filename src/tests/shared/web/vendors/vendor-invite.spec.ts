import { test, expect } from "@fixtures";
import { VendorDataFactory } from "@factories/vendor.factory";
import { PENNY_ROUTE_PATTERNS } from "@core/constants";

/**
 * TC_WEB_VENDOR — Vendors List & Invite Vendor Panel Smoke Tests
 *
 * PURPOSE:
 *   Verify the Vendors list page renders correctly and the Invite Vendors
 *   sidebar panel works end-to-end: opening, filling invite rows, switching
 *   tabs, copying the public link, and cancelling.
 *
 * HOW TO RUN:
 *   npx playwright test vendor-invite.spec.ts --project=smoke
 *   TEST_ENV=test npx playwright test vendor-invite.spec.ts --project=smoke
 *
 * TAGS: @smoke @ui
 */

// ═════════════════════════════════════════════════════════════
//  SUITE 1 — VENDORS LIST PAGE LOAD
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_VENDOR — Vendors List Page Load", { tag: ["@smoke", "@ui"] }, () => {
  test.use({ storageState: ".auth/user-web.json" });

  test.beforeEach(async ({ vendorsListPage, envConfig }) => {
    await vendorsListPage.navigate(envConfig.webUrl);
  });

  /**
   * TC_WEB_VENDOR_001 — Vendors list page renders all required elements
   * Verifies all four tabs, the Invite Vendors button, and the ag-Grid
   * are visible after navigation.
   */
  test("TC_WEB_VENDOR_001 — vendors list page renders all required elements", async ({
    vendorsListPage,
  }) => {
    await vendorsListPage.verifyPageIsLoaded();
  });

  /**
   * TC_WEB_VENDOR_002 — URL matches the vendors route pattern
   * Confirms the router settled on the correct SPA route.
   */
  test("TC_WEB_VENDOR_002 — URL is on the vendors page", async ({ vendorsListPage }) => {
    await vendorsListPage.verifyUrl();
  });

  /**
   * TC_WEB_VENDOR_003 — Vendor grid contains at least one row
   * Confirms real vendor data is loaded into the ag-Grid.
   */
  test("TC_WEB_VENDOR_003 — vendor grid has at least one row", async ({ vendorsListPage }) => {
    await vendorsListPage.verifyGridHasRows();
  });

  /**
   * TC_WEB_VENDOR_004 — Pagination control is visible
   * The pagination component must be rendered so users can navigate pages.
   */
  test("TC_WEB_VENDOR_004 — pagination control is visible", async ({ vendorsListPage }) => {
    await vendorsListPage.verifyPaginationIsVisible();
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 2 — TAB NAVIGATION
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_VENDOR — Tab Navigation", { tag: ["@smoke", "@ui"] }, () => {
  test.use({ storageState: ".auth/user-web.json" });

  test.beforeEach(async ({ vendorsListPage, envConfig }) => {
    await vendorsListPage.navigate(envConfig.webUrl);
  });

  /**
   * TC_WEB_VENDOR_005 — Invited Vendors tab is clickable without crash
   */
  test("TC_WEB_VENDOR_005 — clicking Invited Vendors tab does not crash the page", async ({
    vendorsListPage,
    page,
  }) => {
    // ── Act ───────────────────────────────────────────────────────────
    await vendorsListPage.clickInvitedTab();

    // ── Assert ────────────────────────────────────────────────────────
    await expect(page).toHaveURL(PENNY_ROUTE_PATTERNS.VENDORS);
  });

  /**
   * TC_WEB_VENDOR_006 — Reports tab is clickable without crash
   */
  test("TC_WEB_VENDOR_006 — clicking Reports tab does not crash the page", async ({
    vendorsListPage,
    page,
  }) => {
    // ── Act ───────────────────────────────────────────────────────────
    await vendorsListPage.clickReportsTab();

    // ── Assert ────────────────────────────────────────────────────────
    await expect(page).toHaveURL(PENNY_ROUTE_PATTERNS.VENDORS);
  });

  /**
   * TC_WEB_VENDOR_007 — Settings tab is clickable without crash
   */
  test("TC_WEB_VENDOR_007 — clicking Settings tab does not crash the page", async ({
    vendorsListPage,
    page,
  }) => {
    // ── Act ───────────────────────────────────────────────────────────
    await vendorsListPage.clickSettingsTab();

    // ── Assert ────────────────────────────────────────────────────────
    await expect(page).toHaveURL(PENNY_ROUTE_PATTERNS.VENDORS);
  });

  /**
   * TC_WEB_VENDOR_008 — Clicking Vendors tab after another tab returns to the grid view
   * Wait for network idle after tab switch so AG Grid has time to repopulate.
   */
  test("TC_WEB_VENDOR_008 — Vendors tab restores grid view after navigating away", async ({
    vendorsListPage,
  }) => {
    // ── Arrange ──────────────────────────────────────────────────────
    await vendorsListPage.clickInvitedTab();

    // ── Act ───────────────────────────────────────────────────────────
    await vendorsListPage.clickVendorsTab();

    // ── Assert ────────────────────────────────────────────────────────
    // waitForFirstRow waits for AG Grid to repopulate before checking count
    await vendorsListPage.waitForFirstRow();
    await vendorsListPage.verifyGridHasRows();
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 3 — INVITE VENDOR PANEL — OPEN / CLOSE
// ═════════════════════════════════════════════════════════════
test.describe(
  "TC_WEB_VENDOR — Invite Vendor Panel Open/Close",
  { tag: ["@smoke", "@ui", "@critical"] },
  () => {
    test.use({ storageState: ".auth/user-web.json" });

    test.beforeEach(async ({ vendorsListPage, envConfig }) => {
      await vendorsListPage.navigate(envConfig.webUrl);
    });

    /**
     * TC_WEB_VENDOR_009 — Clicking Invite Vendors opens the sidebar panel
     */
    test("TC_WEB_VENDOR_009 — Invite Vendors button opens the sidebar panel", async ({
      vendorsListPage,
      inviteVendorPanel,
    }) => {
      // ── Act ───────────────────────────────────────────────────────────
      await vendorsListPage.clickInviteVendors();

      // ── Assert ────────────────────────────────────────────────────────
      await inviteVendorPanel.verifyPanelIsOpen();
    });

    /**
     * TC_WEB_VENDOR_010 — Panel title reads "Invite Vendors"
     */
    test("TC_WEB_VENDOR_010 — invite panel title is 'Invite Vendors'", async ({
      vendorsListPage,
      inviteVendorPanel,
    }) => {
      // ── Act ───────────────────────────────────────────────────────────
      await vendorsListPage.clickInviteVendors();

      // ── Assert ────────────────────────────────────────────────────────
      await inviteVendorPanel.verifyTitle();
    });

    /**
     * TC_WEB_VENDOR_011 — Send button is disabled when the panel first opens
     * No invite rows are present yet, so sending must be blocked.
     */
    test("TC_WEB_VENDOR_011 — Send button is disabled when panel opens with no rows", async ({
      vendorsListPage,
      inviteVendorPanel,
    }) => {
      // ── Act ───────────────────────────────────────────────────────────
      await vendorsListPage.clickInviteVendors();
      await inviteVendorPanel.switchToEmailTab();

      // ── Assert ────────────────────────────────────────────────────────
      await inviteVendorPanel.verifySendIsDisabled();
    });

    /**
     * TC_WEB_VENDOR_012 — Clicking Cancel closes the panel
     */
    test("TC_WEB_VENDOR_012 — clicking Cancel closes the invite panel", async ({
      vendorsListPage,
      inviteVendorPanel,
    }) => {
      // ── Arrange ──────────────────────────────────────────────────────
      await vendorsListPage.clickInviteVendors();
      await inviteVendorPanel.verifyPanelIsOpen();

      // ── Act ───────────────────────────────────────────────────────────
      await inviteVendorPanel.clickCancel();

      // ── Assert ────────────────────────────────────────────────────────
      await inviteVendorPanel.verifyPanelIsClosed();
    });
  },
);

// ═════════════════════════════════════════════════════════════
//  SUITE 4 — INVITE BY EMAIL — ROW MANAGEMENT
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_VENDOR — Invite by Email Row Management", { tag: ["@smoke", "@ui"] }, () => {
  test.use({ storageState: ".auth/user-web.json" });
  test.slow(); // each test navigates + opens panel — allow 3× the default timeout

  test.beforeEach(async ({ vendorsListPage, inviteVendorPanel, envConfig }) => {
    await vendorsListPage.navigate(envConfig.webUrl);
    await vendorsListPage.clickInviteVendors();
    await inviteVendorPanel.switchToEmailTab();
  });

  /**
   * TC_WEB_VENDOR_013 — Adding a row with valid data enables the Send button
   */
  test("TC_WEB_VENDOR_013 — valid email and org name enables the Send button", async ({
    inviteVendorPanel,
  }) => {
    // ── Arrange ──────────────────────────────────────────────────────
    const invite = VendorDataFactory.inviteRow();

    // ── Act ───────────────────────────────────────────────────────────
    await inviteVendorPanel.clickAdd();
    await inviteVendorPanel.fillInviteRow(0, invite);

    // ── Assert ────────────────────────────────────────────────────────
    await inviteVendorPanel.verifySendIsEnabled();
  });

  /**
   * TC_WEB_VENDOR_014 — Adding multiple rows fills each independently
   * Confirms the dynamic row list allows more than one invite at a time.
   */
  test("TC_WEB_VENDOR_014 — multiple invite rows can be added and filled", async ({
    inviteVendorPanel,
  }) => {
    // ── Arrange ──────────────────────────────────────────────────────
    const invites = [VendorDataFactory.inviteRow(), VendorDataFactory.inviteRow()];

    // ── Act ───────────────────────────────────────────────────────────
    for (let i = 0; i < invites.length; i++) {
      await inviteVendorPanel.clickAdd();
      await inviteVendorPanel.fillInviteRow(i, invites[i]);
    }

    // ── Assert ────────────────────────────────────────────────────────
    await inviteVendorPanel.verifySendIsEnabled();
  });

  /**
   * TC_WEB_VENDOR_015 — Removing the only filled row disables Send again
   */
  test("TC_WEB_VENDOR_015 — removing the last invite row disables the Send button", async ({
    inviteVendorPanel,
  }) => {
    // ── Arrange ──────────────────────────────────────────────────────
    const invite = VendorDataFactory.inviteRow();
    await inviteVendorPanel.clickAdd();
    await inviteVendorPanel.fillInviteRow(0, invite);
    await inviteVendorPanel.verifySendIsEnabled();

    // ── Act ───────────────────────────────────────────────────────────
    await inviteVendorPanel.removeInviteRow(0);

    // ── Assert ────────────────────────────────────────────────────────
    await inviteVendorPanel.verifySendIsDisabled();
  });

  /**
   * TC_WEB_VENDOR_016 — sendInvitations helper fills all rows and clicks Send
   * Smoke-checks the composite action method.
   */
  test("TC_WEB_VENDOR_016 — sendInvitations() composite flow triggers Send", async ({
    vendorsListPage,
    inviteVendorPanel,
  }) => {
    // ── Arrange ──────────────────────────────────────────────────────
    const invites = [VendorDataFactory.inviteRow()];

    // Intercept any vendor/invite API call and abort to avoid real side effects
    const wasPostFired = await inviteVendorPanel.interceptInvitePost();

    // Re-open the panel (beforeEach already navigated and opened email tab)
    // sendInvitations() calls switchToEmailTab() internally, so close and re-open for clean state
    await inviteVendorPanel.clickCancel();
    await vendorsListPage.clickInviteVendors();

    // ── Act ───────────────────────────────────────────────────────────
    await inviteVendorPanel.sendInvitations(invites);

    // ── Assert ────────────────────────────────────────────────────────
    // After clicking Send the panel should close OR an API call should have fired.
    // Either signal confirms the happy path reached Send.
    const panelClosed = !(await inviteVendorPanel.isSendButtonEnabled().catch(() => false));
    expect(wasPostFired() || panelClosed).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 5 — PUBLIC INVITE LINK TAB
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_VENDOR — Public Invite Link", { tag: ["@smoke", "@ui"] }, () => {
  test.use({ storageState: ".auth/user-web.json" });
  test.slow(); // navigation to vendors + opening panel can be slow on test env

  test.beforeEach(async ({ vendorsListPage, envConfig }) => {
    await vendorsListPage.navigate(envConfig.webUrl);
    await vendorsListPage.clickInviteVendors();
  });

  /**
   * TC_WEB_VENDOR_017 — Public Link tab shows a non-empty URL
   */
  test("TC_WEB_VENDOR_017 — Public Link tab is active and shows a non-empty invite URL", async ({
    inviteVendorPanel,
  }) => {
    // ── Act ───────────────────────────────────────────────────────────
    await inviteVendorPanel.switchToPublicLinkTab();

    // ── Assert ────────────────────────────────────────────────────────
    await inviteVendorPanel.verifyPublicLinkTabIsActive();
  });

  /**
   * TC_WEB_VENDOR_018 — Public invite link is a valid URL string
   */
  test("TC_WEB_VENDOR_018 — public invite link is a valid URL string", async ({
    inviteVendorPanel,
  }) => {
    // ── Act ───────────────────────────────────────────────────────────
    const link = await inviteVendorPanel.getPublicInviteLink();

    // ── Assert ────────────────────────────────────────────────────────
    expect(link, "Public invite link should be a non-empty string").not.toBe("");
    expect(() => new URL(link), "Public invite link should be a parsable URL").not.toThrow();
  });

  /**
   * TC_WEB_VENDOR_019 — Copy button on the Public Link tab is clickable
   */
  test("TC_WEB_VENDOR_019 — Copy link button is clickable without throwing", async ({
    inviteVendorPanel,
  }) => {
    // ── Arrange ──────────────────────────────────────────────────────
    await inviteVendorPanel.switchToPublicLinkTab();
    await inviteVendorPanel.verifyPublicLinkTabIsActive();

    // ── Act / Assert ──────────────────────────────────────────────────
    // clickCopyLink() will throw if the button is absent — no throw = pass
    await inviteVendorPanel.clickCopyLink();
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 6 — NEGATIVE / VALIDATION
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_VENDOR — Invite Panel Validation", { tag: ["@smoke", "@ui"] }, () => {
  test.use({ storageState: ".auth/user-web.json" });

  test.beforeEach(async ({ vendorsListPage, inviteVendorPanel, envConfig }) => {
    await vendorsListPage.navigate(envConfig.webUrl);
    await vendorsListPage.clickInviteVendors();
    await inviteVendorPanel.switchToEmailTab();
  });

  /**
   * TC_WEB_VENDOR_020 — Send button is enabled as soon as a row is added
   * The app performs no client-side email-format check at the button level.
   * Validation fires post-submit. This test documents that known behavior.
   */
  test("TC_WEB_VENDOR_020 — Send button enables when a row is added regardless of email format", async ({
    inviteVendorPanel,
  }) => {
    // ── Act ───────────────────────────────────────────────────────────
    await inviteVendorPanel.clickAdd();
    await inviteVendorPanel.fillInviteRow(0, {
      email: "not-an-email",
      organizationName: VendorDataFactory.inviteRow().organizationName,
    });

    // ── Assert ────────────────────────────────────────────────────────
    // No client-side format guard on the button — Send is enabled once a row exists
    await inviteVendorPanel.verifySendIsEnabled();
  });

  /**
   * TC_WEB_VENDOR_021 — Send button is enabled when only email is filled (org is empty)
   * Documents that the button-enabled state depends on row presence, not field completeness.
   */
  test("TC_WEB_VENDOR_021 — Send button enables with partial row (email filled, org empty)", async ({
    inviteVendorPanel,
  }) => {
    // ── Act ───────────────────────────────────────────────────────────
    await inviteVendorPanel.clickAdd();
    await inviteVendorPanel.fillInviteRow(0, {
      email: VendorDataFactory.inviteRow().email,
      organizationName: "",
    });

    // ── Assert ────────────────────────────────────────────────────────
    await inviteVendorPanel.verifySendIsEnabled();
  });

  /**
   * TC_WEB_VENDOR_022 — Send button is enabled when only org is filled (email is empty)
   * Documents that the button-enabled state depends on row presence, not field completeness.
   */
  test("TC_WEB_VENDOR_022 — Send button enables with partial row (org filled, email empty)", async ({
    inviteVendorPanel,
  }) => {
    // ── Act ───────────────────────────────────────────────────────────
    await inviteVendorPanel.clickAdd();
    await inviteVendorPanel.fillInviteRow(0, {
      email: "",
      organizationName: VendorDataFactory.inviteRow().organizationName,
    });

    // ── Assert ────────────────────────────────────────────────────────
    await inviteVendorPanel.verifySendIsEnabled();
  });

  /**
   * TC_WEB_VENDOR_023 — Send button enables for all invalid row permutations
   * Parametrized over VendorDataFactory.invalidInviteRows() — confirms no
   * client-side format guard blocks the button regardless of input quality.
   */
  for (const { label, email, organizationName } of VendorDataFactory.invalidInviteRows()) {
    test(`TC_WEB_VENDOR_023_${label.replace(/\s+/g, "_")} — "${label}" — Send button is still enabled`, async ({
      vendorsListPage,
      inviteVendorPanel,
      envConfig,
    }) => {
      await inviteVendorPanel.clickCancel();
      await vendorsListPage.navigate(envConfig.webUrl);
      await vendorsListPage.clickInviteVendors();
      await inviteVendorPanel.switchToEmailTab();

      // ── Act ───────────────────────────────────────────────────────────
      await inviteVendorPanel.clickAdd();
      await inviteVendorPanel.fillInviteRow(0, { email, organizationName });

      // ── Assert ────────────────────────────────────────────────────────
      await inviteVendorPanel.verifySendIsEnabled();
    });
  }
});
