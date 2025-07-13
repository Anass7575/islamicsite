#!/bin/bash

echo "=== Nettoyage et démarrage du serveur Al-Hidaya ==="
echo ""

# Arrêter tous les processus Node.js
echo "Arrêt des processus existants..."
pkill -f "node" 2>/dev/null || true
sleep 2

# Nettoyer les caches
echo "Nettoyage des caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .cache

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances..."
    npm install
fi

# Variables d'environnement
export NODE_ENV=development
export PORT=3003

# Démarrer le serveur
echo ""
echo "Démarrage du serveur sur http://localhost:3003"
echo ""
npm run dev