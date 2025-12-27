const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
	// Settings
	loadSettings: () => ipcRenderer.invoke("load-settings"),
	saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),
	
	// Sounds
	getAvailableSounds: () => ipcRenderer.invoke("get-available-sounds"),
	selectSoundFile: () => ipcRenderer.invoke("select-sound-file"),
	
	// Assistant control
	startAssistant: () => ipcRenderer.invoke("start-assistant"),
	stopAssistant: () => ipcRenderer.invoke("stop-assistant"),
	getAssistantStatus: () => ipcRenderer.invoke("get-assistant-status"),
	
	// Testing
	testFeature: (featureName, number) => ipcRenderer.invoke("test-feature", featureName, number),
	getTeamOrder: () => ipcRenderer.invoke("get-team-order"),
	
	// Event listeners
	onAssistantLog: (callback) => {
		ipcRenderer.on("assistant-log", (event, message) => callback(message));
	},
	onAssistantError: (callback) => {
		ipcRenderer.on("assistant-error", (event, message) => callback(message));
	},
	onAssistantStopped: (callback) => {
		ipcRenderer.on("assistant-stopped", (event, code) => callback(code));
	},
	onMenuSave: (callback) => {
		ipcRenderer.on("menu-save", () => callback());
	},
	onTeamOrderUpdate: (callback) => {
		ipcRenderer.on("team-order-update", (event, order) => callback(order));
	},
});
