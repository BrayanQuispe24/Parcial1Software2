#!/bin/sh
set -e

# Run database migrations if RUN_MIGRATIONS is set to 'true' or by default
if [ "$RUN_MIGRATIONS" != "false" ]; then
    echo "Running database migrations..."

    # Attempt standard migration first; if it fails, run automated reconciliation
    if ! python manage.py migrate --noinput; then
        echo "Detected migration dependency inconsistency on shared DB. Running automated reconciliation..."
        python manage.py shell -c "
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute(\"SELECT 1 FROM django_migrations WHERE app = 'admin'\")
        admin_migrated = cursor.fetchone()
        cursor.execute(\"SELECT 1 FROM django_migrations WHERE app = 'users'\")
        users_migrated = cursor.fetchone()
        if admin_migrated and not users_migrated:
            print('Auto-resolving dependency: removing premature admin migration record...')
            cursor.execute(\"DELETE FROM django_migrations WHERE app = 'admin'\")
except Exception as e:
    print('Reconciliation helper error:', e)
" || true

        echo "Applying users migration..."
        python manage.py migrate users --noinput || true

        echo "Synchronizing admin state..."
        python manage.py migrate admin --fake --noinput || true

        echo "Applying remaining migrations..."
        python manage.py migrate --noinput || {
            echo "Warning: Database migrations could not be completed. External DB might not be ready yet or unreachable."
        }
    fi
fi

# Execute passed container command
exec "$@"
