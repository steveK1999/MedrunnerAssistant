# ✅ INTEGRATION CHECKLIST - Ship Assignment & AAR

## 📋 Status: ALLE DATEIEN ERSTELLT ✅

---

## Schritt 1: HTML Integration (5 Minuten)

### 1.1 Öffne `ui/index.html`
- [ ] Datei gefunden: `c:\Users\steve\OneDrive\Dokumente\GitHub\MedrunnerAssistant\ui\index.html`

### 1.2 Füge neue Tab-Buttons hinzu
- [ ] Finde existierende `<button class="tab-btn">` Tags
- [ ] Füge nach allen anderen Buttons hinzu:
```html
<button class="tab-btn" data-tab="shipAssignment">Ship Assignments</button>
<button class="tab-btn" data-tab="aar">After Action Report</button>
```

### 1.3 Kopiere HTML-Inhalte
- [ ] Öffne `ui/tabs-shipaar.html`
- [ ] Kopiere ALLEN Inhalt (alles zwischen <!-- und -->)
- [ ] Öffne `ui/index.html` und finde `</main>` Tag (ganz am Ende der Datei)
- [ ] Füge den kopierten Inhalt VOR `</main>` ein

### 1.4 Binde CSS ein
- [ ] Finde `<head>` Section in `ui/index.html`
- [ ] Finde bestehende `<link rel="stylesheet" href="styles.css">`
- [ ] Füge danach ein:
```html
<link rel="stylesheet" href="styles-shipaar.css">
```

**✓ HTML Integration fertig**

---

## Schritt 2: JavaScript Integration (5 Minuten)

### 2.1 Öffne `ui/renderer.js`
- [ ] Datei gefunden: `c:\Users\steve\OneDrive\Dokumente\GitHub\MedrunnerAssistant\ui\renderer.js`

### 2.2 Finde Tab-Switch Logik
- [ ] Suche nach existierenden `.addEventListener('click'` für Tab-Buttons
- [ ] Stelle sicher dass folgendes existiert:
```javascript
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabName = e.target.getAttribute('data-tab');
        switchTab(tabName);
    });
});
```

### 2.3 Füge switchTab-Funktion hinzu
- [ ] Füge am ANFANG des Dateien hinzu:
```javascript
// Global switchTab function for all tabs
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
    
    // Initialize AAR when opening AAR tab
    if (tabName === 'aar' && window.populateAARShipDropdowns) {
        window.populateAARShipDropdowns();
    }
}
```

### 2.4 Füge Modul-Import am ENDE hinzu
- [ ] Gehe zum ENDE der `renderer.js` Datei
- [ ] Füge folgendes ein:
```javascript
// Load Ship Assignment and AAR modules
import('./shipaar-init.js').then(() => {
    console.log('Ship Assignment and AAR modules loaded');
}).catch(err => {
    console.error('Failed to load modules:', err);
});
```

**✓ JavaScript Integration fertig**

---

## Schritt 3: Überprüfe package.json (1 Minute)

### 3.1 Öffne `package.json`
- [ ] Datei gefunden: `c:\Users\steve\OneDrive\Dokumente\GitHub\MedrunnerAssistant\package.json`

### 3.2 Überprüfe Modul-Type
- [ ] Stelle sicher dass folgende Zeile existiert:
```json
"type": "module"
```
- [ ] Falls nicht vorhanden, füge es am ANFANG nach `{` ein

**✓ package.json Überprüfung fertig**

---

## Schritt 4: Teste die Integration (5 Minuten)

### 4.1 Starte die App
- [ ] Öffne Terminal im Projekt-Root
- [ ] Führe aus: `npm start`
- [ ] Oder: `electron .`

### 4.2 Überprüfe die Tabs
- [ ] Fenster öffnet sich
- [ ] "Ship Assignments" Tab ist sichtbar
- [ ] "After Action Report" Tab ist sichtbar
- [ ] Klicke auf "Ship Assignments" Tab
- [ ] Tab-Inhalt wird angezeigt

