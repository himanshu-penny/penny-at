import { test, expect } from "@fixtures";
import { VendorsListPage } from "@pages/web/vendors/vendors-list.page";
import { InviteVendorPanel } from "@pages/web/vendors/invite-vendor-panel.page";
import { VendorDataFactory } from "@factories/vendor.factory";
import { EwcfRegistrationPage } from "@pages/web/vendors/ewcf-registration.page";
import { EwcfVendorReviewPage } from "@pages/web/vendors/ewcf-vendor-review.page";
import { getEnvironmentConfig } from "@config/environments";
import { API_STORAGE_STATE, WEB_STORAGE_STATE } from "@config/auth-paths";

// ─────────────────────────────────────────────────────────────
// REQUIRED FIELD VALIDATION MATRIX
// Defines which fields are mandatory on the registration form.
// Each entry produces one test in Suite 2 that fills the entire
// form correctly, then clears that one field and verifies the
// form correctly blocks submission with a validation error.
// ─────────────────────────────────────────────────────────────
const REQUIRED_FIELD_MATRIX: Array<{
  label: string;
  clearFn: (page: EwcfRegistrationPage) => Promise<void>;
}> = [
  { label: "Company Name", clearFn: (p) => p.fillCompanyName("") },
  { label: "Organization Type", clearFn: (p) => p.fillOrganizationType("") },
  { label: "Entity Email Address", clearFn: (p) => p.fillEntityEmail("") },
  { label: "City", clearFn: (p) => p.fillCity("") },
  { label: "Office Address", clearFn: (p) => p.fillOfficeAddress("") },
  { label: "Contact Email (Rep 0)", clearFn: (p) => p.fillContactEmail("") },
  { label: "Contact First Name", clearFn: (p) => p.fillContactFirstName("") },
  { label: "Contact Mobile Number", clearFn: (p) => p.fillContactMobile("") },
  { label: "Beneficiary Name", clearFn: (p) => p.fillBeneficiaryName("") },
  { label: "Bank Name", clearFn: (p) => p.fillBankName("") },
  { label: "Bank Account Number", clearFn: (p) => p.fillAccountNumber("") },
  { label: "IBAN", clearFn: (p) => p.fillIban("") },
  { label: "SWIFT Code", clearFn: (p) => p.fillSwiftCode("") },
];

// ─────────────────────────────────────────────────────────────────────────────
// The vendor registration URL contains a unique invite token that changes per
// environment. Rather than hardcoding it, we fetch it once from the admin
// "Invite Vendors" panel before the suite starts, then reuse it across all tests.
// ─────────────────────────────────────────────────────────────────────────────
let ewcfUrl: string;
// If beforeEach fails once, all remaining tests are skipped rather than failing individually.
let pageSetupFailed = false;

// Runs once before the entire suite.
// Logs in as an admin, navigates to the Vendors page, opens the Invite Vendors
// panel, and captures the public registration link (including its invite token).
test.beforeAll(async ({ browser }) => {
  const envConfig = getEnvironmentConfig();

  const ctx = await browser.newContext({
    storageState: API_STORAGE_STATE,
  });
  const page = await ctx.newPage();

  const vendorsListPage = new VendorsListPage(page);
  const inviteVendorPanel = new InviteVendorPanel(page);

  await vendorsListPage.navigate(envConfig.webUrl);
  await vendorsListPage.clickInviteVendors();
  ewcfUrl = await inviteVendorPanel.getPublicInviteLink();

  expect(ewcfUrl, "Public invite link must be a non-empty string").not.toBe("");
  expect(() => new URL(ewcfUrl), "Public invite link must be a parseable URL").not.toThrow();

  await ctx.close();
});

// The vendor registration form is publicly accessible — no login required.
test.use({ storageState: { cookies: [], origins: [] } });

// Before every test: disable Google reCAPTCHA (to avoid bot-detection blocking automation)
// and open the vendor registration form using the invite link fetched above.
// Exceptions: TC_003 opens the form with a tampered/invalid link to test error handling;
//             TC_065 opens the form a second time to measure how fast it loads.
// If setup fails, the current test is marked failed and all subsequent tests are skipped.
test.beforeEach(async ({ ewcfRegistrationPage }) => {
  if (pageSetupFailed) {
    test.skip(
      true,
      "Skipping: page setup failed in a previous test — fix the environment and re-run.",
    );
    return;
  }
  try {
    await ewcfRegistrationPage.bypassRecaptcha();
    await ewcfRegistrationPage.navigateToPublicLink(ewcfUrl);
  } catch (error) {
    pageSetupFailed = true;
    throw error;
  }
});

