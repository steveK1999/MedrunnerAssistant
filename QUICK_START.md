# 🚀 Quick Start Guide - Ship Assignment & AAR Integration

## ⚡ TL;DR - Start Here

### What You Need to Know
Your MedrunnerAssistant now has two new features:
1. **Ship Assignments** - Manage ships and crew
2. **After Action Report** - Generate mission reports

Everything is **fully automated**. Just run `quickstart.bat` and go!

---

## 🎯 Three Ways to Start

### Option 1: Quick Start (Do This First) ⭐
```
1. Go to MedrunnerAssistant folder
2. Double-click: quickstart.bat
3. Wait for app to start
4. New tabs appear: "Ship Assignments" and "After Action Report"
5. Start using!
```

### Option 2: Full Build (For Distribution)
```
1. Go to MedrunnerAssistant folder
2. Double-click: build.bat
3. Wait for build to complete (5-10 minutes)
4. Check dist/ folder for:
   - MedrunnerAssistant-Portable.exe
   - Medrunner Assistant Setup.exe
```

### Option 3: Admin Build (Code Signing)
```
1. Right-click: build-admin.bat
2. Select "Run as Administrator"
3. Enter admin password if prompted
4. Wait for build (10-15 minutes)
5. Files in dist/ are code-signed
```

---

## 📝 Ship Assignments - What You Can Do

### Add a Ship
```
1. Click "Ship Assignments" tab
2. Click "Add Ship" button
3. Select ship type from dropdown
4. Enter ship name
5. Press Enter or click elsewhere
6. Ship appears in list
```

### Add Crew Members to Ship
```
1. Click ship card
2. In "Add Crew" section:
   - Enter name
   - Select role (Pilot, Gunner, etc.)
   - Select position (Commander, Medic, etc.)
   - Optional: Discord username
3. Click "Add Crew"
4. Crew appears in ship's crew list
```

### Import from Discord (Bulk Add)
```
1. In Discord, copy a ship assignment message
2. Click "Import from Discord"
3. Paste message in dialog
4. Click "Import"
5. All ships and crews load automatically!
```

### Copy to Clipboard
```
1. Arrange ships and crews
2. Click "COPY TO CLIPBOARD"
3. Paste in Discord/chat
4. Formatted perfectly with emojis!
```

---

## 📊 After Action Report - What You Can Do

### Fill in Mission Details
```
1. Click "After Action Report" tab
2. Select ships used:
   - Gunship dropdown
   - Medical Ship dropdown
   - Additional CAP ships (click "Add CAP Ship")
3. Select mission location:
   - Choose planet
   - Choose POI (automatically updates)
   - Enter extraction point
4. Fill in mission info:
   - Reason for mission
   - Outcome (Success/Partial/Failed/Aborted)
   - Casualties
   - Additional notes
5. Click "Copy to Clipboard"
```

### Preview
- Form preview updates automatically
- Check it looks correct before copying
- Clear Form button to start over

---

## 💾 Your Data

### Where It's Stored
- All ship assignments saved in browser storage
- All AAR form data auto-saved
- Persists even if you close the app

### If You Need to Clear
- Click "Clear All" button in Ship Assignments
- Or click "Clear Form" in After Action Report
- Data clears immediately

### Export
- Use "COPY TO CLIPBOARD" to export
- Data format is Discord-friendly
- Can be pasted into messages/documents

---

## 🔍 What If Something Breaks?

### Check Integration Status
```bash
node verify-integration.js
```
Shows exactly what's working and what's not.

### Common Issues

**New tabs don't appear**
- Open browser console (F12)
- Check for red errors
- Run verify-integration.js
- Restart app

**Data doesn't save**
- Check browser console for errors
- Check localStorage is enabled
- Try clearing cache and restart
- Check disk space

**Import not working**
- Make sure you copied entire Discord message
- Message must have ship/crew structure
- Check console for error details

---

## 📚 Documentation Files

If you need more details:

| File | Purpose |
|------|---------|
| **START_HERE.md** | Overview of features |
| **README_SHIPAAR.md** | Full feature documentation |
| **AUTOMATION_COMPLETE.md** | How automation works |
| **INTEGRATION_SUMMARY.md** | Complete integration details |
| **FILE_INVENTORY.md** | List of all files |
| **verify-integration.js** | Run to check status |

---

## ⚙️ For Developers

### Architecture
- **lib/constants.js** - Data (ships, emojis, locations)
- **lib/shipAssignment.js** - Ship management logic  
- **lib/aar.js** - AAR form logic
- **ui/shipaar-init.js** - Module loader
- **ui/styles-shipaar.css** - Styling

### Module Loading
Automatically when app starts:
1. renderer.js detects DOM ready
2. Imports shipaar-init.js
3. shipaar-init.js loads all modules
4. Functions exposed to window global
5. Everything ready to use

### No Configuration Needed
- Uses native ES6 modules (no bundler)
- No npm dependencies added
- Works with existing Electron setup
- localStorage for persistence

---

## 🎉 What's Next?

### First Time
1. Run quickstart.bat
2. Test new tabs
3. Add some test ships
4. Try the features

### Regular Use
1. Use Ship Assignments for planning missions
2. Use AAR for documenting missions
3. Import/export to Discord
4. Data automatically saved

### Build & Deploy
1. Run build.bat
2. Get .exe files from dist/
3. Share with team
4. No installation needed for portable

---

## 💡 Pro Tips

### Crew Name Autocomplete
- Type crew names that appear often
- App remembers them automatically
- Start typing to see suggestions

### Location Selection
- 50+ planets with multiple POIs each
- Select planet first, then POI updates
- Or type custom location

### Discord Format
- Copy output preserves emoji formatting
- Looks great when pasted in Discord
- Professional appearance

### Bulk Operations
- Import entire Discord messages
- Faster than manual entry
- Preserves all crew details

---

## 🚨 Emergency Help

### App Won't Start
```
1. Delete node_modules folder
2. Run quickstart.bat again
3. Wait for fresh install
4. Should work now
```

### Lost Your Data
- Data is in browser localStorage
- Check under App Data → Local Storage
- Or run a fresh browser profile
- Data recoverable from file if recent

### Verification Fails
```bash
node verify-integration.js
```
Shows exactly what's wrong.

---

## 📞 Support

**For technical issues:**
- Check verify-integration.js output
- Look at browser console (F12)
- Check documentation files
- All errors logged with details

**For feature requests:**
- Check README_SHIPAAR.md
- All major features already included
- Contact developer for custom features

---

## ✅ Checklist Before Using

- ✅ You have Node.js installed (check: `node --version`)
- ✅ MedrunnerAssistant folder is writable
- ✅ Browser storage/cookies are enabled
- ✅ You have ~150 MB disk space (for dependencies)

If all checkboxes are ticked, you're ready to go!

---

## 🎊 Summary

1. **Run quickstart.bat** - That's it!
2. New tabs appear automatically
3. Use Ship Assignments and AAR
4. Data saves automatically
5. Copy to clipboard to export
6. Run build.bat when ready to distribute

**Everything else is handled automatically.**

---

*Welcome to the integrated MedrunnerAssistant! Happy missions! 🚀*

*Questions? Check the documentation files or run verify-integration.js*
