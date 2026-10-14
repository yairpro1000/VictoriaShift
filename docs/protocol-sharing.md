# Password-protected department sharing

## Behavior

The manager shares a department using an authorized email and password (at least 8 characters, up to 72 UTF-8 bytes). An expandable protocol list has independent View and Edit columns, each with a select-all checkbox. All protocol permissions start checked. Edit implies View; removing View also removes Edit. Protocols added later are not automatically included.

The **Allow manager page access** toggle (`is_manager`) starts off. It permits the recipient to open the department manager page; per-protocol View/Edit permissions still apply. Recipients cannot manage departments/employees, create protocols, or reshare. View-only protocols have no mutation controls, and database policies enforce the same restrictions.

The generated URL contains only a random share token. Send the recipient the link and chosen password. No confirmation email or recipient Supabase Auth account is needed. Email is a matching identifier, not verified mailbox ownership.

For a forgotten password, generate a new link for the **same department and email**. This revokes all previous links and sessions for that pair. Existing password-protected single-protocol links retain their original access, including manager access. Existing email-only links were revoked by the previous password migration.

## Runtime configuration and release

Follow the existing GitHub PR workflow: commit on a branch, push, open a PR, and release through the Vercel Git integration after merge. Coordinate the database migration with the frontend release; the new frontend requires the new RPC and the old email frontend cannot create password shares.

The previous password migration `20261006092808_protocol_password_shares.sql` is already applied to production. The new migration `supabase/migrations/20261013172459_department_sharing_permissions.sql` is tested locally and **pending production application** to VictoriaShift project `mfedzqefoouxigkavghy`. Apply it before releasing the new frontend. Its compatibility triggers preserve the existing single-protocol creation RPC and links during rollout.

The **Vercel Production** build keeps:

- `VITE_SUPABASE_URL=https://mfedzqefoouxigkavghy.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY`: that project's existing publishable key.

Use the corresponding project URL/key for isolated Preview or Development environments. No new environment variable, SMTP setup, Auth redirect URL, email provider, or service-role key is required for sharing. Do not disable email confirmation globally; this flow does not call Supabase Auth. The owner password-login settings remain unchanged.

Ensure the API gateway permits `x-protocol-share`, `x-protocol-session`, and `x-protocol-manager` request headers. Existing SPA rewrites serve `/share/<token>` and `/share/<token>/manager`.

## Access and diagnostics

Passwords are salted bcrypt hashes (cost 10) in the non-exposed `private.protocol_shares` table. Successful email/password verification issues a separate random 256-bit session; only its SHA-256 hash is stored in `private.protocol_share_sessions`. Browser sessionStorage keeps the opaque session per link for reloads, with an in-memory fallback when storage is unavailable. Passwords and email are not persisted. Sessions expire after 24 hours; reopening after expiry requires the credentials again.

Every shared database request supplies both link and session headers. Manager routes also supply `x-protocol-manager: true`; the checked access function denies those requests when `is_manager` is false. Protocol permissions are stored in the non-exposed `private.share_protocol_permissions` table, and RLS checks View for reads and Edit for mutations. The manager flag never grants Edit by itself. RLS verifies that the session belongs to that exact active invitation before allowing protocol/category/task access. A share-scoped request never falls back to ordinary owner/public access, including malformed links, expired sessions, or an already signed-in account. The private SECURITY DEFINER functions are deliberately available to anonymous recipients through narrowly scoped RPC wrappers; the link/password exchange replaces `auth.uid()` as their authentication boundary. Other owner checks retain the existing ownership/public-manager rules.

Five incorrect attempts lock that share link for 15 minutes. Attempts are serialized and persisted in the database, including failed HTTP requests. A replacement link also provides manual recovery from a lock. Stored sessions do not bypass replacement/revocation checks. No shared data is written to the public/owner localStorage caches; focus and periodic revalidation clear denied shared views.

Department creation adds `department_share_create_*` events, and per-protocol checks add `shared_protocol_permission_*` events. Manager-route checks record the requested route and evaluated manager flag. Structured logs include `share_create_attempt/denied/authorized/succeeded/failed`, `share_unlock_attempt/denied/authorized/succeeded/failed`, and `share_access_attempt/result`. They include the exact password/email mismatch reason, chosen authentication method, limits, session lifetime, replacement count, and database SQLSTATE on unexpected failures. User-facing credential failures are generic; diagnostics distinguish their causes. Logs exclude passwords, emails, link/session secrets, and hashes. RPC errors preserve `{ok, data, error}` and PostgREST-compatible fields; PostgREST provides CORS on success and failure.

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

The database script also applies the department migration, repeats the password compatibility suite, and runs `tests/department-sharing.sql` plus `scripts/check-department-diagnostics.mjs`. These cover mixed permissions, manager-route denial, invalid inputs, replacement, future/moved protocols, private-table secrecy, and unexpected failures. `tests/fixtures/department-browser.sql` provides optional disposable browser data after the transactional suites.

Verified locally: client tests, database behavior and diagnostics, production build, and browser creation/login with editable, view-only, hidden, and manager-gated access. No production settings are changed by this feature branch.

Department HTTP checks: seed the browser fixture, then run `DEPARTMENT_TEST_API_URL=http://127.0.0.1:55431 node --test tests/department-sharing-http.test.mjs`. This verifies manager denial and allowance, unchanged read-only permissions, replacement, error envelopes, and CORS including the manager header.