### 4.3 Überprüfe die Funktionen
- [ ] Klicke "Add Ship" Button
- [ ] Neues Schiff wird hinzugefügt
- [ ] Wähle Schifftyp aus
- [ ] Wähle Schiffsnamen aus
- [ ] Klicke "Add Crew"
- [ ] Crew-Member wird angezeigt

### 4.4 Überprüfe DevTools
- [ ] Drücke F12 zum Öffnen von DevTools
- [ ] Gehe zum "Console" Tab
- [ ] Keine roten Fehler-Messages
- [ ] Nachricht sollte sichtbar sein: "Ship Assignment and AAR modules loaded"

**✓ Integration Tests erfolgreich**

---

## Schritt 5: Anpassung (10 Minuten)

### 5.1 Discord Emoji-IDs anpassen (WICHTIG!)
- [ ] Öffne `lib/constants.js`
- [ ] Finde den `EMOJIS` Object mit `positions`
- [ ] Ersetze die Emoji-IDs mit deinen Discord-Server Emojis:

```javascript
positions: {
    1: "<:P1:DEINE_ID_HIER>",  // Ersetze DEINE_ID_HIER
    2: "<:P2:DEINE_ID_HIER>",
    3: "<:P3:DEINE_ID_HIER>",
    // ... und so weiter bis P9
}
```

**Wie du die Emoji-ID findest:**
- [ ] Öffne Discord Server
- [ ] Gehe zu Server Settings → Emojis
- [ ] Erstelle Custom Emojis: P1, P2, P3, ... P9
- [ ] Schreib in einen Channel: `:P1:` 
- [ ] Rechtsklick auf den Emoji → "Copy"
- [ ] Extrahiere die ID (zwischen `:P1:` und `>`)

### 5.2 Überprüfe Farben & Styling
- [ ] Öffne App erneut
- [ ] Überprüfe dass die Farben zum Rest passen
- [ ] Falls Anpassung nötig: Bearbeite `ui/styles-shipaar.css`

### 5.3 Teste Speicherung
- [ ] Öffne "Ship Assignments" Tab
- [ ] Füge ein Schiff hinzu
- [ ] Schließe und öffne App erneut
- [ ] Schiff sollte noch da sein (aus LocalStorage)

**✓ Anpassungen abgeschlossen**

---

## Schritt 6: Erste Verwendung (5 Minuten)

### 6.1 Ship Assignment erstellen
- [ ] Öffne "Ship Assignments" Tab
- [ ] Klicke "Add Ship"
- [ ] Wähle Schifftyp: "Gunship"
- [ ] Wähle Schiff aus Liste: z.B. "Cutlass Black"
- [ ] Klicke "Add Crew" (3x)
- [ ] Fülle Crew-Details aus:
  - Role: PIL, LEAD, MED
  - Position: Auto-filled
  - Name: Optional
  - Discord ID: Optional
- [ ] Überprüfe Preview
- [ ] Klicke "COPY TO CLIPBOARD"
- [ ] Öffne Discord und Paste
- [ ] Überprüfe Format

### 6.2 After Action Report erstellen
- [ ] Öffne "After Action Report" Tab
- [ ] Schiffe sollten automatisch gefüllt sein
- [ ] Wähle Planet aus
- [ ] Wähle POI aus
- [ ] Fülle Mission-Details aus
- [ ] Überprüfe Preview
- [ ] Klicke "Copy to Clipboard"
- [ ] Öffne Discord und Paste

**✓ Erste Verwendung erfolgreich**

---

## Troubleshooting Checklist

### Problem: "Tabs werden nicht angezeigt"
- [ ] Überprüfe dass HTML korrekt in `index.html` eingefügt wurde
- [ ] Öffne DevTools (F12) → Network Tab
- [ ] Überprüfe dass CSS geladen wird (status 200)
- [ ] Überprüfe Console auf Fehler

