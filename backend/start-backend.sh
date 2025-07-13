#!/bin/bash

echo "=== Démarrage du backend Al-Hidaya ==="
echo ""

# Variables d'environnement
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/al_hidaya_db"
export SECRET_KEY="your-secret-key-here"
export ALGORITHM="HS256"
export ACCESS_TOKEN_EXPIRE_MINUTES=30
export REDIS_URL="redis://localhost:6379"

# Créer la base de données si elle n'existe pas
echo "Vérification de la base de données..."
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'al_hidaya_db'" | grep -q 1 || psql -U postgres -c "CREATE DATABASE al_hidaya_db"

# Migrations
echo "Application des migrations..."
alembic upgrade head

# Démarrer le serveur
echo ""
echo "Démarrage du serveur backend sur http://localhost:5001"
echo ""
uvicorn app.main:app --host 0.0.0.0 --port 5001 --reload