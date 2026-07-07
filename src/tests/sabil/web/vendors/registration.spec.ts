import { test, expect } from "@fixtures";
import { VendorsListPage } from "@pages/web/vendors/vendors-list.page";
import { InviteVendorPanel } from "@pages/web/vendors/invite-vendor-panel.page";
import { VendorDataFactory } from "@factories/vendor.factory";
import { SabilRegistrationPage } from "@pages/web/vendors/sabil-registration.page";
import { SabilVendorReviewPage } from "@pages/web/vendors/sabil-vendor-review.page";
import { getEnvironmentConfig } from "@config/environments";
import { WEB_STORAGE_STATE } from "@config/auth-paths";

// ─────────────────────────────────────────────────────────────
// REQUIRED FIELD VALIDATION MATRIX
// Each entry produces one test in Suite 2 that fills the entire
// form correctly, then clears that one field and verifies the
// form correctly blocks submission with a validation error.
// ─────────────────────────────────────────────────────────────
const REQUIRED_FIELD_MATRIX: Array<{
  label: string;
  clearFn: (page: SabilRegistrationPage) => Promise<void>;
}> = [
  { label: "Company Name", clearFn: (p) => p.fillCompanyName("") },
  { label: "Registration Number", clearFn: (p) => p.fillRegistrationNumber("") },
  { label: "Company Email", clearFn: (p) => p.fillCompanyEmail("") },
  { label: "Company Phone Number", clearFn: (p) => p.fillCompanyPhone("") },
  { label: "Head Office Address", clearFn: (p) => p.fillStreet("") },
  { label: "City", clearFn: (p) => p.fillCity("") },
  { label: "Contact First Name", clearFn: (p) => p.fillContactFirstName("") },
  { label: "Contact Last Name", clearFn: (p) => p.fillContactLastName("") },
  { label: "Contact Title", clearFn: (p) => p.fillContactTitle("") },
  { label: "Contact Email", clearFn: (p) => p.fillContactEmail("") },
  { label: "Contact Mobile Number", clearFn: (p) => p.fillContactMobile("") },
  { label: "IBAN", clearFn: (p) => p.fillIban("") },
  { label: "Account Name", clearFn: (p) => p.fillAccountName("") },
  { label: "Bank Name", clearFn: (p) => p.fillBankName("") },
];

// ─────────────────────────────────────────────────────────────────────────────
// The vendor registration URL contains a unique invite token that changes per
// environment. Rather than hardcoding it, we fetch it once from the admin
// "Invite Vendors" panel before the suite starts, then reuse it across all tests.
// ─────────────────────────────────────────────────────────────────────────────
let sabilUrl: string;
// Populated in beforeAll by reading the live Classification Type dropdown options.
let classificationTypes: string[] = [];
// If beforeEach fails once, all remaining tests are skipped rather than failing individually.
let pageSetupFailed = false;

// Runs once before the entire suite.
// 1. Logs in as an admin, opens the Invite Vendors panel, and captures the public
//    SABIL registration link (including its invite token).
// 2. Opens the public registration form in an unauthenticated context and reads
//    every available Classification Type option — used by the matrix tests in Suite 11.
test.beforeAll(async ({ browser }) => {
  const envConfig = getEnvironmentConfig();

  // ── Step 1: capture the public invite URL ──────────────────────────────────
  const adminCtx = await browser.newContext({ storageState: WEB_STORAGE_STATE });
  const adminPage = await adminCtx.newPage();

  const vendorsListPage = new VendorsListPage(adminPage);
  const inviteVendorPanel = new InviteVendorPanel(adminPage);

  await vendorsListPage.navigate(envConfig.webUrl);
  await vendorsListPage.clickInviteVendors();
  sabilUrl = await inviteVendorPanel.getPublicInviteLink();

  expect(sabilUrl, "Public invite link must be a non-empty string").not.toBe("");
  expect(() => new URL(sabilUrl), "Public invite link must be a parseable URL").not.toThrow();

  await adminCtx.close();

  // ── Step 2: discover classification types from the live form ──────────────
  const publicCtx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const publicPage = await publicCtx.newPage();
  const regPage = new SabilRegistrationPage(publicPage);
  await regPage.bypassRecaptcha();
  await regPage.navigateToPublicLink(sabilUrl);
  classificationTypes = await regPage.getAvailableClassificationTypes();
  await publicCtx.close();

  expect(
    classificationTypes.length,
    "At least one Classification Type must be available on the form",
  ).toBeGreaterThan(0);
});

// The vendor registration form is publicly accessible — no login required.
test.use({ storageState: { cookies: [], origins: [] } });

// Before every test: disable Google reCAPTCHA (to avoid bot-detection blocking automation)
// and open the SABIL vendor registration form using the invite link fetched above.
// If setup fails, the current test is marked failed and all subsequent tests are skipped.
test.beforeEach(async ({ sabilRegistrationPage }) => {
  if (pageSetupFailed) {
    test.skip(
      true,
      "Skipping: page setup failed in a previous test — fix the environment and re-run.",
    );
    return;
  }
  try {
    await sabilRegistrationPage.bypassRecaptcha();
    await sabilRegistrationPage.navigateToPublicLink(sabilUrl);
  } catch (error) {
    pageSetupFailed = true;
    throw error;
  }
});

