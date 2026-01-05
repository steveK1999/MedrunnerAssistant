# Quick Start: Ship Assignment & AAR Integration

## Installation (Schritt für Schritt)

### Schritt 1: Neue Tabs zur HTML hinzufügen

Öffne `ui/index.html` und füge nach den existierenden Tab-Buttons folgende zwei Buttons hinzu:

```html
<button class="tab-btn" data-tab="shipAssignment">Ship Assignments</button>
<button class="tab-btn" data-tab="aar">After Action Report</button>
```

### Schritt 2: HTML-Inhalte einfügen

Kopiere den gesamten Inhalt aus `ui/tabs-shipaar.html` und füge ihn am Ende des `<main>` Tags (vor `</main>`) in `ui/index.html` ein.

### Schritt 3: CSS einbinden

Füge in der `<head>` Section von `ui/index.html` folgende Zeile hinzu:

```html
<link rel="stylesheet" href="styles-shipaar.css">
```

### Schritt 4: JavaScript Module laden

Öffne `ui/renderer.js` und füge am ENDE der Datei folgende Zeilen ein:

```javascript
// Ship Assignment and AAR Module Integration
import('./shipaar-init.js').then(module => {
    window.switchTab = module.switchTab;
});

// Make switchTab available for inline onclick handlers
function switchTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabContents.forEach(content => {
        if (content.getAttribute('data-tab') === tabName) {
            content.style.display = 'block';
            content.classList.add('active');
        } else {
            content.style.display = 'none';
            content.classList.remove('active');
        }
    });
    
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}
```

### Schritt 5: Tab-Button Event Listener hinzufügen

Füge in `ui/renderer.js` in der bereits existierenden Tab-Switching-Logik die Listener für die neuen Buttons ein:

```javascript
// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabName = e.target.getAttribute('data-tab');
        switchTab(tabName);
    });
});
```

## Verwendung

### Ship Assignments verwenden

1. Navigiere zum "Ship Assignments" Tab
2. Klicke "Add Ship" um ein neues Schiff hinzuzufügen
3. Wähle den Schifftyp (Gunship, Medship, oder CAP) aus
4. Wähle den Schiffsnamen aus der Liste
5. Klicke "Add Crew" um Crew-Members hinzuzufügen
6. Fülle die Details aus:
   - Position: 1-9 (oder leer lassen)
   - Rolle: PIL, LEAD, MED, SEC, CAP
   - Discord ID: Optional
   - Name: Optional (mit Autocomplete)
   - Kommentar: Optional (z.B. "Turret", "Pilot")
7. Preview überprüfen
8. "COPY TO CLIPBOARD" klicken
9. In Discord einfügen und senden

### After Action Report verwenden

1. Navigiere zum "After Action Report" Tab
2. Schiffe werden automatisch aus "Ship Assignments" geladen
3. Wähle Gunship und Medical Ship aus
4. Füge optional CAP Ships hinzu mit "Add CAP Ship" Button
5. Wähle Planet und POI
6. Fülle Mission-Details aus:
   - Reason: Grund für die Mission
   - Outcome: Success/Partial/Failed/Aborted
   - Casualties: Verluste
   - Notes: Zusätzliche Notizen
7. Preview überprüfen
8. "Copy to Clipboard" klicken
9. In Discord einfügen und senden

## Daten speichern

Alle Daten werden automatisch in LocalStorage gespeichert:
- **Ship Assignments** speichern sich automatisch nach jeder Änderung
- **AAR Formulare** werden NICHT gespeichert (nur der Preview wird angezeigt)

Um gespeicherte Assignments zu löschen:
- Nutze den "Clear All" Button im Ship Assignments Tab

## Discord Emoji Setup

Die Positions-Emojis müssen auf deinen Discord-Server angepasst werden. 

Um die Emoji-IDs herauszufinden:
1. Erstelle Custom Emojis auf deinem Server (P1 bis P9)
2. Nutze diese in einer Testnachricht
3. Kopiere die Emoji-IDs (rechtsklick > Kopieren)
4. Ersetze die Emoji-IDs in `lib/constants.js`

Beispiel:
```javascript
const EMOJIS = {
    positions: {
        1: "<:P1:YOUR_EMOJI_ID>",  // Deine Emoji-ID hier
        2: "<:P2:YOUR_EMOJI_ID>",
        // ... etc
    }
}
```

## Keyboard Shortcuts (Optional)

Du kannst in `ui/renderer.js` noch folgende Shortcuts hinzufügen:

```javascript
document.addEventListener('keydown', (e) => {
    // Alt + A für Ship Assignments
    if (e.altKey && e.key === 'a') {
        switchTab('shipAssignment');
    }
    // Alt + R für After Action Report
    if (e.altKey && e.key === 'r') {
        switchTab('aar');
    }
});
```

## Troubleshooting

### "Module not found" Fehler
- Stelle sicher, dass `"type": "module"` in `package.json` gesetzt ist
- Überprüfe dass alle Datei-Pfade korrekt sind

### Tabs werden nicht angezeigt
- Überprüfe, dass die Tab-Button `data-tab` Attribute korrekt gesetzt sind
- Stelle sicher, dass die Tab-Content Divs das `data-tab` Attribut haben

### Preview wird nicht aktualisiert
- Stelle sicher, dass `updatePreview()` nach Änderungen aufgerufen wird
- Überprüfe die Browser-Console auf JavaScript-Fehler (F12)

### Discord-Import funktioniert nicht
- Die Nachricht muss im korrekten Format sein (wie von MRS Lead Toolkit exportiert)
- Überprüfe die Browser-Console für genaue Fehlermeldung

## Performance-Tipps

- Bei sehr vielen Crew-Members kann das Rendering langsamer werden
- Für große Missionen empfiehlt es sich, mehrere kleinere AAR-Einträge zu erstellen
- LocalStorage ist auf ~5MB begrenzt - alte Assignments können gelöscht werden

## Weitere Informationen

Siehe `SHIPAAR_INTEGRATION.md` für ausführliche Dokumentation und Konfiguration.

## Support

Falls Probleme auftreten:
1. Überprüfe die Browser-Console (DevTools - F12)
2. Stelle sicher, dass alle Dateien existieren
3. Vergleiche deine Integration mit dem Guide in `SHIPAAR_INTEGRATION.md`
