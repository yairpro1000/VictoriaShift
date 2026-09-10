# Private lists

Sign-in uses Supabase Auth with persisted, automatically refreshed sessions in localStorage. The username yair maps to an internal email identity; passwords are verified by Supabase, not stored in frontend code. Sign out returns to the public app.

Departments.user_id references auth.users.id. Existing rows remain NULL/public; new rows default to auth.uid(). Database policies separate public/anonymous access from authenticated ownership and follow department ownership through protocols, categories, tasks, and approval snapshots. Authenticated private accounts cannot access employees or the public approval workflow.

For local development, set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local. Set the same two variables in the frontend hosting environment before building deployments. No service-role key belongs in the frontend. The migration private_user_lists has been applied to the VictoriaShift Supabase project (mfedzqefoouxigkavghy), and the requested yair account has been provisioned there. Passwords are deliberately omitted from this repository.

Diagnostics:
- Browser: login_attempt/login_succeeded/login_failed, auth_session_changed, task_mutation_attempt/task_mutation_succeeded/task_mutation_failed.
- Database Postgres logs: department_access_check and department_access_result, with public/owner/denied_owner_mismatch branches.
- Built-in Auth and PostgREST services provide their native JSON errors and CORS headers. No custom HTTP endpoint was added.

Run node --experimental-vm-modules --test tests/*.test.mjs for unit tests. Execute tests/private-access.sql as the database owner to verify anonymous, owner, and other-user access. The SQL test rolls all fixtures back.

Each account has a separate board cache and remembered department/protocol selection. Private empty categories remain visible so their + button can create the first task. Hold a private task for 550 ms to open Edit/Delete/Cancel; right-click and Shift+F10 offer the same actions. Moving the pointer cancels the hold so scrolling does not open the editor.
