@echo off
echo ====================================
echo Medrunner Assistant Quick Start
echo ====================================
echo.

echo [1/3] Verifiziere Integration...
call node verify-integration.js > nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Integration Verification fehlgeschlagen!
    echo Bitte verify-integration.js ausführen für Details.
    echo.
)

if not exist "node_modules\" (
    echo [2/3] Installiere Dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo FEHLER: npm install fehlgeschlagen!
        echo Stelle sicher, dass Node.js installiert ist.
        echo Download: https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
) else (
    echo [2/3] Dependencies bereits installiert
)

echo [3/3] Starte Medrunner Assistant...
call npm start

if %errorlevel% neq 0 (
    echo.
    echo FEHLER: App konnte nicht gestartet werden!
    pause
    exit /b 1
)
