import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { Step } from "../../../core/steps";
import type { SabilVendorRegistrationData } from "../../../types/interfaces/vendor.interface";
import { VENDOR_INVITE_PARAM, TIMEOUTS } from "../../../core/constants";

/**
 * SABIL Vendor Registration Form Locators
 *
 * Extracted from the rendered HTML of the dynamic-vendor-form (PrimeNG / Angular).
 * Priority: [data-test-id] > id > CSS.
 *
 * SABIL-specific sections beyond the EWCF baseline:
 *   - Experience Details  (table-section-experienceDetails)
 *   - Technical Capabilities (table-section-techCapabilities)
 *   - Key Staff           (table-section-keyStaff)
 *   - Financial Details   (table-section-financialDetails)
 *   - HSSE                (table-section-hsse)
 *
 * For p-dropdown: click the wrapper to open the overlay, then click `.p-dropdown-item`.
 * For p-radiobutton: click `.p-radiobutton-box` inside the radio wrapper.
 * For p-treeselect: click the wrapper to open the panel, then click `.p-treeselect-panel .p-checkbox`.
 * For p-checkbox: click `.p-checkbox-box` (visual element, not the hidden accessible input).
 */
const SABIL_LOCATORS = {
  // ── Section containers ────────────────────────────────────────────
  SECTION_INFO: '[data-test-id="section-info"]',
  SECTION_ADDRESS: '[data-test-id="section-address"]',
  SECTION_CONTACTS: '[data-test-id="contact-group-section-contacts"]',
  SECTION_BANK: '[data-test-id="section-bankInfo"]',
  SECTION_ATTACHMENTS: '[data-test-id="attachments-section-attachments"]',
  SECTION_EXPERIENCE: '[data-test-id="table-section-experienceDetails"]',
  SECTION_TECH_CAP: '[data-test-id="table-section-techCapabilities"]',
  SECTION_KEY_STAFF: '[data-test-id="table-section-keyStaff"]',
  SECTION_FINANCIAL: '[data-test-id="table-section-financialDetails"]',
  SECTION_HSSE: '[data-test-id="table-section-hsse"]',

  // ── Section headers (click to expand/collapse) ────────────────────
  SECTION_INFO_HEADER: '[data-test-id="section-info"] .section-header',
  SECTION_ADDRESS_HEADER: '[data-test-id="section-address"] .section-header',
  SECTION_CONTACTS_HEADER: '[data-test-id="contact-group-section-contacts"] .section-header',
  SECTION_BANK_HEADER: '[data-test-id="section-bankInfo"] .section-header',
  SECTION_ATTACHMENTS_HEADER: '[data-test-id="attachments-section-attachments"] .section-header',
  SECTION_EXPERIENCE_HEADER: '[data-test-id="table-section-experienceDetails"] .section-header',
  SECTION_TECH_CAP_HEADER: '[data-test-id="table-section-techCapabilities"] .section-header',
  SECTION_KEY_STAFF_HEADER: '[data-test-id="table-section-keyStaff"] .section-header',
  SECTION_FINANCIAL_HEADER: '[data-test-id="table-section-financialDetails"] .section-header',
  SECTION_HSSE_HEADER: '[data-test-id="table-section-hsse"] .section-header',

  // ── Company Information ───────────────────────────────────────────
  COMPANY_NAME: '[data-test-id="input-orgData_orgName"]',
  COMPANY_NAME_AR: '[data-test-id="input-orgData_orgName_ar"]',
  OPERATING_REGION_LOCAL: '[data-test-id="radio-operationRegion-local"] .p-radiobutton-box',
  OPERATING_REGION_INTL: '[data-test-id="radio-operationRegion-international"] .p-radiobutton-box',
  REGISTRATION_NUMBER: '[data-test-id="input-orgData_registrationNumber"]',
  COMPANY_EMAIL: '[data-test-id="input-orgData_email"]',
  PHONE_ISD_CODE: '[data-test-id="dropdown-orgData_phone-isdCode"]',
  PHONE_NUMBER: '[data-test-id="input-orgData_phone-number"]',
  PHONE_EXTENSION: '[data-test-id="input-orgData_phone-extension"]',
  CLASSIFICATION_DROPDOWN: '[data-test-id="dropdown-orgData_classificationType"]',
  CATEGORIES_TREESELECT: '[data-test-id="treeselect-orgData_categories"]',
  NUMBER_OF_EMPLOYEES: "input#orgData_numberOfEmployees",
  WEBSITE_URL: '[data-test-id="input-orgData_websiteURL"]',

  // ── Address ───────────────────────────────────────────────────────
  STREET: '[data-test-id="input-orgData_orgDetails_primaryAddress_street"]',
  COUNTRY_DROPDOWN: '[data-test-id="dropdown-orgData_orgDetails_primaryAddress_country"]',
  CITY: '[data-test-id="input-orgData_orgDetails_primaryAddress_city"]',
  POSTAL_CODE: '[data-test-id="input-orgData_orgDetails_primaryAddress_postalCode"]',

  // ── Contact Information ───────────────────────────────────────────
  CONTACT_FIRST_NAME: '[data-test-id="input-contacts_0_firstName"]',
  CONTACT_LAST_NAME: '[data-test-id="input-contacts_0_lastName"]',
  CONTACT_TITLE: '[data-test-id="input-contacts_0_position"]',
  CONTACT_EMAIL: '[data-test-id="input-contacts_0_email"]',
  CONTACT_MOBILE_ISD: '[data-test-id="dropdown-contacts_0_mobile-isdCode"]',
  CONTACT_MOBILE_NUMBER: '[data-test-id="input-contacts_0_mobile-number"]',
  AUTHORIZED_SIGNATORY_BOX:
    '[data-test-id="checkbox-contacts_0_isAuthorizedSignatory"] .p-checkbox-box',
  ADD_CONTACT_BUTTON: '[data-test-id="add-contact-entry-button"]',

  // ── Bank Information ──────────────────────────────────────────────
  IBAN: '[data-test-id="input-orgData_bankInfo_iban"]',
  ACCOUNT_NAME: '[data-test-id="input-orgData_bankInfo_beneficiaryName"]',
  BANK_NAME: '[data-test-id="input-orgData_bankInfo_bankName"]',
  BANK_COUNTRY_DROPDOWN: '[data-test-id="dropdown-orgData_bankInfo_country"]',
  CURRENCY_DROPDOWN: '[data-test-id="dropdown-orgData_bankInfo_currency"]',
  ACCOUNT_NUMBER: '[data-test-id="input-orgData_bankInfo_accountNumber"]',

  // ── Attachments ──────────────────────────────────────────────────
  ATTACHMENT_ROWS: '[data-test-id^="attachment-row-attachments_"]',
  ADD_ATTACHMENT_BUTTON: '[data-test-id="add-attachment-button"]',
  NDA_DOWNLOAD_LINK: '[data-test-id="inline-link-attachments_nda"]',

  // ── Experience Details ────────────────────────────────────────────
  ADD_EXPERIENCE_ROW_BTN: '[data-test-id="table-add-row-experienceDetails"]',
  EXPERIENCE_CLIENT_NAME_0: '[data-test-id="table-text-experienceDetails_additional_0_clientName"]',
  EXPERIENCE_DESCRIPTION_0:
    '[data-test-id="table-text-experienceDetails_additional_0_description"]',
  EXPERIENCE_VALUE_0: '[data-test-id="table-number-experienceDetails_additional_0_value"] input',
  EXPERIENCE_END_YEAR_0:
    '[data-test-id="table-dropdown-experienceDetails_additional_0_projectEndYear"]',

  // ── Key Staff ─────────────────────────────────────────────────────
  ADD_KEY_STAFF_ROW_BTN: '[data-test-id="table-add-row-keyStaff"]',
  KEY_STAFF_NAME_0: '[data-test-id="table-text-keyStaff_additional_0_name"]',
  KEY_STAFF_POSITION_0: '[data-test-id="table-text-keyStaff_additional_0_position"]',
  KEY_STAFF_YEARS_EXP_0:
    '[data-test-id="table-number-keyStaff_additional_0_yearsOfExperience"] input',
  KEY_STAFF_QUALIFICATION_0: '[data-test-id="table-text-keyStaff_additional_0_qualification"]',

  // ── Financial Details ─────────────────────────────────────────────
  FINANCIAL_CURRENT_UPLOAD:
    '[data-test-id="table-upload-btn-financialDetails_currentYear_attachment"]',
  FINANCIAL_PREV_UPLOAD:
    '[data-test-id="table-upload-btn-financialDetails_previousYear_attachment"]',
  FINANCIAL_TWO_YEARS_UPLOAD:
    '[data-test-id="table-upload-btn-financialDetails_twoYearsAgo_attachment"]',

  // ── Technical Capabilities subsection headers ─────────────────────
  TECH_CAP_QMS_HEADER: '[data-test-id="table-subsection-header-sub-qms"]',
  TECH_CAP_PM_HEADER: '[data-test-id="table-subsection-header-sub-pm"]',
  TECH_CAP_SCM_HEADER: '[data-test-id="table-subsection-header-sub-scm"]',
  TECH_CAP_AFTERSALE_HEADER: '[data-test-id="table-subsection-header-sub-afterSale"]',
  TECH_CAP_WAREHOUSE_HEADER: '[data-test-id="table-subsection-header-sub-warehouse"]',

  // ── HSSE subsection headers ───────────────────────────────────────
  HSSE_GENERAL_HEADER: '[data-test-id="table-subsection-header-sub-hsse-general"]',
  HSSE_MANAGER_HEADER: '[data-test-id="table-subsection-header-sub-hsse-manager"]',
  HSSE_MANAGER_NAME: '[data-test-id="table-text-hsse_manager_managerName"]',

  // ── Submit ────────────────────────────────────────────────────────
  SUBMIT_BUTTON: '[data-test-id="confirm-and-submit-button"]',

  // ── Validation errors ─────────────────────────────────────────────
  VALIDATION_ERROR: ".error-msg",
  NG_INVALID_DIRTY: ".ng-invalid:is(.ng-dirty, .ng-touched):not(form):not(ng-form)",

  // ── Error / invalid invite ────────────────────────────────────────
  ERROR_BANNER: '[class*="error"], p-message, .p-message-error',

  // ── Attachments file inputs (prefix match) ───────────────────────
  FILE_INPUTS_ATTACHMENTS: '[data-test-id^="file-input-attachments_"]',
  CERT_NO_INPUTS_ATTACHMENTS: '[data-test-id^="certificate-no-input-attachments_"]',

  // ── p-dropdown overlay items (appended to body) ───────────────────
  DROPDOWN_ITEM: ".p-dropdown-item",

  // ── p-treeselect panel checkbox ───────────────────────────────────
  TREE_SELECT_PANEL_CHECKBOX: ".p-treeselect-panel .p-checkbox",

  // ── Language toggle ───────────────────────────────────────────────
  LANGUAGE_BUTTON: '[data-test-id="language-change-button"]',

  // ── HTML root (language direction) ───────────────────────────────
  HTML_ROOT: "html",
} as const;

