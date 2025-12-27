@echo off
echo ====================================
echo Medrunner Assistant Quick Start
echo ====================================
echo.

if not exist "node_modules\" (
    echo Node modules nicht gefunden. Installiere Dependencies...
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
)

echo Starte Medrunner Assistant...
call npm start

if %errorlevel% neq 0 (
    echo.
    echo FEHLER: App konnte nicht gestartet werden!
    pause
    exit /b 1
)