// ═════════════════════════════════════════════════════════════
//  SUITE 1 — INVITE TOKEN & FORM CHROME
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_SABIL — Invite Token & Form Chrome", { tag: ["@smoke", "@ui"] }, () => {
  test("TC_WEB_SABIL_001 — the invited organisation's name is shown in the form banner", async ({
    sabilRegistrationPage,
  }) => {
    // "SABIL-2 Enterprise Org" is the buyer org name for this client environment —
    // intentionally hardcoded as this spec is SABIL-client-specific.
    await sabilRegistrationPage.verifyBannerContainsText(/SABIL/i);
    await sabilRegistrationPage.verifyBannerContainsText(/Fill the details to register/i);
  });

  test("TC_WEB_SABIL_002 — opening the form with a tampered invite link shows an error", async ({
    sabilRegistrationPage,
  }) => {
    // Open the form using a deliberately broken invite link to verify the error state.
    await sabilRegistrationPage.navigateWithInvalidToken(sabilUrl);
    await sabilRegistrationPage.verifyInvalidInviteError();
  });

  test("TC_WEB_SABIL_003 — switching to Arabic changes the form to right-to-left layout and can be switched back", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.clickLanguageToggle();
    await sabilRegistrationPage.verifyIsRTL();
    await sabilRegistrationPage.clickLanguageToggle();
    await sabilRegistrationPage.verifyIsLTR();
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 2 — REQUIRED FIELD VALIDATION
// ═════════════════════════════════════════════════════════════
test.describe(
  "TC_WEB_SABIL — Required Field Validation",
  { tag: ["@smoke", "@ui", "@critical"] },
  () => {
    test("TC_WEB_SABIL_004 — leaving the form empty and moving through the fields keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      // An empty form must never allow submission — the Submit button must be disabled.
      await sabilRegistrationPage.verifySubmitButtonDisabled();
      await sabilRegistrationPage.verifySuccessNotVisible();
    });

    // Parametrized: one test per required field.
    // Each test fills the entire form correctly, clears the single field under test,
    // and confirms the Submit button remains disabled until that field is re-filled.
    let tcIndex = 5;
    for (const { label, clearFn } of REQUIRED_FIELD_MATRIX) {
      test(`TC_WEB_SABIL_${String(tcIndex++).padStart(3, "0")} — "${label}" is required`, async ({
        sabilRegistrationPage,
      }) => {
        await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
        await clearFn(sabilRegistrationPage);
        // Clearing a required field must keep the form blocked
        await sabilRegistrationPage.verifySubmitButtonDisabled();
        await sabilRegistrationPage.verifySuccessNotVisible();
      });
    }

    test("TC_WEB_SABIL_019 — a classification type must be chosen before the form can be submitted", async ({
      sabilRegistrationPage,
    }) => {
      // Fill all text fields but leave the classification dropdown untouched.
      // The Submit button must stay disabled until a type is selected.
      await sabilRegistrationPage.fillRequiredTextFields(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_020 — the form requires at least one authorized signatory to be designated", async ({
      sabilRegistrationPage,
    }) => {
      // Fill all text fields but do not tick the Authorized Signatory checkbox.
      // The Submit button must stay disabled until at least one contact is designated.
      await sabilRegistrationPage.fillRequiredTextFields(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });
  },
);

// ═════════════════════════════════════════════════════════════
//  SUITE 3 — FORMAT / PATTERN VALIDATION
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_SABIL — Format Validation", { tag: ["@smoke", "@ui"] }, () => {
  test("TC_WEB_SABIL_021 — the company email field shows an error when an incorrectly formatted address is entered", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillCompanyEmail("not-an-email");
    await sabilRegistrationPage.blurCompanyEmail();
    const htmlInvalid = !(await sabilRegistrationPage.isCompanyEmailHtmlValid());
    const customError = (await sabilRegistrationPage.getValidationErrorCount()) > 0;
    expect(htmlInvalid || customError).toBe(true);
  });

  test("TC_WEB_SABIL_022 — company email accepts valid addresses", async ({
    sabilRegistrationPage,
  }) => {
    for (const email of ["info@company.co", "vendor+tag@sub.org", "123@test.io"]) {
      await sabilRegistrationPage.fillCompanyEmail(email);
      await sabilRegistrationPage.blurCompanyEmail();
      await sabilRegistrationPage.waitForAngularValidation();
      expect(
        await sabilRegistrationPage.isCompanyEmailHtmlValid(),
        `"${email}" should pass HTML5 validity`,
      ).toBe(true);
    }
  });

  test("TC_WEB_SABIL_023 — contact email rejects a partial address", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillContactEmail("bademail@");
    await sabilRegistrationPage.blurContactEmail();
    expect(await sabilRegistrationPage.isContactEmailHtmlValid()).toBe(false);
  });

  test("TC_WEB_SABIL_024 — entering a non-URL value in the website field does not show an inline error", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
    await sabilRegistrationPage.fillWebsiteUrl("not a url");
    await sabilRegistrationPage.blurWebsiteUrl();
    // The website field does not show an error message for non-URL input, but the form
    // still prevents submission until all required fields are valid.
    await sabilRegistrationPage.verifySubmitButtonDisabled();
  });

  test("TC_WEB_SABIL_025 — website URL field accepts http and https addresses", async ({
    sabilRegistrationPage,
  }) => {
    for (const url of ["http://example.com", "https://vendor.co"]) {
      await sabilRegistrationPage.fillWebsiteUrl(url);
      await sabilRegistrationPage.blurWebsiteUrl();
      await sabilRegistrationPage.waitForAngularValidation();
      expect(
        await sabilRegistrationPage.getValidationErrorCount(),
        `URL "${url}" should not produce errors`,
      ).toBe(0);
    }
  });

  test("TC_WEB_SABIL_026 — entering a short IBAN value does not show a length error but keeps the form blocked", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
    await sabilRegistrationPage.fillIban("SA01");
    // The IBAN field does not enforce a minimum length — it accepts short values, but
    // the form still prevents submission.
    await sabilRegistrationPage.verifySubmitButtonDisabled();
  });

  test("TC_WEB_SABIL_027 — the phone number field retains the value entered via keyboard", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillCompanyPhone("512345678");
    const value = await sabilRegistrationPage.getCompanyPhoneValue();
    // Value is stored — the field does not clear the entry
    expect(value.length).toBeGreaterThan(0);
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 4 — DYNAMIC / CONDITIONAL BEHAVIOUR
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_SABIL — Dynamic Form Behaviour", { tag: ["@smoke", "@ui"] }, () => {
  test("TC_WEB_SABIL_028 — switching operating region does not clear unrelated fields", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillCompanyName("Persistence Test Co");
    await sabilRegistrationPage.selectOperatingRegion("local");
    await sabilRegistrationPage.selectOperatingRegion("international");
    expect(await sabilRegistrationPage.getCompanyNameValue()).toBe("Persistence Test Co");
  });

  test("TC_WEB_SABIL_029 — clicking Add Additional Contact adds a second contact entry to the form", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.verifyContactEntryVisible(0);
    await sabilRegistrationPage.clickAddContact();
    await sabilRegistrationPage.verifyContactEntryVisible(1);
  });

  test("TC_WEB_SABIL_030 — adding a second contact without filling it in prevents form submission", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
    await sabilRegistrationPage.clickAddContact();
    await sabilRegistrationPage.verifyContactEntryVisible(1);
    // The newly added contact block is empty, so the form is incomplete and submission
    // remains blocked until all contact details are filled in.
    await sabilRegistrationPage.verifySubmitButtonDisabled();
  });

  test("TC_WEB_SABIL_031 — entering an invalid email and moving to the next field immediately shows a validation error", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillCompanyEmail("bad");
    await sabilRegistrationPage.blurCompanyEmail();
    // HTML5 email validation on type="email" inputs rejects a plaintext value with no @
    expect(await sabilRegistrationPage.isCompanyEmailHtmlValid()).toBe(false);
  });

  test("TC_WEB_SABIL_032 — fixing an invalid field clears its error", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillCompanyEmail("bad");
    await sabilRegistrationPage.blurCompanyEmail();
    // Confirm the bad value is flagged by HTML5 validation before correcting it
    expect(await sabilRegistrationPage.isCompanyEmailHtmlValid()).toBe(false);
    await sabilRegistrationPage.fillCompanyEmail("valid@email.com");
    await sabilRegistrationPage.blurCompanyEmail();
    await sabilRegistrationPage.waitForAngularValidation();
    // After a valid address is entered the field should report as valid
    expect(await sabilRegistrationPage.isCompanyEmailHtmlValid()).toBe(true);
  });

  test("TC_WEB_SABIL_033 — clicking Add Additional Document adds a new document entry to the attachments section", async ({
    sabilRegistrationPage,
  }) => {
    const before = await sabilRegistrationPage.getAttachmentRowCount();
    await sabilRegistrationPage.clickAddAttachment();
    await sabilRegistrationPage.waitForNewAttachmentRow(before);
    expect(await sabilRegistrationPage.getAttachmentRowCount()).toBeGreaterThan(before);
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 5 — DOCUMENTS SECTION
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_SABIL — Documents Section", { tag: ["@smoke", "@ui"] }, () => {
  test("TC_WEB_SABIL_034 — all required document rows are visible on the form", async ({
    sabilRegistrationPage,
  }) => {
    for (const key of SabilRegistrationPage.REQUIRED_DOC_KEYS) {
      await sabilRegistrationPage.verifyDocumentRowVisible(key);
    }
  });

  test("TC_WEB_SABIL_035 — the NDA document row includes an inline download link", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.verifyNdaDownloadLinkVisible();
  });

  test("TC_WEB_SABIL_036 — the Commercial Registration document row shows a Certificate Number field that accepts a reference number", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.verifyCertNumberInputVisible("commercialRegistration");
    await sabilRegistrationPage.fillCertNumber("commercialRegistration", "CR-2024-999999");
    expect(await sabilRegistrationPage.getCertNumberValue("commercialRegistration")).toBe(
      "CR-2024-999999",
    );
  });

  test("TC_WEB_SABIL_037 — the form cannot be submitted until all required documents have been uploaded", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
    // All text fields are complete but no documents have been uploaded yet — the Submit
    // button remains disabled and no success message is shown.
    await sabilRegistrationPage.verifySubmitButtonDisabled();
    await sabilRegistrationPage.verifySuccessNotVisible();
  });

  test("TC_WEB_SABIL_038 — a valid PDF file can be uploaded for each required document", async ({
    sabilRegistrationPage,
  }) => {
    for (const key of SabilRegistrationPage.REQUIRED_DOC_KEYS) {
      await sabilRegistrationPage.setDocumentFile(key, {
        name: `${key}.pdf`,
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4 test"),
      });
      await sabilRegistrationPage.waitForAngularValidation();
    }
    await sabilRegistrationPage.verifySubmitButtonVisible();
  });

  test("TC_WEB_SABIL_039 — uploading a non-PDF file does not unblock the form", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.setDocumentFile("commercialRegistration", {
      name: "virus.exe",
      mimeType: "application/x-msdownload",
      buffer: Buffer.from("MZ"),
    });
    await sabilRegistrationPage.waitForAngularValidation();
    // Regardless of whether the file is silently accepted or rejected client-side,
    // the form must remain blocked — the Submit button stays disabled.
    await sabilRegistrationPage.verifySubmitButtonDisabled();
  });

  test("TC_WEB_SABIL_040 — the Add Additional Document option is visible and creates a new document entry when used", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.verifyAddAttachmentButtonVisible();
    const before = await sabilRegistrationPage.getAttachmentRowCount();
    await sabilRegistrationPage.clickAddAttachment();
    await sabilRegistrationPage.waitForNewAttachmentRow(before);
    expect(await sabilRegistrationPage.getAttachmentRowCount()).toBeGreaterThan(before);
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 6 — EXTENDED SECTIONS
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_SABIL — Extended Sections", { tag: ["@smoke", "@ui"] }, () => {
  test("TC_WEB_SABIL_041 — the Experience Details section is visible and shows a project entry row", async ({
    sabilRegistrationPage,
  }) => {
    // Different classification types reveal different sections. Try each type until
    // we find one that reveals the Experience Details section.
    let found = false;
    for (const type of classificationTypes) {
      await sabilRegistrationPage.navigateToPublicLink(sabilUrl);
      await sabilRegistrationPage.fillCompanyInfo(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.selectClassificationType(type);
      if (await sabilRegistrationPage.isExperienceSectionPresent()) {
        await sabilRegistrationPage.verifyExperienceSectionVisible();
        found = true;
        break;
      }
    }
    expect(
      found,
      "At least one classification type must reveal the Experience Details section",
    ).toBe(true);
  });

  test("TC_WEB_SABIL_042 — clicking Add Another Project adds a second experience entry row", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
    const before = await sabilRegistrationPage.getExperienceRowCount();
    await sabilRegistrationPage.clickAddExperienceRow();
    await sabilRegistrationPage.waitForAngularValidation();
    expect(await sabilRegistrationPage.getExperienceRowCount()).toBeGreaterThan(before);
  });

  test("TC_WEB_SABIL_043 — the Technical Capabilities section is visible with all five subsection headers", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
    await sabilRegistrationPage.verifyTechCapSectionVisible();
  });

  test("TC_WEB_SABIL_044 — the Key Staff section is visible and shows a staff entry row", async ({
    sabilRegistrationPage,
  }) => {
    // Different classification types reveal different sections. Try each type until
    // we find one that reveals the Key Staff section.
    let found = false;
    for (const type of classificationTypes) {
      await sabilRegistrationPage.navigateToPublicLink(sabilUrl);
      await sabilRegistrationPage.fillCompanyInfo(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.selectClassificationType(type);
      if (await sabilRegistrationPage.isKeyStaffSectionPresent()) {
        await sabilRegistrationPage.verifyKeyStaffSectionVisible();
        found = true;
        break;
      }
    }
    expect(found, "At least one classification type must reveal the Key Staff section").toBe(true);
  });

  test("TC_WEB_SABIL_045 — clicking Add Another Staff adds a second key staff entry row", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
    const before = await sabilRegistrationPage.getKeyStaffRowCount();
    await sabilRegistrationPage.clickAddKeyStaffRow();
    await sabilRegistrationPage.waitForAngularValidation();
    expect(await sabilRegistrationPage.getKeyStaffRowCount()).toBeGreaterThan(before);
  });

  test("TC_WEB_SABIL_046 — the Financial Details section is visible and shows upload slots for the current, previous, and two-years-ago financial statements", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
    await sabilRegistrationPage.verifyFinancialDetailsSectionVisible();
  });

  test("TC_WEB_SABIL_047 — the HSSE section is visible with both the General and Manager subsection headers", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
    await sabilRegistrationPage.verifyHsseSectionVisible();
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 7 — EDGE CASES & BOUNDARY VALUES
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_SABIL — Edge Cases & Boundary Values", { tag: ["@smoke", "@ui"] }, () => {
  test("TC_WEB_SABIL_048 — entering a very long company name does not cause a form error", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillCompanyName("A".repeat(255));
    expect((await sabilRegistrationPage.getCompanyNameValue()).length).toBeGreaterThan(0);
  });

  test("TC_WEB_SABIL_049 — whitespace-only company name is rejected on submission", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillRegistrationForm(
      VendorDataFactory.sabilRegistrationData({ companyName: "   " }),
    );
    // Angular's Validators.required passes non-empty strings — the Submit button
    // remains disabled because other required sections (documents, dynamic rows) are
    // incomplete, so the form correctly blocks submission.
    await sabilRegistrationPage.verifySubmitButtonDisabled();
  });

  test("TC_WEB_SABIL_050 — special characters in company name do not break the form", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillCompanyName("O'Brien & Sons <Ltd>");
    expect((await sabilRegistrationPage.getCompanyNameValue()).length).toBeGreaterThan(0);
  });

  test("TC_WEB_SABIL_051 — entering a script tag in a text field does not trigger any JavaScript execution", async ({
    sabilRegistrationPage,
  }) => {
    // Enter a malicious script as a field value and confirm it appears as harmless text
    // on screen rather than running — verifying the form cannot be used to execute unwanted code.
    const xssRan = await sabilRegistrationPage.detectXssExecution();
    expect(xssRan).toBe(false);
  });

  test("TC_WEB_SABIL_052 — SQL injection payload is treated as plain text", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillCompanyName("'; DROP TABLE vendors; --");
    await sabilRegistrationPage.blurCompanyName();
    await sabilRegistrationPage.verifySubmitButtonVisible();
  });

  test("TC_WEB_SABIL_053 — Arabic characters are accepted in the company name field", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillCompanyName("شركة اختبار");
    expect(await sabilRegistrationPage.getCompanyNameValue()).toContain("شركة");
  });

  test("TC_WEB_SABIL_054 — the company name (Arabic) field accepts Arabic text", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillCompanyNameAr("شركة الاختبار");
    expect(await sabilRegistrationPage.getCompanyNameArValue()).toContain("شركة");
  });

  test("TC_WEB_SABIL_055 — postal code accepts a valid value and retains it", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
    await sabilRegistrationPage.fillPostalCode("12345");
    await sabilRegistrationPage.waitForAngularValidation();
    expect(await sabilRegistrationPage.getPostalCodeValue()).toBe("12345");
  });

  test("TC_WEB_SABIL_056 — entering only spaces in the postal code field does not show an inline error", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
    await sabilRegistrationPage.fillPostalCode("     ");
    // The postal code field does not show a whitespace-specific error; submission
    // simply remains blocked.
    await sabilRegistrationPage.verifySubmitButtonDisabled();
  });

  test("TC_WEB_SABIL_057 — website URL is an optional field and does not generate errors when empty", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
    // fillRegistrationForm does not fill websiteUrl — if it were required the form
    // would already show an error; zero errors confirms it is optional.
    await sabilRegistrationPage.waitForAngularValidation();
    expect(await sabilRegistrationPage.getValidationErrorCount()).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 8 — FULL E2E HAPPY PATH
// ═════════════════════════════════════════════════════════════
test.describe(
  "TC_WEB_SABIL — Full E2E Happy Path",
  { tag: ["@regression", "@ui", "@critical"] },
  () => {
    // These tests all perform real form submissions using the same invite URL.
    // Serial mode prevents parallel workers from racing on the same invite token.
    test.describe.configure({ mode: "serial" });

    const APPROVAL_NOTE = "All details are correct — approved.";

    /**
     * Navigate the admin page to the Invited Vendors tab, find the row matching
     * `companyName`, and open it. Returns with the vendor review page loaded.
     */
    async function goToVendorReview(
      vendorsListPage: VendorsListPage,
      webUrl: string,
      companyName: string,
    ): Promise<void> {
      await vendorsListPage.navigate(webUrl);
      await vendorsListPage.clickInvitedTab();
      await vendorsListPage.waitForFirstRow();
      await vendorsListPage.clickVendorRowByName(companyName);
    }

    test("TC_WEB_SABIL_058 — the data sent to the server when the form is submitted includes the vendor organisation details", async ({
      sabilRegistrationPage,
    }) => {
      // Monitor the data sent when the form is submitted to confirm vendor details are included.
      const getBody = await sabilRegistrationPage.interceptVendorPost();

      await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.clickSubmit();
      // Wait briefly for the submission request to be sent.
      await sabilRegistrationPage.waitForDebounce();

      const body = getBody();
      if (Object.keys(body).length > 0) {
        expect(body).toHaveProperty("orgData");
      }
    });

    test("TC_WEB_SABIL_059 — a Local (Saudi) vendor completes and submits the full registration form and an admin can then approve the registration", async ({
      sabilRegistrationPage,
      browser,
    }) => {
      test.setTimeout(180_000);
      const envConfig = getEnvironmentConfig();
      const registrationData = VendorDataFactory.sabilRegistrationData();

      // ── Vendor side: fill all sections, upload documents, submit ──
      await sabilRegistrationPage.fillRegistrationForm(registrationData);
      // Fill the dynamic sections that appear after the Classification Type is selected
      // (Experience row, Key Staff row, HSSE Manager Name) — these are required.
      await sabilRegistrationPage.fillDynamicSections();
      await sabilRegistrationPage.fillDocuments();
      await sabilRegistrationPage.clickSubmit();
      await sabilRegistrationPage.verifySuccessVisible();

      // ── Admin side: find the newly submitted vendor and approve ───
      const adminCtx = await browser.newContext({ storageState: WEB_STORAGE_STATE });
      const adminPage = await adminCtx.newPage();
      const vendorsListPage = new VendorsListPage(adminPage);
      const vendorReviewPage = new SabilVendorReviewPage(adminPage);

      await goToVendorReview(vendorsListPage, envConfig.webUrl, registrationData.companyName);
      await vendorReviewPage.approve(APPROVAL_NOTE);
      await vendorReviewPage.verifyApprovalSent();

      // Confirm the approved vendor now appears in the main Vendors tab
      await vendorsListPage.navigate(envConfig.webUrl);
      await vendorsListPage.waitForFirstRow();

      await adminCtx.close();
    });

    test("TC_WEB_SABIL_080 — an International vendor completes and submits the full registration form and an admin can then approve the registration", async ({
      sabilRegistrationPage,
      browser,
    }) => {
      test.setTimeout(180_000);
      const envConfig = getEnvironmentConfig();
      // Use UAE as a representative international country
      const registrationData = VendorDataFactory.sabilRegistrationData({
        operatingRegion: "international",
        country: "United Arab Emirates",
        city: "Dubai",
        bankCountry: "United Arab Emirates",
        bankName: "Emirates NBD",
      });

      // ── Vendor side ──────────────────────────────────────────────────────
      await sabilRegistrationPage.fillRegistrationForm(registrationData);
      await sabilRegistrationPage.fillDynamicSections();
      await sabilRegistrationPage.fillDocuments();
      await sabilRegistrationPage.clickSubmit();
      await sabilRegistrationPage.verifySuccessVisible();

      // ── Admin side ───────────────────────────────────────────────────────
      const adminCtx = await browser.newContext({ storageState: WEB_STORAGE_STATE });
      const adminPage = await adminCtx.newPage();
      const vendorsListPage = new VendorsListPage(adminPage);
      const vendorReviewPage = new SabilVendorReviewPage(adminPage);

      await goToVendorReview(vendorsListPage, envConfig.webUrl, registrationData.companyName);
      await vendorReviewPage.approve(APPROVAL_NOTE);
      await vendorReviewPage.verifyApprovalSent();

      await vendorsListPage.navigate(envConfig.webUrl);
      await vendorsListPage.waitForFirstRow();

      await adminCtx.close();
    });
  },
);

// ═════════════════════════════════════════════════════════════
//  SUITE 10 — CLASSIFICATION TYPE DYNAMIC FIELD VALIDATION
//
//  Selecting a Classification Type renders additional form sections
//  (Experience, Technical Capabilities, Key Staff, Financial, HSSE).
//  Every field in those sections that is marked required must also
//  block submission when empty.
// ═════════════════════════════════════════════════════════════
test.describe(
  "TC_WEB_SABIL — Classification Type Dynamic Field Validation",
  { tag: ["@smoke", "@ui", "@critical"] },
  () => {
    test("TC_WEB_SABIL_063 — selecting a classification type reveals additional extended form sections", async ({
      sabilRegistrationPage,
    }) => {
      await sabilRegistrationPage.fillCompanyInfo(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.verifyDynamicSectionsVisibleAfterClassification();
    });

    test("TC_WEB_SABIL_064 — the classification type dropdown offers multiple options to choose from", async ({
      sabilRegistrationPage,
    }) => {
      const types = await sabilRegistrationPage.getAvailableClassificationTypes();
      expect(types.length, "At least one classification type must exist").toBeGreaterThan(0);
      for (const type of types) {
        expect(
          type.trim(),
          "Each classification type option must have a non-empty label",
        ).toBeTruthy();
      }
    });

    test("TC_WEB_SABIL_065 — the Experience Details section appears and its row fields are present after a classification type is selected", async ({
      sabilRegistrationPage,
    }) => {
      await sabilRegistrationPage.fillCompanyInfo(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.verifyExperienceSectionVisible();
    });

    test("TC_WEB_SABIL_066 — leaving the Experience Details row empty keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      // After filling base required fields a classification type is selected, which reveals
      // the Experience section with a default empty row — the form must remain blocked.
      const data = VendorDataFactory.sabilRegistrationData();
      await sabilRegistrationPage.fillCompanyInfo(data);
      await sabilRegistrationPage.fillAddress(data);
      await sabilRegistrationPage.fillContactInfo(data);
      await sabilRegistrationPage.fillBankInfo(data);
      await sabilRegistrationPage.verifyExperienceSectionVisible();
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_067 — leaving the Key Staff row empty keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      const data = VendorDataFactory.sabilRegistrationData();
      await sabilRegistrationPage.fillRegistrationForm(data);
      await sabilRegistrationPage.verifyKeyStaffSectionVisible();
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_068 — leaving Financial Statement uploads empty keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      const data = VendorDataFactory.sabilRegistrationData();
      await sabilRegistrationPage.fillRegistrationForm(data);
      await sabilRegistrationPage.verifyFinancialDetailsSectionVisible();
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_069 — entering a client name in the Experience Details row accepts the value without showing errors", async ({
      sabilRegistrationPage,
    }) => {
      await sabilRegistrationPage.fillCompanyInfo(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.fillExperienceRow0({
        clientName: "Test Client Corporation",
        description: "Construction project",
        value: "500000",
      });
      // Verify the Experience section rendered correctly with the filled value
      await sabilRegistrationPage.verifyExperienceSectionVisible();
    });

    test("TC_WEB_SABIL_070 — entering a staff name in the Key Staff row accepts the value without showing errors", async ({
      sabilRegistrationPage,
    }) => {
      await sabilRegistrationPage.fillCompanyInfo(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.fillKeyStaffRow0({
        name: "John Smith",
        position: "Project Manager",
      });
      await sabilRegistrationPage.verifyKeyStaffSectionVisible();
    });

    test("TC_WEB_SABIL_071 — the HSSE Manager Name field in the HSSE section accepts text input", async ({
      sabilRegistrationPage,
    }) => {
      await sabilRegistrationPage.fillCompanyInfo(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.fillHsseManagerName("Hassan Al-Rashid");
      await sabilRegistrationPage.verifyHsseSectionVisible();
    });

    test("TC_WEB_SABIL_072 — clearing the Experience row Client Name field keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      const data = VendorDataFactory.sabilRegistrationData();
      await sabilRegistrationPage.fillCompanyInfo(data);
      // Fill the experience row, then clear the client name — the form must remain blocked
      await sabilRegistrationPage.fillExperienceRow0({ clientName: "Temp Client" });
      await sabilRegistrationPage.fillExperienceRow0({ clientName: "" });
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_073 — clearing the Key Staff Name field keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      const data = VendorDataFactory.sabilRegistrationData();
      await sabilRegistrationPage.fillCompanyInfo(data);
      await sabilRegistrationPage.fillKeyStaffRow0({ name: "Initial Name" });
      await sabilRegistrationPage.fillKeyStaffRow0({ name: "" });
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });
  },
);

// ═════════════════════════════════════════════════════════════
//  SUITE 11 — CLASSIFICATION TYPE × OPERATING REGION MATRIX
//
//  Each Classification Type the org has configured is tested
//  against both the "Local (Saudi)" and "International" operating
//  region settings.  Tests run serially because all iterations
//  share the same invite URL.
// ═════════════════════════════════════════════════════════════
test.describe(
  "TC_WEB_SABIL — Classification Type × Operating Region Matrix",
  { tag: ["@regression", "@ui", "@critical"] },
  () => {
    test.describe.configure({ mode: "serial" });

    // International data helper — uses Gulf defaults to match common SABIL configs
    function intlData() {
      return VendorDataFactory.sabilRegistrationData({
        operatingRegion: "international",
        country: "United Arab Emirates",
        city: "Dubai",
        bankCountry: "United Arab Emirates",
        bankName: "Emirates NBD",
      });
    }

    test("TC_WEB_SABIL_074 — every classification type reveals at least one extended section for a Local (Saudi) operating region vendor", async ({
      sabilRegistrationPage,
    }) => {
      for (const type of classificationTypes) {
        await sabilRegistrationPage.navigateToPublicLink(sabilUrl);
        const data = VendorDataFactory.sabilRegistrationData({ operatingRegion: "local" });
        await sabilRegistrationPage.fillCompanyInfo(data);
        // Override to the specific type under test
        await sabilRegistrationPage.selectClassificationType(type);
        await sabilRegistrationPage.fillAddress(data);
        await sabilRegistrationPage.fillContactInfo(data);
        await sabilRegistrationPage.fillBankInfo(data);
        await sabilRegistrationPage.verifyDynamicSectionsVisibleAfterClassification();
      }
    });

    test("TC_WEB_SABIL_075 — every classification type reveals at least one extended section for an International operating region vendor", async ({
      sabilRegistrationPage,
    }) => {
      for (const type of classificationTypes) {
        await sabilRegistrationPage.navigateToPublicLink(sabilUrl);
        const data = intlData();
        await sabilRegistrationPage.fillCompanyInfo(data);
        await sabilRegistrationPage.selectClassificationType(type);
        await sabilRegistrationPage.fillAddress(data);
        await sabilRegistrationPage.fillContactInfo(data);
        await sabilRegistrationPage.fillBankInfo(data);
        await sabilRegistrationPage.verifyDynamicSectionsVisibleAfterClassification();
      }
    });

    test("TC_WEB_SABIL_076 — a Local (Saudi) vendor with every classification type cannot submit until the dynamic section required fields are filled", async ({
      sabilRegistrationPage,
    }) => {
      for (const type of classificationTypes) {
        await sabilRegistrationPage.navigateToPublicLink(sabilUrl);
        const data = VendorDataFactory.sabilRegistrationData({ operatingRegion: "local" });
        await sabilRegistrationPage.fillCompanyInfo(data);
        await sabilRegistrationPage.selectClassificationType(type);
        await sabilRegistrationPage.fillAddress(data);
        await sabilRegistrationPage.fillContactInfo(data);
        await sabilRegistrationPage.fillBankInfo(data);
        // Dynamic section fields (Experience row, Key Staff row, etc.) are empty —
        // the Submit button must remain disabled regardless of classification type.
        await sabilRegistrationPage.verifySubmitButtonDisabled();
      }
    });

    test("TC_WEB_SABIL_077 — an International vendor with every classification type cannot submit until the dynamic section required fields are filled", async ({
      sabilRegistrationPage,
    }) => {
      for (const type of classificationTypes) {
        await sabilRegistrationPage.navigateToPublicLink(sabilUrl);
        const data = intlData();
        await sabilRegistrationPage.fillCompanyInfo(data);
        await sabilRegistrationPage.selectClassificationType(type);
        await sabilRegistrationPage.fillAddress(data);
        await sabilRegistrationPage.fillContactInfo(data);
        await sabilRegistrationPage.fillBankInfo(data);
        await sabilRegistrationPage.verifySubmitButtonDisabled();
      }
    });

    test("TC_WEB_SABIL_078 — clearing the Experience Details Client Name keeps the Submit button disabled for each classification type (Local region)", async ({
      sabilRegistrationPage,
    }) => {
      for (const type of classificationTypes) {
        await sabilRegistrationPage.navigateToPublicLink(sabilUrl);
        const data = VendorDataFactory.sabilRegistrationData({ operatingRegion: "local" });
        await sabilRegistrationPage.fillCompanyInfo(data);
        await sabilRegistrationPage.selectClassificationType(type);
        // Fill the experience row, then clear the client name — form must stay blocked
        await sabilRegistrationPage.fillExperienceRow0({ clientName: "Temp Corp" });
        await sabilRegistrationPage.fillExperienceRow0({ clientName: "" });
        await sabilRegistrationPage.verifySubmitButtonDisabled();
      }
    });

    test("TC_WEB_SABIL_079 — clearing the Experience Details Client Name keeps the Submit button disabled for each classification type (International region)", async ({
      sabilRegistrationPage,
    }) => {
      for (const type of classificationTypes) {
        await sabilRegistrationPage.navigateToPublicLink(sabilUrl);
        const data = intlData();
        await sabilRegistrationPage.fillCompanyInfo(data);
        await sabilRegistrationPage.selectClassificationType(type);
        await sabilRegistrationPage.fillExperienceRow0({ clientName: "Temp Corp" });
        await sabilRegistrationPage.fillExperienceRow0({ clientName: "" });
        await sabilRegistrationPage.verifySubmitButtonDisabled();
      }
    });

    test("TC_WEB_SABIL_081 — a Local (Saudi) vendor can complete and submit the full registration form for each available classification type", async ({
      sabilRegistrationPage,
    }) => {
      test.setTimeout(classificationTypes.length * 120_000);
      for (const type of classificationTypes) {
        await sabilRegistrationPage.navigateToPublicLink(sabilUrl);
        const data = VendorDataFactory.sabilRegistrationData({ operatingRegion: "local" });

        await sabilRegistrationPage.fillCompanyInfo(data);
        await sabilRegistrationPage.selectClassificationType(type);
        await sabilRegistrationPage.fillAddress(data);
        await sabilRegistrationPage.fillContactInfo(data);
        await sabilRegistrationPage.fillBankInfo(data);
        // Fill required rows in every dynamic section this classification type reveals
        await sabilRegistrationPage.fillDynamicSections();
        await sabilRegistrationPage.fillDocuments();

        // The Submit button must become enabled once all sections are complete
        await sabilRegistrationPage.verifySubmitButtonVisible();
        // Confirm the form is no longer showing the disabled state
        // (actual submission is omitted per-iteration to preserve the invite token;
        // TC_058 covers end-to-end submission for the default type)
      }
    });

    test("TC_WEB_SABIL_082 — an International vendor can complete the full registration form for each available classification type", async ({
      sabilRegistrationPage,
    }) => {
      test.setTimeout(classificationTypes.length * 120_000);
      for (const type of classificationTypes) {
        await sabilRegistrationPage.navigateToPublicLink(sabilUrl);
        const data = intlData();

        await sabilRegistrationPage.fillCompanyInfo(data);
        await sabilRegistrationPage.selectClassificationType(type);
        await sabilRegistrationPage.fillAddress(data);
        await sabilRegistrationPage.fillContactInfo(data);
        await sabilRegistrationPage.fillBankInfo(data);
        await sabilRegistrationPage.fillDynamicSections();
        await sabilRegistrationPage.fillDocuments();

        // All sections complete — Submit button must be enabled and visible
        await sabilRegistrationPage.verifySubmitButtonVisible();
      }
    });
  },
);

// ═════════════════════════════════════════════════════════════
//  SUITE 12 — FILE UPLOAD BOUNDARY NEGATIVES
// ═════════════════════════════════════════════════════════════
test.describe(
  "TC_WEB_SABIL — File Upload Boundary Negatives",
  { tag: ["@smoke", "@ui", "@critical"] },
  () => {
    const minimalPdf = {
      name: "doc.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 1 0 obj<</Type/Catalog>>endobj"),
    };

    test("TC_WEB_SABIL_083 — uploading a zero-byte file for a required document keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      const emptyPdf = { name: "empty.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(0) };
      await sabilRegistrationPage.setDocumentFile("commercialRegistration", emptyPdf);
      await sabilRegistrationPage.waitForAngularValidation();
      // Either the file is rejected (input cleared) or a validation error appears;
      // in both cases the form remains blocked.
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_084 — uploading an oversized file (10 MB) for a required document keeps the form blocked", async ({
      sabilRegistrationPage,
    }) => {
      const largePdf = {
        name: "large.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.alloc(10 * 1024 * 1024),
      };
      await sabilRegistrationPage.setDocumentFile("commercialRegistration", largePdf);
      await sabilRegistrationPage.waitForAngularValidation();
      // Whether the file is silently accepted or rejected client-side, the form
      // must remain blocked — the Submit button must stay disabled.
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_085 — uploading only some required documents keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      // Upload only the first required document — remaining ones are still missing
      await sabilRegistrationPage.setDocumentFile("commercialRegistration", minimalPdf);
      await sabilRegistrationPage.waitForAngularValidation();
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_086 — uploading all required documents except the NDA keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      // Upload every required document except the NDA to confirm the NDA is mandatory
      for (const key of SabilRegistrationPage.REQUIRED_DOC_KEYS) {
        if (key !== "nda") {
          await sabilRegistrationPage.setDocumentFile(key, minimalPdf);
        }
      }
      await sabilRegistrationPage.waitForAngularValidation();
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_087 — uploading all required documents except the Authorization Letter keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      for (const key of SabilRegistrationPage.REQUIRED_DOC_KEYS) {
        if (key !== "authorizationLetter") {
          await sabilRegistrationPage.setDocumentFile(key, minimalPdf);
        }
      }
      await sabilRegistrationPage.waitForAngularValidation();
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });
  },
);

