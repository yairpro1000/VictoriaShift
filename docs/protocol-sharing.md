# Email-restricted protocol sharing

## Release workflow

Commit changes on a branch, push to GitHub, and open a PR. Vercel automatically deploys pushes through the existing Git integration; use that workflow rather than direct Vercel CLI deployments. Keep the database migration in the same PR even when it has already been applied separately. Production release follows merge to the configured production branch.

The manager selects one protocol and a recipient email, generates a unique link, and copies it to send personally. Generating a link sends no email and does not use Gmail. Opening it requires a Supabase Auth session with a confirmed canonical email matching the invitation. The recipient can request a provider sign-in email; typing an email alone never grants access.

The shared board and manager reuse the existing protocol, category, and task editors. Recipients can edit/delete the shared protocol and create/edit/delete its categories and tasks, including completion and category changes. Department editing, creating another protocol, employees, and resharing are unavailable. Normal public and owner flows remain separate.

## Deployment and Auth prerequisites

Migration `supabase/migrations/20261006085907_protocol_email_shares.sql` was applied to VictoriaShift production (`mfedzqefoouxigkavghy`) on 2026-10-06. Transactional permission tests passed against production and rolled back all fixtures. Email/signup are enabled and `mailer_autoconfirm` is false, verified through the live Auth settings endpoint. SMTP delivery and redirect configuration still require verification before calling the full flow production ready. Setup requirements for each environment:

1. Apply that migration after the existing private-user-lists migration to a staging Supabase project first, then deploy the matching frontend there. A frontend pointing at an unmigrated project returns a missing-RPC error on link generation.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the frontend build environment (`.env.local` for local development). Never expose a service-role key.
3. In that same Supabase project's Authentication settings, enable the Email provider and new-user signup. Keep email confirmation enabled (`mailer_autoconfirm: false`); the authorization check trusts Auth's canonical `email_confirmed_at`, so auto-confirmed password signups must not be enabled.
4. Configure the intended frontend Site URL and allow redirect URLs for `/share/**` on each permitted origin. For this local preview use `http://127.0.0.1:4173/share/**`; add `http://localhost:4173/share/**` only if using that hostname. Add the exact staging/production origin separately. Hosting must serve the SPA for `/share/<token>` and `/share/<token>/manager`.
5. Configure custom SMTP for arbitrary recipient addresses: `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `smtp_admin_email`, and `smtp_sender_name` in the target project's Auth settings. Supabase's default sender is restricted to organization team addresses and is unsuitable for general recipients.
6. Keep `{{ .ConfirmationURL }}` in the Magic Link email template for the default flow. The UI also accepts email OTP codes if the template includes `{{ .Token }}`. Test delivery and a successful callback using an authorized test mailbox before release.

No real verification email was sent during implementation. SMTP delivery, redirect configuration, and confirmation settings have not been verified against a staging deployment. These are outstanding deployment checks, not a reason to bypass verification. No invitation email is sent by the manager UI.

References: [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless), [custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

## Access and diagnostics

Only token SHA-256 hashes are stored in `private.protocol_shares`; direct client access is revoked. Each shared request supplies `x-protocol-share`. Database RLS checks that token, the authenticated user, the canonical verified email, and revocation. A shared request cannot fall back to ordinary owner/public access. User metadata and caller-supplied email are never permission sources. A session outside the shared route does not confer access to invited protocols.

Shared data is not cached in localStorage. Shared views revalidate on focus and poll instead of using Realtime, which does not carry the share header. Revocation or verified-email changes deny subsequent database requests; displayed data clears at revalidation. Deleting a protocol cascades its invitations. Revocation is currently an administrative update to `private.protocol_shares.revoked_at`; there is no revocation UI.

Browser diagnostics include `share_rpc_attempt/succeeded/failed`, `share_create_validation`, `share_email_signin_attempt/sent/failed`, and `share_email_verify_attempt/succeeded/failed`. Database logs include `share_access_attempt/result`, `share_create_attempt/denied/authorized/succeeded/failed`, department scope decisions, and protocol-insert decisions. Tokens, verification codes, and recipient emails are omitted from structured authorization logs. RPC failures preserve `{ok, data, error}` plus PostgREST-compatible error fields and HTTP status. Auth and ordinary table mutations retain the provider's native error format. Supabase/PostgREST handles CORS; the gateway was checked to accept `x-protocol-share` preflights.

## Verification

Run `node --experimental-vm-modules --test tests/*.test.mjs` and `npm run build`.

Database tests use a disposable local Supabase Postgres container, never a production connection:

```sh
docker run --name victoria-share-test --rm -d -e POSTGRES_PASSWORD=local-test-only public.ecr.aws/supabase/postgres:17.6.1.063
# Wait for Postgres to be ready; run once against this fresh database:
sh scripts/test-protocol-sharing-db.sh victoria-share-test
```

`tests/protocol-sharing.sql` rolls back fixtures and checks owner/public behavior, matching recipients, wrong and unverified emails, spoofed metadata, missing/malformed tokens, sibling-protocol isolation, task/category editing, forbidden department edits, forbidden resharing, email changes, and revocation. On an already initialized test container, rerun only that SQL file with `psql -v ON_ERROR_STOP=1`. Client tests cover request-local header scope, logical and HTTP failure paths, provider-based verification, and diagnostic secret omission. These checks do not substitute for the mailbox-to-callback staging test above.

## Production status — 2026-10-06

The migration is installed as `20261006085907_protocol_email_shares`. Production transactional policy tests passed with all fixtures rolled back. A live RPC validation request returned HTTP 422 with the documented JSON envelope and the correct CORS origin for `https://victoria-shift.vercel.app`. Supabase public Auth settings confirm Email enabled, signup enabled, and `mailer_autoconfirm=false`.

The existing Vercel target is `yairpro1000/victoria-shift` (`prj_MM7l1OnWCI1nDXEDvEmur48vTkaR`). Production has both required VITE Supabase variables. Workspace linking succeeded. The requested `vercel deploy --prod` command was rejected at approval, so no matching frontend release was performed in this run. SMTP and redirect settings could not be inspected because the Supabase dashboard requires sign-in; no management API credential was available. A test mailbox was requested but has not been authorized yet. No test email was sent. Full production readiness remains unverified until these steps are completed.
