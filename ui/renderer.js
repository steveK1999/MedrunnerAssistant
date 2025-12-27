// UI State
let currentSettings = {};
let isAssistantRunning = false;

// DOM Elements - will be populated in DOMContentLoaded
let tabs, tabContents, saveBtn, saveStatus, startStopBtn, statusIndicator, statusText, statusDot, logOutput, clearLogsBtn, toggleTokenBtn, tokenInput, alertTestFullBtn;

// Form Elements
let formElements = {};

// Initialize DOM Elements and setup event listeners
function initializeDOMElements() {
	// Select DOM Elements
	tabs = document.querySelectorAll('.tab-btn');
	tabContents = document.querySelectorAll('.tab-content');
	saveBtn = document.getElementById('save-btn');
	saveStatus = document.getElementById('save-status');
	startStopBtn = document.getElementById('start-stop-btn');
	statusIndicator = document.getElementById('status-indicator');
	statusText = document.getElementById('status-text');
	statusDot = document.getElementById('status-dot');
	logOutput = document.getElementById('log-output');
	clearLogsBtn = document.getElementById('clear-logs');
	toggleTokenBtn = document.getElementById('toggle-token');
	tokenInput = document.getElementById('medrunner-token');
	
	// Initialize Form Elements
	formElements = {
		MEDRUNNER_TOKEN: document.getElementById('medrunner-token'),
		CUSTOM_ALERT_SOUND: document.getElementById('alert-sound'),
		CUSTOM_CHATMESSAGE_SOUND: document.getElementById('chat-sound'),
		CUSTOM_TEAMJOIN_SOUND: document.getElementById('team-sound'),
		ENABLE_CUSTOM_ALERT_SOUND: document.getElementById('enable-alert-sound'),
		ENABLE_CUSTOM_CHATMESSAGE_SOUND: document.getElementById('enable-chat-message-sound'),
		ENABLE_CUSTOM_TEAMJOIN_SOUND: document.getElementById('enable-team-sound'),
		ENABLE_PRINT_SHIPASSIGNMENTS: document.getElementById('enable-ship-assignments'),
		ENABLE_PRINT_TEAMJOINORDER: document.getElementById('enable-team-order'),
		ENABLE_ALERT_OVERLAY: document.getElementById('enable-overlay'),
		ALERT_OVERLAY_ALL_MONITORS: document.querySelector('input[name="overlay-mode"][value="all"]'),
		ALERT_OVERLAY_MONITOR_INDEX: document.getElementById('overlay-monitor'),
		OVERLAY_DURATION_MS: document.getElementById('overlay-duration'),
		OVERLAY_TEXT_SIZE_PERCENT: document.getElementById('overlay-text-percent'),
		OVERLAY_POSITION: document.querySelector('input[name="overlay-position"][value="top"]'),
		OVERLAY_BORDER_STYLE: document.getElementById('overlay-border-style'),
		OVERLAY_BACKGROUND_STYLE: document.getElementById('overlay-background-style'),
		DEBUG_MODE: document.getElementById('debug-mode'),
		TEST_MODE: document.getElementById('test-mode'),
	};
	
	// Tab switching
	tabs.forEach(tab => {
		tab.addEventListener('click', () => {
			const targetTab = tab.dataset.tab;
			
			tabs.forEach(t => t.classList.remove('active'));
			tabContents.forEach(tc => tc.classList.remove('active'));
			
			tab.classList.add('active');
			document.querySelector(`.tab-content[data-tab="${targetTab}"]`).classList.add('active');
		});
	});
	
	// Event Listeners
	saveBtn.addEventListener('click', saveSettings);
	startStopBtn.addEventListener('click', toggleAssistant);
	clearLogsBtn.addEventListener('click', clearLogs);
	toggleTokenBtn.addEventListener('click', toggleTokenVisibility);

	// Alert Full Test button
	alertTestFullBtn = document.getElementById('alert-test-full');
	if (alertTestFullBtn) {
		alertTestFullBtn.addEventListener('click', async () => {
			try {
				alertTestFullBtn.disabled = true;
				const originalText = alertTestFullBtn.textContent;
				alertTestFullBtn.textContent = '⏳ Läuft...';
				const result = await window.api.testAlertFull();
				if (result.success) {
					addLog(`✅ Alert Test Full gestartet`);
				} else {
					addLog(`❌ Alert Test Full fehlgeschlagen: ${result.message}`, true);
				}
				alertTestFullBtn.textContent = originalText;
			} catch (error) {
				addLog(`❌ Alert Test Full Fehler: ${error.message}`, true);
			} finally {
				alertTestFullBtn.disabled = false;
			}
		});
	}

	// File selection buttons
	document.querySelectorAll('[data-select]').forEach(button => {
		button.addEventListener('click', async () => {
			const targetId = button.dataset.select;
			const targetInput = document.getElementById(targetId);
			
			const filePath = await window.api.selectSoundFile();
			if (filePath) {
				targetInput.value = filePath;
			}
		});
	});

	// Monitor mode toggle
	const overlayModeRadios = document.querySelectorAll('input[name="overlay-mode"]');
	overlayModeRadios.forEach(radio => {
		radio.addEventListener('change', (e) => {
			const monitorGroup = document.getElementById('monitor-select-group');
			if (e.target.value === 'all') {
				monitorGroup.style.display = 'none';
			} else {
				monitorGroup.style.display = 'block';
			}
		});
	});

	// Position helper (no extra UI behaviors needed yet)
}

