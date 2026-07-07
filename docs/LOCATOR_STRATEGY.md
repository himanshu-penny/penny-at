# Locator Strategy Guide

## Priority Order

Use locators in this order of preference (most → least stable):

```
1. data-test-id     ← Best: explicit, stable, purpose-built for testing
2. ARIA roles       ← Great: accessible and semantically meaningful
3. CSS selectors    ← OK: when data-test-id isn't possible
4. XPath            ← Last resort: fragile, avoid unless absolutely necessary
```

## 1. data-test-id (Preferred)

```typescript
// ✅ Best practice
page.locator('[data-test-id="login-button"]')

// In HTML
<button data-test-id="login-button">Sign In</button>
```

Work with your developers to add `data-test-id` attributes to testable elements.

## 2. ARIA Roles and Labels

```typescript
// ✅ Accessible and stable
page.getByRole("button", { name: "Sign In" });
page.getByRole("textbox", { name: "Email address" });
page.getByLabel("Password");
page.getByPlaceholder("Enter your email");
```

## 3. Text Content (Use Sparingly)

```typescript
// ⚠️ Only for unique, stable text — avoid for i18n apps
page.getByText("Sign In");
page.getByTitle("Close dialog");
```

## 4. CSS Selectors

```typescript
// ⚠️ Fallback when data-test-id unavailable
page.locator(".login-form button[type='submit']");
```

## Anti-Patterns to Avoid

```typescript
// ❌ XPath — fragile
page.locator("//div[3]/button[1]");

// ❌ nth-child — breaks on layout changes
page.locator("ul li:nth-child(3)");

// ❌ Text-only for non-unique text
page.getByText("Click here");

// ❌ Dynamic IDs — change on every render
page.locator("#btn-12345");
```

## Chaining Locators

For elements inside a container:

```typescript
// ✅ Scoped locator — more precise, less flaky
const row = page.locator('[data-test-id="vendor-row"]').filter({ hasText: "Acme Trading" });
await row.locator('[data-test-id="view-vendor-button"]').click();
```

## Locator Best Practices

**Store locators as class properties in page objects (not in test files):**

```typescript
// ✅ In LoginPage class
private readonly loginButton = this.page.locator('[data-test-id="login-button"]');

// ❌ Never do this in a test spec
const loginButton = page.locator('[data-test-id="login-button"]');
```

**Define a `const` locator object at the top of each page file — no raw strings in methods:**

```typescript
// ✅ At the top of penny-login.page.ts
const PENNY_LOGIN_LOCATORS = {
  EMAIL_INPUT: '[data-test-id="email-address-input"]',
  LOGIN_BUTTON: '[data-test-id="login-button"]',
} as const;

// ✅ In the constructor
this.emailInput = page.locator(PENNY_LOGIN_LOCATORS.EMAIL_INPUT);

// ❌ Inline raw strings in methods
this.emailInput = page.locator('[data-test-id="email-address-input"]');
```

## Waiting Strategy

Playwright's locators auto-wait by default. Avoid explicit waits:

```typescript
// ✅ Playwright auto-waits for visibility before clicking
await loginButton.click();

// ❌ Unnecessary manual wait
await page.waitForTimeout(2000);
await loginButton.click();

// ✅ Only use explicit waits for specific state changes
await page.waitForURL(/\/dashboard/);
await expect(loadingSpinner).toBeHidden();
```
