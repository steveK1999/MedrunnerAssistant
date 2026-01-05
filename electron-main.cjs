const { app, BrowserWindow, ipcMain, dialog, Menu, screen } = require("electron");
const path = require("path");
const { fork } = require("child_process");
const fs = require("fs");

let mainWindow = null;
let assistantProcess = null;
let isRunning = false;
let currentTeamMembers = [];

// Get app paths that work both in dev and production
const isDev = !app.isPackaged;
const appPath = isDev ? __dirname : path.dirname(app.getPath("exe"));
const resourcesPath = isDev ? __dirname : process.resourcesPath;

// Use user data directory for settings and sounds in production
const userDataPath = app.getPath("userData");
const settingsPath = isDev ? __dirname : userDataPath;
const envPath = path.join(settingsPath, ".env");
const soundsPath = isDev ? path.join(__dirname, "sounds") : path.join(userDataPath, "sounds");

function parseEnvFile(content) {
	const settings = {};
	const lines = content.split("\n");
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const equalsIndex = trimmed.indexOf("=");
		if (equalsIndex === -1) continue;
		const key = trimmed.substring(0, equalsIndex).trim();
		const value = trimmed.substring(equalsIndex + 1).trim();
		settings[key] = value;
	}
	return settings;
}

function stringifyEnvFile(settings) {
	const lines = [];
	const categories = {
		auth: ["MEDRUNNER_TOKEN"],
		sounds: [
			"CUSTOM_ALERT_SOUND",
			"CUSTOM_CHATMESSAGE_SOUND",
			"CUSTOM_TEAMJOIN_SOUND",
		],
		features: [
			"ENABLE_CUSTOM_ALERT_SOUND",
			"ENABLE_CUSTOM_CHATMESSAGE_SOUND",
			"ENABLE_CUSTOM_TEAMJOIN_SOUND",
			"ENABLE_PRINT_SHIPASSIGNMENTS",
			"ENABLE_PRINT_TEAMJOINORDER",
			"ENABLE_TEAM_MEMBERS",
			"ENABLE_ALERT_OVERLAY",
		],
		overlay: [
			"ALERT_OVERLAY_ALL_MONITORS",
			"ALERT_OVERLAY_MONITOR_INDEX",
			"OVERLAY_DURATION_MS",
			"OVERLAY_TEXT_SIZE_PERCENT",
			"OVERLAY_POSITION",
			"OVERLAY_BORDER_STYLE",
		],
		debug: ["DEBUG_MODE", "TEST_MODE", "API_ENV", "DEV_API_KEY", "LANGUAGE"],
	};
	for (const [category, keys] of Object.entries(categories)) {
		for (const key of keys) {
			if (settings.hasOwnProperty(key)) {
				lines.push(`${key}=${settings[key]}`);
			}
		}
		lines.push("");
	}
	return lines.join("\n");
}

function loadSettings() {
	try {
		// Create settings directory if it doesn't exist
		if (!fs.existsSync(settingsPath)) {
			fs.mkdirSync(settingsPath, { recursive: true });
		}
		
		// Create sounds directory if it doesn't exist
		if (!fs.existsSync(soundsPath)) {
			fs.mkdirSync(soundsPath, { recursive: true });
		}
		
		// Ensure .env exists, otherwise seed it
		if (!fs.existsSync(envPath)) {
			// In production, look for .env.example in resources
			const examplePath = isDev 
				? path.join(__dirname, ".env.example")
				: path.join(process.resourcesPath, "app.asar", ".env.example");
			
			if (fs.existsSync(examplePath)) {
				fs.copyFileSync(examplePath, envPath);
			} else {
				// Create default .env
				const defaults = getDefaultSettings();
				saveSettings(defaults);
				return defaults;
			}
		}
		const content = fs.readFileSync(envPath, "utf-8");
		const parsed = parseEnvFile(content);
		// Merge with defaults so missing keys (e.g., new duration settings) are populated
		return { ...getDefaultSettings(), ...parsed };
	} catch (error) {
		console.error("Failed to load settings:", error);
		return getDefaultSettings();
	}
}

function saveSettings(settings) {
	try {
		// Merge defaults and existing .env to avoid losing keys that are not present in the UI payload
		const merged = { ...getDefaultSettings(), ...loadSettings(), ...settings };
		const content = stringifyEnvFile(merged);
		fs.writeFileSync(envPath, content, "utf-8");
		return { success: true };
	} catch (error) {
		console.error("Failed to save settings:", error);
		return { success: false, error: error.message };
	}
}