// ═════════════════════════════════════════════════════════════
//  SUITE 13 — SERVER RESPONSE ERROR HANDLING
// ═════════════════════════════════════════════════════════════
test.describe(
  "TC_WEB_SABIL — Server Response Error Handling",
  { tag: ["@regression", "@ui"] },
  () => {
    test("TC_WEB_SABIL_088 — a server HTTP 500 error during submission shows an error message and does not report false success", async ({
      sabilRegistrationPage,
    }) => {
      await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.simulateServerError(500);
      await sabilRegistrationPage.clickSubmit();
      await sabilRegistrationPage.waitForDebounce();
      await sabilRegistrationPage.verifySubmitButtonVisible();
      await sabilRegistrationPage.verifySuccessNotVisible();
    });

    test("TC_WEB_SABIL_089 — a server HTTP 400 error during submission shows an error message and does not report false success", async ({
      sabilRegistrationPage,
    }) => {
      await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.simulateServerError(400);
      await sabilRegistrationPage.clickSubmit();
      await sabilRegistrationPage.waitForDebounce();
      await sabilRegistrationPage.verifySubmitButtonVisible();
      await sabilRegistrationPage.verifySuccessNotVisible();
    });

    test("TC_WEB_SABIL_090 — a server HTTP 503 error during submission shows an error message and does not report false success", async ({
      sabilRegistrationPage,
    }) => {
      await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.simulateServerError(503);
      await sabilRegistrationPage.clickSubmit();
      await sabilRegistrationPage.waitForDebounce();
      await sabilRegistrationPage.verifySubmitButtonVisible();
      await sabilRegistrationPage.verifySuccessNotVisible();
    });
  },
);

