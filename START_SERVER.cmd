@echo off
echo === Demarrage du serveur Al-Hidaya ===
echo.

cd frontend

echo Nettoyage en cours...
rmdir /s /q .next 2>nul
rmdir /s /q node_modules\.cache 2>nul

echo.
echo Demarrage du serveur sur http://localhost:3003
echo.

npm run dev

pause