function getDefaultSettings() {
	return {
		MEDRUNNER_TOKEN: "",
		API_ENV: "prod",
		DEV_API_KEY: "",
		LANGUAGE: "en",
		CUSTOM_ALERT_SOUND: path.join(soundsPath, "alert.wav"),
		CUSTOM_CHATMESSAGE_SOUND: path.join(soundsPath, "chat.wav"),
		CUSTOM_TEAMJOIN_SOUND: path.join(soundsPath, "team.wav"),
		ENABLE_CUSTOM_ALERT_SOUND: "true",
		ENABLE_CUSTOM_CHATMESSAGE_SOUND: "true",
		ENABLE_CUSTOM_TEAMJOIN_SOUND: "true",
		ENABLE_PRINT_SHIPASSIGNMENTS: "true",
		ENABLE_PRINT_TEAMJOINORDER: "true",
		ENABLE_TEAM_MEMBERS: "true",
		ENABLE_ALERT_OVERLAY: "false",
		ALERT_OVERLAY_ALL_MONITORS: "false",
		ALERT_OVERLAY_MONITOR_INDEX: "0",
		OVERLAY_DURATION_MS: "3000",
		OVERLAY_TEXT_SIZE_PERCENT: "100",
		OVERLAY_POSITION: "top",
		OVERLAY_BORDER_STYLE: "glow",
		TEST_MODE: "false",
		DEBUG_MODE: "false",
	};
}