### Problem: "Tabs sehen falsch aus"
- [ ] Überprüfe dass `styles-shipaar.css` in `<head>` eingebunden ist
- [ ] Überprüfe dass die Datei existiert: `ui/styles-shipaar.css`
- [ ] Überprüfe DevTools → Elements → Head → Link Tags

### Problem: "Module not found" Fehler
- [ ] Überprüfe `"type": "module"` in `package.json`
- [ ] Überprüfe Datei-Pfade in `shipaar-init.js`
- [ ] Überprüfe dass `lib/constants.js`, `lib/shipAssignment.js`, `lib/aar.js` existieren

### Problem: "Ships werden nicht gespeichert"
- [ ] Öffne DevTools → Application → LocalStorage
- [ ] Überprüfe ob `mrs_ship_assignments` Key existiert
- [ ] Falls nicht: Überprüfe Console auf Fehler
- [ ] Versuche `localStorage.clear()` in Console und neu laden

### Problem: "Discord-Emojis werden nicht angezeigt"
- [ ] Überprüfe dass Emoji-IDs in `lib/constants.js` korrekt sind
- [ ] Teste in Discord ob die Emojis auf dem Server existieren
- [ ] Überprüfe Format: `<:P1:123456789>` (muss exakt sein)

**Mehr Hilfe:** Siehe `SHIPAAR_INTEGRATION.md` → Troubleshooting

---

## Final Verification

### Code Dateien
- [ ] `lib/constants.js` existiert
- [ ] `lib/shipAssignment.js` existiert
- [ ] `lib/aar.js` existiert

### UI Dateien
- [ ] `ui/tabs-shipaar.html` existiert
- [ ] `ui/shipaar-init.js` existiert
- [ ] `ui/styles-shipaar.css` existiert

### HTML Integration
- [ ] `ui/index.html` wurde geändert
- [ ] Tab-Buttons wurden hinzugefügt
- [ ] Tab-Inhalte wurden eingefügt
- [ ] CSS Link wurde hinzugefügt

### JavaScript Integration
- [ ] `ui/renderer.js` wurde geändert
- [ ] switchTab Funktion wurde hinzugefügt
- [ ] Modul-Import wurde hinzugefügt

### Tests bestanden
- [ ] App startet ohne Fehler
- [ ] Tabs werden angezeigt
- [ ] Schiffe können hinzugefügt werden
- [ ] Daten werden gespeichert
- [ ] Discord-Format ist korrekt

---

## 🎉 SUCCESS CHECKLIST

- [ ] Alle Dateien erstellt ✅
- [ ] HTML integriert ✅
- [ ] JavaScript integriert ✅
- [ ] CSS integriert ✅
- [ ] package.json überprüft ✅
- [ ] App getestet ✅
- [ ] Discord-Emojis angepasst ✅
- [ ] Ship Assignment funktioniert ✅
- [ ] AAR funktioniert ✅
- [ ] LocalStorage funktioniert ✅

**ALLE PUNKTE CHECKED = INTEGRATION ERFOLGREICH! 🎉**

---

## Nächste Schritte

Nach erfolgreicher Integration:

1. **Verwende regelmäßig**
   - Plane damit Missionen
   - Erstelle AAR Reports nach Einsätzen
   - Teile in Discord

2. **Passe an deine Bedürfnisse an**
   - Füge weitere Schiffe hinzu (in `lib/constants.js`)
   - Ändere Farben (in `ui/styles-shipaar.css`)
   - Passe Emojis an

3. **Überwache LocalStorage**
   - Überprüfe regelmäßig ob Daten gespeichert sind
   - Lösche alte Missions falls nötig
   - Nutze Browser-Console zum Checken

4. **Teile mit Team**
   - Discord Link zum Projekt
   - Erkläre die Features
   - Zeige Beispiele

---

**Viel Erfolg mit deiner Integration! 🚑**

Bei Fragen oder Problemen: Siehe Dokumentations-Dateien.

Fertigstellungsdatum: 4. Januar 2026
