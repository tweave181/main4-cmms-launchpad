# Invitation-Code Signup Popups

## Goal
Replace the "Don't have an account? Sign up" link on the Sign In page with **"Click to enter Invitation Code"**, opening a small popup flow. After successful signup, the user verifies their email and lands in the app where the existing Setup Wizard collects the rest of their details.

## UX Flow

1. **Sign In page** — change the link text under the Sign In button to:
   `Click to enter Invitation Code`

2. **Popup 1 — Invitation Code**
   - Title: "Enter Invitation Code"
   - Single input + **Enter** button
   - Validates the code via the existing `validate_tenant_invitation` RPC
   - On success: closes and opens Popup 2 (passes the validated code along)
   - On failure: inline error, stays open

3. **Popup 2 — Create Account**
   - Title: "Create your account"
   - Fields: **Email**, **Password**, **Confirm Password** (one password value, typed twice for confirmation, as requested)
   - **Create Account** button
   - Calls existing `signUp(email, password, ...)` with the validated invitation code
   - All other tenant/business details are **omitted** — they're collected later via Main4's Pricing & Sign Up page on the website / in-app setup wizard

4. **After submit**
   - Show the existing `EmailVerificationPending` screen (already wired) so the user knows to verify their email
   - After they verify and sign in, the existing Setup Wizard / Pricing flow handles the rest

## Technical Notes

- **Files to change**
  - `src/components/auth/AuthPage.tsx` — drop the `register` view; add state for the two dialogs; render new `InvitationCodeDialog` and `CreateAccountDialog`; keep `verification-pending` view as-is
  - `src/components/auth/LoginForm.tsx` — change link label to "Click to enter Invitation Code" and make it open Popup 1 (replace `onToggleMode` with `onStartSignup`)
  - **New** `src/components/auth/InvitationCodeDialog.tsx` — Radix Dialog with code input, validates via `useValidateInvitation`, on success calls `onValidated(code)`
  - **New** `src/components/auth/CreateAccountDialog.tsx` — Radix Dialog with email + password + confirm password; calls `signUp` with placeholder/derived tenant fields and the validated code; on success calls `onRegistrationComplete(email)`

- **signUp signature** currently expects `(email, password, name, tenantName, tenantSlug, businessType, invitationCode)`. Since we're no longer collecting those fields up front, we'll pass minimal placeholders derived from the email (e.g. name = email local-part, tenantName = email local-part, tenantSlug = slugified local-part, businessType = `'other'` or first available). The real organization details are added later via the existing setup wizard / pricing page. **Confirm this approach is OK**, or alternatively we leave `RegisterForm.tsx` available as a deeper signup path from elsewhere.

- **Keep** existing `RegisterForm.tsx` and `InvitationCodeInput.tsx` files in place (unused by AuthPage) so nothing else that imports them breaks. They can be deleted in a later cleanup pass.

- No backend / SQL / RLS changes. Email verification continues to use the current Supabase Auth flow.

## Out of Scope
- Changing the invitation generation, tenant defaults, or setup wizard
- Any styling changes beyond the new dialogs (they'll reuse current shadcn `Dialog`, `Input`, `Button`, `Label` tokens)
