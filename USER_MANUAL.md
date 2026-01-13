# Medrunner Assistant - User Manual

## Table of Contents
1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Features](#features)
4. [Workflow Builder](#workflow-builder)
5. [Settings](#settings)
6. [FAQ](#faq)

---

## Installation

### Prerequisites
- Windows 10/11
- Node.js 18 or higher
- Medrunner API Token (available in the Staff Portal)

### Step 1: Download
Download the latest version from GitHub or clone the repository:
```bash
git clone https://github.com/GeneralMine/MedrunnerAssistant.git
cd MedrunnerAssistant
```

### Step 2: Installation
```bash
npm install
```

### Step 3: Start
```bash
npm start
```
Or use the provided `start.bat` file.

---

## Getting Started

### 1. Enter Medrunner Token
1. Open **Settings**
2. Enter your Medrunner API Token (available in the Staff Portal)
3. Click **Save**

### 2. Choose Language
- Select **Deutsch** or **English** in Settings

### 3. Start Assistant
- Click the **Start** button in the top right
- The green status indicator shows that the Assistant is running

---

## Features

### 🔊 Custom Sounds
Configure individual sounds for different events:
- **Alert Sound** - For new alerts
- **Chat Message Sound** - For incoming chat messages
- **Team Join Sound** - When someone wants to join the team
- **Unassigned Sound** - For unassigned alerts

**How it works:**
1. Go to the **Sound Files** tab
2. Select a .wav file via **Browse**
3. Enable the feature under **Features**

### 🎯 Alert Overlay
Visual feedback for alerts directly on your screen:
- **Screen Selection** - Choose the monitor for the overlay
- **Position** - Top or Center
- **Effects** - Slider animation or fade-in with pulse
- **Border** - Optional red glowing border

**Configuration:**
1. Open the **Overlay** tab
2. Enable **Activate Overlay**
3. Adjust text size, position, and effects
4. Test with **Alert Test**

### 👥 Team Management
Overview of all team members:
- RSI Handle
- Discord ID
- Role
- Join Time
- Order

**Quick Actions:**
- **Copy Position** - Copies team position for Discord
- **Copy Alert** - Copies formatted alert message
- **Copy RTB** - Ready-to-Board message

### 🔄 Workflow Builder
Create automated workflows for different situations:

**Triggers:**
- Team Join
- Chat Message
- New Alert (only at position 1)

**Actions:**
- Play Sound
- Show Overlay
- Display pages with buttons

**Workflow Window:**
- Workflows with pages open a separate window
- Configurable on any monitor
- Buttons with various actions:
  - Navigate between pages
  - Copy text
  - Control timer
  - End workflow

**How to create a workflow:**
1. Click **Workflow Builder** in the main window
2. Enter a name
3. Choose a trigger
4. Optional: Add pages and buttons
5. Configure trigger actions
6. Select the target screen under **Display Settings**
7. Click **Save**

### 📊 Ship Assignments & Team Order
- Automatic display of ship assignments
- Track team join order

---

## Settings

### Basic Settings
- **Language** - German/English
- **Medrunner Token** - Your API Token (required)

### Overlay Settings
- **Duration** - How long the overlay is displayed (in ms)
- **Text Size** - Relative size in percent
- **Monitor** - Which screen the overlay appears on
- **Position & Effect** - Top with slider or center with fade-in
- **Border Style** - No border or red glowing

### Debug & Test
- **Debug Mode** - Shows extended logs in the console
- **Test Mode** - Enables test buttons and API configuration
- **Alert Test** - Tests sound and overlay

---

## FAQ

### Where do I find my Medrunner Token?
In the Staff Portal under your profile.

### Why don't I hear any sounds?
1. Check if the feature is enabled
2. Make sure a .wav file is selected
3. Test the file with an Alert Test

### The overlay is not displayed
1. Enable **Activate Overlay** in the Overlay tab
2. Select the correct monitor
3. Test with **Run Alert Test**

### Workflow is not triggered
1. Make sure the workflow is **Enabled**
2. For alert triggers: Your team must be at position 1
3. Check if the correct alert types are selected

### How can I create multiple workflows?
1. Click **📋 Workflows** in the Workflow Builder
2. Select **+ New Workflow**
3. Configure new workflow
4. Switch between workflows via the workflows list

### The workflow window does not appear
1. Make sure the workflow has pages
2. Check the **Display Settings** in the Builder
3. Workflows without pages only show trigger actions

### Keyboard Shortcuts
- **Ctrl+S** - Save settings
- **F12** - Open DevTools (for developers)

---

## Support

For problems or questions:
- GitHub Issues: [github.com/GeneralMine/MedrunnerAssistant/issues](https://github.com/GeneralMine/MedrunnerAssistant/issues)
- Discord: Medrunner Discord Server

---

**Version:** 0.3.0  
**Developers:** GeneralMine & Luebbi3000  
**License:** See LICENSE file