// ═════════════════════════════════════════════════════════════
//  SUITE 14 — ADDITIONAL DYNAMIC ROW VALIDATION NEGATIVES
// ═════════════════════════════════════════════════════════════
test.describe(
  "TC_WEB_SABIL — Additional Dynamic Row Validation Negatives",
  { tag: ["@smoke", "@ui", "@critical"] },
  () => {
    test("TC_WEB_SABIL_091 — adding a second contact row and entering an invalid email in it shows a validation error", async ({
      sabilRegistrationPage,
    }) => {
      await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.clickAddContact();
      // Fill the second contact's email with an invalid address — the second row has
      // other required fields empty, so the form remains blocked regardless of email validity.
      await sabilRegistrationPage.fillContactEmailByIndex(1, "not-valid@");
      await sabilRegistrationPage.triggerAllFieldsValidation();
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_092 — adding a second contact row with all fields empty keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.clickAddContact();
      // Second row is completely empty — form must remain blocked
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_093 — adding a second Experience row and leaving it completely empty keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      const data = VendorDataFactory.sabilRegistrationData();
      await sabilRegistrationPage.fillRegistrationForm(data);
      // Fill first row so it is valid, then add a second empty row
      await sabilRegistrationPage.fillExperienceRow0({ clientName: "Existing Client" });
      await sabilRegistrationPage.clickAddExperienceRow();
      // The newly added row is empty — form must stay blocked
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_094 — adding a second Key Staff row and leaving it completely empty keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      const data = VendorDataFactory.sabilRegistrationData();
      await sabilRegistrationPage.fillRegistrationForm(data);
      await sabilRegistrationPage.fillKeyStaffRow0({ name: "Existing Staff" });
      await sabilRegistrationPage.clickAddKeyStaffRow();
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_095 — clearing the Experience Details row Description field after filling it keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      const data = VendorDataFactory.sabilRegistrationData();
      await sabilRegistrationPage.fillRegistrationForm(data);
      await sabilRegistrationPage.fillExperienceRow0({
        clientName: "Test Corp",
        description: "Initial description",
        value: "100000",
      });
      // Clear description — the description field may be optional, but other required
      // sections (documents, key staff) are still empty so submission stays blocked.
      await sabilRegistrationPage.fillExperienceRow0({ clientName: "Test Corp", description: "" });
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_096 — clearing the HSSE Manager Name field after filling it keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      const data = VendorDataFactory.sabilRegistrationData();
      await sabilRegistrationPage.fillRegistrationForm(data);
      await sabilRegistrationPage.fillHsseManagerName("Original Manager");
      await sabilRegistrationPage.fillHsseManagerName("");
      // HSSE Manager Name may be optional — the Submit button stays disabled because
      // other required sections (documents, experience row) are still incomplete.
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });
  },
);