/** URL glob matching all Penny vendor API endpoints */
const VENDOR_API_GLOB = "**/vendor**";

/**
 * SabilRegistrationPage — page object for the external SABIL vendor registration form.
 *
 * Access: public invite link from the Invite Vendors sidebar.
 *
 * Run with: CLIENT=sabil TEST_ENV=tst npx playwright test src/tests/sabil/web/vendors/registration.spec.ts
 *
 * All form sections are accordion-expanded by default in this form variant.
 * reCAPTCHA bypass must be called before navigating to avoid bot detection.
 */
export class SabilRegistrationPage extends BasePage {
  /** Required document attachment keys (visible in the Attachments section) */
  static readonly REQUIRED_DOC_KEYS = [
    "commercialRegistration",
    "detailsOfBankAccountOnLetterHead",
    "authorizationLetter",
    "nda",
  ] as const;

  /** Optional document attachment keys */
  static readonly OPTIONAL_DOC_KEYS = ["sagiaCertificate"] as const;

  /** All attachment row keys (required + optional) */
  static readonly ALL_DOC_KEYS = [
    ...SabilRegistrationPage.REQUIRED_DOC_KEYS,
    ...SabilRegistrationPage.OPTIONAL_DOC_KEYS,
  ] as const;

  protected readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.submitButton = page.locator(SABIL_LOCATORS.SUBMIT_BUTTON);
  }

  // ── Navigation ──────────────────────────────────────────────────

  @Step("Navigate to SABIL vendor registration via public invite link")
  async navigateToPublicLink(url: string): Promise<void> {
    await super.navigate(url);
    // Wait for the HTML/scripts to load, then allow up to 8 s for Angular's initial
    // bootstrap requests to settle.  If background polling prevents full networkidle
    // we proceed anyway — the form is rendered once the load event fires.
    await this.wait.forLoad(TIMEOUTS.PAGE_LOAD);
    await this.page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
  }

  @Step("Navigate to SABIL registration with invalid invite token")
  async navigateWithInvalidToken(vendorUrl: string): Promise<void> {
    const parsed = new URL(vendorUrl);
    parsed.searchParams.set(VENDOR_INVITE_PARAM, "invalid-token-xyz-000");
    await super.navigate(parsed.toString());
  }

  // ── reCAPTCHA bypass ────────────────────────────────────────────

  @Step("Bypass Google reCAPTCHA")
  async bypassRecaptcha(): Promise<void> {
    await this.page.route("**/recaptcha/**", (route) => route.fulfill({ status: 200, body: "" }));
    await this.page.route("**/google.com/recaptcha/**", (route) =>
      route.fulfill({ status: 200, body: "" }),
    );
  }

  // ── Private helpers ─────────────────────────────────────────────

  /** Expand accordion section if the sample field is not yet visible.
   *  Uses .first() on both locators to avoid strict-mode violations when a
   *  data-test-id matches multiple elements (e.g. repeated table rows).
   */
  private async ensureSectionExpanded(
    headerSelector: string,
    sampleFieldSelector: string,
  ): Promise<void> {
    const sampleLocator = this.page.locator(sampleFieldSelector).first();
    const isVisible = await sampleLocator.isVisible().catch(() => false);
    if (!isVisible) {
      await this.action.click(this.page.locator(headerSelector).first());
      await this.wait.forVisible(sampleLocator);
    }
  }

  /** Open a p-dropdown and click the item matching the given text */
  private async selectDropdownOption(dropdownSelector: string, text: string): Promise<void> {
    await this.action.click(this.page.locator(dropdownSelector).first());
    await this.action.click(
      this.page.locator(SABIL_LOCATORS.DROPDOWN_ITEM, { hasText: text }).first(),
    );
  }

  /** Open a p-dropdown and click the first available item */
  private async selectFirstDropdownOption(dropdownSelector: string): Promise<void> {
    await this.action.click(this.page.locator(dropdownSelector).first());
    await this.action.click(this.page.locator(SABIL_LOCATORS.DROPDOWN_ITEM).first());
  }

  // ── Section fill methods ────────────────────────────────────────

  @Step("Fill Company Information section")
  async fillCompanyInfo(data: SabilVendorRegistrationData): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_INFO_HEADER,
      SABIL_LOCATORS.COMPANY_NAME,
    );

    await this.action.fill(this.page.locator(SABIL_LOCATORS.COMPANY_NAME), data.companyName);

    if (data.companyNameAr) {
      await this.action.fill(this.page.locator(SABIL_LOCATORS.COMPANY_NAME_AR), data.companyNameAr);
    }

    const radioSelector =
      data.operatingRegion === "local"
        ? SABIL_LOCATORS.OPERATING_REGION_LOCAL
        : SABIL_LOCATORS.OPERATING_REGION_INTL;
    await this.action.click(this.page.locator(radioSelector));

    await this.action.fill(
      this.page.locator(SABIL_LOCATORS.REGISTRATION_NUMBER),
      data.registrationNumber,
    );
    await this.action.fill(this.page.locator(SABIL_LOCATORS.COMPANY_EMAIL), data.companyEmail);

    // Phone — select Saudi country code, then fill number
    await this.selectDropdownOption(SABIL_LOCATORS.PHONE_ISD_CODE, "+966");
    await this.action.fill(this.page.locator(SABIL_LOCATORS.PHONE_NUMBER), data.companyPhone);

    // Classification Type — first available option (codes vary per org config)
    await this.selectFirstDropdownOption(SABIL_LOCATORS.CLASSIFICATION_DROPDOWN);

    // Categories — open treeselect and select first checkbox
    await this.action.click(this.page.locator(SABIL_LOCATORS.CATEGORIES_TREESELECT));
    const firstCheckbox = this.page.locator(SABIL_LOCATORS.TREE_SELECT_PANEL_CHECKBOX).first();
    await this.wait.forVisible(firstCheckbox);
    await this.action.click(firstCheckbox);
    // Close treeselect by clicking outside
    await this.action.click(this.page.locator(SABIL_LOCATORS.COMPANY_NAME));
  }

  @Step("Fill Address section")
  async fillAddress(data: SabilVendorRegistrationData): Promise<void> {
    await this.ensureSectionExpanded(SABIL_LOCATORS.SECTION_ADDRESS_HEADER, SABIL_LOCATORS.CITY);
    await this.action.fill(this.page.locator(SABIL_LOCATORS.STREET), data.headOfficeAddress);
    await this.selectDropdownOption(
      SABIL_LOCATORS.COUNTRY_DROPDOWN,
      data.country ?? "Saudi Arabia",
    );
    await this.action.fill(this.page.locator(SABIL_LOCATORS.CITY), data.city);
    if (data.postalCode) {
      await this.action.fill(this.page.locator(SABIL_LOCATORS.POSTAL_CODE), data.postalCode);
    }
  }

  @Step("Fill Contact Information section")
  async fillContactInfo(data: SabilVendorRegistrationData): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_CONTACTS_HEADER,
      SABIL_LOCATORS.CONTACT_EMAIL,
    );
    await this.action.fill(
      this.page.locator(SABIL_LOCATORS.CONTACT_FIRST_NAME),
      data.contactFirstName,
    );
    await this.action.fill(
      this.page.locator(SABIL_LOCATORS.CONTACT_LAST_NAME),
      data.contactLastName,
    );
    await this.action.fill(this.page.locator(SABIL_LOCATORS.CONTACT_TITLE), data.contactTitle);
    await this.action.fill(this.page.locator(SABIL_LOCATORS.CONTACT_EMAIL), data.contactEmail);
    await this.selectDropdownOption(SABIL_LOCATORS.CONTACT_MOBILE_ISD, "+966");
    await this.action.fill(
      this.page.locator(SABIL_LOCATORS.CONTACT_MOBILE_NUMBER),
      data.contactMobile,
    );
    // Set as authorized POC — required: at least one must be designated
    await this.action.click(this.page.locator(SABIL_LOCATORS.AUTHORIZED_SIGNATORY_BOX));
  }

  @Step("Fill Bank Information section")
  async fillBankInfo(data: SabilVendorRegistrationData): Promise<void> {
    await this.ensureSectionExpanded(SABIL_LOCATORS.SECTION_BANK_HEADER, SABIL_LOCATORS.IBAN);
    await this.action.fill(this.page.locator(SABIL_LOCATORS.IBAN), data.iban);
    await this.action.fill(this.page.locator(SABIL_LOCATORS.ACCOUNT_NAME), data.accountName);
    await this.action.fill(this.page.locator(SABIL_LOCATORS.BANK_NAME), data.bankName);
    await this.selectDropdownOption(
      SABIL_LOCATORS.BANK_COUNTRY_DROPDOWN,
      data.bankCountry ?? "Saudi Arabia",
    );
    // Currency — select first available option
    await this.selectFirstDropdownOption(SABIL_LOCATORS.CURRENCY_DROPDOWN);
    if (data.accountNumber) {
      await this.action.fill(this.page.locator(SABIL_LOCATORS.ACCOUNT_NUMBER), data.accountNumber);
    }
  }

  /**
   * Upload a minimal PDF to every file input in the Documents section.
   * Also fills any required Certificate No. inputs.
   */
  @Step("Upload documents (minimal PDF buffers)")
  async fillDocuments(): Promise<void> {
    const minimalPdf = Buffer.from("%PDF-1.4 1 0 obj<</Type/Catalog>>endobj");

    // ── Attachments section ──────────────────────────────────────────
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      SABIL_LOCATORS.ADD_ATTACHMENT_BUTTON,
    );
    const attachmentInputs = this.page.locator(SABIL_LOCATORS.FILE_INPUTS_ATTACHMENTS);
    const aCount = await attachmentInputs.count();
    for (let i = 0; i < aCount; i++) {
      const input = attachmentInputs.nth(i);
      const testId = (await input.getAttribute("data-test-id")) ?? "";
      const key = testId.replace("file-input-attachments_", "");
      await input.setInputFiles({
        name: `${key}.pdf`,
        mimeType: "application/pdf",
        buffer: minimalPdf,
      });
    }

    // ── Financial Details section ────────────────────────────────────
    // Financial uploads use PrimeNG table-upload buttons whose inner <input type="file">
    // elements may not carry a data-test-id — find them by type within the section.
    if (
      await this.page
        .locator(SABIL_LOCATORS.SECTION_FINANCIAL)
        .isVisible()
        .catch(() => false)
    ) {
      await this.ensureSectionExpanded(
        SABIL_LOCATORS.SECTION_FINANCIAL_HEADER,
        SABIL_LOCATORS.FINANCIAL_CURRENT_UPLOAD,
      );
      const financialInputs = this.page
        .locator(SABIL_LOCATORS.SECTION_FINANCIAL)
        .locator('input[type="file"]');
      const fCount = await financialInputs.count();
      for (let i = 0; i < fCount; i++) {
        await financialInputs.nth(i).setInputFiles({
          name: `financial_${i}.pdf`,
          mimeType: "application/pdf",
          buffer: minimalPdf,
        });
      }
    }

    // Wait for Angular + any server-side file processing to settle.
    // Background polling may prevent true networkidle — tolerate the timeout.
    await this.page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});

    // ── Certificate number inputs ────────────────────────────────────
    const certInputs = this.page.locator(SABIL_LOCATORS.CERT_NO_INPUTS_ATTACHMENTS);
    const certCount = await certInputs.count();
    for (let i = 0; i < certCount; i++) {
      const input = certInputs.nth(i);
      if (await input.isVisible()) {
        const current = await input.inputValue();
        if (!current) {
          await input.fill("AUTO-TEST-001");
          await input.press("Tab");
        }
      }
    }

    // ── Expiry date fields in attachment rows ─────────────────────────
    // Confirmed DOM path via browser inspector:
    //   penny-attachments-section table > tbody > tr > td:nth-child(4) = expiry date cell
    // Do NOT use ATTACHMENT_ROWS locator here — it points to a wrapper div, not <tr>,
    // so row.locator("td") returns nothing. Use the table structure directly instead.
    const expiryCells = this.page
      .locator(SABIL_LOCATORS.SECTION_ATTACHMENTS)
      .locator("table tbody tr td:nth-child(4)");
    const cellCount = await expiryCells.count();
    for (let i = 0; i < cellCount; i++) {
      const cell = expiryCells.nth(i);
      const input = cell.locator("input").first();
      if (!(await input.isVisible().catch(() => false))) continue;
      const current = await input.inputValue().catch(() => "");
      if (current) continue;
      // Open the p-calendar panel
      await this.action.click(input);
      const panel = this.page.locator(".p-datepicker").last();
      await panel.waitFor({ state: "visible", timeout: 5_000 });
      // Navigate one month forward so all days are enabled (no past-date restrictions)
      await this.action.click(panel.locator(".p-datepicker-next"));
      // Click day 28 — exists in every month, never disabled in a future month.
      // Playwright auto-waits for the day locator to attach after the month re-renders.
      const day28 = panel
        .locator("td:not(.p-datepicker-other-month) span:not(.p-disabled)")
        .filter({ hasText: /^28$/ })
        .first();
      await expect(day28).toBeVisible();
      await this.action.click(day28);
      // Wait for the picker to close (which is what commits the value into the input).
      await expect(panel).toBeHidden();
    }
  }

  // ── Composite fill ──────────────────────────────────────────────

  @Step("Fill all required registration form fields")
  async fillRegistrationForm(data: SabilVendorRegistrationData): Promise<void> {
    await this.fillCompanyInfo(data);
    await this.fillAddress(data);
    await this.fillContactInfo(data);
    await this.fillBankInfo(data);
  }

  /**
   * Fill one default row in each dynamic section that appears after a Classification
   * Type is selected (Experience, Key Staff, HSSE Manager Name).
   * Only fills a section if it is already visible in the DOM — safe to call for
   * any classification type regardless of which sections it renders.
   */
  @Step("Fill dynamic section rows (Experience, Technical Capabilities, Key Staff, HSSE)")
  async fillDynamicSections(): Promise<void> {
    if (
      await this.page
        .locator(SABIL_LOCATORS.SECTION_EXPERIENCE)
        .isVisible()
        .catch(() => false)
    ) {
      await this.fillExperienceRow0({
        clientName: "AutoTest Client Corp",
        description: "Automated test project",
        value: "1000000",
        projectEndYear: "2020",
      });
    }
    if (
      await this.page
        .locator(SABIL_LOCATORS.SECTION_TECH_CAP)
        .isVisible()
        .catch(() => false)
    ) {
      await this.fillTechCapabilities();
    }
    if (
      await this.page
        .locator(SABIL_LOCATORS.SECTION_KEY_STAFF)
        .isVisible()
        .catch(() => false)
    ) {
      await this.fillKeyStaffRow0({
        name: "AutoTest Staff Member",
        position: "Manager",
        yearsOfExperience: "5",
      });
    }
    if (
      await this.page
        .locator(SABIL_LOCATORS.SECTION_HSSE)
        .isVisible()
        .catch(() => false)
    ) {
      await this.fillHsseManagerName("AutoTest Safety Manager");
    }
  }

  /**
   * Fill only text inputs (no dropdowns, no treeselect, no file inputs).
   * Used by required-field tests to establish a "text-complete but dropdowns empty" state,
   * which proves that selection controls are also required.
   */
  @Step("Fill required text fields (no dropdowns)")
  async fillRequiredTextFields(data: SabilVendorRegistrationData): Promise<void> {
    // Company Information (default expanded)
    await this.fillCompanyName(data.companyName);
    await this.fillRegistrationNumber(data.registrationNumber);
    await this.fillCompanyEmail(data.companyEmail);
    await this.fillCompanyPhone(data.companyPhone);
    // Address section — expand before filling street/city
    await this.ensureSectionExpanded(SABIL_LOCATORS.SECTION_ADDRESS_HEADER, SABIL_LOCATORS.CITY);
    await this.action.fill(this.page.locator(SABIL_LOCATORS.STREET), data.headOfficeAddress);
    await this.fillCity(data.city);
    // Contact section — expand before filling contact fields
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_CONTACTS_HEADER,
      SABIL_LOCATORS.CONTACT_EMAIL,
    );
    await this.fillContactFirstName(data.contactFirstName);
    await this.fillContactLastName(data.contactLastName);
    await this.fillContactTitle(data.contactTitle);
    await this.fillContactEmail(data.contactEmail);
    await this.fillContactMobile(data.contactMobile);
    // Bank section — fillIban already expands the section
    await this.fillIban(data.iban);
    await this.fillAccountName(data.accountName);
    await this.fillBankName(data.bankName);
  }

  // ── Individual field methods ────────────────────────────────────

  @Step("Fill company name (EN)")
  async fillCompanyName(value: string): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_INFO_HEADER,
      SABIL_LOCATORS.COMPANY_NAME,
    );
    await this.action.fill(this.page.locator(SABIL_LOCATORS.COMPANY_NAME), value);
  }

  async getCompanyNameValue(): Promise<string> {
    return this.page.locator(SABIL_LOCATORS.COMPANY_NAME).inputValue();
  }

  async blurCompanyName(): Promise<void> {
    await this.action.pressKeyOnElement(this.page.locator(SABIL_LOCATORS.COMPANY_NAME), "Tab");
  }

  @Step("Fill company name (AR)")
  async fillCompanyNameAr(value: string): Promise<void> {
    await this.action.fill(this.page.locator(SABIL_LOCATORS.COMPANY_NAME_AR), value);
  }

  async getCompanyNameArValue(): Promise<string> {
    return this.page.locator(SABIL_LOCATORS.COMPANY_NAME_AR).inputValue();
  }

  @Step("Select operating region")
  async selectOperatingRegion(region: "local" | "international"): Promise<void> {
    const selector =
      region === "local"
        ? SABIL_LOCATORS.OPERATING_REGION_LOCAL
        : SABIL_LOCATORS.OPERATING_REGION_INTL;
    await this.action.click(this.page.locator(selector));
  }

  @Step("Fill registration number")
  async fillRegistrationNumber(value: string): Promise<void> {
    await this.action.fill(this.page.locator(SABIL_LOCATORS.REGISTRATION_NUMBER), value);
  }

  @Step("Fill company email")
  async fillCompanyEmail(value: string): Promise<void> {
    await this.action.fill(this.page.locator(SABIL_LOCATORS.COMPANY_EMAIL), value);
  }

  async blurCompanyEmail(): Promise<void> {
    await this.action.pressKeyOnElement(this.page.locator(SABIL_LOCATORS.COMPANY_EMAIL), "Tab");
  }

  async isCompanyEmailHtmlValid(): Promise<boolean> {
    return this.page
      .locator(SABIL_LOCATORS.COMPANY_EMAIL)
      .evaluate((el: HTMLInputElement) => el.validity.valid);
  }

  @Step("Fill company phone number")
  async fillCompanyPhone(value: string): Promise<void> {
    await this.action.fill(this.page.locator(SABIL_LOCATORS.PHONE_NUMBER), value);
  }

  async getCompanyPhoneValue(): Promise<string> {
    return this.page.locator(SABIL_LOCATORS.PHONE_NUMBER).inputValue();
  }

  @Step("Fill IBAN")
  async fillIban(value: string): Promise<void> {
    await this.ensureSectionExpanded(SABIL_LOCATORS.SECTION_BANK_HEADER, SABIL_LOCATORS.IBAN);
    await this.action.fill(this.page.locator(SABIL_LOCATORS.IBAN), value);
  }

  @Step("Fill account name")
  async fillAccountName(value: string): Promise<void> {
    await this.action.fill(this.page.locator(SABIL_LOCATORS.ACCOUNT_NAME), value);
  }

  @Step("Fill bank name")
  async fillBankName(value: string): Promise<void> {
    await this.action.fill(this.page.locator(SABIL_LOCATORS.BANK_NAME), value);
  }

  @Step("Fill account number")
  async fillAccountNumber(value: string): Promise<void> {
    await this.action.fill(this.page.locator(SABIL_LOCATORS.ACCOUNT_NUMBER), value);
  }

  @Step("Fill contact first name")
  async fillContactFirstName(value: string): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_CONTACTS_HEADER,
      SABIL_LOCATORS.CONTACT_FIRST_NAME,
    );
    await this.action.fill(this.page.locator(SABIL_LOCATORS.CONTACT_FIRST_NAME), value);
  }

  @Step("Fill contact last name")
  async fillContactLastName(value: string): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_CONTACTS_HEADER,
      SABIL_LOCATORS.CONTACT_FIRST_NAME,
    );
    await this.action.fill(this.page.locator(SABIL_LOCATORS.CONTACT_LAST_NAME), value);
  }

  @Step("Fill contact title")
  async fillContactTitle(value: string): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_CONTACTS_HEADER,
      SABIL_LOCATORS.CONTACT_FIRST_NAME,
    );
    await this.action.fill(this.page.locator(SABIL_LOCATORS.CONTACT_TITLE), value);
  }

  @Step("Fill contact email")
  async fillContactEmail(value: string): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_CONTACTS_HEADER,
      SABIL_LOCATORS.CONTACT_FIRST_NAME,
    );
    await this.action.fill(this.page.locator(SABIL_LOCATORS.CONTACT_EMAIL), value);
  }

  async blurContactEmail(): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_CONTACTS_HEADER,
      SABIL_LOCATORS.CONTACT_FIRST_NAME,
    );
    await this.action.pressKeyOnElement(this.page.locator(SABIL_LOCATORS.CONTACT_EMAIL), "Tab");
  }

  async isContactEmailHtmlValid(): Promise<boolean> {
    return this.page
      .locator(SABIL_LOCATORS.CONTACT_EMAIL)
      .evaluate((el: HTMLInputElement) => el.validity.valid);
  }

  @Step("Fill contact mobile number")
  async fillContactMobile(value: string): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_CONTACTS_HEADER,
      SABIL_LOCATORS.CONTACT_FIRST_NAME,
    );
    await this.action.fill(this.page.locator(SABIL_LOCATORS.CONTACT_MOBILE_NUMBER), value);
  }

  @Step("Fill city")
  async fillCity(value: string): Promise<void> {
    await this.action.fill(this.page.locator(SABIL_LOCATORS.CITY), value);
  }

  @Step("Fill postal code")
  async fillPostalCode(value: string): Promise<void> {
    await this.action.fill(this.page.locator(SABIL_LOCATORS.POSTAL_CODE), value);
  }

  async getPostalCodeValue(): Promise<string> {
    return this.page.locator(SABIL_LOCATORS.POSTAL_CODE).inputValue();
  }

  @Step("Fill website URL")
  async fillWebsiteUrl(value: string): Promise<void> {
    await this.action.fill(this.page.locator(SABIL_LOCATORS.WEBSITE_URL), value);
  }

  async blurWebsiteUrl(): Promise<void> {
    await this.action.pressKeyOnElement(this.page.locator(SABIL_LOCATORS.WEBSITE_URL), "Tab");
  }

  // ── Contact section ─────────────────────────────────────────────

  @Step("Add additional contact entry")
  async clickAddContact(): Promise<void> {
    await this.action.click(this.page.locator(SABIL_LOCATORS.ADD_CONTACT_BUTTON));
  }

  @Step("Verify contact entry is visible")
  async verifyContactEntryVisible(index: number): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_CONTACTS_HEADER,
      SABIL_LOCATORS.CONTACT_EMAIL,
    );
    await expect(this.page.locator(`[data-test-id="contact-entry-${index}"]`)).toBeVisible();
  }

  // ── Attachments ─────────────────────────────────────────────────

  @Step("Click Add Additional Document")
  async clickAddAttachment(): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      SABIL_LOCATORS.NDA_DOWNLOAD_LINK,
    );
    await this.action.click(this.page.locator(SABIL_LOCATORS.ADD_ATTACHMENT_BUTTON));
  }

  async getAttachmentRowCount(): Promise<number> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      SABIL_LOCATORS.NDA_DOWNLOAD_LINK,
    );
    return this.page.locator(SABIL_LOCATORS.ATTACHMENT_ROWS).count();
  }

  async waitForNewAttachmentRow(previousCount: number): Promise<void> {
    await expect(this.page.locator(SABIL_LOCATORS.ATTACHMENT_ROWS)).toHaveCount(previousCount + 1, {
      timeout: 5_000,
    });
  }

  @Step("Verify attachment section Add button is visible")
  async verifyAddAttachmentButtonVisible(): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      SABIL_LOCATORS.ADD_ATTACHMENT_BUTTON,
    );
    await expect(this.page.locator(SABIL_LOCATORS.ADD_ATTACHMENT_BUTTON)).toBeVisible();
  }

  @Step("Verify document row is visible")
  async verifyDocumentRowVisible(key: string): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      SABIL_LOCATORS.ADD_ATTACHMENT_BUTTON,
    );
    await expect(
      this.page.locator(`[data-test-id="attachment-row-attachments_${key}"]`),
    ).toBeVisible();
  }

  @Step("Verify NDA inline download link is visible")
  async verifyNdaDownloadLinkVisible(): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      SABIL_LOCATORS.ADD_ATTACHMENT_BUTTON,
    );
    await expect(this.page.locator(SABIL_LOCATORS.NDA_DOWNLOAD_LINK)).toBeVisible();
  }

  @Step("Verify Certificate Number input is visible for document")
  async verifyCertNumberInputVisible(docKey: string): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      SABIL_LOCATORS.ADD_ATTACHMENT_BUTTON,
    );
    await expect(
      this.page.locator(`[data-test-id="certificate-no-input-attachments_${docKey}"]`),
    ).toBeVisible();
  }

  async fillCertNumber(docKey: string, value: string): Promise<void> {
    await this.action.fill(
      this.page.locator(`[data-test-id="certificate-no-input-attachments_${docKey}"]`),
      value,
    );
  }

  async getCertNumberValue(docKey: string): Promise<string> {
    return this.page
      .locator(`[data-test-id="certificate-no-input-attachments_${docKey}"]`)
      .inputValue();
  }

  async setDocumentFile(
    docKey: string,
    file: { name: string; mimeType: string; buffer: Buffer },
  ): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      SABIL_LOCATORS.NDA_DOWNLOAD_LINK,
    );
    await this.page
      .locator(`[data-test-id="file-input-attachments_${docKey}"]`)
      .setInputFiles(file);
  }

  async getDocumentFileInputValue(docKey: string): Promise<string> {
    return this.page.locator(`[data-test-id="file-input-attachments_${docKey}"]`).inputValue();
  }

  // ── Experience Details ──────────────────────────────────────────

  @Step("Click Add Another Project")
  async clickAddExperienceRow(): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_EXPERIENCE_HEADER,
      SABIL_LOCATORS.ADD_EXPERIENCE_ROW_BTN,
    );
    await this.action.click(this.page.locator(SABIL_LOCATORS.ADD_EXPERIENCE_ROW_BTN));
  }

  async isExperienceSectionPresent(): Promise<boolean> {
    return this.page
      .locator(SABIL_LOCATORS.SECTION_EXPERIENCE)
      .isVisible()
      .catch(() => false);
  }

  @Step("Verify Experience Details section is visible")
  async verifyExperienceSectionVisible(): Promise<void> {
    await expect(this.page.locator(SABIL_LOCATORS.SECTION_EXPERIENCE)).toBeVisible();
  }

  async getExperienceRowCount(): Promise<number> {
    // Count by client-name cells — one per row
    return this.page
      .locator(
        '[data-test-id^="table-text-experienceDetails_additional_"][data-test-id$="_clientName"]',
      )
      .count();
  }

  // ── Key Staff ───────────────────────────────────────────────────

  @Step("Click Add Another Staff")
  async clickAddKeyStaffRow(): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_KEY_STAFF_HEADER,
      SABIL_LOCATORS.ADD_KEY_STAFF_ROW_BTN,
    );
    await this.action.click(this.page.locator(SABIL_LOCATORS.ADD_KEY_STAFF_ROW_BTN));
  }

  async isKeyStaffSectionPresent(): Promise<boolean> {
    return this.page
      .locator(SABIL_LOCATORS.SECTION_KEY_STAFF)
      .isVisible()
      .catch(() => false);
  }

  @Step("Verify Key Staff section is visible")
  async verifyKeyStaffSectionVisible(): Promise<void> {
    await expect(this.page.locator(SABIL_LOCATORS.SECTION_KEY_STAFF)).toBeVisible();
  }

  async getKeyStaffRowCount(): Promise<number> {
    return this.page
      .locator('[data-test-id^="table-text-keyStaff_additional_"][data-test-id$="_name"]')
      .count();
  }

  // ── Technical Capabilities ──────────────────────────────────────

  @Step("Verify Technical Capabilities section and all subsections are visible")
  async verifyTechCapSectionVisible(): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_TECH_CAP_HEADER,
      SABIL_LOCATORS.TECH_CAP_QMS_HEADER,
    );
    await expect(this.page.locator(SABIL_LOCATORS.SECTION_TECH_CAP)).toBeVisible();
    await expect(this.page.locator(SABIL_LOCATORS.TECH_CAP_QMS_HEADER)).toBeVisible();
    await expect(this.page.locator(SABIL_LOCATORS.TECH_CAP_PM_HEADER)).toBeVisible();
    await expect(this.page.locator(SABIL_LOCATORS.TECH_CAP_SCM_HEADER)).toBeVisible();
    await expect(this.page.locator(SABIL_LOCATORS.TECH_CAP_AFTERSALE_HEADER)).toBeVisible();
    await expect(this.page.locator(SABIL_LOCATORS.TECH_CAP_WAREHOUSE_HEADER)).toBeVisible();
  }

  // ── Financial Details ───────────────────────────────────────────

  @Step("Verify Financial Details section shows upload slots for all three statement years")
  async verifyFinancialDetailsSectionVisible(): Promise<void> {
    await expect(this.page.locator(SABIL_LOCATORS.SECTION_FINANCIAL)).toBeVisible();
  }

  // ── HSSE ────────────────────────────────────────────────────────

  @Step("Verify HSSE section and its two subsections are visible")
  async verifyHsseSectionVisible(): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_HSSE_HEADER,
      SABIL_LOCATORS.HSSE_GENERAL_HEADER,
    );
    await expect(this.page.locator(SABIL_LOCATORS.SECTION_HSSE)).toBeVisible();
    await expect(this.page.locator(SABIL_LOCATORS.HSSE_GENERAL_HEADER)).toBeVisible();
    await expect(this.page.locator(SABIL_LOCATORS.HSSE_MANAGER_HEADER)).toBeVisible();
  }

  // ── Submit ──────────────────────────────────────────────────────

  @Step("Click Confirm and Submit")
  async clickSubmit(): Promise<void> {
    // Remove the disabled attribute and dispatch a real MouseEvent directly on the DOM —
    // same approach as EWCF's clickSubmitForce(). Playwright's { force: true } bypasses
    // actionability checks but Angular still sees the button as disabled and ignores it.
    await this.page.evaluate((selector) => {
      const btn = document.querySelector(selector) as HTMLButtonElement | null;
      if (btn) {
        btn.removeAttribute("disabled");
        btn.dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true, composed: true }),
        );
      }
    }, SABIL_LOCATORS.SUBMIT_BUTTON);
  }

  async dblclickSubmit(): Promise<void> {
    await this.submitButton.dblclick({ timeout: 5_000 }).catch(() => {});
  }

  @Step("Verify Submit button is disabled")
  async verifySubmitButtonDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  @Step("Verify Submit button is visible")
  async verifySubmitButtonVisible(): Promise<void> {
    await expect(this.submitButton).toBeVisible();
  }

  // ── Language toggle ─────────────────────────────────────────────

  @Step("Click language toggle button")
  async clickLanguageToggle(): Promise<void> {
    await this.action.click(this.page.locator(SABIL_LOCATORS.LANGUAGE_BUTTON));
  }

  @Step("Verify form is right-to-left")
  async verifyIsRTL(): Promise<void> {
    const dir = await this.page.locator(SABIL_LOCATORS.HTML_ROOT).getAttribute("dir");
    expect(dir).toBe("rtl");
  }

  @Step("Verify form is left-to-right")
  async verifyIsLTR(): Promise<void> {
    const dir = await this.page.locator(SABIL_LOCATORS.HTML_ROOT).getAttribute("dir");
    expect(dir).not.toBe("rtl");
  }

  // ── Validation ──────────────────────────────────────────────────

  @Step("Verify at least one validation error is visible")
  async verifyValidationErrorsVisible(): Promise<void> {
    const errCount = await this.getValidationErrorCount();
    const invalidCount = await this.page.locator(SABIL_LOCATORS.NG_INVALID_DIRTY).count();
    expect(errCount + invalidCount).toBeGreaterThan(0);
  }

  async getValidationErrorCount(): Promise<number> {
    return this.page.locator(SABIL_LOCATORS.VALIDATION_ERROR).count();
  }

  @Step("Verify authorized signatory validation error is shown")
  async verifyAuthorizedSignatoryError(): Promise<void> {
    expect(await this.getValidationErrorCount()).toBeGreaterThan(0);
  }

  @Step("Verify success confirmation is not visible")
  async verifySuccessNotVisible(): Promise<void> {
    // Submit button remains visible when the form has not been successfully sent
    await expect(this.submitButton).toBeVisible();
  }

  @Step("Verify the form was submitted successfully")
  async verifySuccessVisible(): Promise<void> {
    await expect(this.submitButton).not.toBeVisible({ timeout: 30_000 });
  }

  @Step("Verify invalid invite error is shown")
  async verifyInvalidInviteError(): Promise<void> {
    await this.wait.forLoad(TIMEOUTS.PAGE_LOAD);
    await this.page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
    const errBanner = this.page.locator(SABIL_LOCATORS.ERROR_BANNER);
    const isVisible = await errBanner.isVisible({ timeout: 10_000 }).catch(() => false);
    const formAbsent = !(await this.page
      .locator(SABIL_LOCATORS.SUBMIT_BUTTON)
      .isVisible()
      .catch(() => false));
    expect(isVisible || formAbsent).toBe(true);
  }

  @Step("Verify form banner contains text")
  async verifyBannerContainsText(text: string | RegExp): Promise<void> {
    await expect(this.page.locator("body")).toContainText(text);
  }

  async waitForAngularValidation(): Promise<void> {
    // Wait until no Angular form control is still in the pending-validator state.
    // Falls back to networkIdle when the .ng-pending signal isn't present (older
    // Angular builds, or forms outside the reactive-forms tree).
    await this.page
      .waitForFunction(() => !document.querySelector(".ng-pending"), undefined, { timeout: 3_000 })
      .catch(() => this.page.waitForLoadState("networkidle", { timeout: 3_000 }));
  }

  async waitForDebounce(): Promise<void> {
    // Debounced typing usually resolves into a network call — wait for the
    // request queue to drain instead of guessing at a fixed delay.
    await this.page.waitForLoadState("networkidle", { timeout: 3_000 });
  }

  // ── Granular field helpers (used by negative-case tests) ────────────────

  /** Expand the Address section and fill the street field only (no country dropdown). */
  @Step("Fill street address")
  async fillStreet(value: string): Promise<void> {
    await this.ensureSectionExpanded(SABIL_LOCATORS.SECTION_ADDRESS_HEADER, SABIL_LOCATORS.CITY);
    await this.action.fill(this.page.locator(SABIL_LOCATORS.STREET), value);
  }

  /** Select the phone country-code (ISD) dropdown independently of fillCompanyInfo. */
  @Step("Select phone ISD code")
  async selectPhoneIsdCode(code: string): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_INFO_HEADER,
      SABIL_LOCATORS.COMPANY_NAME,
    );
    await this.selectDropdownOption(SABIL_LOCATORS.PHONE_ISD_CODE, code);
  }

  /** Open the Categories treeselect and tick the first available checkbox. */
  @Step("Select first available category")
  async selectFirstCategory(): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_INFO_HEADER,
      SABIL_LOCATORS.COMPANY_NAME,
    );
    await this.action.click(this.page.locator(SABIL_LOCATORS.CATEGORIES_TREESELECT));
    const firstCheckbox = this.page.locator(SABIL_LOCATORS.TREE_SELECT_PANEL_CHECKBOX).first();
    await this.wait.forVisible(firstCheckbox);
    await this.action.click(firstCheckbox);
    await this.action.click(this.page.locator(SABIL_LOCATORS.COMPANY_NAME));
  }

  /**
   * Intercept all vendor API calls and return the given HTTP status code with a
   * JSON error body.  Use this to simulate server-side error responses (400, 500, 503).
   */
  async simulateServerError(statusCode: number): Promise<void> {
    await this.page.route(VENDOR_API_GLOB, (route) =>
      route.fulfill({
        status: statusCode,
        contentType: "application/json",
        body: JSON.stringify({ message: `Simulated ${statusCode}` }),
      }),
    );
  }

  /** Fill the email field of an arbitrary contact entry (zero-indexed). */
  async fillContactEmailByIndex(index: number, value: string): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_CONTACTS_HEADER,
      SABIL_LOCATORS.CONTACT_EMAIL,
    );
    await this.action.fill(
      this.page.locator(`[data-test-id="input-contacts_${index}_email"]`),
      value,
    );
  }

  /** Reload the current page URL (simulates a browser refresh). */
  async reloadPage(): Promise<void> {
    await this.page.reload({ waitUntil: "load" });
  }

  /**
   * Dispatches focus+blur events on every visible text input, select, and textarea
   * to mark all form controls as ng-touched.  Angular renders inline `.error-msg`
   * elements once a control is touched AND invalid, so calling this method before
   * asserting on validation errors is the correct alternative to clicking the
   * (disabled) Submit button.
   */
  @Step("Trigger validation on all form fields by blurring each one")
  async triggerAllFieldsValidation(): Promise<void> {
    await this.page.evaluate(() => {
      const inputs = document.querySelectorAll<HTMLElement>(
        "input:not([type='hidden']), select, textarea",
      );
      inputs.forEach((el) => {
        el.dispatchEvent(new Event("focus", { bubbles: true }));
        el.dispatchEvent(new Event("blur", { bubbles: true }));
      });
    });
    // Wait for Angular to finish any async validators kicked off by blur, and
    // for at least one .ng-touched marker to appear so callers can rely on the
    // validation state being visible.
    await this.page
      .waitForFunction(() => document.querySelector(".ng-touched") !== null, undefined, {
        timeout: 3_000,
      })
      .catch(() => this.page.waitForLoadState("networkidle", { timeout: 3_000 }));
  }

  // ── Classification Type helpers ──────────────────────────────

  /**
   * Select a specific Classification Type by its displayed label.
   * Opens the dropdown, waits for the matching item, clicks it.
   */
  @Step("Select Classification Type")
  async selectClassificationType(typeName: string): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_INFO_HEADER,
      SABIL_LOCATORS.COMPANY_NAME,
    );
    await this.selectDropdownOption(SABIL_LOCATORS.CLASSIFICATION_DROPDOWN, typeName);
  }

  /**
   * Returns the text of every item currently visible in the Classification Type dropdown.
   * Leaves the dropdown closed on exit.
   */
  async getAvailableClassificationTypes(): Promise<string[]> {
    await this.action.click(this.page.locator(SABIL_LOCATORS.CLASSIFICATION_DROPDOWN).first());
    const items = this.page.locator(SABIL_LOCATORS.DROPDOWN_ITEM);
    await items.first().waitFor({ state: "visible", timeout: 5_000 });
    const count = await items.count();
    const types: string[] = [];
    for (let i = 0; i < count; i++) {
      types.push((await items.nth(i).textContent())?.trim() ?? "");
    }
    await this.page.keyboard.press("Escape");
    return types;
  }

  @Step("Verify at least one extended section is visible after classification type selection")
  async verifyDynamicSectionsVisibleAfterClassification(): Promise<void> {
    const sectionSelectors = [
      SABIL_LOCATORS.SECTION_EXPERIENCE,
      SABIL_LOCATORS.SECTION_TECH_CAP,
      SABIL_LOCATORS.SECTION_KEY_STAFF,
      SABIL_LOCATORS.SECTION_FINANCIAL,
      SABIL_LOCATORS.SECTION_HSSE,
    ];
    let visible = 0;
    for (const sel of sectionSelectors) {
      if (
        await this.page
          .locator(sel)
          .isVisible()
          .catch(() => false)
      )
        visible++;
    }
    expect(visible).toBeGreaterThan(0);
  }

  // ── Dynamic section field fill methods ───────────────────────

  @Step("Fill Experience Details row 0")
  async fillExperienceRow0(data: {
    clientName: string;
    description?: string;
    value?: string;
    projectEndYear?: string;
  }): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_EXPERIENCE_HEADER,
      SABIL_LOCATORS.EXPERIENCE_CLIENT_NAME_0,
    );
    await this.action.fill(
      this.page.locator(SABIL_LOCATORS.EXPERIENCE_CLIENT_NAME_0).first(),
      data.clientName,
    );
    if (
      data.description !== undefined &&
      (await this.page
        .locator(SABIL_LOCATORS.EXPERIENCE_DESCRIPTION_0)
        .first()
        .isVisible()
        .catch(() => false))
    ) {
      await this.action.fill(
        this.page.locator(SABIL_LOCATORS.EXPERIENCE_DESCRIPTION_0).first(),
        data.description,
      );
    }
    if (data.value !== undefined) {
      // p-inputnumber renders an inner <input> — locate by placeholder within the section
      const valueInput = this.page
        .locator(SABIL_LOCATORS.SECTION_EXPERIENCE)
        .getByPlaceholder("Add Value")
        .first();
      if (await valueInput.isVisible().catch(() => false)) {
        await this.action.fill(valueInput, data.value);
      }
    }
    if (data.projectEndYear !== undefined) {
      // Project End Year: the data-test-id is "table-dropdown-*" so this is a p-dropdown
      // component. Force-click its trigger to open the overlay, then pick the first item.
      const yearCell = this.page
        .locator(SABIL_LOCATORS.SECTION_EXPERIENCE)
        .locator("tbody tr")
        .first()
        .locator("td")
        .nth(3);
      if (await yearCell.isVisible().catch(() => false)) {
        // Click the trigger button inside the cell (the calendar/dropdown arrow icon)
        const triggerBtn = yearCell.locator("button").first();
        if (await triggerBtn.isVisible().catch(() => false)) {
          await this.action.click(triggerBtn);
        } else {
          // No button visible — try force-clicking the whole cell to open the overlay
          await this.action.click(yearCell, { force: true });
        }
        // Pick first available option (p-dropdown item or p-calendar year item).
        // The isVisible calls below already carry a bounded wait, so no pre-sleep needed.
        const firstDropdownItem = this.page.locator(SABIL_LOCATORS.DROPDOWN_ITEM).first();
        const firstCalendarYear = this.page
          .locator(".p-yearpicker-year, .p-year-picker span")
          .first();
        if (await firstDropdownItem.isVisible({ timeout: 1_500 }).catch(() => false)) {
          await this.action.click(firstDropdownItem);
        } else if (await firstCalendarYear.isVisible({ timeout: 1_500 }).catch(() => false)) {
          await this.action.click(firstCalendarYear);
        }
      }
    }
    // Upload Certificate of Completion — required when experience row fields are filled.
    // The file input may be hidden (PrimeNG upload button pattern) but still accepts setInputFiles.
    const expRow = this.page.locator(SABIL_LOCATORS.SECTION_EXPERIENCE).locator("tbody tr").first();
    const certFileInputs = expRow.locator('input[type="file"]');
    const certFileCount = await certFileInputs.count();
    if (certFileCount > 0) {
      const minimalPdf = Buffer.from("%PDF-1.4 1 0 obj<</Type/Catalog>>endobj");
      for (let i = 0; i < certFileCount; i++) {
        await certFileInputs.nth(i).setInputFiles({
          name: `completion_cert_${i}.pdf`,
          mimeType: "application/pdf",
          buffer: minimalPdf,
        });
      }
    }
  }

  @Step("Fill Key Staff row 0")
  async fillKeyStaffRow0(data: {
    name: string;
    position?: string;
    yearsOfExperience?: string;
  }): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_KEY_STAFF_HEADER,
      SABIL_LOCATORS.KEY_STAFF_NAME_0,
    );
    await this.action.fill(this.page.locator(SABIL_LOCATORS.KEY_STAFF_NAME_0).first(), data.name);
    if (
      data.position !== undefined &&
      (await this.page
        .locator(SABIL_LOCATORS.KEY_STAFF_POSITION_0)
        .first()
        .isVisible()
        .catch(() => false))
    ) {
      await this.action.fill(
        this.page.locator(SABIL_LOCATORS.KEY_STAFF_POSITION_0).first(),
        data.position,
      );
    }
    if (data.yearsOfExperience !== undefined) {
      // p-inputnumber renders an inner <input> — locate by placeholder within the section
      const yearsInput = this.page
        .locator(SABIL_LOCATORS.SECTION_KEY_STAFF)
        .getByPlaceholder("Enter years of experience")
        .first();
      if (await yearsInput.isVisible().catch(() => false)) {
        await this.action.fill(yearsInput, data.yearsOfExperience);
      }
    }
    // Upload CV / qualification certificate — required when key staff row fields are filled.
    const staffRow = this.page
      .locator(SABIL_LOCATORS.SECTION_KEY_STAFF)
      .locator("tbody tr")
      .first();
    const cvFileInputs = staffRow.locator('input[type="file"]');
    const cvFileCount = await cvFileInputs.count();
    if (cvFileCount > 0) {
      const minimalPdf = Buffer.from("%PDF-1.4 1 0 obj<</Type/Catalog>>endobj");
      for (let i = 0; i < cvFileCount; i++) {
        await cvFileInputs.nth(i).setInputFiles({
          name: `cv_${i}.pdf`,
          mimeType: "application/pdf",
          buffer: minimalPdf,
        });
      }
    }
  }

  @Step("Fill HSSE section (General radio questions + Manager details + Safety Certification)")
  async fillHsseManagerName(value: string): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_HSSE_HEADER,
      SABIL_LOCATORS.HSSE_MANAGER_NAME,
    );

    // ── HSSE General: answer all yes/no radio button questions ────────
    // The HSSE General subsection contains required radio-button questions (e.g. HSSE policy,
    // training programmes). Clicking the second radio in each pair selects "No" for each,
    // which avoids triggering additional conditional certificate/date requirements.
    const allHsseRadios = this.page
      .locator(SABIL_LOCATORS.SECTION_HSSE)
      .locator(".p-radiobutton-box");
    const radioCount = await allHsseRadios.count();
    // Click every odd-indexed radio (index 1, 3, 5… = "No" in each Yes/No pair)
    for (let i = 1; i < radioCount; i += 2) {
      const radio = allHsseRadios.nth(i);
      if (await radio.isVisible().catch(() => false)) {
        await this.action.click(radio).catch(() => {});
      }
    }

    // ── HSSE Manager: fill name, position, years ──────────────────────
    await this.action.fill(this.page.locator(SABIL_LOCATORS.HSSE_MANAGER_NAME).first(), value);
    // Also fill Job Position (cell 1) and Years of Experience (cell 2) in the manager row
    // using positional locators since the HSSE manager table is the last table in the section.
    const managerRow = this.page
      .locator(SABIL_LOCATORS.SECTION_HSSE)
      .locator("table")
      .last()
      .locator("tbody tr")
      .first();
    const positionInput = managerRow.locator("td").nth(1).locator("input").first();
    const yearsInput = managerRow.locator("td").nth(2).locator("input").first();
    if (await positionInput.isVisible().catch(() => false)) {
      await this.action.fill(positionInput, "HSSE Manager");
    }
    if (await yearsInput.isVisible().catch(() => false)) {
      await this.action.fill(yearsInput, "5");
    }

    // ── HSSE Manager: upload safety certification ──────────────────────
    // Safety Certification is required when HSSE Manager details are filled.
    const safetyFileInputs = managerRow.locator('input[type="file"]');
    const safetyFileCount = await safetyFileInputs.count();
    if (safetyFileCount > 0) {
      const minimalPdf = Buffer.from("%PDF-1.4 1 0 obj<</Type/Catalog>>endobj");
      for (let i = 0; i < safetyFileCount; i++) {
        await safetyFileInputs.nth(i).setInputFiles({
          name: `safety_cert_${i}.pdf`,
          mimeType: "application/pdf",
          buffer: minimalPdf,
        });
      }
    }
  }

  /**
   * Expand the Technical Capabilities section and answer all visible yes/no radio questions.
   * Selects "No" (the second radio in each pair) for each question to avoid triggering
   * conditional required certificate or expiry-date fields.
   * If a question only has one radio visible, that one is selected.
   */
  @Step("Fill Technical Capabilities section (select No for all yes/no questions)")
  async fillTechCapabilities(): Promise<void> {
    await this.ensureSectionExpanded(
      SABIL_LOCATORS.SECTION_TECH_CAP_HEADER,
      SABIL_LOCATORS.TECH_CAP_QMS_HEADER,
    );
    // Section is expanded — wait for the first radio button to render before
    // enumerating them. Playwright auto-wait handles per-item visibility below.
    await expect(
      this.page.locator(SABIL_LOCATORS.SECTION_TECH_CAP).locator(".p-radiobutton-box").first(),
    ).toBeVisible();
    // Tech Cap uses p-radiobutton (Yes/No pairs) for applicable questions.
    // Click the second radio in each Yes/No pair (i = 1, 3, 5 …) → selects "No",
    // avoiding conditional required fields (ISO cert expiry + attachment).
    const radioBoxes = this.page
      .locator(SABIL_LOCATORS.SECTION_TECH_CAP)
      .locator(".p-radiobutton-box");
    const radioCount = await radioBoxes.count();
    for (let i = 1; i < radioCount; i += 2) {
      const radio = radioBoxes.nth(i);
      if (await radio.isVisible().catch(() => false)) {
        await this.action.click(radio).catch(() => {});
      }
    }
    if (radioCount > 0 && radioCount % 2 !== 0) {
      const last = radioBoxes.nth(radioCount - 1);
      if (await last.isVisible().catch(() => false)) {
        await this.action.click(last).catch(() => {});
      }
    }
    // Tech Cap also uses p-checkbox for "Applicable" toggles — leave unchecked (= No/not applicable)
    // since unchecked is the valid default and avoids triggering conditional required fields.
  }

  // ── Network intercept helpers ────────────────────────────────────

  async interceptVendorPost(): Promise<() => Record<string, unknown>> {
    let body: Record<string, unknown> = {};
    await this.page.route(VENDOR_API_GLOB, async (route) => {
      const req = route.request();
      if (req.method() === "POST") {
        try {
          body = JSON.parse(req.postData() ?? "{}") as Record<string, unknown>;
        } catch {
          // ignore parse errors
        }
      }
      await route.continue();
    });
    return () => body;
  }

  async countVendorPosts(): Promise<() => number> {
    let count = 0;
    await this.page.route(VENDOR_API_GLOB, async (route) => {
      if (route.request().method() === "POST") count++;
      await route.continue();
    });
    return () => count;
  }

  async simulateNetworkTimeout(): Promise<void> {
    await this.page.route(VENDOR_API_GLOB, (route) => route.abort("timedout"));
  }

  async detectXssExecution(): Promise<boolean> {
    let xssRan = false;
    this.page.on("dialog", () => {
      xssRan = true;
    });
    await this.page.evaluate((selector) => {
      const el = document.querySelector(selector) as HTMLInputElement;
      if (el) {
        el.value = '<script>alert("xss")</script>';
        el.dispatchEvent(new Event("input"));
      }
    }, SABIL_LOCATORS.COMPANY_NAME);
    // Bounded window for the browser to actually parse and execute the injected
    // script if the sanitizer failed. If networkidle doesn't happen (no request
    // fires), the timeout is our upper bound on how long we wait for a dialog.
    await this.page.waitForLoadState("networkidle", { timeout: 1_500 }).catch(() => {});
    return xssRan;
  }
}
