# Medrunner Assistant - Benutzerhandbuch

## Inhaltsverzeichnis
1. [Installation](#installation)
2. [Erste Schritte](#erste-schritte)
3. [Features](#features)
4. [Workflow Builder](#workflow-builder)
5. [Einstellungen](#einstellungen)
6. [FAQ](#faq)

---

## Installation

### Voraussetzungen
- Windows 10/11
- Node.js 18 oder höher
- Medrunner API Token (erhältlich im Staff Portal)

### Schritt 1: Download
Lade die neueste Version von GitHub herunter oder klone das Repository:
```bash
git clone https://github.com/GeneralMine/MedrunnerAssistant.git
cd MedrunnerAssistant
```

### Schritt 2: Installation
```bash
npm install
```

### Schritt 3: Starten
```bash
npm start
```
Oder nutze die bereitgestellte `start.bat` Datei.

---

## Erste Schritte

### 1. Medrunner Token eingeben
1. Öffne die **Einstellungen**
2. Gib deinen Medrunner API Token ein (erhältlich im Staff Portal)
3. Klicke auf **Speichern**

### 2. Sprache wählen
- **Deutsch** oder **English** unter Einstellungen auswählen

### 3. Assistant starten
- Klicke auf den **Start** Button oben rechts
- Der grüne Status-Indikator zeigt an, dass der Assistant läuft

---

## Features

### 🔊 Custom Sounds
Konfiguriere individuelle Sounds für verschiedene Events:
- **Alert Sound** - Bei neuen Alerts
- **Chat Message Sound** - Bei eingehenden Chatnachrichten
- **Team Join Sound** - Wenn jemand dem Team beitreten möchte
- **Unassigned Sound** - Für nicht zugewiesene Alerts

**So funktioniert's:**
1. Gehe zum Tab **Sound-Dateien**
2. Wähle eine .wav Datei über **Durchsuchen**
3. Aktiviere das Feature unter **Features**

### 🎯 Alert Overlay
Visuelles Feedback bei Alerts direkt auf deinem Bildschirm:
- **Bildschirm-Auswahl** - Wähle den Monitor für das Overlay
- **Position** - Oben oder Mitte
- **Effekte** - Slider-Animation oder Fade-in mit Puls
- **Rahmen** - Optional roter leuchtender Rand

**Konfiguration:**
1. Tab **Overlay** öffnen
2. **Overlay aktivieren** einschalten
3. Textgröße, Position und Effekte anpassen
4. Mit **Alert-Test** testen

### 👥 Team Management
Übersicht aller Team-Mitglieder:
- RSI Handle
- Discord ID
- Rolle
- Beitrittszeit
- Reihenfolge

**Quick Actions:**
- **Position kopieren** - Kopiert Team-Position für Discord
- **Alert kopieren** - Kopiert formatierte Alert-Nachricht
- **RTB kopieren** - Ready-to-Board Nachricht

### 🔄 Workflow Builder
Erstelle automatisierte Workflows für verschiedene Situationen:

**Trigger:**
- Team-Beitritt
- Chat-Nachricht
- Neuer Alert (nur bei Position 1)

**Aktionen:**
- Sound abspielen
- Overlay anzeigen
- Seiten mit Buttons anzeigen

**Workflow-Fenster:**
- Workflows mit Seiten öffnen ein separates Fenster
- Konfigurierbar auf beliebigem Monitor
- Buttons mit verschiedenen Aktionen:
  - Navigation zwischen Seiten
  - Text kopieren
  - Timer steuern
  - Workflow beenden

**So erstellst du einen Workflow:**
1. Klicke auf **Workflow Builder** im Hauptfenster
2. Gib einen Namen ein
3. Wähle einen Trigger
4. Optional: Füge Seiten und Buttons hinzu
5. Konfiguriere Trigger-Aktionen
6. Wähle den Ziel-Bildschirm unter **Anzeige-Einstellungen**
7. Klicke auf **Speichern**

### 📊 Ship Assignments & Team Order
- Automatische Anzeige von Schiffszuweisungen
- Team-Beitritts-Reihenfolge nachvollziehen

---

## Einstellungen

### Grundeinstellungen
- **Sprache** - Deutsch/English
- **Medrunner Token** - Dein API Token (erforderlich)

### Overlay-Einstellungen
- **Dauer** - Wie lange das Overlay angezeigt wird (in ms)
- **Textgröße** - Relative Größe in Prozent
- **Monitor** - Auf welchem Bildschirm das Overlay erscheint
- **Position & Effekt** - Oben mit Slider oder Mitte mit Fade-in
- **Randstil** - Kein Rand oder rot leuchtend

### Debug & Test
- **Debug-Modus** - Zeigt erweiterte Logs in der Konsole
- **Test Mode** - Aktiviert Test-Buttons und API-Konfiguration
- **Alert-Test** - Testet Sound und Overlay

---

## FAQ

### Wo finde ich meinen Medrunner Token?
Im Staff Portal unter deinem Profil.

### Warum höre ich keine Sounds?
1. Prüfe, ob das Feature aktiviert ist
2. Stelle sicher, dass eine .wav Datei ausgewählt ist
3. Teste die Datei mit einem Alert-Test

### Das Overlay wird nicht angezeigt
1. Aktiviere **Overlay aktivieren** im Overlay-Tab
2. Wähle den richtigen Monitor
3. Teste mit **Alert-Test ausführen**

### Workflow wird nicht ausgelöst
1. Stelle sicher, dass der Workflow **Aktiviert** ist
2. Bei Alert-Triggern: Dein Team muss Position 1 sein
3. Prüfe, ob die richtigen Alert-Typen ausgewählt sind

### Wie kann ich mehrere Workflows erstellen?
1. Im Workflow Builder auf **📋 Workflows** klicken
2. **+ Neuer Workflow** wählen
3. Neuen Workflow konfigurieren
4. Zwischen Workflows wechseln über die Workflows-Liste

### Das Workflow-Fenster erscheint nicht
1. Stelle sicher, dass der Workflow Seiten hat
2. Prüfe die **Anzeige-Einstellungen** im Builder
3. Workflows ohne Seiten zeigen nur Trigger-Aktionen

### Keyboard Shortcuts
- **Strg+S** - Einstellungen speichern
- **F12** - DevTools öffnen (für Entwickler)

---

## Support

Bei Problemen oder Fragen:
- GitHub Issues: [github.com/GeneralMine/MedrunnerAssistant/issues](https://github.com/GeneralMine/MedrunnerAssistant/issues)
- Discord: Medrunner Discord Server

---

**Version:** 0.3.0  
**Entwickler:** GeneralMine & Luebbi3000  
**Lizenz:** Siehe LICENSE Datei