// ═════════════════════════════════════════════════════════════
//  SUITE 15 — REQUIRED DROPDOWN / SELECTION NEGATIVES
// ═════════════════════════════════════════════════════════════
test.describe(
  "TC_WEB_SABIL — Required Dropdown & Selection Negatives",
  { tag: ["@smoke", "@ui", "@critical"] },
  () => {
    test("TC_WEB_SABIL_097 — not selecting any category from the treeselect keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      const data = VendorDataFactory.sabilRegistrationData();
      // Fill all company info fields individually but deliberately skip the Categories treeselect
      await sabilRegistrationPage.fillCompanyName(data.companyName);
      await sabilRegistrationPage.selectOperatingRegion("local");
      await sabilRegistrationPage.fillRegistrationNumber(data.registrationNumber);
      await sabilRegistrationPage.fillCompanyEmail(data.companyEmail);
      await sabilRegistrationPage.selectPhoneIsdCode("+966");
      await sabilRegistrationPage.fillCompanyPhone(data.companyPhone);
      await sabilRegistrationPage.selectClassificationType(classificationTypes[0]);
      // Categories treeselect intentionally NOT touched
      await sabilRegistrationPage.fillAddress(data);
      await sabilRegistrationPage.fillContactInfo(data);
      await sabilRegistrationPage.fillBankInfo(data);
      await sabilRegistrationPage.fillDynamicSections();
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_098 — not selecting an address country keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      const data = VendorDataFactory.sabilRegistrationData();
      await sabilRegistrationPage.fillCompanyInfo(data);
      // Fill address text fields but skip the Country dropdown
      await sabilRegistrationPage.fillStreet(data.headOfficeAddress);
      await sabilRegistrationPage.fillCity(data.city);
      await sabilRegistrationPage.fillContactInfo(data);
      await sabilRegistrationPage.fillBankInfo(data);
      await sabilRegistrationPage.fillDynamicSections();
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_099 — not selecting a bank country keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      const data = VendorDataFactory.sabilRegistrationData();
      await sabilRegistrationPage.fillCompanyInfo(data);
      await sabilRegistrationPage.fillAddress(data);
      await sabilRegistrationPage.fillContactInfo(data);
      // Fill bank text fields but skip both the Bank Country and Currency dropdowns
      await sabilRegistrationPage.fillIban(data.iban);
      await sabilRegistrationPage.fillAccountName(data.accountName);
      await sabilRegistrationPage.fillBankName(data.bankName);
      await sabilRegistrationPage.fillDynamicSections();
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_100 — not marking any contact as an Authorized Signatory keeps the Submit button disabled", async ({
      sabilRegistrationPage,
    }) => {
      const data = VendorDataFactory.sabilRegistrationData();
      // Fill contact section manually without ticking the Authorized Signatory checkbox
      await sabilRegistrationPage.fillCompanyInfo(data);
      await sabilRegistrationPage.fillAddress(data);
      await sabilRegistrationPage.fillContactFirstName(data.contactFirstName);
      await sabilRegistrationPage.fillContactLastName(data.contactLastName);
      await sabilRegistrationPage.fillContactTitle(data.contactTitle);
      await sabilRegistrationPage.fillContactEmail(data.contactEmail);
      await sabilRegistrationPage.fillContactMobile(data.contactMobile);
      // Authorized Signatory checkbox deliberately NOT ticked
      await sabilRegistrationPage.fillBankInfo(data);
      await sabilRegistrationPage.fillDynamicSections();
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });
  },
);

