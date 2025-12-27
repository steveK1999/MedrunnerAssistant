# Medrunner Assistant - Windows Installer erstellen

## Für Entwickler: Installer bauen

### Voraussetzungen
- Node.js installiert
- Git (optional)

### Build-Prozess

**Option 1: Automatisches Build-Script**
```cmd
build.bat
```
Das Script führt automatisch aus:
1. `npm install` - Installiert alle Dependencies
2. `npm run build` - Erstellt Installer und Portable-Version
3. Öffnet den `dist/` Ordner mit den fertigen Dateien

**Option 2: Manuell**
```cmd
npm install
npm run build
```

### Ergebnis

Im `dist/` Ordner findest du:
- **`Medrunner Assistant Setup 0.3.0.exe`** - Vollständiger Windows-Installer (empfohlen)
- **`MedrunnerAssistant-Portable.exe`** - Portable Version (keine Installation nötig)

## Für Endbenutzer: Installation

### Windows Installer (empfohlen)

1. **Download:** Lade `Medrunner Assistant Setup X.X.X.exe` herunter
2. **Ausführen:** Doppelklick auf die .exe
3. **Installation:** Folge dem Installationsassistenten
   - Wähle Installationsort (optional)
   - Desktop-Verknüpfung erstellen (empfohlen)
   - Startmenü-Eintrag erstellen
4. **Starten:** Klicke auf "Medrunner Assistant" auf dem Desktop oder im Startmenü

**Das war's! Node.js wird NICHT benötigt.**

### Portable Version

1. **Download:** Lade `MedrunnerAssistant-Portable.exe` herunter
2. **Ausführen:** Lege die .exe in einen beliebigen Ordner
3. **Starten:** Doppelklick auf die .exe

Die Portable Version kann auch auf einem USB-Stick verwendet werden.

## Was ist enthalten?

Der Installer/Portable-Version enthält:
- ✅ Komplette Electron-App
- ✅ Alle Node.js Dependencies (eingebettet)
- ✅ Medrunner API Client
- ✅ Alle Features und Libraries
- ✅ Beispiel-Sounds (falls vorhanden)
- ✅ .env.example für erste Konfiguration

**Keine manuelle Installation von Node.js oder npm nötig!**

## Erste Schritte nach Installation

1. **App starten** - Über Desktop-Verknüpfung oder Startmenü
2. **Token eingeben** - Im "Authentifizierung"-Tab deinen Medrunner API-Token einfügen
3. **Sounds konfigurieren** - Im "Sound-Dateien"-Tab deine .wav-Dateien auswählen
4. **Features aktivieren** - Im "Features"-Tab gewünschte Features einschalten
5. **Speichern** - Auf "💾 Einstellungen speichern" klicken
6. **Starten** - Auf "Start"-Button oben rechts klicken

## Technische Details

### Installer-Typ: NSIS
- Moderne Windows-Installation
- Deinstallation über Windows Systemsteuerung
- Updates können über neue Installer eingespielt werden
- Konfiguration bleibt bei Updates erhalten

### Portable Version
- Keine Installation nötig
- Alle Daten im gleichen Ordner wie die .exe
- Perfekt für USB-Stick oder temporäre Nutzung
- Keine Registry-Einträge

### Systemanforderungen
- **OS:** Windows 10 oder neuer (64-bit)
- **RAM:** Mindestens 4 GB empfohlen
- **Festplatte:** ~200 MB freier Speicher
- **Internet:** Für Medrunner API-Verbindung

## Fehlerbehebung

**"Windows hat diesen PC geschützt" Warnung:**
- Klicke auf "Weitere Informationen"
- Dann auf "Trotzdem ausführen"
- (Die App ist nicht signiert, daher zeigt Windows diese Warnung)

**Installer startet nicht:**
- Führe als Administrator aus (Rechtsklick → "Als Administrator ausführen")
- Prüfe Antivirus-Software

**App startet nicht nach Installation:**
- Prüfe Windows Defender / Antivirus
- Führe Installer neu aus
- Versuche Portable-Version

## Updaten

Um auf eine neue Version zu updaten:

**Installer-Version:**
1. Lade neue .exe herunter
2. Führe neue Installation aus (überschreibt alte Version)
3. Deine Einstellungen (`.env`) bleiben erhalten

**Portable-Version:**
1. Lösche alte .exe
2. Lade neue .exe herunter
3. Kopiere `.env`-Datei vom alten zum neuen Ordner

## Distribution

Die erstellten .exe-Dateien können verteilt werden:
- Via GitHub Releases
- Via Direct Download
- Via USB-Stick
- Per E-Mail (komprimiert)

**Empfohlene Verteilung:**
- Erstelle ein GitHub Release
- Lade beide Versionen hoch (Installer + Portable)
- Füge Changelog und Installationsanleitung hinzu

## Support

Bei Problemen:
- GitHub Issues: https://github.com/GeneralMine/MedrunnerAssistant/issues
- Discord: `.generalmine`
