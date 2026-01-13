import { app, BrowserWindow, ipcMain, dialog, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { fork } from "child_process";
import { loadSettings, saveSettings, getAvailableSounds } from "./lib/settingsManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let workflowWindow = null;
let assistantProcess = null;
let isRunning = false;

// Create the main window
function createWindow() {
	mainWindow = new BrowserWindow({
		width: 900,
		height: 700,
		minWidth: 800,
		minHeight: 600,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, "ui", "preload.js"),
		},
		autoHideMenuBar: true,
	});

	// Create menu
	const menu = Menu.buildFromTemplate([
		{
			label: "Datei",
			submenu: [
				{
					label: "Einstellungen speichern",
					accelerator: "CmdOrCtrl+S",
					click: () => {
						mainWindow.webContents.send("menu-save");
					},
				},
				{ type: "separator" },
				{
					label: "Beenden",
					accelerator: "CmdOrCtrl+Q",
					click: () => {
						app.quit();
					},
				},
			],
		},
		{
			label: "Hilfe",
			submenu: [
				{
					label: "Über",
					click: () => {
						dialog.showMessageBox(mainWindow, {
							type: "info",
							title: "Über Medrunner Assistant",
							message: "Medrunner Assistant v0.3.0",
							detail: "Entwickelt von GeneralMine & Luebbi3000\n\nGitHub: github.com/GeneralMine/MedrunnerAssistant",
						});
					},
				},
				{
					label: "DevTools",
					accelerator: "F12",
					click: () => {
						mainWindow.webContents.toggleDevTools();
					},
				},
			],
		},
	]);
	Menu.setApplicationMenu(menu);

	mainWindow.loadFile(path.join(__dirname, "ui", "index.html"));

	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}

// Create workflow display window
function createWorkflowWindow(workflow, targetDisplay = 0) {
	// Close existing workflow window if any
	if (workflowWindow) {
		workflowWindow.close();
		workflowWindow = null;
	}
	
	// Get all displays
	const { screen } = require('electron');
	const displays = screen.getAllDisplays();
	
	// Select target display (default to primary if target doesn't exist)
	let targetScreen = displays[0];
	if (targetDisplay > 0 && targetDisplay < displays.length) {
		targetScreen = displays[targetDisplay];
	}
	
	const { x, y, width, height } = targetScreen.bounds;
	
	workflowWindow = new BrowserWindow({
		x: x + 50,
		y: y + 50,
		width: Math.min(1000, width - 100),
		height: Math.min(700, height - 100),
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, "ui", "preload.js"),
		},
		autoHideMenuBar: true,
		title: workflow.name || 'Workflow',
	});
	
	workflowWindow.loadFile(path.join(__dirname, "ui", "workflow-display.html"));
	
	// Send workflow data when window is ready
	workflowWindow.webContents.on('did-finish-load', () => {
		workflowWindow.webContents.send('workflow-data', workflow);
	});
	
	workflowWindow.on("closed", () => {
		workflowWindow = null;
	});
	
	return workflowWindow;
}

// Start the Medrunner Assistant background service
function startAssistant() {
	if (assistantProcess) {
		return { success: false, message: "Assistant läuft bereits" };
	}

	try {
		assistantProcess = fork(path.join(__dirname, "main.js"), [], {
			stdio: ["pipe", "pipe", "pipe", "ipc"],
		});

		isRunning = true;

		assistantProcess.stdout.on("data", (data) => {
			const message = data.toString().trim();
			console.log("[Assistant]", message);
			if (mainWindow) {
				mainWindow.webContents.send("assistant-log", message);
			}
		});

		assistantProcess.stderr.on("data", (data) => {
			const message = data.toString().trim();
			console.error("[Assistant Error]", message);
			if (mainWindow) {
				mainWindow.webContents.send("assistant-error", message);
			}
		});

		assistantProcess.on("exit", (code) => {
			console.log(`[Assistant] Process exited with code ${code}`);
			assistantProcess = null;
			isRunning = false;
			if (mainWindow) {
				mainWindow.webContents.send("assistant-stopped", code);
			}
		});

		return { success: true, message: "Assistant gestartet" };
	} catch (error) {
		console.error("Failed to start assistant:", error);
		assistantProcess = null;
		isRunning = false;
		return { success: false, message: error.message };
	}
}

// Stop the Medrunner Assistant background service
function stopAssistant() {
	if (!assistantProcess) {
		return { success: false, message: "Assistant läuft nicht" };
	}

	try {
		assistantProcess.kill();
		assistantProcess = null;
		isRunning = false;
		return { success: true, message: "Assistant gestoppt" };
	} catch (error) {
		console.error("Failed to stop assistant:", error);
		return { success: false, message: error.message };
	}
}

// IPC Handlers
ipcMain.handle("load-settings", async () => {
	return loadSettings();
});

ipcMain.handle("save-settings", async (event, settings) => {
	const result = saveSettings(settings);
	
	// Restart assistant if it's running
	if (isRunning) {
		stopAssistant();
		setTimeout(() => {
			startAssistant();
		}, 1000);
	}
	
	return result;
});

ipcMain.handle("get-available-sounds", async () => {
	return getAvailableSounds();
});

ipcMain.handle("select-sound-file", async () => {
	const result = await dialog.showOpenDialog(mainWindow, {
		properties: ["openFile"],
		filters: [{ name: "Audio Files", extensions: ["wav"] }],
	});

	if (!result.canceled && result.filePaths.length > 0) {
		return result.filePaths[0];
	}
	return null;
});

ipcMain.handle("start-assistant", async () => {
	return startAssistant();
});

ipcMain.handle("stop-assistant", async () => {
	return stopAssistant();
});

ipcMain.handle("get-assistant-status", async () => {
	return { running: isRunning };
});

// Workflow display handlers
ipcMain.on("workflow-display-ready", (event) => {
	console.log("[Electron] Workflow display ready");
});

ipcMain.on("open-workflow-window", (event, workflow) => {
	console.log("[Electron] Opening workflow window:", workflow.name);
	const targetDisplay = workflow.displaySettings?.targetDisplay || 0;
	createWorkflowWindow(workflow, targetDisplay);
});

ipcMain.on("workflow-timer-action", (event, action) => {
	// Forward timer action to main window
	if (mainWindow) {
		mainWindow.webContents.send('workflow-timer-action', action);
	}
});

ipcMain.on("test-workflow", (event, data) => {
	console.log("[Electron] Testing workflow:", data.workflow.name);
	
	// Send test trigger to main window
	if (mainWindow) {
		mainWindow.webContents.send('test-workflow-trigger', {
			workflow: data.workflow,
			triggerType: data.triggerType
		});
	}
});

// App lifecycle
app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {
	if (assistantProcess) {
		stopAssistant();
	}
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("before-quit", () => {
	if (assistantProcess) {
		stopAssistant();
	}
});
