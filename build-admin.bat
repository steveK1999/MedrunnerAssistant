@echo off
echo ====================================
echo Medrunner Assistant - Build Script (Admin)
echo ====================================
echo.
echo Dieses Script muss als Administrator ausgefuehrt werden!
echo.

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo FEHLER: Nicht als Administrator gestartet!
    echo.
    echo Bitte Rechtsklick auf build-admin.bat und "Als Administrator ausfuehren" waehlen.
    echo.
    pause
    exit /b 1
)

echo Administrator-Rechte erkannt. Starte Build...
echo.

cd /d "%~dp0"

echo [1/3] Installiere Dependencies...
call npm install
if %errorlevel% neq 0 (
    echo FEHLER: npm install fehlgeschlagen!
    pause
    exit /b 1
)

echo.
echo [2/3] Loesche alten Build-Cache...
rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign" 2>nul

echo.
echo [3/3] Erstelle Windows Installer und Portable Version...
call npm run build
if %errorlevel% neq 0 (
    echo FEHLER: Build fehlgeschlagen!
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Build erfolgreich!
echo.
echo Fertige Dateien findest du im 'dist' Ordner:
echo  - Medrunner Assistant Setup X.X.X.exe (Installer)
echo  - MedrunnerAssistant-Portable.exe (Ohne Installation)
echo.
echo Druecke eine Taste um den dist-Ordner zu oeffnen...
pause > nul
explorer dist

exit /b 0
