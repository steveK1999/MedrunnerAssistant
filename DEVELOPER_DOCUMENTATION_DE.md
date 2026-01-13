# Medrunner Assistant - Entwickler Dokumentation

## Inhaltsverzeichnis
1. [Architektur-Übersicht](#architektur-übersicht)
2. [Projektstruktur](#projektstruktur)
3. [Technologie-Stack](#technologie-stack)
4. [Module & Komponenten](#module--komponenten)
5. [Workflow-System](#workflow-system)
6. [API Integration](#api-integration)
7. [Entwicklung](#entwicklung)

---

## Architektur-Übersicht

Der Medrunner Assistant ist eine Electron-basierte Desktop-Anwendung mit folgender Architektur:

```
┌─────────────────────────────────────────────────────────┐
│                    Electron Main Process                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Main Window │  │   Workflow   │  │   Builder    │  │
│  │              │  │    Window    │  │    Window    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│           │                │                 │           │
│           └────────────────┴─────────────────┘           │
│                       IPC Communication                   │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│               Forked Background Process                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │             Medrunner API Client                   │ │
│  │  - WebSocket Connection                            │ │
│  │  - Event Polling                                   │ │
│  │  - Data Processing                                 │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Hauptkomponenten:**
1. **Electron Main Process** - Fenster-Management, IPC-Handler
2. **Renderer Process** - UI, User-Interaktionen
3. **Background Process** - API-Kommunikation, Event-Verarbeitung
4. **Workflow System** - Automatisierung und Event-basierte Aktionen

---

## Projektstruktur

```
MedrunnerAssistant/
├── electron-main.js              # Electron Hauptprozess
├── main.js                       # Background Worker
├── package.json                  # Dependencies & Scripts
│
├── lib/                          # Bibliotheken & Module
│   ├── aar.js                    # After Action Report
│   ├── alert-timer.js            # Alert Timer Management
│   ├── constants.js              # Globale Konstanten
│   ├── hammertime.js             # Discord Timestamp Helper
│   ├── medrunnerAPI.js           # Medrunner API Client
│   ├── monitorHelper.js          # Multi-Monitor Support
│   ├── playAudio.js              # Audio Playback
│   ├── resolveAudioPath.js       # Audio Datei-Auflösung
│   ├── settingsManager.js        # Einstellungs-Verwaltung
│   ├── shipAssignment.js         # Schiffs-Zuweisung Logik
│   ├── shipsAPI.js               # Schiffs-Daten API
│   ├── showAlertOverlay.js       # Overlay-Anzeige
│   ├── teamOrderPlace.js         # Team-Reihenfolge
│   └── workflowManager.js        # Workflow-Verwaltung
│
├── features/                     # Feature-Module
│   ├── alertNameTracker.js       # Alert-Namen Tracking
│   ├── alertOverlayTest.js       # Overlay Test-Utility
│   ├── customAlertSound.js       # Alert Sound Feature
│   ├── customChatMessageSound.js # Chat Sound Feature
│   ├── customTeamJoinSound.js    # Team Join Sound Feature
│   ├── customUnassignedSound.js  # Unassigned Alert Sound
│   ├── printShipAssignments.js   # Ship Assignment Feature
│   ├── printTeamJoinOrder.js     # Team Order Feature
│   ├── teamMembers.js            # Team Member Management
│   └── teamPositionManager.js    # Position Management
│
├── ui/                           # User Interface
│   ├── index.html                # Haupt-UI
│   ├── renderer.js               # Haupt-Renderer Logik
│   ├── preload.js                # Electron Preload Script
│   ├── styles.css                # Haupt-Styles
│   ├── styles-crew-enhancements.css
│   ├── styles-shipaar.css
│   ├── styles-shipaar-improvements.css
│   │
│   ├── workflow-builder.html     # Workflow Builder UI
│   ├── workflow-builder.js       # Builder Logik
│   ├── workflow-builder.css      # Builder Styles
│   │
│   ├── workflow-display.html     # Workflow Anzeige-Fenster
│   ├── workflow-display.js       # Display Logik
│   │
│   ├── shipaar-init.js           # Ship AAR Initialisierung
│   └── tabs-shipaar.html         # Ship AAR Tab Content
│
├── sounds/                       # Sound-Dateien
└── assets/                       # Assets (Logo, etc.)
```

---

## Technologie-Stack

### Core
- **Electron** - Desktop-Framework
- **Node.js** - Runtime
- **ES Modules** - Module-System

### Frontend
- **Vanilla JavaScript** - Keine Frameworks
- **HTML5 & CSS3** - UI-Gestaltung
- **IPC (Inter-Process Communication)** - Electron IPC

### APIs
- **Medrunner API** - WebSocket & REST
- **Ships API** - Schiffs-Daten von medrunner.net

### Persistenz
- **LocalStorage** - Settings & Workflows
- **File System** - Sound-Dateien

---

## Module & Komponenten

### 1. Electron Main Process (`electron-main.js`)

**Verantwortlichkeiten:**
- Fenster-Erstellung und -Verwaltung
- IPC-Handler für Renderer ↔ Main Kommunikation
- Background Process (main.js) forken und verwalten

**Wichtige Funktionen:**
- `createWindow()` - Haupt-Fenster erstellen
- `createWorkflowWindow(workflow, targetDisplay)` - Workflow-Fenster auf spezifischem Monitor
- `startAssistant()` - Background Process starten
- `stopAssistant()` - Background Process beenden

**IPC Handler:**
```javascript
ipcMain.handle('load-settings', ...)
ipcMain.handle('save-settings', ...)
ipcMain.handle('start-assistant', ...)
ipcMain.handle('stop-assistant', ...)
ipcMain.on('open-workflow-window', ...)
ipcMain.on('workflow-timer-action', ...)
```

### 2. Background Worker (`main.js`)

**Verantwortlichkeiten:**
- Medrunner API Verbindung aufrechterhalten
- Events empfangen und verarbeiten
- Features triggern

**Event-Loop:**
```javascript
1. API Login
2. WebSocket verbinden
3. Poll-Loop starten
4. Events verarbeiten
5. Features ausführen
6. Workflow-Trigger prüfen
```

### 3. Medrunner API Client (`lib/medrunnerAPI.js`)

**Klassen:**
- `MedrunnerAPIClient` - Haupt-API Client

**Methoden:**
```javascript
login()                    // Authentifizierung
getTeam()                  // Team-Daten abrufen
getChatMessages()          // Chat-Nachrichten
getCurrentAlerts()         // Aktuelle Alerts
getAlertHistory()          // Alert-Verlauf
assignShipToAlert()        // Schiff zuweisen
```

**WebSocket Events:**
- `alert:new` - Neuer Alert
- `alert:assigned` - Alert zugewiesen
- `alert:accepted` - Alert akzeptiert
- `team:member_joined` - Team-Mitglied beigetreten
- u.v.m.

### 4. Workflow System

#### Workflow Manager (`lib/workflowManager.js`)

**Workflow-Struktur:**
```javascript
{
  id: "workflow-xyz",
  name: "Mein Workflow",
  enabled: true,
  trigger: {
    type: "team_join" | "chat_message" | "new_alert",
    alertTypes: ["PVE", "PVP", "Non-Threat"],
    actions: {
      playSound: true,
      soundFile: "CUSTOM_ALERT_SOUND",
      showOverlay: true
    }
  },
  pages: [
    {
      id: 1,
      buttons: [
        {
          id: "btn-123",
          label: "Kopiere Text",
          color: "#3b82f6",
          actions: [
            { type: "copy", text: "Beispieltext" },
            { type: "navigate", targetPage: 2 }
          ]
        }
      ]
    }
  ],
  displaySettings: {
    targetDisplay: 0  // Monitor-Index
  }
}
```

**Funktionen:**
```javascript
triggerWorkflow(triggerType)       // Workflow auslösen
shouldTriggerOnTeamJoin()          // Trigger-Prüfung
shouldTriggerOnChatMessage()
shouldTriggerOnNewAlert(alert)
executeButtonActions(button)       // Button-Aktionen ausführen
```

**Button-Aktionen:**
- `navigate` - Seiten-Navigation
- `copy` - Text in Zwischenablage
- `timer` - Alert-Timer steuern
- `end` - Workflow beenden

#### Workflow Builder (`ui/workflow-builder.js`)

**Funktionen:**
```javascript
createNewWorkflow()                // Neuen Workflow erstellen
saveWorkflow()                     // Speichern
loadWorkflow(workflowId)           // Laden
addPage(workflow)                  // Seite hinzufügen
addButton(workflow, pageId, data)  // Button hinzufügen
```

**Übersetzungssystem:**
- Zweisprachig (DE/EN)
- Dynamische UI-Aktualisierung
- `applyTranslations()` bei Sprachwechsel

### 5. Settings Manager (`lib/settingsManager.js`)

**Einstellungen-Schema:**
```javascript
{
  MEDRUNNER_TOKEN: "",
  LANGUAGE: "de",
  CUSTOM_ALERT_SOUND: "path/to/sound.wav",
  ENABLE_CUSTOM_ALERT_SOUND: true,
  ENABLE_ALERT_OVERLAY: true,
  ALERT_OVERLAY_MONITOR_INDEX: 0,
  OVERLAY_DURATION_MS: 3000,
  OVERLAY_TEXT_SIZE_PERCENT: 100,
  OVERLAY_POSITION: "top",
  OVERLAY_BORDER_STYLE: "glow",
  DEBUG_MODE: false,
  TEST_MODE: false,
  API_ENV: "prod"
}
```

**Speicherort:**
- Windows: `%APPDATA%/medrunner-assistant/settings.json`

### 6. Overlay System (`lib/showAlertOverlay.js`)

**Multi-Monitor Support:**
```javascript
const { screen } = require('electron');
const displays = screen.getAllDisplays();
const targetDisplay = displays[monitorIndex];
```

**Overlay-Fenster:**
- Frameless Window
- Always on Top
- Transparent Background
- Auto-Close nach Timer

**Effekte:**
- **Top Position:** Slider-Animation + Puls
- **Center Position:** Fade-in + Puls
- **Border Styles:** Keiner oder rot leuchtend

---

## Workflow-System

### Trigger-System

**1. Team Join Trigger:**
```javascript
// In customTeamJoinSound.js
if (shouldTriggerOnTeamJoin()) {
  triggerWorkflow('team_join');
}
```

**2. Chat Message Trigger:**
```javascript
// In customChatMessageSound.js
if (shouldTriggerOnChatMessage()) {
  triggerWorkflow('chat_message');
}
```

**3. New Alert Trigger:**
```javascript
// In customAlertSound.js
if (shouldTriggerOnNewAlert(alert)) {
  triggerWorkflow('new_alert');
}
```

### Workflow-Fenster-Lifecycle

```
1. Trigger ausgelöst
2. workflowManager prüft: Hat Workflow Seiten?
3a. Ja -> IPC 'open-workflow-window' senden
3b. Nein -> Nur Trigger-Aktionen ausführen
4. electron-main erstellt Fenster auf targetDisplay
5. workflow-display.html geladen
6. Workflow-Daten via IPC gesendet
7. Seiten rendern
8. Button-Klicks verarbeiten
9. Aktionen ausführen
10. Bei "end" Aktion -> Fenster schließen
```

### Seiten-Navigation

```javascript
// Im Workflow-Fenster
navigateToPage(pageId)  // Direkte Navigation
nextPage()              // Vorwärts
previousPage()          // Rückwärts
```

---

## API Integration

### Medrunner API Endpoints

**Base URLs:**
- Production: `https://api.medrunner.space`
- Development: `https://api.medrunner.dev`

**Authentifizierung:**
```javascript
Headers: {
  'Authorization': 'Bearer <MEDRUNNER_TOKEN>'
}
```

**Wichtige Endpoints:**
```
GET  /team                    # Team-Daten
GET  /chat/messages           # Chat-Nachrichten
GET  /alerts/current          # Aktuelle Alerts
GET  /alerts/history          # Alert-Historie
POST /alerts/{id}/assign      # Schiff zuweisen
```

### Ships API

**Endpoint:**
```
GET https://www.medrunner.net/wp-json/api/v1/ship
```

**Response:**
```javascript
[
  {
    "Name": "Cutlass Red",
    "Crew": 2,
    "Medical Beds": 2,
    "Size": "Small",
    "Internal Use": true
  },
  // ...
]
```

---

## Entwicklung

### Setup

```bash
# Dependencies installieren
npm install

# Entwicklung starten
npm start

# Build erstellen
npm run build
```

### Debugging

**Electron DevTools:**
- F12 im Haupt-Fenster
- Rechtsklick → "Element untersuchen"

**Debug-Modus:**
- In Einstellungen aktivieren
- Erweiterte Logs in Console-Tab

**Test-Modus:**
- Aktiviert Test-Buttons
- API-Umgebung wechselbar

### Code-Style

**ES Modules:**
```javascript
import { function } from './module.js';
export { function };
```

**Namenskonventionen:**
- `camelCase` für Funktionen/Variablen
- `PascalCase` für Klassen
- `UPPER_SNAKE_CASE` für Konstanten

**Kommentare:**
```javascript
/**
 * Beschreibung der Funktion
 * @param {Type} paramName - Beschreibung
 * @returns {Type} Beschreibung
 */
```

### Testing

**Alert-Test:**
```javascript
// Im UI: "Alert-Test ausführen" Button
// Testet: Sound + Overlay auf gewähltem Monitor
```

**Workflow-Test:**
```javascript
// Im Workflow Builder: Trigger manuell auslösen
// Test-Workflows mit verschiedenen Aktionen
```

### Häufige Entwicklungsaufgaben

**Neues Feature hinzufügen:**
1. Feature-Modul in `features/` erstellen
2. In `main.js` importieren und initialisieren
3. Settings-Key in `lib/settingsManager.js` hinzufügen
4. UI in `ui/index.html` erweitern
5. Übersetzungen in `ui/renderer.js` hinzufügen

**Neue Workflow-Aktion:**
1. Action-Type in `ui/workflow-builder.js` definieren
2. UI für Action-Konfiguration hinzufügen
3. Ausführungs-Logik in `lib/workflowManager.js` implementieren
4. In `ui/workflow-display.js` für Workflow-Fenster

**Multi-Language Support:**
1. Übersetzungen in `translations` Objekt hinzufügen
2. `t(key)` Funktion verwenden
3. `applyTranslations()` bei UI-Updates aufrufen

---

## Build & Distribution

### Windows Build

```bash
# Electron Builder (falls konfiguriert)
npm run build

# Oder manuell mit electron-builder
electron-builder --win
```

### Deployment

**Voraussetzungen:**
- `package.json` Version aktualisieren
- Changelog erstellen
- Tests durchführen

**Release-Prozess:**
1. Code committen & pushen
2. Tag erstellen: `git tag v0.3.0`
3. Build erstellen
4. GitHub Release erstellen
5. Installer hochladen

---

## Troubleshooting

### Häufige Probleme

**IPC nicht funktionierend:**
- Preload-Script korrekt konfiguriert?
- Context Isolation aktiviert?
- Handler in electron-main registriert?

**Workflow-Fenster erscheint nicht:**
- Hat Workflow Seiten? (pages.length > 0)
- Monitor-Index gültig?
- Permissions korrekt?

**Audio funktioniert nicht:**
- .wav Format?
- Pfad korrekt aufgelöst?
- Node-Addons installiert?

**Overlay nicht sichtbar:**
- Monitor-Index korrekt?
- Always-On-Top aktiviert?
- Transparent Background unterstützt?

---

## Architektur-Entscheidungen

### Warum Electron?
- Native Desktop-Integration
- Plattformübergreifend
- Einfacher Zugriff auf Node.js APIs

### Warum Forked Process?
- Separation of Concerns
- UI bleibt responsiv während API-Polling
- Einfacheres Error-Handling

### Warum LocalStorage für Workflows?
- Einfach zu implementieren
- Keine DB-Abhängigkeiten
- Ausreichend für Use-Case

### Warum Vanilla JS?
- Geringe Bundle-Größe
- Keine Framework-Abhängigkeiten
- Volle Kontrolle über Performance

---

## Roadmap & TODOs

### Geplante Features
- [ ] Workflow Templates
- [ ] Export/Import von Workflows
- [ ] Erweiterte Workflow-Aktionen
- [ ] Plugin-System
- [ ] Auto-Update Mechanismus

### Bekannte Limitierungen
- Workflow-Fenster nur auf vorhandenen Monitoren
- Audio nur .wav Format
- Keine Cloud-Sync für Workflows

---

## Lizenz

Siehe LICENSE Datei im Repository.

---

## Kontakt & Contribution

**Entwickler:**
- GeneralMine
- Luebbi3000

**GitHub:** [github.com/GeneralMine/MedrunnerAssistant](https://github.com/GeneralMine/MedrunnerAssistant)

**Contributions:**
1. Fork das Repository
2. Feature Branch erstellen
3. Commits mit aussagekräftigen Messages
4. Pull Request erstellen

---

**Version:** 0.3.0  
**Letzte Aktualisierung:** Januar 2026