// Load settings on startup
async function loadSettings() {
	try {
		currentSettings = await window.api.loadSettings();
		populateForm(currentSettings);
		await loadAvailableSounds();
		updateTestButtonsVisibility();
	} catch (error) {
		console.error('Failed to load settings:', error);
		showStatus('Fehler beim Laden der Einstellungen', 'error');
	}
}

// Populate form with settings
function populateForm(settings) {
	for (const [key, element] of Object.entries(formElements)) {
		if (!element) continue;
		
		const value = settings[key] || '';
		
		if (key === 'ALERT_OVERLAY_ALL_MONITORS') {
			// Handle radio button for all monitors
			const allMonitorsRadio = document.querySelector('input[name="overlay-mode"][value="all"]');
			const singleRadio = document.querySelector('input[name="overlay-mode"][value="single"]');
			if (value === 'true') {
				allMonitorsRadio.checked = true;
				document.getElementById('monitor-select-group').style.display = 'none';
			} else {
				singleRadio.checked = true;
				document.getElementById('monitor-select-group').style.display = 'block';
			}
		} else if (key === 'OVERLAY_POSITION') {
			const topRadio = document.querySelector('input[name="overlay-position"][value="top"]');
			const centerRadio = document.querySelector('input[name="overlay-position"][value="center"]');
			if (value === 'center') {
				centerRadio.checked = true;
			} else {
				topRadio.checked = true;
			}
		} else if (element.type === 'checkbox') {
			element.checked = value === 'true';
		} else {
			element.value = value;
		}
	}
}

// Show/hide test buttons depending on TEST_MODE
function updateTestButtonsVisibility() {
	const enabled = formElements.TEST_MODE && formElements.TEST_MODE.checked;
	const testButtons = document.querySelectorAll('.btn-test');
	testButtons.forEach(btn => {
		btn.style.display = enabled ? 'inline-block' : 'none';
	});
}

// Gather settings from form
function gatherSettings() {
	const settings = {};
	
	for (const [key, element] of Object.entries(formElements)) {
		if (!element) continue;
		
		if (element.type === 'checkbox') {
			settings[key] = element.checked ? 'true' : 'false';
		} else if (key === 'ALERT_OVERLAY_ALL_MONITORS') {
			// Handle radio button for all monitors
			const allMonitorsRadio = document.querySelector('input[name="overlay-mode"][value="all"]');
			settings[key] = allMonitorsRadio.checked ? 'true' : 'false';
		} else if (key === 'OVERLAY_POSITION') {
			const centerRadio = document.querySelector('input[name="overlay-position"][value="center"]');
			settings[key] = centerRadio.checked ? 'center' : 'top';
		} else if (key === 'ALERT_OVERLAY_MONITOR_INDEX') {
			settings[key] = element.value;
		} else {
			settings[key] = element.value;
		}
	}
	
	return settings;
}