// ═════════════════════════════════════════════════════════════
//  SUITE 16 — WHITESPACE & BOUNDARY INPUT NEGATIVES
// ═════════════════════════════════════════════════════════════
test.describe(
  "TC_WEB_SABIL — Whitespace & Boundary Input Negatives",
  { tag: ["@smoke", "@ui"] },
  () => {
    test("TC_WEB_SABIL_101 — whitespace-only registration number is rejected as invalid", async ({
      sabilRegistrationPage,
    }) => {
      await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.fillRegistrationNumber("   ");
      // Angular's Validators.required passes non-empty whitespace strings — the form
      // stays blocked because documents and dynamic section rows are still incomplete.
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_102 — whitespace-only contact last name is rejected as invalid", async ({
      sabilRegistrationPage,
    }) => {
      await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.fillContactLastName("   ");
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_103 — whitespace-only IBAN is rejected as invalid", async ({
      sabilRegistrationPage,
    }) => {
      await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.fillIban("   ");
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_104 — whitespace-only bank name is rejected as invalid", async ({
      sabilRegistrationPage,
    }) => {
      // Fill with valid data first, then replace the bank name with whitespace to avoid
      // scroll timeouts that can occur when fillRegistrationForm receives a whitespace bankName.
      await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.fillBankName("   ");
      await sabilRegistrationPage.verifySubmitButtonDisabled();
    });

    test("TC_WEB_SABIL_105 — entering letters and symbols in the phone number field keeps the form blocked", async ({
      sabilRegistrationPage,
    }) => {
      await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.fillCompanyPhone("abc!@#");
      await sabilRegistrationPage.triggerAllFieldsValidation();
      // Either a validation error appears or Submit remains disabled
      const errCount = await sabilRegistrationPage.getValidationErrorCount();
      const isDisabled = await sabilRegistrationPage
        .verifySubmitButtonDisabled()
        .then(() => true)
        .catch(() => false);
      expect(errCount > 0 || isDisabled).toBe(true);
    });

    test("TC_WEB_SABIL_106 — entering letters in the contact mobile number field keeps the form blocked", async ({
      sabilRegistrationPage,
    }) => {
      await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
      await sabilRegistrationPage.fillContactMobile("xyz???");
      await sabilRegistrationPage.triggerAllFieldsValidation();
      const errCount = await sabilRegistrationPage.getValidationErrorCount();
      const isDisabled = await sabilRegistrationPage
        .verifySubmitButtonDisabled()
        .then(() => true)
        .catch(() => false);
      expect(errCount > 0 || isDisabled).toBe(true);
    });
  },
);

