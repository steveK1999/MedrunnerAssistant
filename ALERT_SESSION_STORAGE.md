# Alert & Session Storage

## Overview

Starting from this version, ship assignments and alert data follow a transient storage model:

- **Ship Assignments**: Cleared on each app restart, not persisted to localStorage
- **Alert Names**: Captured automatically from the API when an emergency is created (EmergencyCreate event)
- **Crew Names Cache**: Still persisted in localStorage for suggestions

## Alert Name Storage (Transient - Auto-populated from API)

Alert names are automatically captured from the API when an `EmergencyCreate` event occurs and stored in memory only for the duration of the current app session.

### How It Works

1. **Backend** (`features/alertNameTracker.js`):
   - Listens for `EmergencyCreate` events from the API
   - Extracts the `missionName` from the alert data
   - Stores it in memory (cleared on app close)
   - Sends the alert data to the Electron main process

2. **Electron Main** (`electron-main.cjs`):
   - Receives `alert-started` message from the backend process
   - Forwards it to the UI via IPC

3. **Frontend** (`renderer.js`):
   - Listens for `alert-started` events
   - Automatically calls `setCurrentAlertName()` to update the current alert
   - Stores the name in memory for the session

### Available Functions

#### `getCurrentAlertName()`
Gets the current alert name (set automatically from API).

```javascript
const alertName = window.getCurrentAlertName();
// Returns: "Test-Alert-123" or null if no alert active
```

#### `getAlertStartTime()`
Gets the timestamp when the alert was started (milliseconds since epoch).

```javascript
const startTime = window.getAlertStartTime();
const elapsedMs = Date.now() - startTime;
```

#### `setCurrentAlertName(name)`
Manually set the alert name (normally called automatically from API).

```javascript
window.setCurrentAlertName("Manual Alert");
```

#### `clearCurrentAlertName()`
Manually clears the current alert name.

```javascript
window.clearCurrentAlertName();
```

## Ship Assignments (Session-Only)

Ship assignments are now **NOT** automatically saved to localStorage.

### Why?
- Fresh start on each session (prevents stale data)
- Users explicitly manage their ship assignments each mission
- Still possible to manually save if needed

### Manual Save (if required)

If you need to save ship assignments for later:

```javascript
window.saveShipAssignments();
```

To load previously saved assignments:

```javascript
window.loadShipAssignments();
```

## Crew Names Cache (Still Persisted)

Crew names are still cached in localStorage for autocomplete suggestions:
- **Storage Key**: `mrs_cached_crew_names`
- **Persisted**: Yes, survives app restart
- **Auto-populated**: When crew members are added

## Debugging

Check the browser console and Electron logs to see:

```javascript
// Check current state
console.log("Current Alert:", window.getCurrentAlertName());
console.log("Alert Start Time:", window.getAlertStartTime());

// Test the feature (requires assistant running)
window.api.testFeature("Alert_Name_Tracker", 1);
```

### Console Output Examples

When an alert is triggered:
```
[renderer] Alert started: "Test-Alert-123"
```

When the feature is enabled:
```
[AlertNameTracker] Alert started: "Test-Alert-123" at 2026-01-07T12:34:56.789Z
[AlertNameTracker] Alert data sent to UI
```

## Files Modified

- `features/alertNameTracker.js` - New feature that listens for EmergencyCreate events
- `electron-main.cjs` - Added handling for alert-started messages
- `preload.cjs` & `ui/preload.cjs` - Exposed onAlertStarted callback
- `ui/renderer.js` - Added listener for alert-started events
- `lib/shipAssignment.js` - Contains the in-memory state functions
