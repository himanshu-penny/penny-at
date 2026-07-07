# Flows

**Flows** are high-level orchestration classes that combine multiple page objects
to execute a complete **user journey** across several pages.

## Page Objects vs Flows — The Difference

|                 | Page Object                                | Flow                                          |
| --------------- | ------------------------------------------ | --------------------------------------------- |
| **Scope**       | One page                                   | Multiple pages end-to-end                     |
| **Knows about** | Locators, element interactions             | Business processes                            |
| **Used for**    | Clicking, filling, asserting on one screen | Setting up preconditions, end-to-end journeys |
| **Example**     | `PennyLoginPage.login()`                   | `PennyAuthFlow.loginAndGoToDashboard()`       |

## When to Use a Flow

Use a flow when:

- Multiple tests need the **same multi-page setup** (DRY principle)
- A test's **precondition** involves several pages
- You want to write **end-to-end journey tests** that read like a user story

## Files in this folder

Add Penny-specific flows here as needed.
