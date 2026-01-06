# Logo Update - MedRunner Assistant

## Änderungen

Das Medrunner Assistant Logo wurde erfolgreich aktualisiert:

### Neue Logo-Dateien
- `assets/logo.avif` - Original AVIF-Datei
- `assets/logo.png` - Haupt-Logo (512x512)
- `assets/logo-small.png` - Kleines Logo für UI (128x128)
- `assets/icon-16.png` bis `assets/icon-256.png` - Icon-Größen für Windows

### Geänderte Dateien

#### 1. electron-main.cjs
- Fenster-Icon hinzugefügt (`icon: path.join(__dirname, "assets", "icon-256.png")`)

#### 2. package.json
- Windows-Build-Icon konfiguriert: `"icon": "assets/icon-256.png"`
- `assets/**/*` zu den Build-Dateien hinzugefügt

#### 3. ui/index.html
- Krankenwagen-Emoji (🚑) durch `<img>`-Tag ersetzt
- Zeigt nun `assets/logo-small.png` im Header an

### Verwendung

Das neue Logo wird automatisch angezeigt:
- **Header**: Logo-Bild links neben dem Titel
- **Taskleiste**: Icon wird als Fenster-Icon verwendet
- **Build**: Icon wird für .exe und Installer verwendet

### Logo-Konvertierung

Die Datei `convert-logo.cjs` wurde erstellt, um das AVIF-Logo in verschiedene Formate zu konvertieren:

```bash
node convert-logo.cjs
```

Dies generiert alle benötigten PNG-Dateien aus dem Original-Logo.