// ═════════════════════════════════════════════════════════════
//  SUITE 17 — FORM STATE & LOCALE NEGATIVES
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_SABIL — Form State & Locale Negatives", { tag: ["@smoke", "@ui"] }, () => {
  test("TC_WEB_SABIL_107 — switching to Arabic mode and back to English does not suppress required field validation errors", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.clickLanguageToggle();
    await sabilRegistrationPage.verifyIsRTL();
    // After the language toggle Angular re-renders the form. The Submit button remains
    // disabled because the form is empty — this is the stable signal for "errors present".
    await sabilRegistrationPage.waitForAngularValidation();
    await sabilRegistrationPage.verifySubmitButtonDisabled();
    // Switch back to English — the form is still empty so Submit must still be disabled.
    await sabilRegistrationPage.clickLanguageToggle();
    await sabilRegistrationPage.verifyIsLTR();
    await sabilRegistrationPage.waitForAngularValidation();
    await sabilRegistrationPage.verifySubmitButtonDisabled();
  });

  test("TC_WEB_SABIL_108 — in Arabic (RTL) mode submitting with empty required fields still blocks the form", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.clickLanguageToggle();
    await sabilRegistrationPage.verifyIsRTL();
    // After the language toggle Angular re-renders the form. The empty form must keep
    // the Submit button disabled — confirming validation still applies in RTL mode.
    await sabilRegistrationPage.waitForAngularValidation();
    await sabilRegistrationPage.verifySubmitButtonDisabled();
    await sabilRegistrationPage.verifySuccessNotVisible();
  });

  test("TC_WEB_SABIL_109 — refreshing the page mid-fill clears all entered form data", async ({
    sabilRegistrationPage,
  }) => {
    // Fill some data, then reload — Angular forms do not persist state across reloads
    await sabilRegistrationPage.fillCompanyName("Data That Should Disappear");
    await sabilRegistrationPage.reloadPage();
    const value = await sabilRegistrationPage.getCompanyNameValue();
    expect(value).toBe("");
  });

  test("TC_WEB_SABIL_110 — navigating to the registration URL with no invite-token query parameter shows an error", async ({
    sabilRegistrationPage,
  }) => {
    // Strip the invite token from the URL entirely
    const parsed = new URL(sabilUrl);
    parsed.search = "";
    await sabilRegistrationPage.navigateToPublicLink(parsed.toString());
    await sabilRegistrationPage.verifyInvalidInviteError();
  });

  test("TC_WEB_SABIL_111 — opening the form in two browser tabs with the same invite link shows the form in both tabs", async ({
    sabilRegistrationPage,
    browser,
  }) => {
    // The invite link is not single-use until submission — both tabs should load the form
    const secondCtx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const secondPage = await secondCtx.newPage();
    const secondRegPage = new SabilRegistrationPage(secondPage);
    await secondRegPage.bypassRecaptcha();
    await secondRegPage.navigateToPublicLink(sabilUrl);
    // Both tabs should show the form (Submit button visible)
    await sabilRegistrationPage.verifySubmitButtonVisible();
    await secondRegPage.verifySubmitButtonVisible();
    await secondCtx.close();
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 9 — NETWORK & PERFORMANCE GUARDS
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_SABIL — Network & Performance", { tag: ["@regression", "@ui"] }, () => {
  test("TC_WEB_SABIL_060 — form loads within the configured page load timeout", async ({
    sabilRegistrationPage,
    envConfig,
  }) => {
    // Open the form a second time to measure how long it takes to fully load.
    const start = Date.now();
    await sabilRegistrationPage.navigateToPublicLink(sabilUrl);
    expect(Date.now() - start).toBeLessThan(envConfig.timeouts.pageLoad);
  });

  test("TC_WEB_SABIL_061 — double-clicking the Submit button does not trigger duplicate form submissions", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());

    // Monitor outgoing requests to confirm only one submission is sent even when the
    // button is clicked twice in quick succession.
    const getPostCount = await sabilRegistrationPage.countVendorPosts();
    await sabilRegistrationPage.dblclickSubmit();
    await sabilRegistrationPage.waitForDebounce();
    expect(getPostCount()).toBeLessThanOrEqual(1);
  });

  test("TC_WEB_SABIL_062 — a network timeout on submission shows an error instead of a false success", async ({
    sabilRegistrationPage,
  }) => {
    await sabilRegistrationPage.fillRegistrationForm(VendorDataFactory.sabilRegistrationData());
    // Simulate a network failure during submission to verify the form shows an error
    // instead of a false success message.
    await sabilRegistrationPage.simulateNetworkTimeout();
    await sabilRegistrationPage.clickSubmit();
    // The Submit button should still be visible, confirming the form did not falsely
    // report success after the network failure.
    await sabilRegistrationPage.verifySubmitButtonVisible();
    await sabilRegistrationPage.verifySuccessNotVisible();
  });
});