function getAvailableSounds() {
	try {
		if (!fs.existsSync(soundsPath)) {
			return [];
		}
		const files = fs.readdirSync(soundsPath);
		return files.filter((file) => file.endsWith(".wav")).map((file) => path.join(soundsPath, file));
	} catch (error) {
		console.error("Failed to list sounds:", error);
		return [];
	}
}

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
			preload: path.join(__dirname, "preload.cjs"),
		},
		autoHideMenuBar: true,
		title: "Medrunner Assistant",
		icon: path.join(__dirname, "assets", "icon-256.png"),
	});

	// Create menu
	const lang = loadSettings().LANGUAGE || 'de';
	const L = (de, en) => (lang === 'en' ? en : de);
	const menu = Menu.buildFromTemplate([
		{
			label: L("Datei", "File"),
			submenu: [
				{
					label: L("Einstellungen speichern", "Save Settings"),
					accelerator: "CmdOrCtrl+S",
					click: () => {
						mainWindow.webContents.send("menu-save");
					},
				},
				{ type: "separator" },
				{
					label: L("Beenden", "Quit"),
					accelerator: "CmdOrCtrl+Q",
					click: () => {
						app.quit();
					},
				},
			],
		},
		{
			label: L("Hilfe", "Help"),
			submenu: [
				{
					label: L("Einstellungsordner öffnen", "Open Settings Folder"),
					click: () => {
						require("electron").shell.openPath(settingsPath);
					},
				},
				{
					label: L("Sounds-Ordner öffnen", "Open Sounds Folder"),
					click: () => {
						require("electron").shell.openPath(soundsPath);
					},
				},
				{ type: "separator" },
				{
					label: L("Über", "About"),
					click: () => {
						dialog.showMessageBox(mainWindow, {
							type: "info",
							title: L("Über Medrunner Assistant", "About Medrunner Assistant"),
							message: L("Medrunner Assistant v0.3.0", "Medrunner Assistant v0.3.0"),
							detail: L(
								`Entwickelt von GeneralMine & Luebbi3000\n\nGitHub: github.com/GeneralMine/MedrunnerAssistant\n\nEinstellungen: ${settingsPath}\nSounds: ${soundsPath}`,
								`Developed by GeneralMine & Luebbi3000\n\nGitHub: github.com/GeneralMine/MedrunnerAssistant\n\nSettings: ${settingsPath}\nSounds: ${soundsPath}`
							),
						});
					},
				},
				{
					label: L("DevTools", "DevTools"),
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
		// Load current settings and pass them as environment variables
		const currentSettings = loadSettings();
		
		// In packaged app, main.js is in app.asar or resources/app.asar
		let mainJsPath;
		if (isDev) {
			mainJsPath = path.join(__dirname, "main.js");
		} else {
			// In production, files are unpacked to app.asar.unpacked
			mainJsPath = path.join(process.resourcesPath, "app.asar.unpacked", "main.js");
			if (!fs.existsSync(mainJsPath)) {
				// Fallback to regular app.asar
				mainJsPath = path.join(process.resourcesPath, "app.asar", "main.js");
			}
		}
		
		console.log("[Assistant] Starting with path:", mainJsPath);
		
		// Set working directory and NODE_PATH for module resolution
		const workingDir = isDev ? __dirname : path.join(process.resourcesPath, "app.asar.unpacked");
		const nodeModulesPath = path.join(workingDir, "node_modules");
		
		console.log("[Assistant] Working dir:", workingDir);
		console.log("[Assistant] NODE_PATH:", nodeModulesPath);
		console.log("[Assistant] Token set:", currentSettings.MEDRUNNER_TOKEN ? "Yes" : "No");
		
		// Pass settings as environment variables
		const env = { 
			...process.env,
			...currentSettings,
			NODE_PATH: nodeModulesPath,
			NODE_OPTIONS: '--experimental-specifier-resolution=node'
		};
		
		assistantProcess = fork(mainJsPath, [], {
			stdio: ["pipe", "pipe", "pipe", "ipc"],
			cwd: workingDir,
			env: env,
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

		// Listen for messages from assistant process (team members updates, etc.)
		assistantProcess.on("message", (msg) => {
			if (msg.type === "team-members") {
				currentTeamMembers = msg.data || [];
				console.log("[Assistant] Team members updated:", currentTeamMembers);
				if (mainWindow) {
					mainWindow.webContents.send("team-members-update", currentTeamMembers);
				}
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

// Test feature
async function testFeature(featureName, number) {
	if (!assistantProcess) {
		return { success: false, message: "Assistant muss laufen für Tests!" };
	}

	try {
		console.log(`[Test] Running test for ${featureName} (${number})`);
		assistantProcess.send({
			type: "test",
			feature: featureName,
			number: number
		});
		return { success: true, message: `Test ${number} für ${featureName} gestartet` };
	} catch (error) {
		console.error("Test failed:", error);
		return { success: false, message: error.message };
	}
}

// Get team members
function getTeamMembers() {
	if (assistantProcess) {
		// Request team members from assistant process
		assistantProcess.send({ type: "get-team-members" });
	}
	return currentTeamMembers;
}

// Store team position and team count
let currentTeamPosition = 1;
let currentTeamCount = 1;

// Get current team position
function getTeamPosition() {
	return currentTeamPosition;
}

// Get total team count
function getTeamCount() {
	return currentTeamCount;
}

// Set team position
function setTeamPosition(position) {
	currentTeamPosition = position;
	if (assistantProcess) {
		assistantProcess.send({ type: "set-team-position", position: position });
	}
}

// Update team count when teams change
function updateTeamCount(count) {
	currentTeamCount = count;
	// Reload UI to update team position selector
	if (mainWindow) {
		mainWindow.webContents.send("team-count-updated", count);
	}
}

// IPC Handlers
ipcMain.handle("load-settings", async () => {
	return loadSettings();
});

ipcMain.handle("save-settings", async (event, settings) => {
	const result = saveSettings(settings);

	// Restart assistant if it's running and save succeeded
	if (result.success && isRunning) {
		const stopResult = stopAssistant();
		const restartResult = stopResult.success ? startAssistant() : { success: false, message: stopResult.message };
		return { ...result, restarted: restartResult };
	}

	return result;
});

ipcMain.handle("get-available-sounds", async () => {
	return getAvailableSounds();
});

ipcMain.handle("get-available-monitors", async () => {
	const displays = screen.getAllDisplays();
	return displays.map((display, index) => ({
		id: display.id,
		name: `Monitor ${index + 1}${display.primary ? ' (Hauptmonitor)' : ''}`,
		index: index,
		primary: display.primary
	}));
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

ipcMain.handle("test-feature", async (event, featureName, number) => {
	return testFeature(featureName, number);
});

ipcMain.handle("get-team-members", async () => {
	return getTeamMembers();
});

ipcMain.handle("get-team-position", async () => {
	return getTeamPosition();
});

ipcMain.handle("get-team-count", async () => {
	return getTeamCount();
});

ipcMain.handle("set-team-position", async (event, position) => {
	setTeamPosition(position);
	return { success: true };
});

ipcMain.handle("test-alert-full", async () => {
	if (!assistantProcess) {
		return { success: false, message: "Assistant muss laufen für Tests!" };
	}
	try {
		assistantProcess.send({ type: "test-alert-full" });
		return { success: true, message: "Alert Test Full gestartet" };
	} catch (error) {
		return { success: false, message: error.message };
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
