# Medrunner Assistant - Windows Desktop App

Eine moderne Desktop-Anwendung für Medrunner mit grafischer Benutzeroberfläche.

## Schnellstart

1. **Dependencies installieren:**
   ```bash
   npm install
   ```

2. **App starten:**
   ```bash
   npm start
   ```

3. **Konfiguration:**
   - Die App öffnet automatisch mit einer GUI
   - Navigiere durch die Tabs: Authentifizierung, Sound-Dateien, Features, Alert-Overlay, Erweitert
   - Gib deinen Medrunner API-Token ein (aus dem Staff Portal)
   - Wähle deine Sound-Dateien (.wav Format)
   - Aktiviere/Deaktiviere Features nach Bedarf
   - Konfiguriere das Alert-Overlay (Bildschirm-Auswahl)
   - Klicke auf "Einstellungen speichern"

4. **Assistant starten:**
   - Klicke auf den "Start"-Button oben rechts
   - Der Status-Indikator wird grün, wenn der Assistant läuft
   - Live-Logs erscheinen im "Erweitert"-Tab

## Verfügbare Scripts

- `npm start` - Startet die Desktop-App mit GUI
- `npm run dev` - Startet die App im Entwicklungsmodus
- `npm run build` - Erstellt eine Windows .exe Installer im `dist/` Ordner
- `npm run build:all` - Erstellt Installer für 32-bit und 64-bit
- `npm run legacy` - Startet das alte CLI-Interface ohne GUI

## Features

### Tabs in der GUI:
1. **Authentifizierung** - Medrunner API Token eingeben
2. **Sound-Dateien** - Custom Sounds für Alert, Chat, Team-Join konfigurieren
3. **Features** - Einzelne Features aktivieren/deaktivieren
4. **Alert-Overlay** - Visuelles Alert-Overlay konfigurieren (Bildschirm auswählen)
5. **Erweitert** - Debug-Modus und Live-Logs

### Funktionen:
- ✅ Grafische Konfiguration aller .env-Einstellungen
- ✅ Start/Stop des Assistants direkt aus der App
- ✅ Live-Log-Anzeige
- ✅ Sound-Datei-Browser
- ✅ Toggle-Switches für alle Features
- ✅ Keyboard Shortcuts (Ctrl+S zum Speichern)
- ✅ Status-Indikator
- ✅ Dunkles, modernes Design

## Installer erstellen

Um eine standalone Windows-Anwendung zu erstellen:

```bash
npm run build
```

Der Installer wird im `dist/` Ordner erstellt und kann auf anderen Windows-PCs ohne Node.js installiert werden.

## Technische Details

- **Framework:** Electron
- **Backend:** Node.js mit Medrunner API Client
- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Build:** electron-builder für Windows Installer

## Ordnerstruktur

```
MedrunnerAssistant/
├── electron-main.js       # Electron Hauptprozess
├── main.js                # Backend Service (Medrunner Logic)
├── ui/
│   ├── index.html         # GUI Layout
│   ├── styles.css         # Styling
│   ├── renderer.js        # Frontend Logic
│   └── preload.js         # Electron IPC Bridge
├── lib/
│   ├── settingsManager.js # .env Verwaltung
│   └── ...                # Weitere Libraries
├── features/              # Medrunner Features
├── sounds/                # Sound-Dateien
└── assets/                # Icons und Assets
```

## Problembehebung

**App startet nicht:**
- Stelle sicher, dass Node.js installiert ist
- Führe `npm install` erneut aus
- Prüfe, ob Port 3000 frei ist

**Settings werden nicht gespeichert:**
- Prüfe Schreibrechte im Projektordner
- Stelle sicher, dass ein gültiger Token eingegeben wurde

**Assistant startet nicht:**
- Prüfe die Logs im "Erweitert"-Tab
- Stelle sicher, dass der Token gültig ist
- Aktiviere Debug-Mode für mehr Informationen

## Support

Bei Fragen oder Problemen:
- GitHub Issues: https://github.com/GeneralMine/MedrunnerAssistant/issues
- Discord: `.generalmine`
