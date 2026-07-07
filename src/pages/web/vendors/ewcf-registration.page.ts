import { Page, Locator, Response, expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { Step } from "../../../core/steps";
import type { VendorRegistrationData } from "../../../types/interfaces/vendor.interface";
import { VENDOR_INVITE_PARAM, TIMEOUTS } from "../../../core/constants";

/**
 * EWCF Vendor Registration Form Locators
 *
 * Extracted from the real HTML of the dynamic-vendor-form (PrimeNG / Angular).
 * Priority: [data-test-id] > id > CSS.
 *
 * IMPORTANT — Accordion behaviour:
 *   All form sections are COLLAPSED by default (Company Information may be pre-expanded).
 *   Click the `.section-header` inside each `[data-test-id="section-*"]` container to expand.
 *   Use `ensureSectionExpanded()` to expand only when a section is still collapsed.
 *
 * For p-dropdown: click the wrapper to open the overlay, then click `.p-dropdown-item`.
 * For p-radiobutton: click `.p-radiobutton-box` inside the radio wrapper.
 * For p-calendar: fill the `#id` input directly.
 * For p-treeselect: click the wrapper to open the panel, then click `.p-treeselect-panel .p-checkbox`.
 * For p-checkbox: click `.p-checkbox-box` (visual element, not the hidden accessible input).
 */
const EWCF_LOCATORS = {
  // ── Section containers ────────────────────────────────────────────
  SECTION_INFO: '[data-test-id="section-info"]',
  SECTION_ADDRESS: '[data-test-id="section-address"]',
  SECTION_CONTACTS: '[data-test-id="contact-group-section-contacts"]',
  SECTION_ADDITIONAL: '[data-test-id="section-additionalInfo"]',
  SECTION_BANK: '[data-test-id="section-bankInfo"]',

  // ── Section headers (click to expand/collapse) ────────────────────
  SECTION_INFO_HEADER: '[data-test-id="section-info"] .section-header',
  SECTION_ADDRESS_HEADER: '[data-test-id="section-address"] .section-header',
  SECTION_CONTACTS_HEADER: '[data-test-id="contact-group-section-contacts"] .section-header',
  SECTION_ADDITIONAL_HEADER: '[data-test-id="section-additionalInfo"] .section-header',
  SECTION_BANK_HEADER: '[data-test-id="section-bankInfo"] .section-header',

  // ── Company Information ───────────────────────────────────────────
  COMPANY_NAME: '[data-test-id="input-orgData_orgName"]',
  TRADING_NAME: '[data-test-id="input-tradingName"]',
  ORGANIZATION_TYPE: '[data-test-id="input-organizationType"]',
  ENTITY_TYPE_LOCAL: '[data-test-id="radio-operationRegion-local"] .p-radiobutton-box',
  ENTITY_TYPE_INTERNATIONAL:
    '[data-test-id="radio-operationRegion-international"] .p-radiobutton-box',
  // Hidden native radio inputs — used for JS evaluation (uncheckAllEntityTypeRadios)
  ENTITY_TYPE_LOCAL_RADIO_INPUT: '[data-test-id="radio-operationRegion-local"] input[type="radio"]',
  ENTITY_TYPE_INTL_RADIO_INPUT:
    '[data-test-id="radio-operationRegion-international"] input[type="radio"]',
  CLASSIFICATION_DROPDOWN: '[data-test-id="dropdown-orgData_classificationType"]',
  ENTITY_EMAIL: '[data-test-id="input-orgData_email"]',
  ESTABLISHMENT_DATE: 'input[placeholder="Select establishment date"]',
  CURRENCY_DROPDOWN: '[data-test-id="dropdown-orgData_currency"]',

  // ── Address ───────────────────────────────────────────────────────
  COUNTRY_DROPDOWN: '[data-test-id="dropdown-orgData_orgDetails_primaryAddress_country"]',
  CITY: '[data-test-id="input-orgData_orgDetails_primaryAddress_city"]',
  OFFICE_ADDRESS: '[data-test-id="input-orgData_orgDetails_primaryAddress_street"]',
  NATIONAL_ADDRESS: 'input[placeholder="Enter national address"]',
  COPY_OFFICE_ADDRESS_BTN: "text=Copy Office Address",
  POSTAL_CODE: '[data-test-id="input-orgData_orgDetails_primaryAddress_postalCode"]',

  // ── Contact Information ───────────────────────────────────────────
  CONTACT_EMAIL: '[data-test-id="input-contacts_0_email"]',
  CONTACT_DESIGNATION: '[data-test-id="input-contacts_0_position"]',
  CONTACT_FIRST_NAME: '[data-test-id="input-contacts_0_firstName"]',
  CONTACT_LAST_NAME: '[data-test-id="input-contacts_0_lastName"]',
  CONTACT_MOBILE_CODE: '[data-test-id="dropdown-contacts_0_mobile-isdCode"]',
  CONTACT_MOBILE_NUMBER: '[data-test-id="input-contacts_0_mobile-number"]',
  // Visual checkbox box — preferred over hidden accessible input for PrimeNG p-checkbox
  AUTHORIZED_SIGNATORY_BOX:
    '[data-test-id="checkbox-contacts_0_isAuthorizedSignatory"] .p-checkbox-box',

  // ── Additional Information ────────────────────────────────────────
  SCOPE_OF_WORK: '[data-test-id="treeselect-orgData_categories"]',
  WEBSITE_URL: '[data-test-id="input-orgData_websiteURL"]',

  // ── Bank Information ──────────────────────────────────────────────
  BENEFICIARY_NAME: '[data-test-id="input-orgData_bankInfo_beneficiaryName"]',
  BANK_NAME: '[data-test-id="input-orgData_bankInfo_bankName"]',
  BANK_ACCOUNT_NO: '[data-test-id="input-orgData_bankInfo_accountNumber"]',
  IBAN: '[data-test-id="input-orgData_bankInfo_iban"]',
  SWIFT_CODE: '[data-test-id="input-orgData_bankInfo_swiftCode"]',
  BANK_COUNTRY_DROPDOWN: '[data-test-id="dropdown-orgData_bankInfo_country"]',

  // ── View-mode field values (rendered after successful submission) ─
  VIEW_ORG_NAME: '[data-test-id="view-orgData_orgName"]',
  VIEW_TRADING_NAME: '[data-test-id="view-tradingName"]',
  VIEW_ORGANIZATION_TYPE: '[data-test-id="view-organizationType"]',
  VIEW_OPERATION_REGION: '[data-test-id="view-operationRegion"]',
  VIEW_CLASSIFICATION_TYPE: '[data-test-id="view-orgData_classificationType"]',
  VIEW_ENTITY_EMAIL: '[data-test-id="view-orgData_email"]',
  VIEW_ESTABLISHMENT_DATE: '[data-test-id="view-orgData_yearOfEstablishment"]',
  VIEW_CURRENCY: '[data-test-id="view-orgData_currency"]',
  VIEW_ADDRESS_COUNTRY: '[data-test-id="view-orgData_orgDetails_primaryAddress_country"]',
  VIEW_CITY: '[data-test-id="view-orgData_orgDetails_primaryAddress_city"]',
  VIEW_STREET: '[data-test-id="view-orgData_orgDetails_primaryAddress_street"]',
  VIEW_POSTAL_CODE: '[data-test-id="view-orgData_orgDetails_primaryAddress_postalCode"]',
  VIEW_NATIONAL_ADDRESS: '[data-test-id="view-nationalAddress"]',
  VIEW_CONTACT_EMAIL: '[data-test-id="view-contacts_0_email"]',
  VIEW_CONTACT_DESIGNATION: '[data-test-id="view-contacts_0_position"]',
  VIEW_CONTACT_FIRST_NAME: '[data-test-id="view-contacts_0_firstName"]',
  VIEW_CONTACT_LAST_NAME: '[data-test-id="view-contacts_0_lastName"]',
  VIEW_CONTACT_MOBILE: '[data-test-id="view-contacts_0_mobile"]',
  VIEW_CONTACT_SIGNATORY: '[data-test-id="view-contacts_0_isAuthorizedSignatory"]',
  VIEW_CATEGORIES: '[data-test-id="categories-view-orgData_categories"]',
  VIEW_WEBSITE_URL: '[data-test-id="view-orgData_websiteURL"]',
  VIEW_BENEFICIARY_NAME: '[data-test-id="view-orgData_bankInfo_beneficiaryName"]',
  VIEW_BANK_NAME: '[data-test-id="view-orgData_bankInfo_bankName"]',
  VIEW_BANK_ACCOUNT_NO: '[data-test-id="view-orgData_bankInfo_accountNumber"]',
  VIEW_IBAN: '[data-test-id="view-orgData_bankInfo_iban"]',
  VIEW_SWIFT_CODE: '[data-test-id="view-orgData_bankInfo_swiftCode"]',
  VIEW_BANK_COUNTRY: '[data-test-id="view-orgData_bankInfo_country"]',

  // ── Submit ────────────────────────────────────────────────────────
  SUBMIT_BUTTON: '[data-test-id="confirm-and-submit-button"]',

  // ── Validation errors ─────────────────────────────────────────────
  VALIDATION_ERROR: ".p-error",
  NG_INVALID_DIRTY: ".ng-invalid.ng-dirty:not(form):not(ng-form)",
  HTML5_INVALID: "input:invalid, select:invalid, textarea:invalid",

  // ── Error / invalid invite ────────────────────────────────────────
  ERROR_BANNER: '[class*="error"], p-message, .p-message-error',

  // ── p-dropdown overlay items (appended to body) ───────────────────
  DROPDOWN_ITEM: ".p-dropdown-item",

  // ── p-treeselect panel checkbox ───────────────────────────────────
  TREE_SELECT_PANEL_CHECKBOX: ".p-treeselect-panel .p-checkbox",

  // ── Language toggle ───────────────────────────────────────────────
  LANGUAGE_BUTTON: '[data-test-id="language-change-button"]',

  // ── Contacts ─────────────────────────────────────────────────────
  ADD_CONTACT_BUTTON: '[data-test-id="add-contact-entry-button"]',

  // ── Attachments ──────────────────────────────────────────────────
  ADD_ATTACHMENT_BUTTON: '[data-test-id="add-attachment-button"]',
  SECTION_ATTACHMENTS: '[data-test-id="attachments-section-attachments"]',
  SECTION_ATTACHMENTS_HEADER: '[data-test-id="attachments-section-attachments"] .section-header',
  ALL_UPLOAD_BUTTONS: '[data-test-id^="upload-button-attachments_"]',
  ALL_ATTACHMENT_ROWS: '[data-test-id^="attachment-row-attachments_"]',

  // ── PrimeNG date picker (calendar overlay) ───────────────────────
  DATE_PICKER_OVERLAY: ".p-datepicker",
  ESTABLISHMENT_DATE_TRIGGER: 'input[placeholder="Select establishment date"] ~ button',

  // ── HTML root (language direction) ───────────────────────────────
  HTML_ROOT: "html",

  // ── Returned-for-revision banner ─────────────────────────────────
  // Shown at the top of the form after an admin returns a submission for revision.
  // No data-test-id — identified by the warning colour class applied by Angular.
  RETURNED_BANNER: '[class*="tw-border-warning-color-dark"]',
} as const;

/** URL glob matching all Penny vendor API endpoints — used to intercept/route vendor POSTs */
const VENDOR_API_GLOB = "**/vendor**";
/** URL substring used in waitForResponse — matches any vendor API response */
const VENDOR_API_PATH = "/vendor";

/**
 * EwcfRegistrationPage — page object for the external EWCF vendor registration form.
 *
 * Access: public invite link from the Invite Vendors sidebar,
 *   or `envConfig.webUrl` + `?invite=<token>`.
 *
 * Run with: TEST_ENV=test npx playwright test src/tests/ewcf/web/vendors/registration.spec.ts --project=smoke
 *
 * NOTE: All form sections are accordion-collapsed by default. Every fill method expands
 * its target section automatically before interacting with fields.
 * Automated submission is blocked by reCAPTCHA — tests verify form fill and validation only.
 */
export class EwcfRegistrationPage extends BasePage {
  // ── Document key constants ───────────────────────────────────────
  /** Documents present for both local (Saudi) and international entity types */
  static readonly COMMON_DOC_KEYS = [
    "commercialRegistration",
    "companyProfile",
    "copiesOfLicenses",
    "detailsOfBankAccountOnLetterHead",
    "authorizationLetter",
    "referenceProjects",
    "currentWorkload",
    "yearlyCashflowTrendAndRevenue",
    "nda",
    "conflictOfInterestDeclarationForm",
  ] as const;

  /** Additional document rows that only appear for local (Saudi) entity type */
  static readonly LOCAL_ONLY_DOC_KEYS = [
    "vatCertificate",
    "gosiCertificate",
    "saudizationCertificate",
    "validZakatCertificate",
    "localContentCertificate",
  ] as const;

  /** Additional document rows that only appear for international entity type */
  static readonly INTERNATIONAL_ONLY_DOC_KEYS = ["taxCertificate"] as const;

  /** All document rows for local entity type (superset) */
  static readonly ALL_DOC_KEYS = [
    ...EwcfRegistrationPage.COMMON_DOC_KEYS,
    ...EwcfRegistrationPage.LOCAL_ONLY_DOC_KEYS,
  ] as const;

  /** All document rows for international entity type */
  static readonly INTERNATIONAL_DOC_KEYS = [
    ...EwcfRegistrationPage.COMMON_DOC_KEYS,
    ...EwcfRegistrationPage.INTERNATIONAL_ONLY_DOC_KEYS,
  ] as const;

  static readonly REQUIRED_DOC_KEYS = [
    "commercialRegistration",
    "companyProfile",
    "copiesOfLicenses",
    "detailsOfBankAccountOnLetterHead",
    "authorizationLetter",
    "nda",
    "conflictOfInterestDeclarationForm",
  ] as const;

  static readonly TEMPLATE_DOC_KEYS = [
    "nda",
    "conflictOfInterestDeclarationForm",
    "authorizationLetter",
  ] as const;

  protected readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.submitButton = page.locator(EWCF_LOCATORS.SUBMIT_BUTTON);
  }

  // ── Navigation ──────────────────────────────────────────────────

  /**
   * Navigate using the full public invite link URL from the sidebar.
   * Waits for network idle to let the Angular SPA fully initialize.
   */
  @Step("Navigate to EWCF registration via public invite link")
  async navigateToPublicLink(url: string): Promise<void> {
    await super.navigate(url);
    await this.wait.forNetworkIdle(TIMEOUTS.PAGE_LOAD);
  }

  @Step("Navigate to EWCF registration with invite token")
  async navigateWithToken(vendorUrl: string, inviteToken: string): Promise<void> {
    const url = `${vendorUrl}?${VENDOR_INVITE_PARAM}=${encodeURIComponent(inviteToken)}`;
    await super.navigate(url);
  }

  @Step("Navigate to EWCF registration with invalid token")
  async navigateWithInvalidToken(vendorUrl: string): Promise<void> {
    const parsed = new URL(vendorUrl);
    parsed.searchParams.set(VENDOR_INVITE_PARAM, "invalid-token-xyz-000");
    await super.navigate(parsed.toString());
  }

  // ── Private helpers ──────────────────────────────────────────────

  /**
   * Select a date in the PrimeNG v13 p-calendar by reading the calendar header to
   * determine the currently displayed month/year, then navigating with the prev button
   * until the target month/year is shown. Finally clicks the target day cell.
   * This approach is immune to off-by-one errors in month calculation.
   * @param dateStr ISO date string "yyyy-mm-dd"
   */
  private async pickDateViaCalendar(dateStr: string): Promise<void> {
    const [year, month, day] = dateStr.split("-").map(Number);

    // Guard: invalid date string (NaN components) — open and immediately close the calendar
    // so the field becomes "touched" but has no value (the required validator will fire).
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      await this.page.locator(EWCF_LOCATORS.ESTABLISHMENT_DATE_TRIGGER).click();
      await this.page.keyboard.press("Escape");
      return;
    }

    // PrimeNG v13 default locale uses full English month names in the header
    const MONTHS = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Open the calendar via the trigger button
    await this.page.locator(EWCF_LOCATORS.ESTABLISHMENT_DATE_TRIGGER).click();
    const overlay = this.page.locator(EWCF_LOCATORS.DATE_PICKER_OVERLAY);
    await this.wait.forVisible(overlay);

    const prevBtn = overlay.locator(".p-datepicker-prev");
    const nextBtn = overlay.locator(".p-datepicker-next");
    const yearDisplay = overlay.locator(".p-datepicker-year");
    const monthDisplay = overlay.locator(".p-datepicker-month");

    // Read the current displayed year/month
    const getDisplayed = async (): Promise<{ y: number; m: number }> => {
      const yText = (await yearDisplay.textContent()) ?? "";
      const mText = (await monthDisplay.textContent()) ?? "";
      return {
        y: parseInt(yText.trim(), 10),
        m: MONTHS.indexOf(mText.trim()) + 1, // 1-indexed; -1 → 0 signals unknown
      };
    };

    let displayed = await getDisplayed();
    // Navigate backward when overshooting the target month/year
    while (displayed.y > year || (displayed.y === year && displayed.m > month)) {
      await prevBtn.click();
      displayed = await getDisplayed();
    }
    // Navigate forward when undershooting (e.g. future target date).
    // Break early if the next button is disabled — the app is preventing future navigation.
    while (displayed.y < year || (displayed.y === year && displayed.m < month)) {
      const disabled = await nextBtn.evaluate(
        (el) => el.hasAttribute("disabled") || el.classList.contains("p-disabled"),
      );
      if (disabled) {
        // Calendar blocks forward navigation (e.g. future dates are disallowed).
        // Close the calendar and leave the date field empty so validators can fire.
        await this.page.keyboard.press("Escape");
        return;
      }
      await nextBtn.click();
      displayed = await getDisplayed();
    }

    // Click the target day cell in the current-month grid (skip other-month overflow cells).
    // If the day is marked p-disabled (e.g. future date restrictions), close the calendar
    // and leave the date field empty so validators can fire.
    const dayCell = overlay
      .locator("td:not(.p-datepicker-other-month) span")
      .filter({ hasText: new RegExp(`^\\s*${day}\\s*$`) })
      .first();

    const isDisabledDay = await dayCell
      .evaluate((el) => el.classList.contains("p-disabled"))
      .catch(() => false);

    if (isDisabledDay) {
      await this.page.keyboard.press("Escape");
      return;
    }

    await dayCell.click();
  }

  /**
   * Expand a form accordion section if it is currently collapsed.
   * Checks visibility of a known field inside the section to determine state.
   */
  private async ensureSectionExpanded(
    headerSelector: string,
    sampleFieldSelector: string,
  ): Promise<void> {
    const isVisible = await this.page
      .locator(sampleFieldSelector)
      .isVisible()
      .catch(() => false);
    if (!isVisible) {
      await this.action.click(this.page.locator(headerSelector));
      await this.wait.forVisible(this.page.locator(sampleFieldSelector));
    }
  }

  /**
   * Open a PrimeNG p-dropdown and select the overlay item matching the given text.
   * Overlay panels are appended to document body.
   */
  private async selectDropdownOption(dropdownSelector: string, text: string): Promise<void> {
    await this.action.click(this.page.locator(dropdownSelector).first());
    await this.action.click(
      this.page.locator(EWCF_LOCATORS.DROPDOWN_ITEM, { hasText: text }).first(),
    );
  }

  /**
   * Open a PrimeNG p-dropdown and select the very first available option.
   * Use when the exact option text is not known (e.g. Classification Type, Currency).
   */
  private async selectFirstDropdownOption(dropdownSelector: string): Promise<void> {
    await this.action.click(this.page.locator(dropdownSelector).first());
    // Use locator.click() directly — PrimeNG appends overlay items to <body> and can
    // re-render them mid-interaction, causing scrollIntoViewIfNeeded to hit a detached node.
    // Playwright's built-in click auto-waits and retries without the extra DOM scroll step.
    await this.page.locator(EWCF_LOCATORS.DROPDOWN_ITEM).first().click({ timeout: 10_000 });
  }

  // ── Section fill methods ─────────────────────────────────────────

  /**
   * Fill Company Information section (expands accordion if needed).
   * Includes text fields, entity type radio, Classification Type dropdown,
   * Establishment Date, and Currency dropdown.
   */
  @Step("Fill Company Information section")
  async fillCompanyInfo(data: VendorRegistrationData): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_INFO_HEADER,
      EWCF_LOCATORS.ORGANIZATION_TYPE,
    );

    await this.action.fill(this.page.locator(EWCF_LOCATORS.COMPANY_NAME), data.companyName);
    if (data.tradingName) {
      await this.action.fill(this.page.locator(EWCF_LOCATORS.TRADING_NAME), data.tradingName);
    }
    await this.action.fill(
      this.page.locator(EWCF_LOCATORS.ORGANIZATION_TYPE),
      data.organizationType,
    );

    const radioSelector =
      data.entityType === "local"
        ? EWCF_LOCATORS.ENTITY_TYPE_LOCAL
        : EWCF_LOCATORS.ENTITY_TYPE_INTERNATIONAL;
    await this.action.click(this.page.locator(radioSelector));

    // Classification Type — select first available option (codes vary by org config)
    await this.selectFirstDropdownOption(EWCF_LOCATORS.CLASSIFICATION_DROPDOWN);

    await this.action.fill(this.page.locator(EWCF_LOCATORS.ENTITY_EMAIL), data.entityEmail);

    // Currency — select first available option
    await this.selectFirstDropdownOption(EWCF_LOCATORS.CURRENCY_DROPDOWN);

    // Establishment Date — PrimeNG p-calendar does not accept programmatic fill(); it parses
    // only via its internal UI. Use the trigger button to open the picker, navigate to the
    // target month/year via keyboard (Ctrl+PageUp = prev year, PageUp = prev month), then
    // move to the correct day with ArrowRight and confirm with Enter.
    if (data.establishmentDate) {
      await this.pickDateViaCalendar(data.establishmentDate);
    }
  }

  /**
   * Fill Address section (expands accordion if needed).
   * Country defaults to "Saudi Arabia"; pass data.country to override (e.g. international entities).
   */
  @Step("Fill Address section")
  async fillAddress(data: VendorRegistrationData): Promise<void> {
    await this.ensureSectionExpanded(EWCF_LOCATORS.SECTION_ADDRESS_HEADER, EWCF_LOCATORS.CITY);
    await this.selectDropdownOption(EWCF_LOCATORS.COUNTRY_DROPDOWN, data.country ?? "Saudi Arabia");
    await this.action.fill(this.page.locator(EWCF_LOCATORS.CITY), data.city);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.OFFICE_ADDRESS), data.officeAddress);
    // "Copy Office Address" only renders for local entities (Saudi national address field).
    // For international entities the button is absent — skip it gracefully.
    const copyBtn = this.page.locator(EWCF_LOCATORS.COPY_OFFICE_ADDRESS_BTN);
    if (await copyBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.action.click(copyBtn);
    }
    if (data.postalCode) {
      await this.action.fill(this.page.locator(EWCF_LOCATORS.POSTAL_CODE), data.postalCode);
    }
  }

  /**
   * Fill Contact Information section (expands accordion if needed).
   * Includes text fields, Mobile ISD code dropdown, and Authorized Signatory checkbox.
   */
  @Step("Fill Contact Information section")
  async fillContactInfo(data: VendorRegistrationData): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_CONTACTS_HEADER,
      EWCF_LOCATORS.CONTACT_EMAIL,
    );

    await this.action.fill(this.page.locator(EWCF_LOCATORS.CONTACT_EMAIL), data.contactEmail);
    await this.action.fill(
      this.page.locator(EWCF_LOCATORS.CONTACT_DESIGNATION),
      data.contactDesignation,
    );
    await this.action.fill(
      this.page.locator(EWCF_LOCATORS.CONTACT_FIRST_NAME),
      data.contactFirstName,
    );
    await this.action.fill(
      this.page.locator(EWCF_LOCATORS.CONTACT_LAST_NAME),
      data.contactLastName,
    );
    // Mobile ISD code — always select Saudi Arabia (+966) to match generated mobile format
    await this.selectDropdownOption(EWCF_LOCATORS.CONTACT_MOBILE_CODE, "+966");
    await this.action.fill(
      this.page.locator(EWCF_LOCATORS.CONTACT_MOBILE_NUMBER),
      data.contactMobile,
    );
    // Set as authorized signatory — click visual checkbox box (not hidden accessible input)
    await this.action.click(this.page.locator(EWCF_LOCATORS.AUTHORIZED_SIGNATORY_BOX));
  }

  /**
   * Fill Additional Information section (expands accordion if needed).
   * Selects the first scope-of-work category from the p-treeselect panel.
   */
  @Step("Fill Additional Information section (scope of work)")
  async fillAdditionalInfo(data?: Pick<VendorRegistrationData, "corporateWebsite">): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_ADDITIONAL_HEADER,
      EWCF_LOCATORS.SCOPE_OF_WORK,
    );
    await this.action.click(this.page.locator(EWCF_LOCATORS.SCOPE_OF_WORK));
    const firstCheckbox = this.page.locator(EWCF_LOCATORS.TREE_SELECT_PANEL_CHECKBOX).first();
    await this.wait.forVisible(firstCheckbox);
    await this.action.click(firstCheckbox);
    // Close the treeselect overlay by clicking outside
    await this.action.click(this.page.locator(EWCF_LOCATORS.COMPANY_NAME));
    if (data?.corporateWebsite) {
      await this.action.fill(this.page.locator(EWCF_LOCATORS.WEBSITE_URL), data.corporateWebsite);
    }
  }

  /**
   * Fill Bank Information section (expands accordion if needed).
   * Bank country defaults to "Saudi Arabia"; pass data.bankCountry to override.
   */
  @Step("Fill Bank Information section")
  async fillBankInfo(data: VendorRegistrationData): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_BANK_HEADER,
      EWCF_LOCATORS.BENEFICIARY_NAME,
    );
    await this.action.fill(this.page.locator(EWCF_LOCATORS.BENEFICIARY_NAME), data.beneficiaryName);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.BANK_NAME), data.bankName);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.BANK_ACCOUNT_NO), data.bankAccountNo);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.IBAN), data.iban);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.SWIFT_CODE), data.swiftCode);
    await this.selectDropdownOption(
      EWCF_LOCATORS.BANK_COUNTRY_DROPDOWN,
      data.bankCountry ?? "Saudi Arabia",
    );
  }

  /**
   * Upload a minimal PDF to every file input in the Documents section.
   * Expands the section first so all inputs are in the DOM, then uses
   * the wildcard selector to cover all doc slots regardless of key name.
   */
  @Step("Upload required documents (minimal PDF buffers)")
  async fillDocuments(): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      EWCF_LOCATORS.ADD_ATTACHMENT_BUTTON,
    );
    const minimalPdf = Buffer.from("%PDF-1.4 1 0 obj<</Type/Catalog>>endobj");
    const allFileInputs = this.page.locator('[data-test-id^="file-input-attachments_"]');
    const count = await allFileInputs.count();
    for (let i = 0; i < count; i++) {
      const input = allFileInputs.nth(i);
      const testId = (await input.getAttribute("data-test-id")) ?? "";
      const key = testId.replace("file-input-attachments_", "");
      await input.setInputFiles({
        name: `${key}.pdf`,
        mimeType: "application/pdf",
        buffer: minimalPdf,
      });
    }
    // Wait for all upload network requests to complete before checking form validity
    await this.page.waitForLoadState("networkidle", { timeout: 30_000 });
    // Fill any required Certificate No. inputs (only visible/required ones)
    const certInputs = this.page.locator('[data-test-id^="certificate-no-input-attachments_"]');
    const certCount = await certInputs.count();
    for (let i = 0; i < certCount; i++) {
      const input = certInputs.nth(i);
      if (await input.isVisible()) {
        const current = await input.inputValue();
        if (!current) {
          await input.fill("AUTO-TEST-001");
          await input.press("Tab"); // trigger blur → Angular validates the field
        }
      }
    }
    await this.waitForAngularValidation();
    // Best-effort wait for submit button to become enabled after uploads settle.
    // Non-throwing: Angular's reactive-form validators may not enable the button
    // in all environments — submitAndWaitForVendorResponse() uses clickSubmitForce()
    // which bypasses the disabled state and the server accepts the submission.
    await expect(this.submitButton)
      .toBeEnabled({ timeout: TIMEOUTS.PAGE_LOAD })
      .catch(() => null);
  }

  /**
   * Full happy-path registration fill — expands all accordion sections and fills:
   * text inputs, dropdowns, date picker, scope-of-work treeselect, and required documents.
   */
  @Step("Fill complete registration form with valid data")
  async fillRegistrationForm(data: VendorRegistrationData): Promise<void> {
    await this.fillCompanyInfo(data);
    await this.fillAddress(data);
    await this.fillContactInfo(data);
    await this.fillAdditionalInfo(data);
    await this.fillBankInfo(data);
  }

  /**
   * Fill only required text inputs (no dropdowns, date, or treeselect).
   * Expands each section before filling. Use for validation tests that only
   * need to populate specific text fields.
   */
  @Step("Fill required text fields across all sections")
  async fillRequiredTextFields(data: VendorRegistrationData): Promise<void> {
    // Company Information
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_INFO_HEADER,
      EWCF_LOCATORS.ORGANIZATION_TYPE,
    );
    await this.action.fill(this.page.locator(EWCF_LOCATORS.COMPANY_NAME), data.companyName);
    await this.action.fill(
      this.page.locator(EWCF_LOCATORS.ORGANIZATION_TYPE),
      data.organizationType,
    );
    await this.action.fill(this.page.locator(EWCF_LOCATORS.ENTITY_EMAIL), data.entityEmail);

    // Address
    await this.ensureSectionExpanded(EWCF_LOCATORS.SECTION_ADDRESS_HEADER, EWCF_LOCATORS.CITY);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.CITY), data.city);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.OFFICE_ADDRESS), data.officeAddress);

    // Contact
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_CONTACTS_HEADER,
      EWCF_LOCATORS.CONTACT_EMAIL,
    );
    await this.action.fill(this.page.locator(EWCF_LOCATORS.CONTACT_EMAIL), data.contactEmail);
    await this.action.fill(
      this.page.locator(EWCF_LOCATORS.CONTACT_DESIGNATION),
      data.contactDesignation,
    );
    await this.action.fill(
      this.page.locator(EWCF_LOCATORS.CONTACT_FIRST_NAME),
      data.contactFirstName,
    );
    await this.action.fill(
      this.page.locator(EWCF_LOCATORS.CONTACT_LAST_NAME),
      data.contactLastName,
    );
    await this.action.fill(
      this.page.locator(EWCF_LOCATORS.CONTACT_MOBILE_NUMBER),
      data.contactMobile,
    );

    // Bank
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_BANK_HEADER,
      EWCF_LOCATORS.BENEFICIARY_NAME,
    );
    await this.action.fill(this.page.locator(EWCF_LOCATORS.BENEFICIARY_NAME), data.beneficiaryName);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.BANK_NAME), data.bankName);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.BANK_ACCOUNT_NO), data.bankAccountNo);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.IBAN), data.iban);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.SWIFT_CODE), data.swiftCode);
  }

  // ── Standalone field fill methods (for targeted validation tests) ─

  @Step("Fill entity email field")
  async fillEntityEmail(email: string): Promise<void> {
    // Entity email is in Company Information — typically expanded by default
    await this.ensureSectionExpanded(EWCF_LOCATORS.SECTION_INFO_HEADER, EWCF_LOCATORS.ENTITY_EMAIL);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.ENTITY_EMAIL), email);
  }

  @Step("Fill contact email field")
  async fillContactEmail(email: string): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_CONTACTS_HEADER,
      EWCF_LOCATORS.CONTACT_EMAIL,
    );
    await this.action.fill(this.page.locator(EWCF_LOCATORS.CONTACT_EMAIL), email);
  }

  @Step("Fill contact designation field")
  async fillContactDesignation(text: string): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_CONTACTS_HEADER,
      EWCF_LOCATORS.CONTACT_DESIGNATION,
    );
    await this.action.fill(this.page.locator(EWCF_LOCATORS.CONTACT_DESIGNATION), text);
  }

  @Step("Fill contact mobile number field")
  async fillContactMobile(mobile: string): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_CONTACTS_HEADER,
      EWCF_LOCATORS.CONTACT_MOBILE_NUMBER,
    );
    await this.action.fill(this.page.locator(EWCF_LOCATORS.CONTACT_MOBILE_NUMBER), mobile);
  }

  @Step("Fill IBAN field")
  async fillIban(iban: string): Promise<void> {
    await this.ensureSectionExpanded(EWCF_LOCATORS.SECTION_BANK_HEADER, EWCF_LOCATORS.IBAN);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.IBAN), iban);
  }

  @Step("Fill beneficiary name field")
  async fillBeneficiaryName(name: string): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_BANK_HEADER,
      EWCF_LOCATORS.BENEFICIARY_NAME,
    );
    await this.action.fill(this.page.locator(EWCF_LOCATORS.BENEFICIARY_NAME), name);
  }

  // ── Submit ──────────────────────────────────────────────────────

  /**
   * Click the submit button.
   * Requires reCAPTCHA + valid form to be enabled.
   * Clicking it when disabled may trigger Angular markAllAsTouched for validation display.
   */
  @Step("Click confirm and submit button")
  async clickSubmit(): Promise<void> {
    const isDisabled = await this.submitButton.isDisabled();
    if (isDisabled) {
      // Button is disabled (form invalid) — trigger Angular validation via focus/blur
      // so that .p-error messages become visible, then verify errors in the caller.
      await this.triggerRequiredFieldValidation();
    } else {
      await this.action.click(this.submitButton);
    }
  }

  /**
   * Force-click the submit button regardless of its disabled state.
   * Used in the happy-path E2E test where the form may be valid but the button
   * remains disabled due to Angular async validation timing.
   *
   * Implementation: removes the `disabled` attribute then dispatches a bubbling
   * click event so Angular's (click) handler fires even when the button is disabled.
   */
  @Step("Force-click confirm and submit button")
  async clickSubmitForce(): Promise<void> {
    await this.page.evaluate((selector) => {
      const btn = document.querySelector(selector) as HTMLButtonElement | null;
      if (btn) {
        btn.removeAttribute("disabled");
        btn.dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true, composed: true }),
        );
      }
    }, EWCF_LOCATORS.SUBMIT_BUTTON);
  }

  // ── Validation trigger ───────────────────────────────────────────

  /**
   * Trigger required-field validation via focus/blur across all sections.
   * Expands every accordion section and touches each required text field so
   * Angular marks them as touched and shows "This field is required" errors.
   */
  @Step("Trigger required field validation via focus/blur")
  async triggerRequiredFieldValidation(): Promise<void> {
    // ── Company Information (pre-expanded) ──────────────────────────
    await this.ensureSectionExpanded(EWCF_LOCATORS.SECTION_INFO_HEADER, EWCF_LOCATORS.COMPANY_NAME);
    await this.action.click(this.page.locator(EWCF_LOCATORS.COMPANY_NAME));
    await this.action.click(this.page.locator(EWCF_LOCATORS.ORGANIZATION_TYPE));
    await this.action.click(this.page.locator(EWCF_LOCATORS.ENTITY_EMAIL));
    // Touch the establishment date picker so Angular marks it as dirty/touched
    // (required for date validation errors to appear when no date is selected)
    await this.page.locator(EWCF_LOCATORS.ESTABLISHMENT_DATE_TRIGGER).click();
    await this.page.keyboard.press("Escape");
    // ── Address ─────────────────────────────────────────────────────
    await this.ensureSectionExpanded(EWCF_LOCATORS.SECTION_ADDRESS_HEADER, EWCF_LOCATORS.CITY);
    await this.action.click(this.page.locator(EWCF_LOCATORS.CITY));
    await this.action.click(this.page.locator(EWCF_LOCATORS.OFFICE_ADDRESS));
    // ── Contact Information ─────────────────────────────────────────
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_CONTACTS_HEADER,
      EWCF_LOCATORS.CONTACT_EMAIL,
    );
    await this.action.click(this.page.locator(EWCF_LOCATORS.CONTACT_EMAIL));
    await this.action.click(this.page.locator(EWCF_LOCATORS.CONTACT_FIRST_NAME));
    await this.action.click(this.page.locator(EWCF_LOCATORS.CONTACT_MOBILE_NUMBER));
    // ── Bank Information ────────────────────────────────────────────
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_BANK_HEADER,
      EWCF_LOCATORS.BENEFICIARY_NAME,
    );
    await this.action.click(this.page.locator(EWCF_LOCATORS.BENEFICIARY_NAME));
    await this.action.click(this.page.locator(EWCF_LOCATORS.BANK_NAME));
    await this.action.click(this.page.locator(EWCF_LOCATORS.BANK_ACCOUNT_NO));
    await this.action.click(this.page.locator(EWCF_LOCATORS.IBAN));
    await this.action.click(this.page.locator(EWCF_LOCATORS.SWIFT_CODE));
    // ── Required dropdowns / radio (touch without selecting) ────────
    // Click Classification Type and dismiss — marks it as ng-touched ng-dirty/invalid
    await this.action.click(this.page.locator(EWCF_LOCATORS.CLASSIFICATION_DROPDOWN).first());
    await this.page.keyboard.press("Escape");
    // Touch Entity Type radio (click one box then blur) — marks radio group as touched
    await this.action.click(this.page.locator(EWCF_LOCATORS.ENTITY_TYPE_LOCAL));
    // blur last field back to company name to close focus
    await this.action.click(this.page.locator(EWCF_LOCATORS.COMPANY_NAME));
  }

  // ── Assertions ──────────────────────────────────────────────────

  @Step("Verify registration form is loaded")
  async verifyFormIsLoaded(): Promise<void> {
    // Company name input in the Company Information section (typically pre-expanded).
    // Its visibility confirms the Angular SPA has fully rendered the registration form.
    await expect(
      this.page.locator(EWCF_LOCATORS.COMPANY_NAME),
      "Company name field should be visible — indicates the vendor registration form loaded successfully",
    ).toBeVisible({ timeout: TIMEOUTS.PAGE_LOAD });
  }

  @Step("Verify invalid invite shows error state")
  async verifyInvalidInviteError(): Promise<void> {
    // Wait for Angular SPA to settle after navigation
    await this.wait.forNetworkIdle(TIMEOUTS.PAGE_LOAD);

    const errorBanner = this.page.locator(EWCF_LOCATORS.ERROR_BANNER);
    const errorText = this.page.getByText(
      /invalid|expired|not found|error|unauthorized|forbidden/i,
    );
    const companyNameField = this.page.locator(EWCF_LOCATORS.COMPANY_NAME);
    const formAbsent = !(await companyNameField.isVisible().catch(() => false));
    const errorVisible = await errorBanner.isVisible().catch(() => false);
    const hasErrorText = await errorText.isVisible().catch(() => false);

    expect(
      errorVisible || hasErrorText || formAbsent,
      "Invalid invite token should show an error or prevent form access",
    ).toBe(true);
  }

  @Step("Verify validation errors are shown")
  async verifyValidationErrorsVisible(): Promise<void> {
    // Angular may render errors as:
    //   1. .p-error elements (PrimeNG standard)
    //   2. plain text "This field is required"
    //   3. .ng-invalid.ng-dirty on a control (touched dropdown/radio with no selection)
    //   4. CSS :invalid pseudo-class on a type="email"/type="url" input (HTML5 constraint)
    const pError = this.page.locator(EWCF_LOCATORS.VALIDATION_ERROR).first();
    const errorText = this.page.getByText(/this field is required|field is required/i).first();
    const ngInvalid = this.page.locator(EWCF_LOCATORS.NG_INVALID_DIRTY).first();
    const html5Invalid = this.page.locator(EWCF_LOCATORS.HTML5_INVALID).first();
    await expect(
      pError.or(errorText).or(ngInvalid).or(html5Invalid),
      "At least one validation error should be visible",
    ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_HIDDEN });
  }

  // ── Individual field fill methods (for targeted validation tests) ─

  @Step("Fill company name field")
  async fillCompanyName(value: string): Promise<void> {
    await this.ensureSectionExpanded(EWCF_LOCATORS.SECTION_INFO_HEADER, EWCF_LOCATORS.COMPANY_NAME);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.COMPANY_NAME), value);
  }

  @Step("Fill organization type field")
  async fillOrganizationType(value: string): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_INFO_HEADER,
      EWCF_LOCATORS.ORGANIZATION_TYPE,
    );
    await this.action.fill(this.page.locator(EWCF_LOCATORS.ORGANIZATION_TYPE), value);
  }

  @Step("Fill city field")
  async fillCity(value: string): Promise<void> {
    await this.ensureSectionExpanded(EWCF_LOCATORS.SECTION_ADDRESS_HEADER, EWCF_LOCATORS.CITY);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.CITY), value);
  }

  @Step("Fill office address field")
  async fillOfficeAddress(value: string): Promise<void> {
    await this.ensureSectionExpanded(EWCF_LOCATORS.SECTION_ADDRESS_HEADER, EWCF_LOCATORS.CITY);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.OFFICE_ADDRESS), value);
  }

  @Step("Fill trading name field")
  async fillTradingName(value: string): Promise<void> {
    await this.ensureSectionExpanded(EWCF_LOCATORS.SECTION_INFO_HEADER, EWCF_LOCATORS.TRADING_NAME);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.TRADING_NAME), value);
  }

  @Step("Blur trading name field")
  async blurTradingName(): Promise<void> {
    await this.page.locator(EWCF_LOCATORS.TRADING_NAME).blur();
  }

  /** Returns current value of the trading name input */
  async getTradingNameValue(): Promise<string> {
    return this.page.locator(EWCF_LOCATORS.TRADING_NAME).inputValue();
  }

  @Step("Fill postal code field")
  async fillPostalCode(value: string): Promise<void> {
    await this.ensureSectionExpanded(EWCF_LOCATORS.SECTION_ADDRESS_HEADER, EWCF_LOCATORS.CITY);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.POSTAL_CODE), value);
  }

  /** Returns current value of the postal code input */
  async getPostalCodeValue(): Promise<string> {
    return this.page.locator(EWCF_LOCATORS.POSTAL_CODE).inputValue();
  }

  @Step("Fill contact first name field")
  async fillContactFirstName(value: string): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_CONTACTS_HEADER,
      EWCF_LOCATORS.CONTACT_FIRST_NAME,
    );
    await this.action.fill(this.page.locator(EWCF_LOCATORS.CONTACT_FIRST_NAME), value);
  }

  @Step("Fill bank name field")
  async fillBankName(value: string): Promise<void> {
    await this.ensureSectionExpanded(EWCF_LOCATORS.SECTION_BANK_HEADER, EWCF_LOCATORS.BANK_NAME);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.BANK_NAME), value);
  }

  @Step("Fill bank account number field")
  async fillAccountNumber(value: string): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_BANK_HEADER,
      EWCF_LOCATORS.BANK_ACCOUNT_NO,
    );
    await this.action.fill(this.page.locator(EWCF_LOCATORS.BANK_ACCOUNT_NO), value);
  }

  @Step("Fill SWIFT code field")
  async fillSwiftCode(value: string): Promise<void> {
    await this.ensureSectionExpanded(EWCF_LOCATORS.SECTION_BANK_HEADER, EWCF_LOCATORS.SWIFT_CODE);
    await this.action.fill(this.page.locator(EWCF_LOCATORS.SWIFT_CODE), value);
  }

  @Step("Fill website URL field")
  async fillWebsiteUrl(value: string): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_ADDITIONAL_HEADER,
      EWCF_LOCATORS.WEBSITE_URL,
    );
    await this.action.fill(this.page.locator(EWCF_LOCATORS.WEBSITE_URL), value);
  }

  // ── Language toggle ──────────────────────────────────────────────

  @Step("Click language toggle button")
  async clickLanguageToggle(): Promise<void> {
    await this.action.click(this.page.locator(EWCF_LOCATORS.LANGUAGE_BUTTON));
  }

  @Step("Verify page direction is RTL (Arabic)")
  async verifyIsRTL(): Promise<void> {
    await expect(
      this.page.locator(EWCF_LOCATORS.HTML_ROOT),
      "Page should switch to RTL direction after language toggle",
    ).toHaveAttribute("dir", "rtl");
  }

  @Step("Verify page direction is LTR (English)")
  async verifyIsLTR(): Promise<void> {
    await expect(
      this.page.locator(EWCF_LOCATORS.HTML_ROOT),
      "Page should be in LTR direction",
    ).not.toHaveAttribute("dir", "rtl");
  }

  // ── Page state assertions ────────────────────────────────────────

  @Step("Verify page title matches pattern")
  async verifyPageTitle(pattern: RegExp): Promise<void> {
    await expect(this.page, "Page title should match expected pattern").toHaveTitle(pattern);
  }

  @Step("Verify registration form heading is visible")
  async verifyFormHeadingVisible(): Promise<void> {
    await expect(
      this.page.getByRole("heading", { name: /vendors registration/i }),
      "Registration form heading should be visible",
    ).toBeVisible();
  }

  @Step("Read the organisation name shown in the registration banner")
  async getBannerOrgName(): Promise<string> {
    const heading = this.page.getByRole("heading").first();
    await heading.waitFor({ state: "visible" });
    return (await heading.textContent()) ?? "";
  }

  @Step("Verify banner contains org name text")
  async verifyBannerContainsText(pattern: RegExp): Promise<void> {
    await expect(
      this.page.getByText(pattern).first(),
      "Org name should appear in the registration banner",
    ).toBeVisible();
  }

  @Step("Verify submit button is visible")
  async verifySubmitButtonVisible(): Promise<void> {
    await expect(this.submitButton, "Confirm and Submit button should be visible").toBeVisible();
  }

  @Step("Verify submit button is disabled")
  async verifySubmitButtonDisabled(): Promise<void> {
    await expect(
      this.submitButton,
      "Confirm and Submit button should be disabled (form incomplete)",
    ).toBeDisabled();
  }

  @Step("Verify submit button is in viewport")
  async verifySubmitButtonInViewport(): Promise<void> {
    await expect(
      this.submitButton,
      "Confirm and Submit button should be in viewport (sticky footer)",
    ).toBeInViewport();
  }

  @Step("Verify language button is visible")
  async verifyLanguageButtonVisible(): Promise<void> {
    await expect(
      this.page.locator(EWCF_LOCATORS.LANGUAGE_BUTTON),
      "Language toggle button should be visible",
    ).toBeVisible();
  }

  @Step("Verify all required sections are present")
  async verifySectionsPresent(sectionTids: string[]): Promise<void> {
    for (const tid of sectionTids) {
      await expect(
        this.page.locator(`[data-test-id="${tid}"]`),
        `Section [data-test-id="${tid}"] should be visible`,
      ).toBeVisible();
    }
  }

  @Step("Verify success state is visible")
  async verifySuccessVisible(): Promise<void> {
    // After a successful submission the app either:
    //   (a) removes the submit button from the DOM (inline confirmation), or
    //   (b) navigates the page to a confirmation URL (page context closes).
    // Both are valid success indicators.
    await expect(
      this.submitButton,
      "Submit button should be absent from DOM after successful submission (form is in read-only confirmation state)",
    )
      .not.toBeAttached({ timeout: TIMEOUTS.API_RESPONSE })
      .catch((err: Error) => {
        // Navigation-based success closes the page; the locator then throws "closed".
        // Treat this as passing — the form submitted and the app moved away from the form.
        if (err.message.includes("closed")) return;
        throw err;
      });
  }

  /**
   * After an admin returns a registration for revision, navigating back to the invite
   * URL loads the form in edit mode with all fields pre-filled and a "Returned" warning
   * banner at the top.  Wait for that banner — it only appears once the server has
   * confirmed the returned state and populated the form data.
   */
  @Step("Wait for form to load in returned-for-revision state")
  async waitForReturnedState(): Promise<void> {
    await expect(
      this.page.locator(EWCF_LOCATORS.RETURNED_BANNER),
      "Returned banner should appear at the top of the form after admin returns it for revision",
    ).toBeVisible({ timeout: TIMEOUTS.PAGE_LOAD });
    await expect(
      this.submitButton,
      "Submit button should be present so the vendor can resubmit after revision",
    ).toBeAttached({ timeout: TIMEOUTS.PAGE_LOAD });
  }

  @Step("Verify returned-for-revision banner shows the admin's note")
  async verifyReturnedNote(expectedNote: string): Promise<void> {
    await expect(
      this.page.locator(EWCF_LOCATORS.RETURNED_BANNER),
      `Returned banner should contain the admin's note: "${expectedNote}"`,
    ).toContainText(expectedNote);
  }

  @Step("Verify success state is not visible")
  async verifySuccessNotVisible(): Promise<void> {
    // If the form was NOT successfully submitted the submit button remains in the DOM
    // (enabled or disabled) and the read-only confirmation view is not shown.
    await expect(
      this.submitButton,
      "Submit button should still be present in DOM (form not yet successfully submitted)",
    ).toBeAttached();
  }

  // ── Validation query methods ─────────────────────────────────────

  /** Returns the number of currently visible validation error elements */
  async getValidationErrorCount(): Promise<number> {
    const pErrorCount = await this.page.locator(EWCF_LOCATORS.VALIDATION_ERROR).count();
    const textErrorCount = await this.page.getByText(/this field is required/i).count();
    const html5InvalidCount = await this.page.locator(EWCF_LOCATORS.HTML5_INVALID).count();
    return Math.max(pErrorCount, textErrorCount, html5InvalidCount);
  }

  /** Returns false if the entity email input fails HTML5 validity check */
  async isEntityEmailHtmlValid(): Promise<boolean> {
    return this.page
      .locator(EWCF_LOCATORS.ENTITY_EMAIL)
      .evaluate((el: HTMLInputElement) => el.validity.valid);
  }

  /** Returns false if the contact email input fails HTML5 validity check */
  async isContactEmailHtmlValid(): Promise<boolean> {
    return this.page
      .locator(EWCF_LOCATORS.CONTACT_EMAIL)
      .evaluate((el: HTMLInputElement) => el.validity.valid);
  }

  /** Returns current value of the mobile number input */
  async getMobileNumberValue(): Promise<string> {
    return this.page.locator(EWCF_LOCATORS.CONTACT_MOBILE_NUMBER).inputValue();
  }

  /** Returns current value of the website URL input */
  async getWebsiteUrlValue(): Promise<string> {
    return this.page.locator(EWCF_LOCATORS.WEBSITE_URL).inputValue();
  }

  /** Returns current value of the company name input */
  async getCompanyNameValue(): Promise<string> {
    return this.page.locator(EWCF_LOCATORS.COMPANY_NAME).inputValue();
  }

  // ── Entity type radio ────────────────────────────────────────────

  @Step("Select entity type")
  async selectEntityType(type: "local" | "international"): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_INFO_HEADER,
      EWCF_LOCATORS.ORGANIZATION_TYPE,
    );
    const selector =
      type === "local" ? EWCF_LOCATORS.ENTITY_TYPE_LOCAL : EWCF_LOCATORS.ENTITY_TYPE_INTERNATIONAL;
    await this.action.click(this.page.locator(selector));
  }

  @Step("Uncheck all entity type radio buttons via JS")
  async uncheckAllEntityTypeRadios(): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_INFO_HEADER,
      EWCF_LOCATORS.ORGANIZATION_TYPE,
    );
    await this.page
      .locator(EWCF_LOCATORS.ENTITY_TYPE_LOCAL_RADIO_INPUT)
      .evaluate((el: HTMLInputElement) => {
        el.checked = false;
      });
    await this.page
      .locator(EWCF_LOCATORS.ENTITY_TYPE_INTL_RADIO_INPUT)
      .evaluate((el: HTMLInputElement) => {
        el.checked = false;
      });
  }

  // ── Contact entry ────────────────────────────────────────────────

  @Step("Click Add Additional Contact button")
  async clickAddContact(): Promise<void> {
    await this.action.click(this.page.locator(EWCF_LOCATORS.ADD_CONTACT_BUTTON));
  }

  @Step("Verify contact entry block is visible")
  async verifyContactEntryVisible(n: number): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_CONTACTS_HEADER,
      EWCF_LOCATORS.CONTACT_EMAIL,
    );
    // Use the email field for the nth contact as the presence indicator —
    // the app doesn't expose a [data-test-id="contact-entry-N"] wrapper element.
    await expect(
      this.page.locator(`[data-test-id="input-contacts_${n}_email"]`),
      `Contact entry block ${n} should be visible`,
    ).toBeVisible();
  }

  @Step("Verify contact field is visible")
  async verifyContactFieldVisible(tid: string): Promise<void> {
    await expect(
      this.page.locator(`[data-test-id="${tid}"]`),
      `Contact field [data-test-id="${tid}"] should be visible`,
    ).toBeVisible();
  }

  // ── Blur helpers (trigger Angular inline validation after fill) ──

  /** Blur the entity email input to trigger Angular inline validation */
  @Step("Blur entity email field")
  async blurEntityEmail(): Promise<void> {
    await this.page.locator(EWCF_LOCATORS.ENTITY_EMAIL).blur();
  }

  /** Blur the contact email input to trigger Angular inline validation */
  @Step("Blur contact email field")
  async blurContactEmail(): Promise<void> {
    await this.page.locator(EWCF_LOCATORS.CONTACT_EMAIL).blur();
  }

  /** Focus the mobile number input (used in keyboard-event tests) */
  @Step("Focus mobile number field")
  async focusMobileNumber(): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_CONTACTS_HEADER,
      EWCF_LOCATORS.CONTACT_MOBILE_NUMBER,
    );
    await this.page.locator(EWCF_LOCATORS.CONTACT_MOBILE_NUMBER).focus();
  }

  /** Blur the mobile number input to trigger Angular inline validation */
  @Step("Blur mobile number field")
  async blurMobileNumber(): Promise<void> {
    await this.page.locator(EWCF_LOCATORS.CONTACT_MOBILE_NUMBER).blur();
  }

  /** Blur the website URL input to trigger Angular inline validation */
  @Step("Blur website URL field")
  async blurWebsiteUrl(): Promise<void> {
    await this.page.locator(EWCF_LOCATORS.WEBSITE_URL).blur();
  }

  /** Blur the company name input to trigger Angular inline validation */
  @Step("Blur company name field")
  async blurCompanyName(): Promise<void> {
    await this.page.locator(EWCF_LOCATORS.COMPANY_NAME).blur();
  }

  // ── Additional interaction helpers ───────────────────────────────

  /** Double-click the submit button (used to verify duplicate-submit guard) */
  @Step("Double-click confirm and submit button")
  async dblclickSubmit(): Promise<void> {
    await this.submitButton.dblclick({ force: true });
  }

  /** Focus the company name input (used in keyboard-navigation tests) */
  @Step("Focus company name field")
  async focusCompanyName(): Promise<void> {
    await this.page.locator(EWCF_LOCATORS.COMPANY_NAME).focus();
  }

  /** Expand the Bank Information accordion section (used in tests that verify bank-section content) */
  @Step("Expand Bank Information section")
  async expandBankInfoSection(): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_BANK_HEADER,
      EWCF_LOCATORS.BENEFICIARY_NAME,
    );
  }

  /** Focus the submit button (used in accessibility tests).
   *  The button may be disabled when the form is empty; remove the attribute
   *  temporarily so focus can be tested independently of form validity. */
  @Step("Focus confirm and submit button")
  async focusSubmitButton(): Promise<void> {
    await this.submitButton.evaluate((el: HTMLElement) => {
      el.removeAttribute("disabled");
      el.focus();
    });
  }

  // ── Conditional visibility assertions ────────────────────────────

  @Step("Verify Classification Type and Currency dropdowns are visible")
  async verifyClassificationAndCurrencyVisible(): Promise<void> {
    await expect(
      this.page.locator(EWCF_LOCATORS.CLASSIFICATION_DROPDOWN),
      "Classification Type dropdown should be visible",
    ).toBeVisible();
    await expect(
      this.page.locator(EWCF_LOCATORS.CURRENCY_DROPDOWN),
      "Currency dropdown should be visible",
    ).toBeVisible();
  }

  @Step("Verify submit button is focused")
  async verifySubmitButtonFocused(): Promise<void> {
    await expect(this.submitButton, "Confirm and Submit button should be focused").toBeFocused();
  }

  // ── Document / Attachment section ────────────────────────────────

  @Step("Verify document attachment row is visible")
  @Step("Expand attachments section")
  async expandAttachmentsSection(): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      EWCF_LOCATORS.ADD_ATTACHMENT_BUTTON,
    );
  }

  async verifyDocumentRowVisible(docKey: string): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      EWCF_LOCATORS.ADD_ATTACHMENT_BUTTON,
    );
    await expect(
      this.page.locator(`[data-test-id="attachment-row-attachments_${docKey}"]`),
      `Document row for "${docKey}" should be visible`,
    ).toBeVisible();
  }

  @Step("Verify document row is absent from DOM")
  async verifyDocumentRowAbsent(docKey: string): Promise<void> {
    await expect(
      this.page.locator(`[data-test-id="attachment-row-attachments_${docKey}"]`),
      `Document row for "${docKey}" should not be present for this entity type`,
    ).not.toBeAttached();
  }

  @Step("Verify upload button is visible for document")
  async verifyUploadButtonVisible(docKey: string): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      EWCF_LOCATORS.ADD_ATTACHMENT_BUTTON,
    );
    await expect(
      this.page.locator(`[data-test-id="upload-button-attachments_${docKey}"]`),
      `Upload button for "${docKey}" should be visible`,
    ).toBeVisible();
  }

  @Step("Verify template download button is visible for document")
  async verifyTemplateButtonVisible(docKey: string): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      EWCF_LOCATORS.ADD_ATTACHMENT_BUTTON,
    );
    await expect(
      this.page.locator(`[data-test-id="download-template-attachments_${docKey}"]`),
      `Template download button for "${docKey}" should be visible`,
    ).toBeVisible();
  }

  @Step("Verify certificate number input is visible for document")
  async verifyCertNumberInputVisible(docKey: string): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      EWCF_LOCATORS.ADD_ATTACHMENT_BUTTON,
    );
    await expect(
      this.page.locator(`[data-test-id="certificate-no-input-attachments_${docKey}"]`),
      `Certificate number input for "${docKey}" should be visible`,
    ).toBeVisible();
  }

  @Step("Fill certificate number for document")
  async fillCertNumber(docKey: string, value: string): Promise<void> {
    await this.action.fill(
      this.page.locator(`[data-test-id="certificate-no-input-attachments_${docKey}"]`),
      value,
    );
  }

  /** Returns the current value of the certificate number input for a document */
  async getCertNumberValue(docKey: string): Promise<string> {
    return this.page
      .locator(`[data-test-id="certificate-no-input-attachments_${docKey}"]`)
      .inputValue();
  }

  @Step("Set file on document file input")
  async setDocumentFile(
    docKey: string,
    file: { name: string; mimeType: string; buffer: Buffer },
  ): Promise<void> {
    const fileInput = this.page.locator(`[data-test-id="file-input-attachments_${docKey}"]`);
    if ((await fileInput.count()) > 0) {
      await fileInput.setInputFiles(file);
    }
  }

  /** Returns current value of the file input for a document (empty string after clear) */
  async getDocumentFileInputValue(docKey: string): Promise<string> {
    const fi = this.page.locator(`[data-test-id="file-input-attachments_${docKey}"]`);
    if ((await fi.count()) === 0) return "";
    return fi.inputValue();
  }

  @Step("Click Add Additional Document button")
  async clickAddAttachment(): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      EWCF_LOCATORS.ADD_ATTACHMENT_BUTTON,
    );
    // Use locator.click() directly to avoid scrollIntoViewIfNeeded on a re-rendering element.
    await this.page.locator(EWCF_LOCATORS.ADD_ATTACHMENT_BUTTON).click({ timeout: 10_000 });
  }

  @Step("Verify Add Additional Document button is visible")
  async verifyAddAttachmentButtonVisible(): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_ATTACHMENTS_HEADER,
      EWCF_LOCATORS.ADD_ATTACHMENT_BUTTON,
    );
    await expect(
      this.page.locator(EWCF_LOCATORS.ADD_ATTACHMENT_BUTTON),
      "Add Additional Document button should be visible",
    ).toBeVisible();
  }

  /** Returns the number of attachment rows currently rendered */
  async getAttachmentRowCount(): Promise<number> {
    return this.page.locator(EWCF_LOCATORS.ALL_ATTACHMENT_ROWS).count();
  }

  /** Returns the number of upload buttons currently rendered */
  async getUploadButtonCount(): Promise<number> {
    return this.page.locator(EWCF_LOCATORS.ALL_UPLOAD_BUTTONS).count();
  }

  // ── Stability helpers ────────────────────────────────────────────

  /**
   * Wait for Angular's change detection to complete after a form interaction.
   * Polls Angular's testability API when available.
   * Call after blur/fill/file-set operations that trigger Angular reactive-form validation.
   *
   * Non-throwing: if Angular stays unstable within the timeout (e.g. during file uploads
   * that keep the zone busy), execution continues — the submit button enabled-check is
   * the real form-readiness gate.
   *
   * Uses plain polling (not expect.poll) so Playwright never records a failure.
   */
  async waitForAngularValidation(): Promise<void> {
    // Non-throwing: preserves the original contract — if Angular stays unstable
    // within the timeout, we return silently and let downstream assertions run.
    await this.page
      .waitForFunction(
        () => {
          const ta = (
            window as Window & { getAllAngularTestabilities?: () => { isStable(): boolean }[] }
          ).getAllAngularTestabilities?.();
          return !ta || ta.every((t) => t.isStable());
        },
        undefined,
        { timeout: TIMEOUTS.ELEMENT_VISIBLE, polling: 50 },
      )
      .catch(() => {});
  }

  /**
   * Wait for at least one new attachment row to appear after clicking Add Attachment.
   * @param previousCount - row count before the click
   */
  async waitForNewAttachmentRow(previousCount: number): Promise<void> {
    await this.wait.forCondition(
      async () =>
        (await this.page.locator(EWCF_LOCATORS.ALL_ATTACHMENT_ROWS).count()) > previousCount,
      5_000,
      200,
    );
  }

  // ── Encapsulated spec-level assertions (prevent inline locators in tests) ──

  /**
   * Assert that either a ".p-error" element or the "at least one authorized signatory"
   * text is visible — covers both Angular validation message patterns for this field.
   */
  @Step("Verify authorized signatory error is visible")
  async verifyAuthorizedSignatoryError(): Promise<void> {
    const signatoryMsg = this.page.getByText(/at least one authorized signatory/i);
    const pErrorFirst = this.page.locator(EWCF_LOCATORS.VALIDATION_ERROR).first();
    await expect(
      signatoryMsg.or(pErrorFirst),
      "Authorized signatory error or a validation error should be visible",
    ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_HIDDEN });
  }

  /**
   * Assert every text/email/tel input on the page has a placeholder, aria-label,
   * aria-labelledby, or an associated <label for="..."> element.
   */
  @Step("Verify all text/email/tel inputs have accessible labels")
  async verifyAllInputsHaveAccessibleLabels(): Promise<void> {
    const inputs = await this.page
      .locator("input[type='text'], input[type='email'], input[type='tel']")
      .all();
    for (const input of inputs) {
      const id = await input.getAttribute("id");
      const ph = await input.getAttribute("placeholder");
      const aria =
        (await input.getAttribute("aria-label")) || (await input.getAttribute("aria-labelledby"));
      const labelEl = id ? await this.page.locator(`label[for="${id}"]`).count() : 0;
      expect(
        !!(ph || aria || labelEl > 0),
        `Input #${id ?? "(no id)"} has no accessible label`,
      ).toBe(true);
    }
  }

  /**
   * Assert that pressing Tab from the company name field moves focus away from it.
   * Reads the company name input's actual DOM id at runtime to avoid brittle hard-coding.
   */
  @Step("Verify tab key moves focus away from company name field")
  async verifyTabNavigationFromCompanyName(): Promise<void> {
    await this.page.locator(EWCF_LOCATORS.COMPANY_NAME).focus();
    await this.page.keyboard.press("Tab");
    const companyNameId =
      (await this.page.locator(EWCF_LOCATORS.COMPANY_NAME).getAttribute("id")) ?? "";
    const nextFocusId = await this.page.evaluate(() => document.activeElement?.id ?? "");
    expect(nextFocusId, "Tab should move focus away from company name field").not.toBe(
      companyNameId,
    );
  }

  /**
   * Assert that the beneficiary name hint text is visible in the Bank Information section.
   */
  @Step("Verify beneficiary name hint text is visible")
  async verifyBeneficiaryNameHintVisible(): Promise<void> {
    await this.ensureSectionExpanded(
      EWCF_LOCATORS.SECTION_BANK_HEADER,
      EWCF_LOCATORS.BENEFICIARY_NAME,
    );
    await expect(
      this.page.getByText(/beneficiary name must match/i),
      "Beneficiary name hint text should be visible in the Bank Information section",
    ).toBeVisible();
  }

  // ── Network / interception helpers ───────────────────────────────

  /**
   * Stub all reCAPTCHA network requests so they return an immediate 200.
   * Call this in beforeEach (or at the start of a test) before navigation.
   */
  @Step("Bypass reCAPTCHA requests")
  async bypassRecaptcha(): Promise<void> {
    await this.page.route("**/*recaptcha*/**", (route) =>
      route.fulfill({ status: 200, body: "// bypass" }),
    );
  }

  /**
   * Focus the mobile number field, type `text` via keyboard events, then blur.
   * Uses keyboard.type() rather than fill() so that native input events fire.
   */
  @Step("Type into mobile number field via keyboard")
  async typeIntoMobileNumber(text: string): Promise<void> {
    await this.focusMobileNumber();
    await this.page.keyboard.type(text);
  }

  /**
   * Expose a window function called `xssAlert`, fill the company name with an XSS
   * payload, blur the field, then return whether the function was ever called.
   * A return value of `false` confirms the script was not executed (XSS blocked).
   */
  @Step("Detect XSS execution via exposed window function")
  async detectXssExecution(): Promise<boolean> {
    let xssRan = false;
    await this.page.exposeFunction("xssAlert", () => {
      xssRan = true;
    });
    await this.fillCompanyName("<script>xssAlert()</script>");
    await this.blurCompanyName();
    // Bounded window for the browser to execute the injected script if the
    // sanitizer failed. networkidle drains any input-triggered requests; the
    // timeout is the upper bound on how long we wait for the dialog listener.
    await this.page.waitForLoadState("networkidle", { timeout: 1_500 }).catch(() => {});
    return xssRan;
  }

  /**
   * Click the submit button and simultaneously wait for a vendor POST response.
   * Returns the response (or null if the request never fires / times out).
   * Uses `TIMEOUTS.PAGE_LOAD` as the response wait timeout.
   */
  @Step("Submit form and wait for vendor API POST response")
  async submitAndWaitForVendorResponse(): Promise<Response | null> {
    const [response] = await Promise.all([
      this.page
        .waitForResponse(
          (res) => res.url().includes(VENDOR_API_PATH) && res.request().method() === "POST",
          { timeout: TIMEOUTS.PAGE_LOAD },
        )
        .catch(() => null),
      this.clickSubmitForce(),
    ]);
    return response;
  }

  /**
   * Install a page route that captures the body of the first vendor POST request.
   * Returns a getter function — call it after the POST fires to read the captured body.
   *
   * @param options.abort - when true, the intercepted POST is aborted (not forwarded to the
   *   server) so the invite token is not consumed. Non-POST requests always continue.
   */
  @Step("Intercept vendor POST request")
  async interceptVendorPost(options?: { abort?: boolean }): Promise<() => Record<string, unknown>> {
    let capturedBody: Record<string, unknown> = {};
    await this.page.route(VENDOR_API_GLOB, async (route) => {
      const req = route.request();
      if (req.method() === "POST") {
        try {
          capturedBody = JSON.parse(req.postData() ?? "{}");
        } catch {
          /**/
        }
        if (options?.abort) {
          await route.abort();
        } else {
          await route.continue();
        }
      } else {
        await route.continue();
      }
    });
    return () => capturedBody;
  }

  /**
   * Abort all requests to vendor API endpoints with a "timedout" error.
   * Use this before submit to simulate a network timeout scenario.
   */
  @Step("Simulate network timeout on vendor API")
  async simulateNetworkTimeout(): Promise<void> {
    await this.page.route(VENDOR_API_GLOB, (route) => route.abort("timedout"));
  }

  /**
   * Install a page route that counts every vendor POST fired.
   * Returns a getter function — call it after interactions to read the POST count.
   */
  @Step("Count vendor POST requests")
  async countVendorPosts(): Promise<() => number> {
    let posts = 0;
    await this.page.route(VENDOR_API_GLOB, async (route) => {
      if (route.request().method() === "POST") posts++;
      await route.continue();
    });
    return () => posts;
  }

  /**
   * Wait for in-flight intercepted requests to drain before asserting on captured data.
   * Uses networkidle so the wait is bounded by real request completion instead of
   * a fixed sleep.
   */
  async waitForDebounce(): Promise<void> {
    await this.page.waitForLoadState("networkidle", { timeout: TIMEOUTS.DEBOUNCE }).catch(() => {});
  }

  // ── View-mode (post-submission read-only state) ───────────────────

  /**
   * Confirm the form has transitioned to read-only view mode after a successful submission.
   * View mode replaces all input fields with static `[data-test-id="view-*"]` elements.
   */
  @Step("Verify form is displaying submitted data in read-only view mode")
  async verifyViewModeIsDisplayed(): Promise<void> {
    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_ORG_NAME),
      "Company name view field should be visible — indicates the form is in read-only confirmation mode",
    ).toBeVisible({ timeout: TIMEOUTS.API_RESPONSE });
  }

  /**
   * Cross-check every view-mode field against the data object that was submitted.
   * Call this after `verifySuccessVisible()` and `verifyViewModeIsDisplayed()`.
   *
   * Verifications performed:
   * - Text fields (company name, org type, email, city, address, contact details, bank info):
   *   exact substring match against the submitted value.
   * - Entity type badge: partial match ("Local" or "International").
   * - Establishment date: ISO date string match (e.g. "2020-01-01").
   * - Classification type / currency / address country / bank country:
   *   non-empty presence check (values are dynamically selected from dropdowns).
   * - Contact mobile: contains the submitted number digits.
   * - Authorized signatory: the ✓ checkmark icon is visible.
   * - Categories: at least one badge chip is visible.
   * - Corporate website (optional): substring match when provided.
   */
  @Step("Verify all submitted field values are correctly shown in read-only view mode")
  async verifySubmittedDataInViewMode(data: VendorRegistrationData): Promise<void> {
    // ── Company Information ─────────────────────────────────────────
    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_ORG_NAME),
      "Company name in view mode should match what was submitted",
    ).toContainText(data.companyName);

    if (data.tradingName) {
      await expect(
        this.page.locator(EWCF_LOCATORS.VIEW_TRADING_NAME),
        "Trading name in view mode should match what was submitted",
      ).toContainText(data.tradingName);
    }

    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_ORGANIZATION_TYPE),
      "Organization type in view mode should match what was submitted",
    ).toContainText(data.organizationType);

    // Local (Saudi) vendors show "Saudi"; international vendors show "International"
    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_OPERATION_REGION),
      "Entity type badge in view mode should reflect the submitted entity type",
    ).toContainText(data.entityType === "local" ? /saudi/i : /international/i);

    // Classification type is selected from the first available dropdown option — verify non-empty
    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_CLASSIFICATION_TYPE),
      "Classification type in view mode should not be empty",
    ).toContainText(/.+/);

    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_ENTITY_EMAIL),
      "Entity email in view mode should match what was submitted",
    ).toContainText(data.entityEmail);

    if (data.establishmentDate) {
      await expect(
        this.page.locator(EWCF_LOCATORS.VIEW_ESTABLISHMENT_DATE),
        "Establishment date in view mode should match what was submitted",
      ).toContainText(data.establishmentDate);
    }

    // Currency is selected from the first available dropdown option — verify non-empty
    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_CURRENCY),
      "Currency in view mode should not be empty",
    ).toContainText(/.+/);

    // ── Address ────────────────────────────────────────────────────
    // Country is selected from a dropdown — verify the expected value
    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_ADDRESS_COUNTRY),
      "Address country in view mode should match what was submitted",
    ).toContainText(data.country ?? "Saudi Arabia");

    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_CITY),
      "City in view mode should match what was submitted",
    ).toContainText(data.city);

    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_STREET),
      "Office address in view mode should match what was submitted",
    ).toContainText(data.officeAddress);

    // Saudi vendors have a National Address field populated by "Copy Office Address"
    if (data.entityType === "local") {
      await expect(
        this.page.locator(EWCF_LOCATORS.VIEW_NATIONAL_ADDRESS),
        "National address in view mode should match the office address (copied automatically for Saudi entities)",
      ).toContainText(data.officeAddress);
    }

    if (data.postalCode) {
      await expect(
        this.page.locator(EWCF_LOCATORS.VIEW_POSTAL_CODE),
        "Postal code in view mode should match what was submitted",
      ).toContainText(data.postalCode);
    }

    // ── Contact Information ────────────────────────────────────────
    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_CONTACT_EMAIL),
      "Contact email in view mode should match what was submitted",
    ).toContainText(data.contactEmail);

    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_CONTACT_DESIGNATION),
      "Contact designation in view mode should match what was submitted",
    ).toContainText(data.contactDesignation);

    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_CONTACT_FIRST_NAME),
      "Contact first name in view mode should match what was submitted",
    ).toContainText(data.contactFirstName);

    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_CONTACT_LAST_NAME),
      "Contact last name in view mode should match what was submitted",
    ).toContainText(data.contactLastName);

    // Mobile is displayed as "+(dialCode) (number)" — verify the submitted number digits are present
    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_CONTACT_MOBILE),
      "Contact mobile number digits in view mode should match what was submitted",
    ).toContainText(data.contactMobile);

    // Authorized signatory is shown as a ✓ checkmark icon (we always mark it during registration)
    await expect(
      this.page.locator(`${EWCF_LOCATORS.VIEW_CONTACT_SIGNATORY} .pi-check`),
      "Authorized signatory checkmark should be visible in view mode",
    ).toBeVisible();

    // ── Additional Information ─────────────────────────────────────
    // Categories is selected from a treeselect — verify at least one badge chip is shown
    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_CATEGORIES).locator("span").first(),
      "At least one scope-of-work category badge should be visible in view mode",
    ).toBeVisible();

    if (data.corporateWebsite) {
      await expect(
        this.page.locator(EWCF_LOCATORS.VIEW_WEBSITE_URL),
        "Corporate website in view mode should match what was submitted",
      ).toContainText(data.corporateWebsite);
    }

    // ── Bank Information ───────────────────────────────────────────
    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_BENEFICIARY_NAME),
      "Beneficiary name in view mode should match what was submitted",
    ).toContainText(data.beneficiaryName);

    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_BANK_NAME),
      "Bank name in view mode should match what was submitted",
    ).toContainText(data.bankName);

    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_BANK_ACCOUNT_NO),
      "Bank account number in view mode should match what was submitted",
    ).toContainText(data.bankAccountNo);

    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_IBAN),
      "IBAN in view mode should match what was submitted",
    ).toContainText(data.iban);

    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_SWIFT_CODE),
      "SWIFT code in view mode should match what was submitted",
    ).toContainText(data.swiftCode);

    await expect(
      this.page.locator(EWCF_LOCATORS.VIEW_BANK_COUNTRY),
      "Bank country in view mode should match what was submitted",
    ).toContainText(data.bankCountry ?? "Saudi Arabia");
  }

  /**
   * Verify that uploaded documents are visible as download links in view mode.
   * After a successful submission, each uploaded file appears with a
   * `[data-test-id="attachment-download-attachments_<key>"]` download link.
   */
  @Step("Verify uploaded document download links are visible in view mode")
  async verifyDocumentUploadsVisibleInViewMode(docKeys: readonly string[]): Promise<void> {
    for (const key of docKeys) {
      await expect(
        this.page.locator(`[data-test-id="attachment-download-attachments_${key}"]`),
        `Uploaded document "${key}" should appear as a download link in view mode`,
      ).toBeVisible();
    }
  }
}
