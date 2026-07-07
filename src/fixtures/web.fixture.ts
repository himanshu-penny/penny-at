import { test as baseTest } from "./base.fixture";
import { PennyLoginPage } from "../pages/web/penny-login.page";
import { VendorsListPage } from "../pages/web/vendors/vendors-list.page";
import { InviteVendorPanel } from "../pages/web/vendors/invite-vendor-panel.page";
import { EwcfRegistrationPage } from "../pages/web/vendors/ewcf-registration.page";
import { EwcfVendorReviewPage } from "../pages/web/vendors/ewcf-vendor-review.page";
import { SabilVendorReviewPage } from "../pages/web/vendors/sabil-vendor-review.page";
import { SabilRegistrationPage } from "../pages/web/vendors/sabil-registration.page";

export type WebFixtures = {
  /** Penny login page object */
  pennyLoginPage: PennyLoginPage;
  /** Vendors list page object */
  vendorsListPage: VendorsListPage;
  /** Invite vendor sidebar panel page object */
  inviteVendorPanel: InviteVendorPanel;
  /** EWCF external vendor registration form page object */
  ewcfRegistrationPage: EwcfRegistrationPage;
  /** EWCF admin vendor detail / review page object */
  ewcfVendorReviewPage: EwcfVendorReviewPage;
  /** Sabil admin vendor detail / review page object */
  sabilVendorReviewPage: SabilVendorReviewPage;
  /** SABIL external vendor registration form page object */
  sabilRegistrationPage: SabilRegistrationPage;
};

export const test = baseTest.extend<WebFixtures>({
  pennyLoginPage: async ({ page }, use) => {
    await use(new PennyLoginPage(page));
  },

  vendorsListPage: async ({ page }, use) => {
    await use(new VendorsListPage(page));
  },

  inviteVendorPanel: async ({ page }, use) => {
    await use(new InviteVendorPanel(page));
  },

  ewcfRegistrationPage: async ({ page }, use) => {
    await use(new EwcfRegistrationPage(page));
  },

  ewcfVendorReviewPage: async ({ page }, use) => {
    await use(new EwcfVendorReviewPage(page));
  },

  sabilVendorReviewPage: async ({ page }, use) => {
    await use(new SabilVendorReviewPage(page));
  },

  sabilRegistrationPage: async ({ page }, use) => {
    await use(new SabilRegistrationPage(page));
  },
});

export { expect } from "./base.fixture";
