#!/bin/bash
set -e

echo "=== Post-merge setup ==="

echo "--- Installing frontend dependencies ---"
cd educard-FRONTEND
npm install --legacy-peer-deps
cd ..

echo "--- Applying Django migrations ---"
cd educard-BACKEND
python manage.py migrate --no-input
cd ..

echo "=== Post-merge setup complete ==="
