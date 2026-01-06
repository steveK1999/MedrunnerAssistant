# Ship Assignment & After Action Report Integration Guide

## Übersicht

Diese Integration fügt zwei neue Module zu MedrunnerAssistant hinzu:
1. **Ship Assignment** - Verwaltung von Schiff- und Crew-Zuweisungen für Missionen
2. **After Action Report (AAR)** - Strukturierte Missionsberichte nach Einsätzen

Beide Module basieren auf der [MRS Lead Toolkit](https://github.com/steveK1999/MRS_Lead_Toolkit) und wurden für die Electron-Anwendung angepasst.

## Neue Dateien

### Kernmodule

1. **`lib/constants.js`**
   - Alle Schiffsnamen (SHIPS)
   - Emoji-Zuordnungen für Discord-Ausgabe
   - Positionen und Rollen
   - Locationsdaten für alle Planeten und POIs

2. **`lib/shipAssignment.js`**
   - Schiffsverwaltung (hinzufügen, entfernen, bearbeiten)
   - Crew-Verwaltung (hinzufügen, entfernen, rollen/positionen)
   - Discord-Import/Export
   - Speicherung in localStorage
   - Drag-and-Drop für Crew-Members

3. **`lib/aar.js`**
   - Formularverarbeitung für AAR
   - Ship-Dropdown-Management (Gunship, Medical, CAP)
   - Location/POI-Auswahl
   - AAR-Ausgabe-Generierung
   - Vorschau und Zwischenablage-Funktionen

### UI-Integration

4. **`ui/tabs-shipaar.html`**
   - HTML-Struktur für Ship Assignment Tab
   - HTML-Struktur für AAR Tab
   - Import-Modal
   - CSS-Styles für die Module

5. **`ui/shipaar-init.js`**
   - Initialisierung der Module
   - Globale Funktions-Exporthälle
   - Tab-Switching-Logik

6. **`ui/styles-shipaar.css`**
   - Styling für alle neuen Komponenten
   - Responsive Design
   - Dark-Theme Anpassung

## Integration in bestehende Dateien

### 1. `ui/index.html` anpassen

Füge die neuen Tabs zu den bestehenden Tabs hinzu:

```html
<div class="tabs">
    <button class="tab-btn active" data-tab="sounds">Sound-Dateien</button>
    <button class="tab-btn" data-tab="features">Features</button>
    <button class="tab-btn" data-tab="overlay">Overlay</button>
    <button class="tab-btn" data-tab="team">Team</button>
    <button class="tab-btn" data-tab="settings">Einstellungen</button>
    <!-- NEUE TABS -->
    <button class="tab-btn" data-tab="shipAssignment">Ship Assignments</button>
    <button class="tab-btn" data-tab="aar">After Action Report</button>
    <button class="tab-btn" data-tab="console" style="display: none;">Konsole</button>
</div>
```

Füge dann die HTML-Inhalte aus `tabs-shipaar.html` in den `<main>` Bereich vor dem schließenden `</main>` Tag ein.

### 2. `ui/renderer.js` anpassen

Am Ende der Datei folgende Imports und Initialisierungen hinzufügen:

```javascript
// Ship Assignment and AAR Module Integration
import { initializeShipAndAARModules, switchTab } from './shipaar-init.js';

// Make switchTab available globally
window.switchTab = switchTab;

// Initialize modules when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await initializeShipAndAARModules();
    });
} else {
    initializeShipAndAARModules();
}
```

Zusätzlich die Tab-Click-Events anpassen:

```javascript
// Existing tab switching code should use the switchTab function
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabName = e.target.getAttribute('data-tab');
        switchTab(tabName);
    });
});
```

### 3. `ui/index.html` Head-Section

Stelle sicher, dass das CSS geladen wird:

```html
<head>
    <!-- ... bestehende Links ... -->
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="styles-shipaar.css">
</head>
```

### 4. `package.json` anpassen (bei ES6 Modulen)

Falls noch nicht vorhanden, stelle sicher, dass folgende Konfiguration existiert:

```json
{
    "type": "module",
    "main": "electron-main.cjs"
}
```

## Funktionen

### Ship Assignment

#### Schiff-Verwaltung
- Neue Schiffe hinzufügen (Gunship, Medship, CAP)
- Schiffsnamen aus Dropdown auswählen
- Schiffe entfernen

#### Crew-Verwaltung
- Crew-Members zu Schiffen hinzufügen
- Rollen zuweisen (PIL, LEAD, MED, SEC, CAP)
- Positionen (1-9) automatisch oder manuell setzen
- Discord-IDs eingeben
- Namen mit Autocomplete eingeben
- Kommentare hinzufügen (z.B. "Turret")
- Crew-Members entfernen mit automatischer Position-Neuordnung

#### Import/Export
- Discord-formatierte Nachrichten importieren
- Automatische Parsing von Rollen, Positionen, Kommentaren
- Als Markdown-formatierte Preview
- Mit Zeitstempel zur Clipboard kopierbar

#### LocalStorage
- Automatisches Speichern aller Änderungen
- Laden beim Startup
- Manuelles Löschen möglich

### After Action Report

#### Schiff-Auswahl
- Gunship automatisch aus Assignments vorselektiert
- Medical Ship (optional) automatisch vorselektiert
- Mehrere CAP-Schiffe mit dynamischen Dropdowns
- Zusätzliche Schiffe als Freitext eintragbar

#### Location-Auswahl
- Planeten/Orte (Crusader, Stanton, Microtech, etc.)
- POIs für jeden Ort (abhängig von Planet-Auswahl)
- Extraktionspunkte als Freitext

#### Mission-Details
- Grund für die Mission
- Missionsausgang (Success, Partial, Failed, Aborted)
- Opfer/Verluste
- Zusätzliche Notizen (Textarea)

#### Ausgabe
- Strukturierte Markdown-formatierte AAR
- Mit Zeitstempel
- Zur Clipboard kopierbar
- Live-Vorschau

## Verwendung

### Ship Assignment verwenden

1. Im Tab "Ship Assignments" auf "Add Ship" klicken
2. Schifftyp und -name auswählen
3. "Add Crew" klicken um Crew-Members hinzuzufügen
4. Rollen, Positionen und Namen eingeben
5. Discord-IDs eingeben (optional)
6. "COPY TO CLIPBOARD" klicken um die Ausgabe zu kopieren
7. In Discord paste und senden

### AAR verwenden

1. Im Tab "After Action Report" navigieren
2. Schiffe automatisch aus Ship Assignments gefüllt
3. Location und POI auswählen
4. Mission-Details eintragen
5. Vorschau überprüfen
6. "Copy to Clipboard" klicken
7. In Discord paste und senden

## Discord-Format

### Ship Assignment Format

```
# __⚕️SHIP ASSIGNMENTS⚕️__

## __**Gunship**__ 🔫 Cutlass Black
> 🛸 - <@123456789> <:P1:1281549969876078633> (Pilot)
> 👨‍✈️ - <@987654321> <:P2:1281549974435819621> (Lead)
> 🩺 - <@555555555> <:P3:1281549976576610335> (Medical)

-# Updated <t:1234567890:R>
```

### AAR Format

```
# __⚕️ AFTER ACTION REPORT ⚕️__

## Ships Used
- **Gunship:** Cutlass Black
- **Medical:** Cutlass Red
- **CAP Ships:** C-789, C-790

## Mission Location
- **Planet:** Microtech
- **POI:** New Babbage
- **Extraction:** Port Olisar

## Mission Details
- **Reason:** Patrol and rescue
- **Outcome:** Success
- **Casualties:** None

## Notes
Mission went smoothly, all objectives completed.

-# Generated <t:1234567890:R>
```

## LocalStorage

Die Module speichern automatisch in localStorage:

- `mrs_ship_assignments` - Aktuelle Schiff-Zuweisungen
- `mrs_cached_crew_names` - Cache für Crew-Namen (Autocomplete)

Diese können in der Browser-Console inspiziert werden:

```javascript
// Schiff-Zuweisungen anschauen
console.log(JSON.parse(localStorage.getItem('mrs_ship_assignments')))

// Cache-Namen anschauen
console.log(JSON.parse(localStorage.getItem('mrs_cached_crew_names')))

// Alles löschen (für fresh start)
localStorage.clear()
```

## Emoji-Konfiguration

Die Discord-Emoji-IDs in `lib/constants.js` müssen auf euer Server abgestimmt sein:

```javascript
const EMOJIS = {
    positions: {
        1: "<:P1:1281549969876078633>",  // Emoji-ID eurer P1
        2: "<:P2:1281549974435819621>",  // Emoji-ID eurer P2
        // ... etc
    }
}
```

Diese sollten mit den Position-Emojis auf eurem Discord-Server übereinstimmen.

## Troubleshooting

### Module laden nicht
- Überprüfe, dass `type: "module"` in `package.json` gesetzt ist
- Stelle sicher, dass alle Import-Pfade korrekt sind
- Überprüfe die Browser-Console (DevTools) auf Fehler

### Schiffe/AAR werden nicht gespeichert
- Überprüfe, dass localStorage verfügbar ist
- Überprüfe, dass keine Fehler in der Console sind
- LocalStorage wird durch `Clear All` gelöscht - das ist ein Browser-Feature, nicht ein Bug

### Discord-Import funktioniert nicht
- Stelle sicher, dass die Nachricht im korrekten Format ist
- Überprüfe die Browser-Console für spezifische Fehler
- Teste mit einer Beispiel-Nachricht aus MRS Lead Toolkit

### Dropdown-Optionen werden nicht angezeigt
- Überprüfe, dass CSS korrekt geladen ist
- Stelle sicher, dass die custom-select-options nicht mit `display: none` überschrieben werden

## Zukünftige Verbesserungen

- [ ] Speicherung auf Server/Cloud statt nur localStorage
- [ ] Team-Integration mit Rollen-Synchronisation
- [ ] Automatische Position-Zuweisung nach Algorithmus
- [ ] Export zu PDF
- [ ] Kalendar-Integration für AAR-Archivierung
- [ ] Automatische Crew-Name-Vorschläge aus Team-Liste

## Lizenz

Diese Module basieren auf der [MRS Lead Toolkit](https://github.com/steveK1999/MRS_Lead_Toolkit) und sind Teil des MedrunnerAssistant-Projekts.
