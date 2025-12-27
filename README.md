# Medrunner Assistant
Make your life as Medrunner easier with custom alert notifications and LEAD tools.

🎉 **NEU: Windows Desktop-App mit GUI!** Alle Einstellungen können jetzt über eine moderne Benutzeroberfläche verwaltet werden!

## Features
- `Alert`: Custom sound for incoming alerts
- `Alert`: Optional overlay per monitor with red border + blinking ALERT text
- `Chat`: Custom sound for client chat messages
- `Team`: Custom sound for team join requests
- `Team`: Print team members join order
- `GUI`: Desktop-App mit Tab-basierter Konfiguration
- `GUI`: Start/Stop Assistant direkt aus der App
- `GUI`: Live-Logs in der Anwendung

## Verwendung

1. **App starten** - Über Desktop-Verknüpfung oder `npm start` (Development)
2. **Authentifizierung:**
   - Öffne den "Authentifizierung"-Tab
   - Gib deinen Medrunner API-Token ein (aus dem Staff Portal)
3. **Sound-Dateien:**
   - Wähle .wav-Dateien für Alert, Chat und Team-Join
   - Nutze den "Durchsuchen"-Button oder verfügbare Sounds aus dem sounds/-Ordner
4. **Features aktivieren:**
   - Schalte gewünschte Features über Toggle-Switches ein/aus
5. **Alert-Overlay:**
   - Aktiviere visuelles Feedback bei Alerts
   - Wähle den Bildschirm (0 = Haupt, 1 = Zweiter, ...)
6. **Speichern:**
   - Klicke "💾 Einstellungen speichern" oder drücke `Strg+S`
7. **Starten:**
   - Klicke den "Start"-Button oben rechts
   - Verfolge Logs im "Erweitert"-Tab

## Screenshots

![Hauptfenster](docs/screenshot-main.png) *(TODO: Screenshot hinzufügen)*

## Systemanforderungen

- **OS:** Windows 10 oder neuer (64-bit)
- **RAM:** 4 GB empfohlen
- **Festplatte:** ~200 MB freier Speicher
- **Internet:** Für Medrunner API-Verbindung

## Geplante Features
- `AAR`: Autofill AAR Template based on clients questionaire from the chat
- `Timestamps`: Track Timestamps for LEAD
- `Activity`: Detect if user is active (or fallen asleep)
- `Sounds`: Volume Control for all sounds and OS
- `GUI`: Enable/Disable sounds and select volume
- `GUI`: Easy and flashy overlay informing about alert
- `GUI`: overlay displays basic alert info
  - Client Name
  - Thread Level
  - System
  - Planet Body
  - Location
- `GUI`: overlay displays additional information
  - Temperature
  - Oxygen
  - Mean travel time from musterpoint
  - Hostile/Peaceful place
  - Peaceful with missions
  - Turrets
  - Terrain to hide from turrets or not
  - Recommended ships to use
  - Landing/Dropoff/Cover sites

## Installation

### ⚡ Für Endbenutzer (EINFACH - kein Node.js nötig!)

**[📥 Download der neuesten Version](https://github.com/GeneralMine/MedrunnerAssistant/releases/latest)**

1. **Installer-Version (empfohlen):**
   - Lade `Medrunner Assistant Setup X.X.X.exe` herunter
   - Doppelklick auf die .exe
   - Folge dem Installationsassistenten
   - Fertig! Starte die App über Desktop-Verknüpfung

2. **Portable Version (ohne Installation):**
   - Lade `MedrunnerAssistant-Portable.exe` herunter
   - Lege die .exe in einen beliebigen Ordner
   - Doppelklick zum Starten

**Keine manuelle Installation von Node.js oder npm erforderlich!**

### 🛠️ Für Entwickler (Build aus Source)

```bash
# Clone das Repository
git clone https://github.com/GeneralMine/MedrunnerAssistant.git
cd MedrunnerAssistant

# Option 1: Installer erstellen (Windows)
build.bat

# Option 2: Manuell
npm install
npm run build

# Option 3: Development-Modus
npm install
npm start
```

Fertige Installer findest du dann im `dist/` Ordner.

Detaillierte Build-Anleitung: [BUILD_ANLEITUNG.md](BUILD_ANLEITUNG.md)
## Contributors
A huge thanks to @Luebbi5000 for the support on coding this!

If you want to participate in the development you are free to open a Pull Request, open an issue for e.g. a feature request or bug reports.
You can also send me a message on discord with the handle `.generalmine`
