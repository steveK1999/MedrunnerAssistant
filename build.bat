@echo off
echo ====================================
echo Medrunner Assistant - Build Script
echo ====================================
echo.

echo [1/3] Installiere Dependencies...
call npm install
if %errorlevel% neq 0 (
    echo FEHLER: npm install fehlgeschlagen!
    pause
    exit /b 1
)

echo.
echo [2/3] Erstelle Windows Installer und Portable Version...
call npm run build
if %errorlevel% neq 0 (
    echo FEHLER: Build fehlgeschlagen!
    pause
    exit /b 1
)

echo.
echo [3/3] Build erfolgreich!
echo.
echo Fertige Dateien findest du im 'dist' Ordner:
echo  - Medrunner Assistant Setup X.X.X.exe (Installer)
echo  - MedrunnerAssistant-Portable.exe (Ohne Installation)
echo.
echo Druecke eine Taste um den dist-Ordner zu oeffnen...
pause > nul
explorer dist

exit /b 0