// Save settings
async function saveSettings() {
	try {
		const settings = gatherSettings();
		
		// Basic validation
		if (!settings.MEDRUNNER_TOKEN || settings.MEDRUNNER_TOKEN.trim() === '') {
			showStatus('⚠️ Medrunner Token ist erforderlich!', 'error');
			return;
		}
		
		const result = await window.api.saveSettings(settings);
		
		if (result.success) {
			currentSettings = settings;
			showStatus('✅ Einstellungen gespeichert!', 'success');
		} else {
			showStatus(`❌ Fehler: ${result.error}`, 'error');
		}
	} catch (error) {
		console.error('Failed to save settings:', error);
		showStatus('❌ Fehler beim Speichern', 'error');
	}
}

// Show status message
function showStatus(message, type = 'success') {
	saveStatus.textContent = message;
	saveStatus.className = `save-status ${type}`;
	
	setTimeout(() => {
		saveStatus.textContent = '';
		saveStatus.className = 'save-status';
	}, 5000);
}

// Load available sounds
async function loadAvailableSounds() {
	try {
		const sounds = await window.api.getAvailableSounds();
		const soundList = document.getElementById('sound-list');
		
		if (sounds.length === 0) {
			soundList.innerHTML = '<p class="muted">Keine Sounds gefunden</p>';
			return;
		}
		
		soundList.innerHTML = '';
		sounds.forEach(sound => {
			const chip = document.createElement('span');
			chip.className = 'sound-chip';
			chip.textContent = sound.replace('./sounds/', '');
			chip.title = 'Klicken zum Kopieren';
			chip.addEventListener('click', () => {
				// Could implement copy to clipboard or quick-fill
				console.log('Selected sound:', sound);
			});
			soundList.appendChild(chip);
		});
	} catch (error) {
		console.error('Failed to load sounds:', error);
	}
}

// Load available monitors
async function loadAvailableMonitors() {
	try {
		const monitors = await window.api.getAvailableMonitors();
		const monitorSelect = document.getElementById('overlay-monitor');
		
		if (!monitorSelect) return;
		
		monitorSelect.innerHTML = '';
		monitors.forEach(monitor => {
			const option = document.createElement('option');
			option.value = monitor.index;
			option.textContent = monitor.name;
			option.selected = monitor.primary;
			monitorSelect.appendChild(option);
		});
	} catch (error) {
		console.error('Failed to load monitors:', error);
	}
}

// Start/Stop Assistant
async function toggleAssistant() {
	try {
		if (isAssistantRunning) {
			const result = await window.api.stopAssistant();
			if (result.success) {
				updateAssistantStatus(false);
			}
		} else {
			// Save settings before starting
			await saveSettings();
			
			const result = await window.api.startAssistant();
			if (result.success) {
				updateAssistantStatus(true);
			} else {
				showStatus(`❌ Start fehlgeschlagen: ${result.message}`, 'error');
			}
		}
	} catch (error) {
		console.error('Failed to toggle assistant:', error);
		showStatus('❌ Fehler beim Starten/Stoppen', 'error');
	}
}

// Update assistant status UI
function updateAssistantStatus(running) {
	isAssistantRunning = running;
	
	if (running) {
		statusIndicator.classList.add('running');
		statusText.textContent = 'Läuft';
		startStopBtn.textContent = 'Stop';
		startStopBtn.classList.remove('btn-primary');
		startStopBtn.classList.add('btn-secondary');
	} else {
		statusIndicator.classList.remove('running');
		statusText.textContent = 'Gestoppt';
		startStopBtn.textContent = 'Start';
		startStopBtn.classList.remove('btn-secondary');
		startStopBtn.classList.add('btn-primary');
	}
}

