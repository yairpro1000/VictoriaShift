#!/bin/sh
set -eu
# Requires an isolated Supabase Postgres container, never a production connection.
container=${1:-victoria-share-test}
docker exec -e PGPASSWORD=local-test-only -i "$container" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 < tests/fixtures/share-schema.sql
docker exec -e PGPASSWORD=local-test-only -i "$container" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 < supabase/migrations/20260910111610_private_user_lists.sql
docker exec -e PGPASSWORD=local-test-only -i "$container" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 < supabase/migrations/20261006085907_protocol_email_shares.sql
docker exec -e PGPASSWORD=local-test-only -i "$container" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 < tests/protocol-sharing.sql
docker exec -e PGPASSWORD=local-test-only -i "$container" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 < supabase/migrations/20261006092808_protocol_password_shares.sql
diagnostics=$(mktemp)
trap 'rm -f "$diagnostics"' EXIT
if ! docker exec -e PGPASSWORD=local-test-only -i "$container" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 < tests/protocol-password-sharing.sql > "$diagnostics" 2>&1; then
  cat "$diagnostics"
  exit 1
fi
node scripts/check-share-diagnostics.mjs "$diagnostics"
