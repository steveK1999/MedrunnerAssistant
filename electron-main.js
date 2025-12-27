import { app, BrowserWindow, ipcMain, dialog, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { fork } from "child_process";
import { loadSettings, saveSettings, getAvailableSounds } from "./lib/settingsManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
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