// Log handling
function addLog(message, isError = false) {
	const logLine = document.createElement('div');
	logLine.className = isError ? 'log-line error' : 'log-line';
	
	const timestamp = new Date().toLocaleTimeString('de-DE');
	logLine.textContent = `[${timestamp}] ${message}`;
	
	// Remove "no logs" message if present
	const noLogsMsg = logOutput.querySelector('.muted');
	if (noLogsMsg) {
		noLogsMsg.remove();
	}
	
	logOutput.appendChild(logLine);
	logOutput.scrollTop = logOutput.scrollHeight;
	
	// Limit log lines to 500
	while (logOutput.children.length > 500) {
		logOutput.removeChild(logOutput.firstChild);
	}
}

function clearLogs() {
	logOutput.innerHTML = '<p class="muted">Logs gelöscht</p>';
}

// Toggle token visibility
function toggleTokenVisibility() {
	if (tokenInput.type === 'password') {
		tokenInput.type = 'text';
		toggleTokenBtn.textContent = '🙈';
	} else {
		tokenInput.type = 'password';
		toggleTokenBtn.textContent = '👁️';
	}
}

// Test button handlers
function setupTestButtons() {
	const testButtons = document.querySelectorAll('.btn-test');
	testButtons.forEach(button => {
		button.addEventListener('click', async (e) => {
			e.preventDefault();
			const featureName = button.dataset.test;
			const testNumber = button.textContent.match(/\d+/)[0];
			
			try {
				button.disabled = true;
				const originalText = button.textContent;
				button.textContent = '⏳ Lädt...';
				
				const result = await window.api.testFeature(featureName, testNumber);
				
				if (result.success) {
					addLog(`✅ Test ${testNumber} für ${featureName}: ${result.message}`, false);
				} else {
					addLog(`❌ Test ${testNumber} fehlgeschlagen: ${result.message}`, true);
				}
				button.textContent = originalText;
			} catch (error) {
				addLog(`❌ Test-Fehler: ${error.message}`, true);
				button.textContent = button.textContent.replace('⏳ Lädt...', `Test ${testNumber}`);
			} finally {
				button.disabled = false;
			}
		});
	});
}

// Load and display team order
async function loadTeamOrder() {
	try {
		const order = await window.api.getTeamOrder();
		displayTeamOrder(order);
	} catch (error) {
		console.error('Failed to load team order:', error);
	}
}

// Display team order in UI
function displayTeamOrder(teamOrder) {
	const joinOrderList = document.getElementById('join-order-list');
	
	if (!joinOrderList) return;
	
	if (!teamOrder || teamOrder.length === 0) {
		joinOrderList.innerHTML = '<p class="muted">Keine Daten verfügbar. Starte den Assistant, um die Team-Beitritte zu sehen.</p>';
		return;
	}
	
	joinOrderList.innerHTML = '';
	teamOrder.forEach(member => {
		const item = document.createElement('div');
		item.className = 'join-order-item';
		// Handle both "1. Name" and full strings
		const parts = member.split('. ');
		const number = parts[0];
		const name = parts.slice(1).join('. ');
		item.innerHTML = `<strong>${number}.</strong> <span>${name}</span>`;
		joinOrderList.appendChild(item);
	});
}

// Listen to team order updates
window.api.onTeamOrderUpdate((order) => {
	displayTeamOrder(order);
});

// Listen to assistant events
window.api.onAssistantLog((message) => {
	addLog(message, false);
});

window.api.onAssistantError((message) => {
	addLog(message, true);
});

window.api.onAssistantStopped((code) => {
	updateAssistantStatus(false);
	addLog(`Assistant beendet mit Code ${code}`, code !== 0);
});

// Menu save shortcut
window.api.onMenuSave(() => {
	saveSettings();
});

// React to TEST_MODE toggle
document.addEventListener('change', (e) => {
	if (e.target && e.target.id === 'test-mode') {
		updateTestButtonsVisibility();
	}
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
	// Ctrl+S to save
	if (e.ctrlKey && e.key === 's') {
		e.preventDefault();
		saveSettings();
	}
});

// Check assistant status on load
async function checkInitialStatus() {
	try {
		const status = await window.api.getAssistantStatus();
		updateAssistantStatus(status.running);
	} catch (error) {
		console.error('Failed to check status:', error);
	}
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
	initializeDOMElements();
	await loadSettings();
	await loadAvailableMonitors();
	await checkInitialStatus();
	setupTestButtons();
	loadTeamOrder();
});
