#!/usr/bin/env bash
# Dev helper: apply all migrations then seed the database.
# Usage:  bash seed.sh            (idempotent — skips existing records)
#         bash seed.sh --clear    (wipe + reseed from scratch)
set -e
cd "$(dirname "$0")"
echo "Applying migrations..."
python manage.py migrate
echo "Seeding database..."
python manage.py seed_db "$@"
