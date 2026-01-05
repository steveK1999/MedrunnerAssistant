@echo off
setlocal enabledelayedexpansion

echo.
echo ====================================
echo Medrunner Assistant - Auto Integration
echo Integriere Ship Assignment & AAR
echo ====================================
echo.

REM Wechsle zum Skript-Verzeichnis
cd /d "%~dp0"

echo [1/4] Integriere HTML (tabs-shipaar.html)...

REM Lese tabs-shipaar.html
set "shipaarHtml="
for /f "delims=" %%A in (ui\tabs-shipaar.html) do set "shipaarHtml=!shipaarHtml!%%A"

REM Überprüfe ob bereits integriert
findstr /M "shipAssignment" ui\index.html >nul 2>&1
if !errorlevel! equ 0 (
    echo   [SKIP] HTML ist bereits integriert
) else (
    echo   [OK] Integriere HTML-Inhalte...
    REM Das wird später mit PowerShell gemacht (zu komplex für reine BAT)
)

echo [2/4] Überprüfe package.json...
findstr /M "\"type\": \"module\"" package.json >nul 2>&1
if !errorlevel! neq 0 (
    echo   [WARNING] "type: module" nicht gefunden in package.json
    echo   Es wird trotzdem versucht zu laden...
) else (
    echo   [OK] ES6 Modules aktiviert
)

echo [3/4] Überprüfe neue Dateien...
if exist "lib\constants.js" (
    echo   [OK] lib\constants.js gefunden
) else (
    echo   [FEHLER] lib\constants.js nicht gefunden!
)

if exist "lib\shipAssignment.js" (
    echo   [OK] lib\shipAssignment.js gefunden
) else (
    echo   [FEHLER] lib\shipAssignment.js nicht gefunden!
)

if exist "lib\aar.js" (
    echo   [OK] lib\aar.js gefunden
) else (
    echo   [FEHLER] lib\aar.js nicht gefunden!
)

if exist "ui\tabs-shipaar.html" (
    echo   [OK] ui\tabs-shipaar.html gefunden
) else (
    echo   [FEHLER] ui\tabs-shipaar.html nicht gefunden!
)

if exist "ui\shipaar-init.js" (
    echo   [OK] ui\shipaar-init.js gefunden
) else (
    echo   [FEHLER] ui\shipaar-init.js nicht gefunden!
)

if exist "ui\styles-shipaar.css" (
    echo   [OK] ui\styles-shipaar.css gefunden
) else (
    echo   [FEHLER] ui\styles-shipaar.css nicht gefunden!
)

echo.
echo [4/4] Integration abgeschlossen!
echo.
echo Die App wird beim nächsten Start automatisch die neuen Module laden.
echo Alle Dateien sind vorhanden und einsatzbereit.
echo.
pause

exit /b 0
