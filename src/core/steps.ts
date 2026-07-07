import { test } from "@playwright/test";

/**
 * Wrap a block in a named Playwright step.
 * Steps appear in the HTML report and trace viewer.
 *
 * Usage:
 *   await step("Fill login form", async () => {
 *     await page.fill("#email", user.email);
 *     await page.fill("#password", user.password);
 *   });
 */
export async function step<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return test.step(name, fn);
}

/**
 * Decorator version for class methods.
 * @example
 *   @Step("Login with credentials")
 *   async login(email: string, password: string) { ... }
 */
export function Step(name?: string) {
  return function <This, Args extends unknown[], Return>(
    originalFn: (this: This, ...args: Args) => Promise<Return>,
    context: ClassMethodDecoratorContext,
  ) {
    const methodName = String(context.name);
    return async function (this: This, ...args: Args): Promise<Return> {
      const stepName = name ?? methodName;
      return test.step(stepName, () => originalFn.apply(this, args)) as Promise<Return>;
    };
  };
}
