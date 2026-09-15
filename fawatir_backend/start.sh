#!/bin/sh
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Seeding master admin..."
python manage.py seed_master_admin || true

echo "Starting Gunicorn on port ${PORT:-8000}..."
exec gunicorn fawatir_backend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --threads 4 --timeout 120