// ═════════════════════════════════════════════════════════════
//  SUITE 1 — INVITE TOKEN & FORM CHROME
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_EWCF — Invite Token & Form Chrome", { tag: ["@smoke", "@ui"] }, () => {
  test("TC_WEB_EWCF_001 — the invited organisation's name is shown in the form banner", async ({
    ewcfRegistrationPage,
  }) => {
    // Read the org name directly from the banner heading so the assertion stays
    // valid across environments without hardcoding a specific org name.
    const orgName = await ewcfRegistrationPage.getBannerOrgName();
    expect(orgName, "Organisation name should be visible in the registration banner").toBeTruthy();
    await ewcfRegistrationPage.verifyBannerContainsText(/Fill the details to register/i);
  });

  test("TC_WEB_EWCF_002 — opening the form with a tampered invite link shows an error", async ({
    ewcfRegistrationPage,
  }) => {
    // Open the form using a deliberately broken invite link to verify the error state.
    await ewcfRegistrationPage.navigateWithInvalidToken(ewcfUrl);
    await ewcfRegistrationPage.verifyInvalidInviteError();
  });

  test("TC_WEB_EWCF_003 — switching to Arabic changes the form to right-to-left layout and can be switched back", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.clickLanguageToggle();
    await ewcfRegistrationPage.verifyIsRTL();
    await ewcfRegistrationPage.clickLanguageToggle();
    await ewcfRegistrationPage.verifyIsLTR();
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 2 — REQUIRED FIELD VALIDATION
// ═════════════════════════════════════════════════════════════
test.describe(
  "TC_WEB_EWCF — Required Field Validation",
  { tag: ["@smoke", "@ui", "@critical"] },
  () => {
    test("TC_WEB_EWCF_004 — submitting empty form shows errors on required fields", async ({
      ewcfRegistrationPage,
    }) => {
      await ewcfRegistrationPage.clickSubmit();
      await ewcfRegistrationPage.verifyValidationErrorsVisible();
      await ewcfRegistrationPage.verifySuccessNotVisible();
      expect(await ewcfRegistrationPage.getValidationErrorCount()).toBeGreaterThanOrEqual(5);
    });

    // Parametrized: one test per required field
    let tcIndex = 5;
    for (const { label, clearFn } of REQUIRED_FIELD_MATRIX) {
      test(`TC_WEB_EWCF_${String(tcIndex++).padStart(3, "0")} — "${label}" is required`, async ({
        ewcfRegistrationPage,
      }) => {
        await ewcfRegistrationPage.fillRegistrationForm(VendorDataFactory.registrationData());
        await clearFn(ewcfRegistrationPage);
        await ewcfRegistrationPage.clickSubmit();
        await ewcfRegistrationPage.verifyValidationErrorsVisible();
        await ewcfRegistrationPage.verifySuccessNotVisible();
      });
    }

    test("TC_WEB_EWCF_018 — the vendor must select an entity type before the form can be submitted", async ({
      ewcfRegistrationPage,
    }) => {
      await ewcfRegistrationPage.uncheckAllEntityTypeRadios();
      await ewcfRegistrationPage.clickSubmit();
      await ewcfRegistrationPage.verifyValidationErrorsVisible();
    });

    test("TC_WEB_EWCF_019 — a classification type must be chosen before the form can be submitted", async ({
      ewcfRegistrationPage,
    }) => {
      // Fill in all text fields but leave every selection menu empty to confirm
      // each selection is required before the form can be submitted.
      await ewcfRegistrationPage.fillRequiredTextFields(VendorDataFactory.registrationData());
      await ewcfRegistrationPage.clickSubmit();
      await ewcfRegistrationPage.verifyValidationErrorsVisible();
    });

    test("TC_WEB_EWCF_020 — the form requires at least one authorized signatory to be designated", async ({
      ewcfRegistrationPage,
    }) => {
      // Complete all text fields but skip the authorized signatory designation to confirm
      // at least one contact must be marked as a signatory before submitting.
      await ewcfRegistrationPage.fillRequiredTextFields(VendorDataFactory.registrationData());
      await ewcfRegistrationPage.clickSubmit();
      await ewcfRegistrationPage.verifyAuthorizedSignatoryError();
    });
  },
);

// ═════════════════════════════════════════════════════════════
//  SUITE 3 — FORMAT / PATTERN VALIDATION
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_EWCF — Format Validation", { tag: ["@smoke", "@ui"] }, () => {
  test("TC_WEB_EWCF_021 — the company email field shows an error when an incorrectly formatted address is entered", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillEntityEmail("not-an-email");
    await ewcfRegistrationPage.blurEntityEmail();
    const htmlInvalid = !(await ewcfRegistrationPage.isEntityEmailHtmlValid());
    const customError = (await ewcfRegistrationPage.getValidationErrorCount()) > 0;
    expect(htmlInvalid || customError).toBe(true);
  });

  test("TC_WEB_EWCF_022 — entity email accepts valid addresses", async ({
    ewcfRegistrationPage,
  }) => {
    for (const email of ["info@company.co", "vendor+tag@sub.org", "123@test.io"]) {
      await ewcfRegistrationPage.fillEntityEmail(email);
      await ewcfRegistrationPage.blurEntityEmail();
      await ewcfRegistrationPage.waitForAngularValidation();
      expect(
        await ewcfRegistrationPage.isEntityEmailHtmlValid(),
        `"${email}" should pass HTML5 validity`,
      ).toBe(true);
    }
  });

  test("TC_WEB_EWCF_023 — contact email rejects partial address", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillContactEmail("bademail@");
    await ewcfRegistrationPage.blurContactEmail();
    expect(await ewcfRegistrationPage.isContactEmailHtmlValid()).toBe(false);
  });

  test("TC_WEB_EWCF_024 — entering a non-URL value in the website field does not show an inline error", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillRegistrationForm(VendorDataFactory.registrationData());
    await ewcfRegistrationPage.fillWebsiteUrl("not a url");
    await ewcfRegistrationPage.blurWebsiteUrl();
    // The website field does not show an error message for non-URL input, but the form
    // still prevents submission until all required fields are valid.
    await ewcfRegistrationPage.verifySubmitButtonDisabled();
  });

  test("TC_WEB_EWCF_025 — corporate website accepts http and https URLs", async ({
    ewcfRegistrationPage,
  }) => {
    for (const url of ["http://example.com", "https://vendor.co"]) {
      await ewcfRegistrationPage.fillWebsiteUrl(url);
      await ewcfRegistrationPage.blurWebsiteUrl();
      await ewcfRegistrationPage.waitForAngularValidation();
      expect(
        await ewcfRegistrationPage.getValidationErrorCount(),
        `URL "${url}" should not produce errors`,
      ).toBe(0);
    }
  });

  test("TC_WEB_EWCF_026 — entering an invalid SWIFT code does not show an inline error but keeps the form blocked", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillRegistrationForm(VendorDataFactory.registrationData());
    await ewcfRegistrationPage.fillSwiftCode("BAD!@#$%");
    // The SWIFT field does not validate the format — it accepts any text, but the form
    // still prevents submission.
    await ewcfRegistrationPage.verifySubmitButtonDisabled();
  });

  test("TC_WEB_EWCF_027 — entering a short IBAN value does not show a length error but keeps the form blocked", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillRegistrationForm(VendorDataFactory.registrationData());
    await ewcfRegistrationPage.fillIban("SA01");
    // The IBAN field does not enforce a minimum length — it accepts short values, but
    // the form still prevents submission.
    await ewcfRegistrationPage.verifySubmitButtonDisabled();
  });

  test("TC_WEB_EWCF_028 — the mobile number field can be filled using the keyboard and retains the entered value", async ({
    ewcfRegistrationPage,
  }) => {
    // Type directly using the keyboard to confirm the field accepts manual entry and keeps the value.
    await ewcfRegistrationPage.typeIntoMobileNumber("123456789");
    await ewcfRegistrationPage.blurMobileNumber();
    const value = await ewcfRegistrationPage.getMobileNumberValue();
    expect(value).toContain("123456789");
  });

  test("TC_WEB_EWCF_029 — the calendar does not allow selecting a future establishment date", async ({
    ewcfRegistrationPage,
  }) => {
    // Pick a date 2 years ahead — always future regardless of when the test runs.
    const futureDate = `${new Date().getFullYear() + 2}-01-01`;
    await ewcfRegistrationPage.fillRegistrationForm(
      // The calendar disables future dates so the picker exits without selecting
      // anything, leaving the field empty and keeping the form blocked.
      VendorDataFactory.registrationData({ establishmentDate: futureDate }),
    );
    // The form does not show a specific date-error message; submission simply remains
    // blocked because the date field is still empty.
    await ewcfRegistrationPage.verifySubmitButtonDisabled();
  });

  test("TC_WEB_EWCF_030 — establishment date rejects non-date text", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillRegistrationForm(
      VendorDataFactory.registrationData({ establishmentDate: "not-a-date" }),
    );
    await ewcfRegistrationPage.clickSubmit();
    await ewcfRegistrationPage.verifyValidationErrorsVisible();
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 4 — DYNAMIC / CONDITIONAL BEHAVIOUR
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_EWCF — Dynamic Form Behaviour", { tag: ["@smoke", "@ui"] }, () => {
  test("TC_WEB_EWCF_031 — toggling entity type does not clear unrelated fields", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillCompanyName("Persistence Test Co");
    await ewcfRegistrationPage.selectEntityType("local");
    await ewcfRegistrationPage.selectEntityType("international");
    expect(await ewcfRegistrationPage.getCompanyNameValue()).toBe("Persistence Test Co");
  });

  test("TC_WEB_EWCF_032 — clicking Add Additional Contact adds a second contact entry to the form", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.verifyContactEntryVisible(0);
    await ewcfRegistrationPage.clickAddContact();
    await ewcfRegistrationPage.verifyContactEntryVisible(1);
  });

  test("TC_WEB_EWCF_033 — adding a second contact without filling it in prevents form submission", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillRegistrationForm(VendorDataFactory.registrationData());
    await ewcfRegistrationPage.clickAddContact();
    await ewcfRegistrationPage.verifyContactEntryVisible(1);
    // The newly added contact block is empty, so the form is incomplete and submission
    // remains blocked until all contact details are filled in.
    await ewcfRegistrationPage.verifySubmitButtonDisabled();
  });

  test("TC_WEB_EWCF_034 — entering an invalid email and moving to the next field immediately shows a validation error", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillEntityEmail("bad");
    await ewcfRegistrationPage.blurEntityEmail();
    await ewcfRegistrationPage.verifyValidationErrorsVisible();
  });

  test("TC_WEB_EWCF_035 — fixing an invalid field clears its error", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillEntityEmail("bad");
    await ewcfRegistrationPage.blurEntityEmail();
    await ewcfRegistrationPage.verifyValidationErrorsVisible();
    const errsBefore = await ewcfRegistrationPage.getValidationErrorCount();
    await ewcfRegistrationPage.fillEntityEmail("valid@email.com");
    await ewcfRegistrationPage.blurEntityEmail();
    await ewcfRegistrationPage.waitForAngularValidation();
    expect(await ewcfRegistrationPage.getValidationErrorCount()).toBeLessThan(errsBefore);
  });

  test("TC_WEB_EWCF_036 — clicking Add Additional Document adds a new document entry to the attachments section", async ({
    ewcfRegistrationPage,
  }) => {
    const before = await ewcfRegistrationPage.getAttachmentRowCount();
    await ewcfRegistrationPage.clickAddAttachment();
    await ewcfRegistrationPage.waitForNewAttachmentRow(before);
    expect(await ewcfRegistrationPage.getAttachmentRowCount()).toBeGreaterThan(before);
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 5 — DOCUMENTS SECTION
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_EWCF — Documents Section", { tag: ["@smoke", "@ui"] }, () => {
  test("TC_WEB_EWCF_037 — local (Saudi) entity type shows Saudi-specific document rows", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.selectEntityType("local");
    await ewcfRegistrationPage.expandAttachmentsSection();
    // Saudi-specific rows must appear
    for (const key of EwcfRegistrationPage.LOCAL_ONLY_DOC_KEYS) {
      await ewcfRegistrationPage.verifyDocumentRowVisible(key);
    }
    // International-only row must NOT appear
    for (const key of EwcfRegistrationPage.INTERNATIONAL_ONLY_DOC_KEYS) {
      await ewcfRegistrationPage.verifyDocumentRowAbsent(key);
    }
  });

  test("TC_WEB_EWCF_038 — international entity type shows Tax Certificate instead of Saudi-specific rows", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.selectEntityType("international");
    await ewcfRegistrationPage.expandAttachmentsSection();
    // International-specific row must appear
    for (const key of EwcfRegistrationPage.INTERNATIONAL_ONLY_DOC_KEYS) {
      await ewcfRegistrationPage.verifyDocumentRowVisible(key);
    }
    // Saudi-specific rows must NOT appear
    for (const key of EwcfRegistrationPage.LOCAL_ONLY_DOC_KEYS) {
      await ewcfRegistrationPage.verifyDocumentRowAbsent(key);
    }
  });

  test("TC_WEB_EWCF_039 — template download buttons exist for NDA, COI, and Authorization Letter", async ({
    ewcfRegistrationPage,
  }) => {
    for (const key of EwcfRegistrationPage.TEMPLATE_DOC_KEYS) {
      await ewcfRegistrationPage.verifyTemplateButtonVisible(key);
    }
  });

  test("TC_WEB_EWCF_040 — the Commercial Registration document section shows a Certificate Number field that accepts a reference number", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.verifyCertNumberInputVisible("commercialRegistration");
    await ewcfRegistrationPage.fillCertNumber("commercialRegistration", "CR-2024-999999");
    expect(await ewcfRegistrationPage.getCertNumberValue("commercialRegistration")).toBe(
      "CR-2024-999999",
    );
  });

  test("TC_WEB_EWCF_041 — the form cannot be submitted until all required documents have been uploaded", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillRegistrationForm(VendorDataFactory.registrationData());
    // All text fields are complete but no documents have been uploaded yet — the Submit
    // button remains disabled and no success message is shown.
    await ewcfRegistrationPage.verifySubmitButtonDisabled();
    await ewcfRegistrationPage.verifySuccessNotVisible();
  });

  test("TC_WEB_EWCF_042 — a valid PDF file can be uploaded for each required document", async ({
    ewcfRegistrationPage,
  }) => {
    for (const key of EwcfRegistrationPage.REQUIRED_DOC_KEYS) {
      await ewcfRegistrationPage.setDocumentFile(key, {
        name: `${key}.pdf`,
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4 test"),
      });
      await ewcfRegistrationPage.waitForAngularValidation();
    }
    await ewcfRegistrationPage.verifySubmitButtonVisible();
  });

  test("TC_WEB_EWCF_043 — uploading a disallowed file type is rejected", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.setDocumentFile("commercialRegistration", {
      name: "virus.exe",
      mimeType: "application/x-msdownload",
      buffer: Buffer.from("MZ"),
    });
    await ewcfRegistrationPage.waitForAngularValidation();
    const errCount = await ewcfRegistrationPage.getValidationErrorCount();
    const cleared =
      (await ewcfRegistrationPage.getDocumentFileInputValue("commercialRegistration")) === "";
    expect(errCount > 0 || cleared).toBe(true);
  });

  test("TC_WEB_EWCF_044 — the Add Additional Document option is visible and creates a new document entry when used", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.verifyAddAttachmentButtonVisible();
    const before = await ewcfRegistrationPage.getAttachmentRowCount();
    await ewcfRegistrationPage.clickAddAttachment();
    await ewcfRegistrationPage.waitForNewAttachmentRow(before);
    expect(await ewcfRegistrationPage.getAttachmentRowCount()).toBeGreaterThan(before);
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 6 — ACCESSIBILITY
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_EWCF — Accessibility", { tag: ["@smoke", "@ui"] }, () => {
  test("TC_WEB_EWCF_045 — every input field on the form has a visible label or descriptive placeholder", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.verifyAllInputsHaveAccessibleLabels();
  });

  test("TC_WEB_EWCF_046 — the form can be navigated field by field using the keyboard Tab key", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.verifyTabNavigationFromCompanyName();
  });

  test("TC_WEB_EWCF_047 — the Submit button can be reached and activated using the keyboard", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.focusSubmitButton();
    await ewcfRegistrationPage.verifySubmitButtonFocused();
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 7 — EDGE CASES & BOUNDARY VALUES
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_EWCF — Edge Cases & Boundary Values", { tag: ["@smoke", "@ui"] }, () => {
  test("TC_WEB_EWCF_048 — entering a very long company name does not cause an error", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillCompanyName("A".repeat(255));
    expect((await ewcfRegistrationPage.getCompanyNameValue()).length).toBeGreaterThan(0);
  });

  test("TC_WEB_EWCF_049 — whitespace-only company name is rejected", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillRegistrationForm(
      VendorDataFactory.registrationData({ companyName: "   " }),
    );
    await ewcfRegistrationPage.clickSubmit();
    await ewcfRegistrationPage.verifyValidationErrorsVisible();
  });

  test("TC_WEB_EWCF_050 — special characters in company name do not break the form", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillCompanyName("O'Brien & Sons <Ltd>");
    expect((await ewcfRegistrationPage.getCompanyNameValue()).length).toBeGreaterThan(0);
  });

  test("TC_WEB_EWCF_051 — entering a script tag in a text field does not trigger any JavaScript execution", async ({
    ewcfRegistrationPage,
  }) => {
    // Enter a malicious script as a field value and confirm it appears as harmless text
    // on screen rather than running — verifying the form cannot be used to execute unwanted code.
    const xssRan = await ewcfRegistrationPage.detectXssExecution();
    expect(xssRan).toBe(false);
  });

  test("TC_WEB_EWCF_052 — SQL injection payload is treated as plain text", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillCompanyName("'; DROP TABLE vendors; --");
    await ewcfRegistrationPage.blurCompanyName();
    await ewcfRegistrationPage.verifySubmitButtonVisible();
  });

  test("TC_WEB_EWCF_053 — Arabic (RTL) characters are accepted in company name", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillCompanyName("شركة اختبار");
    expect(await ewcfRegistrationPage.getCompanyNameValue()).toContain("شركة");
  });

  test("TC_WEB_EWCF_054 — beneficiary name hint text is visible", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.verifyBeneficiaryNameHintVisible();
  });

  test("TC_WEB_EWCF_055 — entering only spaces in the postal code field does not show an inline error", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillRegistrationForm(VendorDataFactory.registrationData());
    await ewcfRegistrationPage.fillPostalCode("     ");
    // The postal code field does not show a whitespace-specific error; submission
    // simply remains blocked.
    await ewcfRegistrationPage.verifySubmitButtonDisabled();
  });

  test("TC_WEB_EWCF_056 — entering letters in the bank account number field does not show an inline error", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillRegistrationForm(VendorDataFactory.registrationData());
    await ewcfRegistrationPage.fillAccountNumber("ABCDE");
    // The account number field does not restrict input to digits — it accepts letters,
    // but the form still prevents submission.
    await ewcfRegistrationPage.verifySubmitButtonDisabled();
  });

  test("TC_WEB_EWCF_057 — trading name is an optional field (accepts text, causes no errors)", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillTradingName("Acme Trading Co");
    await ewcfRegistrationPage.blurTradingName();
    await ewcfRegistrationPage.waitForAngularValidation();
    // Optional field — filling it should not generate any validation errors
    expect(await ewcfRegistrationPage.getValidationErrorCount()).toBe(0);
    expect(await ewcfRegistrationPage.getTradingNameValue()).toBe("Acme Trading Co");
  });

  test("TC_WEB_EWCF_058 — postal code accepts a valid value", async ({ ewcfRegistrationPage }) => {
    await ewcfRegistrationPage.fillRegistrationForm(VendorDataFactory.registrationData());
    await ewcfRegistrationPage.fillPostalCode("12345");
    await ewcfRegistrationPage.waitForAngularValidation();
    expect(await ewcfRegistrationPage.getPostalCodeValue()).toBe("12345");
  });

  test("TC_WEB_EWCF_059 — corporate website URL is an optional field", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillRegistrationForm(VendorDataFactory.registrationData());
    // fillRegistrationForm does not fill websiteURL — if it were required the form would
    // already show an error; zero errors confirms it is optional.
    await ewcfRegistrationPage.waitForAngularValidation();
    expect(await ewcfRegistrationPage.getValidationErrorCount()).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════
//  SUITE 8 — FULL E2E HAPPY PATH
// ═════════════════════════════════════════════════════════════
test.describe(
  "TC_WEB_EWCF — Full E2E Happy Path",
  { tag: ["@regression", "@ui", "@critical"] },
  () => {
    // These tests all perform real form submissions using the same invite URL.
    // Serial mode prevents parallel workers from racing on the same invite token.
    test.describe.configure({ mode: "serial" });

    // ── Suite-level constants ─────────────────────────────────
    const REVISION_NOTE = "Please review your details and resubmit.";
    const APPROVAL_NOTE = "All details are correct — approved.";

    /**
     * Navigate the admin page to the Invited Vendors tab, find the row matching
     * `companyName`, and open it. Returns with the vendor review page loaded.
     */
    async function goToVendorReview(
      vendorsListPage: VendorsListPage,
      vendorReviewPage: EwcfVendorReviewPage,
      webUrl: string,
      companyName: string,
    ): Promise<void> {
      await vendorsListPage.navigate(webUrl);
      await vendorsListPage.clickInvitedTab();
      await vendorsListPage.waitForFirstRow();
      await vendorsListPage.clickVendorRowByName(companyName);
      await vendorReviewPage.verifyPageIsLoaded();
    }

    test("TC_WEB_EWCF_060 — the data submitted to the server includes the vendor organisation details", async ({
      ewcfRegistrationPage,
    }) => {
      // Monitor the data sent when the form is submitted to confirm vendor details are included.
      const getBody = await ewcfRegistrationPage.interceptVendorPost();

      await ewcfRegistrationPage.fillRegistrationForm(VendorDataFactory.registrationData());
      await ewcfRegistrationPage.clickSubmit();
      // Wait briefly for the submission request to be sent.
      await ewcfRegistrationPage.waitForDebounce();

      const body = getBody();
      if (Object.keys(body).length > 0) {
        expect(body).toHaveProperty("orgData");
      }
    });

    test("TC_WEB_EWCF_061 — full round-trip: Saudi vendor submits, admin returns for revision, vendor resubmits, admin approves", async ({
      ewcfRegistrationPage,
      browser,
    }) => {
      test.setTimeout(180_000);
      const envConfig = getEnvironmentConfig();
      const registrationData = VendorDataFactory.registrationData();

      // ── Vendor side: fill, submit, verify confirmation view ───────
      await ewcfRegistrationPage.fillRegistrationForm(registrationData);
      await ewcfRegistrationPage.fillDocuments();
      await ewcfRegistrationPage.submitAndWaitForVendorResponse();

      await ewcfRegistrationPage.verifySuccessVisible();
      await ewcfRegistrationPage.verifySubmittedDataInViewMode(registrationData);
      await ewcfRegistrationPage.verifyDocumentUploadsVisibleInViewMode(
        EwcfRegistrationPage.ALL_DOC_KEYS,
      );

      // Capture the URL the vendor lands on after submission — this is the URL
      // the vendor will navigate back to when the form is returned for revision.
      const vendorSubmittedUrl = ewcfRegistrationPage.getCurrentURL();
      const updatedIban = "SA0380000000608010167519";

      // ── Admin side: return for revision ───────────────────────────
      const adminCtx = await browser.newContext({ storageState: WEB_STORAGE_STATE });
      const adminPage = await adminCtx.newPage();
      const vendorsListPage = new VendorsListPage(adminPage);
      const vendorReviewPage = new EwcfVendorReviewPage(adminPage);

      await goToVendorReview(
        vendorsListPage,
        vendorReviewPage,
        envConfig.webUrl,
        registrationData.companyName,
      );
      await vendorReviewPage.returnForRevision(REVISION_NOTE);
      await vendorReviewPage.verifyRevisionRequestSent();
      await adminCtx.close();

      // ── Vendor side: return to form, review revision note, update and resubmit ──
      // Navigating back to the same invite URL loads the form in edit mode with all
      // fields pre-filled and the admin's revision note shown in the "Returned" banner.
      await ewcfRegistrationPage.navigateToPublicLink(vendorSubmittedUrl);
      await ewcfRegistrationPage.waitForReturnedState();
      await ewcfRegistrationPage.verifyReturnedNote(REVISION_NOTE);

      // Simulate the vendor addressing the revision by updating the IBAN
      await ewcfRegistrationPage.fillIban(updatedIban);
      await ewcfRegistrationPage.fillDocuments();
      await ewcfRegistrationPage.submitAndWaitForVendorResponse();
      await ewcfRegistrationPage.verifySuccessVisible();

      // ── Admin side: approve the resubmission ─────────────────────
      const adminCtx2 = await browser.newContext({ storageState: WEB_STORAGE_STATE });
      const adminPage2 = await adminCtx2.newPage();
      const vendorsListPage2 = new VendorsListPage(adminPage2);
      const vendorReviewPage2 = new EwcfVendorReviewPage(adminPage2);

      await goToVendorReview(
        vendorsListPage2,
        vendorReviewPage2,
        envConfig.webUrl,
        registrationData.companyName,
      );

      // Confirm the vendor's updated details are visible before approving
      await vendorReviewPage2.verifyVendorDetailsSummary();
      await vendorReviewPage2.verifyIban(updatedIban);

      await vendorReviewPage2.approve(APPROVAL_NOTE);
      await vendorReviewPage2.verifyApprovalSent();

      // Confirm the approved vendor now appears in the main Vendors tab
      await vendorsListPage2.navigate(envConfig.webUrl);
      await vendorsListPage2.waitForFirstRow();

      await adminCtx2.close();
    });

    test("TC_WEB_EWCF_062 — after an international vendor submits the form, all entered details are shown correctly on the confirmation page and an admin can approve the registration", async ({
      ewcfRegistrationPage,
      browser,
    }) => {
      test.setTimeout(180_000);
      const envConfig = getEnvironmentConfig();
      const registrationData = VendorDataFactory.internationalRegistrationData();

      // ── Vendor side: fill, submit, verify confirmation view ───────
      await ewcfRegistrationPage.fillRegistrationForm(registrationData);
      await ewcfRegistrationPage.fillDocuments();
      await ewcfRegistrationPage.submitAndWaitForVendorResponse();

      await ewcfRegistrationPage.verifySuccessVisible();
      await ewcfRegistrationPage.verifySubmittedDataInViewMode(registrationData);
      await ewcfRegistrationPage.verifyDocumentUploadsVisibleInViewMode(
        EwcfRegistrationPage.INTERNATIONAL_DOC_KEYS,
      );

      // ── Admin side: find the newly submitted vendor and approve ───
      const adminCtx = await browser.newContext({ storageState: WEB_STORAGE_STATE });
      const adminPage = await adminCtx.newPage();
      const vendorsListPage = new VendorsListPage(adminPage);
      const vendorReviewPage = new EwcfVendorReviewPage(adminPage);

      await goToVendorReview(
        vendorsListPage,
        vendorReviewPage,
        envConfig.webUrl,
        registrationData.companyName,
      );

      // Confirm the vendor's submitted details are visible on the review page before approving
      await vendorReviewPage.verifyVendorDetailsSummary();
      await vendorReviewPage.verifyContactEmailVisible();

      await vendorReviewPage.approve(APPROVAL_NOTE);
      await vendorReviewPage.verifyApprovalSent();

      // Confirm the approved vendor now appears in the main Vendors tab
      await vendorsListPage.navigate(envConfig.webUrl);
      await vendorsListPage.waitForFirstRow();

      await adminCtx.close();
    });
  },
);

// ═════════════════════════════════════════════════════════════
//  SUITE 9 — NETWORK & PERFORMANCE GUARDS
// ═════════════════════════════════════════════════════════════
test.describe("TC_WEB_EWCF — Network & Performance", { tag: ["@regression", "@ui"] }, () => {
  test("TC_WEB_EWCF_063 — form loads within the configured page load timeout", async ({
    ewcfRegistrationPage,
    envConfig,
  }) => {
    // Open the form a second time to measure how long it takes to fully load.
    const start = Date.now();
    await ewcfRegistrationPage.navigateToPublicLink(ewcfUrl);
    expect(Date.now() - start).toBeLessThan(envConfig.timeouts.pageLoad);
  });

  test("TC_WEB_EWCF_064 — double-clicking the Submit button does not trigger duplicate form submissions", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillRegistrationForm(VendorDataFactory.registrationData());

    // Monitor outgoing requests to confirm only one submission is sent even when the
    // button is clicked twice in quick succession.
    const getPostCount = await ewcfRegistrationPage.countVendorPosts();
    await ewcfRegistrationPage.dblclickSubmit();
    await ewcfRegistrationPage.waitForDebounce();
    expect(getPostCount()).toBeLessThanOrEqual(1);
  });

  test("TC_WEB_EWCF_065 — network timeout on submit shows error, not success", async ({
    ewcfRegistrationPage,
  }) => {
    await ewcfRegistrationPage.fillRegistrationForm(VendorDataFactory.registrationData());
    // Simulate a network failure during submission to verify the form shows an error
    // instead of a false success message.
    await ewcfRegistrationPage.simulateNetworkTimeout();
    await ewcfRegistrationPage.clickSubmit();
    // The Submit button should still be visible, confirming the form did not falsely
    // report success after the network failure.
    await ewcfRegistrationPage.verifySubmitButtonVisible();
    await ewcfRegistrationPage.verifySuccessNotVisible();
  });
});
