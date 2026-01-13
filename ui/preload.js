import { contextBridge, ipcRenderer } from "electron";

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
});
// Expose electronAPI for workflow communication
contextBridge.exposeInMainWorld("electronAPI", {
	send: (channel, data) => {
		// Whitelist channels
		const validChannels = ['workflow-triggered', 'open-workflow-window', 'workflow-timer-action', 'workflow-display-ready'];
		if (validChannels.includes(channel)) {
			ipcRenderer.send(channel, data);
		}
	},
	on: (channel, callback) => {
		// Whitelist channels
		const validChannels = ['workflow-data', 'navigate-to-page', 'workflow-timer-action'];
		if (validChannels.includes(channel)) {
			ipcRenderer.on(channel, (event, ...args) => callback(...args));
		}
	}
});