# Password-protected protocol sharing

## Behavior

The manager chooses a protocol, authorized email, and password (at least 8 characters, up to 72 UTF-8 bytes). The generated URL contains only a random share token. Send the recipient that link and the chosen password. No confirmation, invitation, reset email, or recipient Supabase Auth account is needed. The email is a matching identifier; ownership of that mailbox is not verified.

Recipients enter the email and password, then can edit the shared protocol, categories and tasks. They cannot manage departments/employees, create another protocol, or reshare. Existing manager account login and normal public-board behavior remain unchanged.

For a forgotten password, generate a new link and password for the **same protocol and email**. Creation atomically revokes all previous links for that pair, immediately invalidating their sessions at the database. Existing email-only links are revoked by the migration and must be regenerated.

## Runtime configuration and release

Follow the existing GitHub PR workflow: commit on a branch, push, open a PR, and release through the Vercel Git integration after merge. Coordinate the database migration with the frontend release; the new frontend requires the new RPC and the old email frontend cannot create password shares.

Apply `supabase/migrations/20261006092808_protocol_password_shares.sql` after `20261006085907_protocol_email_shares.sql` to **VictoriaShift production, project `mfedzqefoouxigkavghy`**, when releasing this change. The migration is currently tested locally, not applied to production.

The **Vercel Production** build keeps:

- `VITE_SUPABASE_URL=https://mfedzqefoouxigkavghy.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY`: that project's existing publishable key.

Use the corresponding project URL/key for isolated Preview or Development environments. No new environment variable, SMTP setup, Auth redirect URL, email provider, or service-role key is required for sharing. Do not disable email confirmation globally; this flow does not call Supabase Auth. The owner password-login settings remain unchanged.

Ensure the API gateway permits `x-protocol-share` and `x-protocol-session` request headers. Existing SPA rewrites serve `/share/<token>` and `/share/<token>/manager`.

## Access and diagnostics

Passwords are salted bcrypt hashes (cost 10) in the non-exposed `private.protocol_shares` table. Successful email/password verification issues a separate random 256-bit session; only its SHA-256 hash is stored in `private.protocol_share_sessions`. Browser sessionStorage keeps the opaque session per link for reloads, with an in-memory fallback when storage is unavailable. Passwords and email are not persisted. Sessions expire after 24 hours; reopening after expiry requires the credentials again.

Every shared database request supplies both link and session headers. RLS verifies that the session belongs to that exact active invitation before allowing protocol/category/task access. A share-scoped request never falls back to ordinary owner/public access, including malformed links, expired sessions, or an already signed-in account. The private SECURITY DEFINER functions are deliberately available to anonymous recipients through narrowly scoped RPC wrappers; the link/password exchange replaces `auth.uid()` as their authentication boundary. Other owner checks retain the existing ownership/public-manager rules.

Five incorrect attempts lock that share link for 15 minutes. Attempts are serialized and persisted in the database, including failed HTTP requests. A replacement link also provides manual recovery from a lock. Stored sessions do not bypass replacement/revocation checks. No shared data is written to the public/owner localStorage caches; focus and periodic revalidation clear denied shared views.

Structured logs include `share_create_attempt/denied/authorized/succeeded/failed`, `share_unlock_attempt/denied/authorized/succeeded/failed`, and `share_access_attempt/result`. They include the exact password/email mismatch reason, chosen authentication method, limits, session lifetime, replacement count, and database SQLSTATE on unexpected failures. User-facing credential failures are generic; diagnostics distinguish their causes. Logs exclude passwords, emails, link/session secrets, and hashes. RPC errors preserve `{ok, data, error}` and PostgREST-compatible fields; PostgREST provides CORS on success and failure.

Private tables intentionally have RLS enabled without user policies and no table grants: they are only reachable through the checked functions. This produces an informational advisor notice, not an invitation to expose them.

## Verification

Run `node --experimental-vm-modules --test tests/*.test.mjs` and `npm run build`.

Database regression suite, against a **fresh disposable local Supabase Postgres container only**:

```sh
docker run --name victoria-share-test --rm -d -e POSTGRES_PASSWORD=local-test-only public.ecr.aws/supabase/postgres:17.6.1.063
# Once ready:
sh scripts/test-protocol-sharing-db.sh victoria-share-test
```

The script verifies the preceding email migration before applying the password migration, then runs `tests/protocol-password-sharing.sql` and the diagnostic assertions. Transactional tests cover email/password mismatch, no-session account bypass, malformed/forged/expired sessions, replacement, lockout and recovery, sibling isolation, task/category edits, forbidden department/employee/approval writes, forbidden resharing, private-table secrecy, legacy client rejection, and unexpected failures with HTTP status/envelope diagnostics.

`tests/protocol-password-http.test.mjs` is opt-in using `SHARE_TEST_API_URL=http://127.0.0.1:<port>` with a disposable PostgREST API and the standard fixture's public protocol. It verifies actual HTTP status/envelopes, CORS/preflight, password unlock, replacement, and lockout persistence across requests; it refuses non-loopback hosts and skips in ordinary unit runs. It creates only local test shares. The SQL suite should run before any persistent browser fixtures are added.

Verified locally: 50 client tests, database behavior/diagnostics, HTTP integration suite, production build, and browser flow (create link → wrong password → correct password → reload → category/task creation → task completion → reload). No real emails were sent and no production settings were changed.
