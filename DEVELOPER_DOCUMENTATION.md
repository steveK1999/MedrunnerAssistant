# Medrunner Assistant - Developer Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Modules & Components](#modules--components)
5. [Workflow System](#workflow-system)
6. [API Integration](#api-integration)
7. [Development](#development)

---

## Architecture Overview

The Medrunner Assistant is an Electron-based desktop application with the following architecture:

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

**Main Components:**
1. **Electron Main Process** - Window management, IPC handlers
2. **Renderer Process** - UI, user interactions
3. **Background Process** - API communication, event processing
4. **Workflow System** - Automation and event-based actions

---

## Project Structure

```
MedrunnerAssistant/
├── electron-main.js              # Electron main process
├── main.js                       # Background worker
├── package.json                  # Dependencies & scripts
│
├── lib/                          # Libraries & modules
│   ├── aar.js                    # After Action Report
│   ├── alert-timer.js            # Alert timer management
│   ├── constants.js              # Global constants
│   ├── hammertime.js             # Discord timestamp helper
│   ├── medrunnerAPI.js           # Medrunner API client
│   ├── monitorHelper.js          # Multi-monitor support
│   ├── playAudio.js              # Audio playback
│   ├── resolveAudioPath.js       # Audio file resolution
│   ├── settingsManager.js        # Settings management
│   ├── shipAssignment.js         # Ship assignment logic
│   ├── shipsAPI.js               # Ships data API
│   ├── showAlertOverlay.js       # Overlay display
│   ├── teamOrderPlace.js         # Team order tracking
│   └── workflowManager.js        # Workflow management
│
├── features/                     # Feature modules
│   ├── alertNameTracker.js       # Alert name tracking
│   ├── alertOverlayTest.js       # Overlay test utility
│   ├── customAlertSound.js       # Alert sound feature
│   ├── customChatMessageSound.js # Chat sound feature
│   ├── customTeamJoinSound.js    # Team join sound feature
│   ├── customUnassignedSound.js  # Unassigned alert sound
│   ├── printShipAssignments.js   # Ship assignment feature
│   ├── printTeamJoinOrder.js     # Team order feature
│   ├── teamMembers.js            # Team member management
│   └── teamPositionManager.js    # Position management
│
├── ui/                           # User interface
│   ├── index.html                # Main UI
│   ├── renderer.js               # Main renderer logic
│   ├── preload.js                # Electron preload script
│   ├── styles.css                # Main styles
│   ├── styles-crew-enhancements.css
│   ├── styles-shipaar.css
│   ├── styles-shipaar-improvements.css
│   │
│   ├── workflow-builder.html     # Workflow builder UI
│   ├── workflow-builder.js       # Builder logic
│   ├── workflow-builder.css      # Builder styles
│   │
│   ├── workflow-display.html     # Workflow display window
│   ├── workflow-display.js       # Display logic
│   │
│   ├── shipaar-init.js           # Ship AAR initialization
│   └── tabs-shipaar.html         # Ship AAR tab content
│
├── sounds/                       # Sound files
└── assets/                       # Assets (logo, etc.)
```

---

## Technology Stack

### Core
- **Electron** - Desktop framework
- **Node.js** - Runtime
- **ES Modules** - Module system

### Frontend
- **Vanilla JavaScript** - No frameworks
- **HTML5 & CSS3** - UI design
- **IPC (Inter-Process Communication)** - Electron IPC

### APIs
- **Medrunner API** - WebSocket & REST
- **Ships API** - Ship data from medrunner.net

### Persistence
- **LocalStorage** - Settings & workflows
- **File System** - Sound files

---

## Modules & Components

### 1. Electron Main Process (`electron-main.js`)

**Responsibilities:**
- Window creation and management
- IPC handlers for Renderer ↔ Main communication
- Fork and manage background process (main.js)

**Important Functions:**
- `createWindow()` - Create main window
- `createWorkflowWindow(workflow, targetDisplay)` - Create workflow window on specific monitor
- `startAssistant()` - Start background process
- `stopAssistant()` - Stop background process

**IPC Handlers:**
```javascript
ipcMain.handle('load-settings', ...)
ipcMain.handle('save-settings', ...)
ipcMain.handle('start-assistant', ...)
ipcMain.handle('stop-assistant', ...)
ipcMain.on('open-workflow-window', ...)
ipcMain.on('workflow-timer-action', ...)
```

### 2. Background Worker (`main.js`)

**Responsibilities:**
- Maintain Medrunner API connection
- Receive and process events
- Trigger features

**Event Loop:**
```javascript
1. API Login
2. Connect WebSocket
3. Start poll loop
4. Process events
5. Execute features
6. Check workflow triggers
```

### 3. Medrunner API Client (`lib/medrunnerAPI.js`)

**Classes:**
- `MedrunnerAPIClient` - Main API client

**Methods:**
```javascript
login()                    // Authentication
getTeam()                  // Retrieve team data
getChatMessages()          // Chat messages
getCurrentAlerts()         // Current alerts
getAlertHistory()          // Alert history
assignShipToAlert()        // Assign ship
```

**WebSocket Events:**
- `alert:new` - New alert
- `alert:assigned` - Alert assigned
- `alert:accepted` - Alert accepted
- `team:member_joined` - Team member joined
- etc.

### 4. Workflow System

#### Workflow Manager (`lib/workflowManager.js`)

**Workflow Structure:**
```javascript
{
  id: "workflow-xyz",
  name: "My Workflow",
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
          label: "Copy Text",
          color: "#3b82f6",
          actions: [
            { type: "copy", text: "Example text" },
            { type: "navigate", targetPage: 2 }
          ]
        }
      ]
    }
  ],
  displaySettings: {
    targetDisplay: 0  // Monitor index
  }
}
```

**Functions:**
```javascript
triggerWorkflow(triggerType)       // Trigger workflow
shouldTriggerOnTeamJoin()          // Trigger check
shouldTriggerOnChatMessage()
shouldTriggerOnNewAlert(alert)
executeButtonActions(button)       // Execute button actions
```

**Button Actions:**
- `navigate` - Page navigation
- `copy` - Copy text to clipboard
- `timer` - Control alert timer
- `end` - End workflow

#### Workflow Builder (`ui/workflow-builder.js`)

**Functions:**
```javascript
createNewWorkflow()                // Create new workflow
saveWorkflow()                     // Save
loadWorkflow(workflowId)           // Load
addPage(workflow)                  // Add page
addButton(workflow, pageId, data)  // Add button
```

**Translation System:**
- Bilingual (DE/EN)
- Dynamic UI updates
- `applyTranslations()` on language change

### 5. Settings Manager (`lib/settingsManager.js`)

**Settings Schema:**
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

**Storage Location:**
- Windows: `%APPDATA%/medrunner-assistant/settings.json`

### 6. Overlay System (`lib/showAlertOverlay.js`)

**Multi-Monitor Support:**
```javascript
const { screen } = require('electron');
const displays = screen.getAllDisplays();
const targetDisplay = displays[monitorIndex];
```

**Overlay Window:**
- Frameless window
- Always on top
- Transparent background
- Auto-close after timer

**Effects:**
- **Top Position:** Slider animation + pulse
- **Center Position:** Fade-in + pulse
- **Border Styles:** None or red glowing

---

## Workflow System

### Trigger System

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

### Workflow Window Lifecycle

```
1. Trigger fired
2. workflowManager checks: Does workflow have pages?
3a. Yes -> Send IPC 'open-workflow-window'
3b. No -> Execute trigger actions only
4. electron-main creates window on targetDisplay
5. workflow-display.html loaded
6. Workflow data sent via IPC
7. Render pages
8. Process button clicks
9. Execute actions
10. On "end" action -> Close window
```

### Page Navigation

```javascript
// In workflow window
navigateToPage(pageId)  // Direct navigation
nextPage()              // Forward
previousPage()          // Backward
```

---

## API Integration

### Medrunner API Endpoints

**Base URLs:**
- Production: `https://api.medrunner.space`
- Development: `https://dev-api.medrunner.space`

**Authentication:**
```javascript
Headers: {
  'Authorization': 'Bearer <MEDRUNNER_TOKEN>'
}
```

**Important Endpoints:**
```
GET  /team                    # Team data
GET  /chat/messages           # Chat messages
GET  /alerts/current          # Current alerts
GET  /alerts/history          # Alert history
POST /alerts/{id}/assign      # Assign ship
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

## Development

### Setup

```bash
# Install dependencies
npm install

# Start development
npm start

# Create build
npm run build
```

### Debugging

**Electron DevTools:**
- F12 in main window
- Right-click → "Inspect Element"

**Debug Mode:**
- Enable in Settings
- Extended logs in Console tab

**Test Mode:**
- Enables test buttons
- Switchable API environment

### Code Style

**ES Modules:**
```javascript
import { function } from './module.js';
export { function };
```

**Naming Conventions:**
- `camelCase` for functions/variables
- `PascalCase` for classes
- `UPPER_SNAKE_CASE` for constants

**Comments:**
```javascript
/**
 * Function description
 * @param {Type} paramName - Description
 * @returns {Type} Description
 */
```

### Testing

**Alert Test:**
```javascript
// In UI: "Run Alert Test" button
// Tests: Sound + Overlay on selected monitor
```

**Workflow Test:**
```javascript
// In Workflow Builder: Manually trigger
// Test workflows with different actions
```

### Common Development Tasks

**Add New Feature:**
1. Create feature module in `features/`
2. Import and initialize in `main.js`
3. Add settings key in `lib/settingsManager.js`
4. Extend UI in `ui/index.html`
5. Add translations in `ui/renderer.js`

**New Workflow Action:**
1. Define action type in `ui/workflow-builder.js`
2. Add UI for action configuration
3. Implement execution logic in `lib/workflowManager.js`
4. Add to `ui/workflow-display.js` for workflow window

**Multi-Language Support:**
1. Add translations to `translations` object
2. Use `t(key)` function
3. Call `applyTranslations()` on UI updates

---

## Build & Distribution

### Windows Build

```bash
# Electron Builder (if configured)
npm run build

# Or manually with electron-builder
electron-builder --win
```

### Deployment

**Prerequisites:**
- Update `package.json` version
- Create changelog
- Run tests

**Release Process:**
1. Commit and push code
2. Create tag: `git tag v0.3.0`
3. Create build
4. Create GitHub release
5. Upload installer

---

## Troubleshooting

### Common Issues

**IPC not working:**
- Preload script configured correctly?
- Context isolation enabled?
- Handler registered in electron-main?

**Workflow window doesn't appear:**
- Does workflow have pages? (pages.length > 0)
- Monitor index valid?
- Permissions correct?

**Audio not working:**
- .wav format?
- Path resolved correctly?
- Node addons installed?

**Overlay not visible:**
- Monitor index correct?
- Always-on-top enabled?
- Transparent background supported?

---

## Architecture Decisions

### Why Electron?
- Native desktop integration
- Cross-platform
- Easy access to Node.js APIs

### Why Forked Process?
- Separation of concerns
- UI stays responsive during API polling
- Easier error handling

### Why LocalStorage for Workflows?
- Easy to implement
- No database dependencies
- Sufficient for use case

### Why Vanilla JS?
- Small bundle size
- No framework dependencies
- Full control over performance

---

## Roadmap & TODOs

### Planned Features
- [ ] Workflow templates
- [ ] Export/import of workflows
- [ ] Extended workflow actions
- [ ] Plugin system
- [ ] Auto-update mechanism

### Known Limitations
- Workflow window only on existing monitors
- Audio only .wav format
- No cloud sync for workflows

---

## License

See LICENSE file in repository.

---

## Contact & Contribution

**Developers:**
- GeneralMine
- Luebbi3000

**GitHub:** [github.com/GeneralMine/MedrunnerAssistant](https://github.com/GeneralMine/MedrunnerAssistant)

**Contributions:**
1. Fork the repository
2. Create feature branch
3. Commits with meaningful messages
4. Create pull request

---

**Version:** 0.3.0  
**Last Updated:** January 2026
