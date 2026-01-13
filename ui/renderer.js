// UI State
let currentSettings = {};
let isAssistantRunning = false;

// DOM Elements - will be populated in DOMContentLoaded
let tabs, tabContents, saveBtn, saveStatus, startStopBtn, statusIndicator, statusText, statusDot, logOutput, clearLogsBtn, toggleTokenBtn, tokenInput, alertTestFullBtn;
let positionPill, positionDisplay, copyPositionBtn;
let teamPositionSelect, teamCountSelect, teamPositionSaveBtn;

// Form Elements
let formElements = {};

// Manual position state
let manualPosition = { pos: null, total: null };

// ============================================================================
// LOAD SHIP ASSIGNMENT AND AAR MODULES
// ============================================================================
// This will be called during DOMContentLoaded
async function loadShipAndAARModules() {
	try {
		const shipaarInit = await import('./shipaar-init.js');
		if (shipaarInit.initializeShipAndAARModules) {
			await shipaarInit.initializeShipAndAARModules();
			console.log('[renderer] Ship and AAR modules loaded successfully');
		}
	} catch (error) {
		console.warn('[renderer] Failed to load ship and AAR modules:', error);
	}
}

// ============================================================================
// EARLY DEFINITION: switchTab - needed for HTML onclick handlers
// ============================================================================
window.switchTab = function(tabName) {
	console.log(`[switchTab] Switching to tab: ${tabName}`);
	
	const tabContents = document.querySelectorAll('.tab-content');
	const tabButtons = document.querySelectorAll('.tab-btn');
	
	// Hide all tabs
	tabContents.forEach(content => {
		content.classList.remove('active');
		content.style.display = 'none';
	});
	
	// Remove active from all buttons
	tabButtons.forEach(btn => {
		btn.classList.remove('active');
	});
	
	// Show selected tab
	const selectedContent = document.querySelector(`.tab-content[data-tab="${tabName}"]`);
	if (selectedContent) {
		selectedContent.classList.add('active');
		selectedContent.style.display = 'block';
		console.log(`[switchTab] Showed tab content for: ${tabName}`);
	}
	
	// Activate button
	const selectedButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
	if (selectedButton) {
		selectedButton.classList.add('active');
		console.log(`[switchTab] Activated button for: ${tabName}`);
	}
};

// Translations
const translations = {
	de: {
			// Tooltips
			tooltip_browse: 'WAV-Datei ausw�hlen',
			tooltip_sound_path: 'Pfad zur WAV-Datei',
			chip_tooltip: 'Klicken zum Kopieren',
			tooltip_text_size: 'Relative Textgr��e f�r Overlay',
			tooltip_monitor_select: 'Monitor f�r Overlay ausw�hlen',
			tooltip_position_top: 'Zeigt Text oben mit Slider + Puls',
			tooltip_position_center: 'Zeigt Text mittig mit Einblendung + Puls',
			tooltip_border_style: 'Randstil des Overlays',
			tooltip_alert_test: 'Alert-Sound abspielen und Overlay testen',
		header_title: 'Medrunner Assistant',
		status_running: 'L�uft',
		status_stopped: 'Gestoppt',
		btn_start: 'Start',
		btn_stop: 'Stop',
		tab_sounds: 'Sound-Dateien',
		tab_features: 'Features',
		tab_overlay: 'Overlay',
		tab_team: 'Team',
		tab_settings: 'Einstellungen',
		tab_console: 'Konsole',
		sounds_title: 'Sound-Dateien',
		sounds_desc: 'W�hle die Sounds f�r verschiedene Events. Die Dateien m�ssen im .wav-Format vorliegen.',
		alert_sound_label: 'Alert-Sound',
		chat_sound_label: 'Chat-Nachricht Sound',
		team_sound_label: 'Team-Beitritt Sound',
		browse: 'Durchsuchen',
		available_sounds_title: 'Verf�gbare Sounds im sounds/-Ordner:',
		sounds_none: 'Keine Sounds gefunden',
		team_no_data: 'Keine Daten verf�gbar. Starte den Assistant, um die Team-Mitglieder zu sehen.',
		table_rsi: 'RSI Handle',
		table_discord: 'Discord ID',
		table_role: 'Rolle',
		table_joined: 'Beitrittszeit',
		table_order: 'Reihenfolge',
		logs_empty: 'Keine Logs verf�gbar. Starte den Assistant, um Logs zu sehen.',
		logs_cleared: 'Logs gel�scht',
		assistant_stopped_code: (code) => `Assistant beendet mit Code ${code}`,
		alert_test_running: '? L�uft...',
		start_failed: (msg) => `? Start fehlgeschlagen: ${msg}`,
		save_token_required: '?? Medrunner Token ist erforderlich!',
		save_ok: '? Einstellungen gespeichert!',
		save_restart_failed: (msg) => `?? Gespeichert, aber Neustart fehlgeschlagen: ${msg}`,
		save_error_generic: '? Fehler beim Speichern',
		timestampLocale: 'de-DE',
		features_title: 'Features aktivieren/deaktivieren',
		features_desc: 'Aktiviere oder deaktiviere einzelne Features nach Bedarf.',
		feature_alert_title: 'Custom Alert Sound',
		feature_alert_desc: 'Spielt einen benutzerdefinierten Sound bei neuen Alerts ab',
		feature_chat_title: 'Custom Chat Message Sound',
		feature_chat_desc: 'Spielt einen Sound bei eingehenden Client-Nachrichten',
		feature_team_title: 'Custom Team Join Sound',
		feature_team_desc: 'Benachrichtigt dich, wenn jemand deinem Team beitreten m�chte',
		feature_ship_title: 'Print Ship Assignments',
		feature_ship_desc: 'Zeigt Schiffszuweisungen in der Konsole an',
		feature_order_title: 'Print Team Join Order',
		feature_order_desc: 'Zeigt die Reihenfolge der Team-Beitritte an',
		overlay_title: 'Overlay Einstellungen',
		overlay_desc: 'Konfiguriere das visuelle Overlay f�r Alerts: Position, Dauer, Rand- und Hintergrund-Effekte.',
		overlay_enable_title: 'Overlay aktivieren',
		overlay_enable_desc: 'Zeigt visuelles Feedback bei neuen Alerts',
		overlay_text_percent_label: 'Textgr��e (%) � 100% entspricht Gr��e 400',
		overlay_monitor_label: 'Monitor ausw�hlen',
		overlay_position_effect_label: 'Text-Position & Effekt',
		overlay_radio_top: 'Oben (Slider + Puls)',
		overlay_radio_center: 'Mitte (Einblendung + Puls)',
		overlay_border_style_label: 'Randstil',
		overlay_border_option_none: 'Keiner',
		overlay_border_option_glow: 'Rot leuchtender Rand',
		team_title: 'Team Mitglieder',
		team_desc: 'Zeigt alle Mitglieder des aktuellen Teams mit Discord ID, RSI Handle und Rolle.',
		settings_title: 'Einstellungen',
		language_label: 'Sprache / Language',
		medrunner_token_label: 'Medrunner API Token *',
		medrunner_token_desc: 'Hol dir deinen Token im Staff Portal unter deinem Medrunner-Profil.',
		toggle_token_title: 'Token anzeigen/verbergen',
		overlay_duration_title: 'Overlay-Dauer (Millisekunden)',
		overlay_duration_desc: 'Bestimme, wie lange das Alert-Overlay angezeigt wird.',
		overlay_duration_label: 'Dauer (ms)',
		debug_test_title: 'Debug & Test Optionen',
		debug_mode_title: 'Debug-Modus',
		debug_mode_desc: 'Zeigt zus�tzliche Debug-Informationen in der Konsole',
		test_mode_title: 'Test Mode',
		test_mode_desc: 'Wenn aktiviert, werden alle Test-Buttons sichtbar.',
		api_config_title: 'API Konfiguration (Test Mode)',
		api_env_label: 'API Umgebung',
		api_env_prod: 'Production (Standard)',
		api_env_dev: 'Development',
		dev_api_key_label: 'Dev API Key',
		alert_test_title: 'Alert Test Full',
		alert_test_desc: 'Spielt Alert-Sound und zeigt Overlay gem�� Monitor-Auswahl.',
		alert_test_run_btn: 'Alert-Test ausf�hren',
	},
	en: {
		header_title: 'Medrunner Assistant',
		status_running: 'Running',
		status_stopped: 'Stopped',
		btn_start: 'Start',
		btn_stop: 'Stop',
		tab_sounds: 'Sound Files',
		tab_features: 'Features',
		tab_overlay: 'Overlay',
		tab_team: 'Team',
		tab_settings: 'Settings',
		tab_console: 'Console',
		sounds_title: 'Sound Files',
		sounds_desc: 'Choose sounds for different events. Files must be .wav format.',
		alert_sound_label: 'Alert Sound',
		chat_sound_label: 'Chat Message Sound',
		team_sound_label: 'Team Join Sound',
		browse: 'Browse',
		available_sounds_title: 'Available sounds in sounds/ folder:',
		sounds_none: 'No sounds found',
		team_no_data: 'No data available. Start the assistant to see team members.',
		table_rsi: 'RSI Handle',
		table_discord: 'Discord ID',
		table_role: 'Role',
		table_joined: 'Joined',
		table_order: 'Order',
		logs_empty: 'No logs available. Start the assistant to see logs.',
		logs_cleared: 'Logs cleared',
		assistant_stopped_code: (code) => `Assistant stopped with code ${code}`,
		alert_test_running: '? Running...',
		start_failed: (msg) => `? Start failed: ${msg}`,
		save_token_required: '?? Medrunner token is required!',
		save_ok: '? Settings saved!',
		save_restart_failed: (msg) => `?? Saved, but restart failed: ${msg}`,
		save_error_generic: '? Error while saving',
		timestampLocale: 'en-US',
		features_title: 'Enable/Disable Features',
		features_desc: 'Toggle individual features as needed.',
		feature_alert_title: 'Custom Alert Sound',
		feature_alert_desc: 'Plays a custom sound for new alerts',
		feature_chat_title: 'Custom Chat Message Sound',
		feature_chat_desc: 'Plays a sound for incoming client messages',
		feature_team_title: 'Custom Team Join Sound',
		feature_team_desc: 'Notifies you when someone wants to join your team',
		feature_ship_title: 'Print Ship Assignments',
		feature_ship_desc: 'Shows ship assignments in the console',
		feature_order_title: 'Print Team Join Order',
		feature_order_desc: 'Shows the order of team joins',
		overlay_title: 'Overlay Settings',
		overlay_desc: 'Configure the visual overlay for alerts: position, duration, border and background effects.',
		overlay_enable_title: 'Enable Overlay',
		overlay_enable_desc: 'Shows visual feedback for new alerts',
		overlay_text_percent_label: 'Text size (%) � 100% equals size 400',
		overlay_monitor_label: 'Select monitor',
		overlay_position_effect_label: 'Text Position & Effect',
		overlay_radio_top: 'Top (Slider + Pulse)',
		overlay_radio_center: 'Center (Fade-in + Pulse)',
		overlay_border_style_label: 'Border Style',
		overlay_border_option_none: 'None',
		overlay_border_option_glow: 'Red glowing border',
		team_title: 'Team Members',
		team_desc: 'Shows all members of the current team with Discord ID, RSI handle, and role.',
		settings_title: 'Settings',
		language_label: 'Language',
		medrunner_token_label: 'Medrunner API Token *',
		medrunner_token_desc: 'Get your token from the Staff Portal under your Medrunner profile.',
		toggle_token_title: 'Show/Hide token',
		overlay_duration_title: 'Overlay Duration (milliseconds)',
		overlay_duration_desc: 'Decide how long the alert overlay is shown.',
		overlay_duration_label: 'Duration (ms)',
		debug_test_title: 'Debug & Test Options',
		debug_mode_title: 'Debug Mode',
		debug_mode_desc: 'Shows additional debug information in the console',
		test_mode_title: 'Test Mode',
		test_mode_desc: 'When enabled, all test buttons are visible.',
		api_config_title: 'API Configuration (Test Mode)',
		api_env_label: 'API Environment',
		api_env_prod: 'Production (Default)',
		api_env_dev: 'Development',
		dev_api_key_label: 'Dev API Key',
		alert_test_title: 'Alert Test Full',
		alert_test_desc: 'Plays alert sound and shows overlay according to monitor selection.',
		alert_test_run_btn: 'Run Alert Test',
		more_settings_title: 'More Settings',
		// Tooltips
		tooltip_browse: 'Select WAV file',
		tooltip_sound_path: 'Path to WAV file',
		chip_tooltip: 'Click to copy',
		tooltip_text_size: 'Relative text size for overlay',
		tooltip_monitor_select: 'Select monitor for overlay',
		tooltip_position_top: 'Shows text at top with slider + pulse',
		tooltip_position_center: 'Shows text at center with fade-in + pulse',
		tooltip_border_style: 'Overlay border style',
		tooltip_alert_test: 'Play alert sound and test overlay',
	}
};

const POSITION_STORAGE_KEY = 'manual_position_state';

function getLang() {
	const sel = document.getElementById('language');
	return sel ? (sel.value || (currentSettings.LANGUAGE || 'de')) : (currentSettings.LANGUAGE || 'de');
}

function t(key, ...args) {
	const lang = getLang();
	const value = translations[lang][key];
	if (typeof value === 'function') return value(...args);
	return value;
}

function updatePositionDisplay() {
	if (!positionDisplay) return;
	const { pos, total } = manualPosition;
	if (pos && total) {
		positionDisplay.textContent = `Pos ${pos}/${total}`;
	} else {
		positionDisplay.textContent = 'Pos -/-';
	}
}

function loadManualPositionFromStorage() {
	try {
		const stored = localStorage.getItem(POSITION_STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			if (parsed && parsed.pos && parsed.total) {
				manualPosition = { pos: parseInt(parsed.pos, 10), total: parseInt(parsed.total, 10) };
			}
		}
	} catch (e) {
		console.warn('Failed to load manual position from storage:', e);
	}
	syncTeamPositionControls();
	updatePositionDisplay();
}

function saveManualPosition() {
	try {
		localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(manualPosition));
	} catch (e) {
		console.warn('Failed to save manual position:', e);
	}
}

function syncTeamPositionControls() {
	if (teamPositionSelect) teamPositionSelect.value = manualPosition.pos || '1';
	if (teamCountSelect) teamCountSelect.value = manualPosition.total || '1';
}

function promptPositionEntry() {
	const currentText = manualPosition.pos && manualPosition.total ? `${manualPosition.pos}/${manualPosition.total}` : '';
	const input = prompt('Position/Teams (z.B. 1/3)', currentText);
	if (!input) return;
	const parts = input.split('/');
	if (parts.length !== 2) return alert('Bitte im Format Position/Teams eingeben, z.B. 1/3');
	const pos = parseInt(parts[0], 10);
	const total = parseInt(parts[1], 10);
	if (!Number.isInteger(pos) || !Number.isInteger(total) || pos < 1 || total < 1) {
		return alert('Nur positive Zahlen erlaubt (Format 1/3)');
	}
	if (pos > total) {
		return alert(`Position (${pos}) kann nicht größer als Anzahl Teams (${total}) sein!`);
	}
	manualPosition = { pos, total };
	saveManualPosition();
	updatePositionDisplay();
}

function copyPositionToClipboard() {
	const pos = manualPosition.pos;
	const total = manualPosition.total;
	let text = 'Position -/-';
	if (pos && total) {
		const posEmojis = {
			1: '<:P1:1432823559364935852>',
			2: '<:P2:1432823562437638144>',
			3: '<:P3:1432823565624305756>',
			4: '<:P4:1432823568389513296>',
			5: '<:P5:1432823570583189624>',
		};
		const sb = [
			'<:SB1:1182246721129025657>',
			'<:SB2:1182246723981164665>',
			'<:SB3:1182246726137036891>',
			'<:SB4:1182246729844797440>',
			'<:SB5:1182246731447021589>',
			'<:SB6:1182246733946818620>',
			'<:SB7:1182246735616155648>',
		];
		const ts = Math.floor(Date.now() / 1000);
		const posEmoji = posEmojis[pos] || `P${pos}`;
		text = `${posEmoji}${sb.join('')}<t:${ts}:R>`;
	}

	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(text).then(() => {
			console.log('[copyPosition] copied', text);
		}).catch(() => {
			fallbackCopy(text);
		});
	} else {
		fallbackCopy(text);
	}
}

function fallbackCopy(text) {
	try {
		const ta = document.createElement('textarea');
		ta.value = text;
		ta.style.position = 'fixed';
		ta.style.top = '-1000px';
		document.body.appendChild(ta);
		ta.focus();
		ta.select();
		document.execCommand('copy');
		document.body.removeChild(ta);
	} catch (e) {
		console.warn('Copy failed:', e);
	}
}

function copyAlertToClipboard() {
	const ts = Math.floor(Date.now() / 1000);
	const text = `<a:AlertBlue:1064652389711360043><a:AlertRed:985293780288700476><:AA1:1182246601557823520><:AA2:1182246604401561610><:AA3:1182246605718556682><:AA4:1182246607228514304><:AA5:1182246610189692938><:AA6:1182246613150859304><:AA7:1182246614665019393><:AA8:1182246617559072838><a:AlertRed:985293780288700476><a:AlertBlue:1064652389711360043><t:${ts}:R>`;
	
	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(text).then(() => {
			console.log('[copyAlert] copied', text);
		}).catch(() => {
			fallbackCopy(text);
		});
	} else {
		fallbackCopy(text);
	}
}

function copyRTBToClipboard() {
	const text = '<:RTB1:1182246669564256296><:RTB2:1182246670717689867><:RTB3:1182246674383507476><:RTB4:1182246677101412392><:RTB5:1182246678397464596><:RTB6:1182246679680929803><:RTB7:1182246686177894430><:RTB8:1182246689336213575><t:1767739810:R>';
	if (navigator.clipboard && navigator.clipboard.writeText && document.hasFocus()) {
		navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
	} else {
		fallbackCopy(text);
	}
}

function applyTranslations() {
	// Set document language for accessibility
	const lang = getLang();
	document.documentElement.lang = lang;

	// Tabs
	const elMap = [
		['tab-btn-sounds', 'tab_sounds'],
		['tab-btn-features', 'tab_features'],
		['tab-btn-overlay', 'tab_overlay'],
		['tab-btn-team', 'tab_team'],
		['tab-btn-settings', 'tab_settings'],
		['console-tab-btn', 'tab_console'],
	];
	elMap.forEach(([id, key]) => {
		const el = document.getElementById(id);
		if (el) el.textContent = t(key);
	});
	// Console title/desc
	const consoleTitle = document.getElementById('console-title');
	if (consoleTitle) consoleTitle.textContent = t('tab_console');
	const consoleDesc = document.getElementById('console-desc');
	if (consoleDesc) consoleDesc.textContent = getLang() === 'en'
		? 'Real-time logs from the running assistant. This tab is visible when Debug Mode is enabled.'
		: 'Echtzeit-Logs vom laufenden Assistenten. Dieser Tab ist sichtbar, wenn der Debug-Modus aktiviert ist.';
	// Save button
	const saveBtnEl = document.getElementById('save-btn-settings');
	if (saveBtnEl) {
		const lang = getLang();
		saveBtnEl.textContent = lang === 'en' ? '💾 Speichern' : '💾 Speichern';
	}
	// Clear logs button
	const clearLogsEl = document.getElementById('clear-logs');
	if (clearLogsEl) clearLogsEl.textContent = getLang() === 'en' ? 'Clear Logs' : 'Logs l�schen';

	// Header
	const headerTitle = document.getElementById('header-title');
	if (headerTitle) headerTitle.textContent = t('header_title');

	// Sounds tab
	const soundsTitle = document.getElementById('sounds-title');
	if (soundsTitle) soundsTitle.textContent = t('sounds_title');
	const soundsTitleAccordion = document.getElementById('sounds-title-accordion');
	if (soundsTitleAccordion) soundsTitleAccordion.textContent = t('sounds_title');
	const soundsDesc = document.getElementById('sounds-desc');
	if (soundsDesc) soundsDesc.textContent = t('sounds_desc');
	const soundsDescAccordion = document.getElementById('sounds-desc-accordion');
	if (soundsDescAccordion) soundsDescAccordion.textContent = t('sounds_desc');
	const alertLabel = document.getElementById('alert-sound-label');
	if (alertLabel) alertLabel.textContent = t('alert_sound_label');
	const chatLabel = document.getElementById('chat-sound-label');
	if (chatLabel) chatLabel.textContent = t('chat_sound_label');
	const teamLabel = document.getElementById('team-sound-label');
	if (teamLabel) teamLabel.textContent = t('team_sound_label');
	document.querySelectorAll('[data-select]').forEach(btn => { btn.textContent = t('browse'); });
	// Tooltips for sounds and browse buttons
	const alertInput = document.getElementById('alert-sound'); if (alertInput) alertInput.title = t('tooltip_sound_path');
	const chatInput = document.getElementById('chat-sound'); if (chatInput) chatInput.title = t('tooltip_sound_path');
	const teamInput = document.getElementById('team-sound'); if (teamInput) teamInput.title = t('tooltip_sound_path');
	const browseAlert = document.getElementById('browse-alert'); if (browseAlert) browseAlert.title = t('tooltip_browse');
	const browseChat = document.getElementById('browse-chat'); if (browseChat) browseChat.title = t('tooltip_browse');
	const browseTeam = document.getElementById('browse-team'); if (browseTeam) browseTeam.title = t('tooltip_browse');
	const availTitle = document.getElementById('available-sounds-title');
	if (availTitle) availTitle.textContent = t('available_sounds_title');
	const soundsEmpty = document.getElementById('sounds-empty-msg');
	if (soundsEmpty) soundsEmpty.textContent = t('sounds_none');

	// Features tab
	const featuresTitle = document.getElementById('features-title');
	if (featuresTitle) featuresTitle.textContent = t('features_title');
	const featuresTitleAccordion = document.getElementById('features-title-accordion');
	if (featuresTitleAccordion) featuresTitleAccordion.textContent = t('features_title');
	const featuresDesc = document.getElementById('features-desc');
	if (featuresDesc) featuresDesc.textContent = t('features_desc');
	const featuresDescAccordion = document.getElementById('features-desc-accordion');
	if (featuresDescAccordion) featuresDescAccordion.textContent = t('features_desc');
	const featAlertTitle = document.getElementById('feature-alert-title');
	if (featAlertTitle) featAlertTitle.textContent = t('feature_alert_title');
	const featAlertDesc = document.getElementById('feature-alert-desc');
	if (featAlertDesc) featAlertDesc.textContent = t('feature_alert_desc');
	const featChatTitle = document.getElementById('feature-chat-title');
	if (featChatTitle) featChatTitle.textContent = t('feature_chat_title');
	const featChatDesc = document.getElementById('feature-chat-desc');
	if (featChatDesc) featChatDesc.textContent = t('feature_chat_desc');
	const featTeamTitle = document.getElementById('feature-team-title');
	if (featTeamTitle) featTeamTitle.textContent = t('feature_team_title');
	const featTeamDesc = document.getElementById('feature-team-desc');
	if (featTeamDesc) featTeamDesc.textContent = t('feature_team_desc');
	const featShipTitle = document.getElementById('feature-ship-title');
	if (featShipTitle) featShipTitle.textContent = t('feature_ship_title');
	const featShipDesc = document.getElementById('feature-ship-desc');
	if (featShipDesc) featShipDesc.textContent = t('feature_ship_desc');
	const featOrderTitle = document.getElementById('feature-order-title');
	if (featOrderTitle) featOrderTitle.textContent = t('feature_order_title');
	const featOrderDesc = document.getElementById('feature-order-desc');
	if (featOrderDesc) featOrderDesc.textContent = t('feature_order_desc');

	// Overlay tab
	const overlayTitle = document.getElementById('overlay-title');
	if (overlayTitle) overlayTitle.textContent = t('overlay_title');
	const overlayTitleAccordion = document.getElementById('overlay-title-accordion');
	if (overlayTitleAccordion) overlayTitleAccordion.textContent = t('overlay_title');
	const overlayDesc = document.getElementById('overlay-desc');
	if (overlayDesc) overlayDesc.textContent = t('overlay_desc');
	const overlayDescAccordion = document.getElementById('overlay-desc-accordion');
	if (overlayDescAccordion) overlayDescAccordion.textContent = t('overlay_desc');
	const overlayEnableTitle = document.getElementById('overlay-enable-title');
	if (overlayEnableTitle) overlayEnableTitle.textContent = t('overlay_enable_title');
	const overlayEnableDesc = document.getElementById('overlay-enable-desc');
	if (overlayEnableDesc) overlayEnableDesc.textContent = t('overlay_enable_desc');
	const overlayTextLabel = document.getElementById('overlay-text-percent-label');
	if (overlayTextLabel) overlayTextLabel.textContent = t('overlay_text_percent_label');
	const overlayTextInput = document.getElementById('overlay-text-percent');
	if (overlayTextInput) overlayTextInput.title = t('tooltip_text_size');
	const overlayMonitorLabel = document.getElementById('overlay-monitor-label');
	if (overlayMonitorLabel) overlayMonitorLabel.textContent = t('overlay_monitor_label');
	const overlayMonitorSelect = document.getElementById('overlay-monitor');
	if (overlayMonitorSelect) overlayMonitorSelect.title = t('tooltip_monitor_select');
	const overlayPosEffectLabel = document.getElementById('overlay-position-effect-label');
	if (overlayPosEffectLabel) overlayPosEffectLabel.textContent = t('overlay_position_effect_label');
	const overlayRadioTop = document.getElementById('overlay-radio-top');
	if (overlayRadioTop) overlayRadioTop.textContent = t('overlay_radio_top');
	const overlayRadioTopLabel = document.getElementById('overlay-radio-top-label');
	if (overlayRadioTopLabel) overlayRadioTopLabel.title = t('tooltip_position_top');
	const overlayRadioCenter = document.getElementById('overlay-radio-center');
	if (overlayRadioCenter) overlayRadioCenter.textContent = t('overlay_radio_center');
	const overlayRadioCenterLabel = document.getElementById('overlay-radio-center-label');
	if (overlayRadioCenterLabel) overlayRadioCenterLabel.title = t('tooltip_position_center');
	const overlayBorderStyleLabel = document.getElementById('overlay-border-style-label');
	if (overlayBorderStyleLabel) overlayBorderStyleLabel.textContent = t('overlay_border_style_label');
	const borderSelect = document.getElementById('overlay-border-style');
	if (borderSelect && borderSelect.options.length >= 2) {
		borderSelect.options[0].text = t('overlay_border_option_none');
		borderSelect.options[1].text = t('overlay_border_option_glow');
		borderSelect.title = t('tooltip_border_style');
	}

	// Team tab
	const teamTitle = document.getElementById('team-title');
	if (teamTitle) teamTitle.textContent = t('team_title');
	const teamDesc = document.getElementById('team-desc');
	if (teamDesc) teamDesc.textContent = t('team_desc');

	// Settings tab
	const settingsTitle = document.getElementById('settings-title');
	if (settingsTitle) settingsTitle.textContent = t('settings_title');
	const languageLabel = document.getElementById('language-label');
	if (languageLabel) languageLabel.textContent = t('language_label');
	const medTokenLabel = document.getElementById('medrunner-token-label');
	if (medTokenLabel) medTokenLabel.textContent = t('medrunner_token_label');
	const medTokenDesc = document.getElementById('medrunner-token-desc');
	if (medTokenDesc) medTokenDesc.textContent = t('medrunner_token_desc');
	const toggleTokenBtn = document.getElementById('toggle-token');
	if (toggleTokenBtn) toggleTokenBtn.title = t('toggle_token_title');
	const overlayDurationTitle = document.getElementById('overlay-duration-title');
	if (overlayDurationTitle) overlayDurationTitle.textContent = t('overlay_duration_title');
	const overlayDurationDesc = document.getElementById('overlay-duration-desc');
	if (overlayDurationDesc) overlayDurationDesc.textContent = t('overlay_duration_desc');
	const overlayDurationLabel = document.getElementById('overlay-duration-label');
	if (overlayDurationLabel) overlayDurationLabel.textContent = t('overlay_duration_label');
	const debugTestTitle = document.getElementById('debug-test-title');
	if (debugTestTitle) debugTestTitle.textContent = t('debug_test_title');
	const debugModeTitle = document.getElementById('debug-mode-title');
	if (debugModeTitle) debugModeTitle.textContent = t('debug_mode_title');
	const debugModeDesc = document.getElementById('debug-mode-desc');
	if (debugModeDesc) debugModeDesc.textContent = t('debug_mode_desc');
	const testModeTitle = document.getElementById('test-mode-title');
	if (testModeTitle) testModeTitle.textContent = t('test_mode_title');
	const testModeDesc = document.getElementById('test-mode-desc');
	if (testModeDesc) testModeDesc.textContent = t('test_mode_desc');
	const apiConfigTitle = document.getElementById('api-config-title');
	if (apiConfigTitle) apiConfigTitle.textContent = t('api_config_title');
	const apiEnvLabel = document.getElementById('api-env-label');
	if (apiEnvLabel) apiEnvLabel.textContent = t('api_env_label');
	const apiEnvProd = document.getElementById('api-env-prod');
	if (apiEnvProd) apiEnvProd.textContent = t('api_env_prod');
	const apiEnvDev = document.getElementById('api-env-dev');
	if (apiEnvDev) apiEnvDev.textContent = t('api_env_dev');
	const devApiKeyLabel = document.getElementById('dev-api-key-label');
	if (devApiKeyLabel) devApiKeyLabel.textContent = t('dev_api_key_label');
	const alertTestTitle = document.getElementById('alert-test-title');
	if (alertTestTitle) alertTestTitle.textContent = t('alert_test_title');
	const alertTestDesc = document.getElementById('alert-test-desc');
	if (alertTestDesc) alertTestDesc.textContent = t('alert_test_desc');
	const alertTestBtn = document.getElementById('alert-test-full');
	if (alertTestBtn) {
		alertTestBtn.textContent = t('alert_test_run_btn');
		alertTestBtn.title = t('tooltip_alert_test');
	}
	const moreSettingsTitle = document.getElementById('more-settings-title');
	if (moreSettingsTitle) moreSettingsTitle.textContent = t('more_settings_title');
}

// Initialize DOM Elements and setup event listeners
function initializeDOMElements() {
	// Select DOM Elements
	tabs = document.querySelectorAll('.tab-btn');
	tabContents = document.querySelectorAll('.tab-content');
	saveBtn = document.getElementById('save-btn-settings');
	saveStatus = document.getElementById('save-status');
	startStopBtn = document.getElementById('start-stop-btn');
	statusIndicator = document.getElementById('status-indicator');
	statusText = document.getElementById('status-text');
	statusDot = document.getElementById('status-dot');
	positionPill = document.getElementById('position-pill');
	positionDisplay = document.getElementById('position-display');
	copyPositionBtn = document.getElementById('copy-position-btn');
	teamPositionSelect = document.getElementById('team-position-select');
	teamCountSelect = document.getElementById('team-count-select');
	teamPositionSaveBtn = document.getElementById('team-position-save');
	logOutput = document.getElementById('log-output');
	clearLogsBtn = document.getElementById('clear-logs');
	toggleTokenBtn = document.getElementById('toggle-token');
	tokenInput = document.getElementById('medrunner-token');
	
	console.log('[initializeDOMElements] DOM Elements initialized');
	console.log('[initializeDOMElements] tabs count:', tabs.length);
	console.log('[initializeDOMElements] startStopBtn:', startStopBtn);
	console.log('[initializeDOMElements] saveBtn:', saveBtn);
	
	// Initialize Form Elements
	formElements = {
		MEDRUNNER_TOKEN: document.getElementById('medrunner-token'),
		LANGUAGE: document.getElementById('language'),
		CUSTOM_ALERT_SOUND: document.getElementById('alert-sound'),
		CUSTOM_CHATMESSAGE_SOUND: document.getElementById('chat-sound'),
		CUSTOM_TEAMJOIN_SOUND: document.getElementById('team-sound'),
		CUSTOM_UNASSIGNED_SOUND: document.getElementById('unassigned-sound'),
		ENABLE_CUSTOM_ALERT_SOUND: document.getElementById('enable-alert-sound'),
		ENABLE_CUSTOM_CHATMESSAGE_SOUND: document.getElementById('enable-chat-message-sound'),
		ENABLE_CUSTOM_TEAMJOIN_SOUND: document.getElementById('enable-team-sound'),
		ENABLE_CUSTOM_UNASSIGNED_SOUND: document.getElementById('enable-unassigned-sound'),
		ENABLE_PRINT_SHIPASSIGNMENTS: document.getElementById('enable-ship-assignments'),
		ENABLE_PRINT_TEAMJOINORDER: document.getElementById('enable-team-order'),
		ENABLE_ALERT_OVERLAY: document.getElementById('enable-overlay'),
		ALERT_OVERLAY_MONITOR_INDEX: document.getElementById('overlay-monitor'),
		OVERLAY_DURATION_MS: document.getElementById('overlay-duration'),
		OVERLAY_TEXT_SIZE_PERCENT: document.getElementById('overlay-text-percent'),
		OVERLAY_POSITION: document.querySelector('input[name="overlay-position"][value="top"]'),
		OVERLAY_BORDER_STYLE: document.getElementById('overlay-border-style'),
		DEBUG_MODE: document.getElementById('debug-mode'),
		TEST_MODE: document.getElementById('test-mode'),
		API_ENV: document.querySelector('input[name="api-env"][value="prod"]'),
		DEV_API_KEY: document.getElementById('dev-api-key'),
	};
	
	// Tab switching with simple event delegation
	tabs.forEach(tab => {
		tab.addEventListener('click', (e) => {
			e.preventDefault();
			const targetTab = tab.dataset.tab;
			console.log('[Tab Click] Switching to:', targetTab);
			window.switchTab(targetTab);
		});
	});
	console.log('[initializeDOMElements] Tab event listeners attached');
	
	// Event Listeners
	if (saveBtn) {
		saveBtn.addEventListener('click', saveSettings);
		console.log('[initializeDOMElements] Save button listener attached');
	}
	if (startStopBtn) {
		startStopBtn.addEventListener('click', toggleAssistant);
		console.log('[initializeDOMElements] Start/Stop button listener attached');
	}
	if (clearLogsBtn) {
		clearLogsBtn.addEventListener('click', clearLogs);
		console.log('[initializeDOMElements] Clear Logs button listener attached');
	}
	if (toggleTokenBtn) {
		toggleTokenBtn.addEventListener('click', toggleTokenVisibility);
		console.log('[initializeDOMElements] Toggle Token button listener attached');
	}

	if (positionDisplay) {
		positionDisplay.addEventListener('click', promptPositionEntry);
		console.log('[initializeDOMElements] Position display listener attached');
	}

	if (copyPositionBtn) {
		copyPositionBtn.addEventListener('click', copyPositionToClipboard);
		console.log('[initializeDOMElements] Copy position button listener attached');
	}

	if (teamPositionSaveBtn) {
		teamPositionSaveBtn.addEventListener('click', () => {
			const pos = parseInt(teamPositionSelect?.value, 10) || 1;
			const total = parseInt(teamCountSelect?.value, 10) || 1;
			
			// Validate that position is not greater than total
			if (pos > total) {
				alert(`Position (${pos}) kann nicht größer als Anzahl Teams (${total}) sein!`);
				return;
			}
			
			manualPosition = { pos, total };
			saveManualPosition();
			updatePositionDisplay();
		});
	}

	// Alert Full Test button
	alertTestFullBtn = document.getElementById('alert-test-full');
	if (alertTestFullBtn) {
		alertTestFullBtn.addEventListener('click', async () => {
			try {
				alertTestFullBtn.disabled = true;
				const originalText = alertTestFullBtn.textContent;
				alertTestFullBtn.textContent = t('alert_test_running');
				const result = await window.api.testAlertFull();
				if (result.success) {
					addLog(getLang()==='en'?`? Alert Test Full started`:`? Alert Test Full gestartet`);
				} else {
					addLog(getLang()==='en'?`? Alert Test Full failed: ${result.message}`:`? Alert Test Full fehlgeschlagen: ${result.message}`, true);
				}
				alertTestFullBtn.textContent = originalText;
			} catch (error) {
				addLog(getLang()==='en'?`? Alert Test Full error: ${error.message}`:`? Alert Test Full Fehler: ${error.message}`, true);
			} finally {
				alertTestFullBtn.disabled = false;
			}
		});
	}

	// Alert Workflow actions
	const awRunAlertBtn = document.getElementById('alert-workflow-run-alert');
	if (awRunAlertBtn) {
		awRunAlertBtn.addEventListener('click', async () => {
			try {
				awRunAlertBtn.disabled = true;
				const originalText = awRunAlertBtn.textContent;
				awRunAlertBtn.textContent = t('alert_test_running');
				const result = await window.api.testAlertFull();
				awRunAlertBtn.textContent = originalText;
				addLog(getLang()==='en'?`Alert Workflow: Alert test ${result.success?'started':'failed'}`:`Alert Workflow: Alert-Test ${result.success?'gestartet':'fehlgeschlagen'}`,
					!result.success);
			} catch (error) {
				addLog(getLang()==='en'?`Alert Workflow: error ${error.message}`:`Alert Workflow: Fehler ${error.message}`,
					true);
			} finally {
				awRunAlertBtn.disabled = false;
			}
		});
	}

	const awCopyAlertBtn = document.getElementById('alert-workflow-copy-alert');
	if (awCopyAlertBtn) {
		awCopyAlertBtn.addEventListener('click', copyAlertToClipboard);
	}

	const awCopyRTBBtn = document.getElementById('alert-workflow-copy-rtb');
	if (awCopyRTBBtn) {
		awCopyRTBBtn.addEventListener('click', copyRTBToClipboard);
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

	// Debug mode toggle - show/hide console tab
	const debugModeCheckbox = document.getElementById('debug-mode');
	if (debugModeCheckbox) {
		debugModeCheckbox.addEventListener('change', () => {
			updateConsoleTabVisibility();
		});
	}

	// Test mode toggle - show/hide API config section
	const testModeCheckbox = document.getElementById('test-mode');
	if (testModeCheckbox) {
		testModeCheckbox.addEventListener('change', () => {
			updateTestButtonsVisibility();
			updateApiConfigVisibility();
		});
	}

	// Initialize header status indicator
	const header = document.querySelector('header');
	if (header) {
		header.classList.add('stopped');
	}

	// Header RTB copy button
	const rtbCopyHeadBtn = document.getElementById('rtb-copy-head');
	if (rtbCopyHeadBtn) {
		rtbCopyHeadBtn.addEventListener('click', copyRTBToClipboard);
	}

	if (positionDisplay) {
		positionDisplay.addEventListener('click', promptPositionEntry);
		console.log('[initializeDOMElements] Position display listener attached');
	}

	if (copyPositionBtn) {
		copyPositionBtn.addEventListener('click', copyPositionToClipboard);
		console.log('[initializeDOMElements] Copy position button listener attached');
	}

	const copyAlertBtn = document.getElementById('copy-alert-btn');
	if (copyAlertBtn) {
		copyAlertBtn.addEventListener('click', copyAlertToClipboard);
		console.log('[initializeDOMElements] Copy alert button listener attached');
	}
}

// Load settings on startup
async function loadSettings() {
	try {
		currentSettings = await window.api.loadSettings();
		populateForm(currentSettings);
		await loadAvailableSounds();
		updateTestButtonsVisibility();
		updateApiConfigVisibility();
		updateConsoleTabVisibility();
		applyTranslations();
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
		
		if (key === 'OVERLAY_POSITION') {
			const topRadio = document.querySelector('input[name="overlay-position"][value="top"]');
			const centerRadio = document.querySelector('input[name="overlay-position"][value="center"]');
			if (value === 'center') {
				centerRadio.checked = true;
			} else {
				topRadio.checked = true;
			}
		} else if (key === 'API_ENV') {
			const prodRadio = document.querySelector('input[name="api-env"][value="prod"]');
			const devRadio = document.querySelector('input[name="api-env"][value="dev"]');
			if (value === 'dev') {
				devRadio.checked = true;
			} else {
				prodRadio.checked = true;
			}
		} else if (element.type === 'checkbox') {
			element.checked = value === 'true';
		} else if (key === 'LANGUAGE') {
			element.value = value || 'de';
		} else {
			element.value = value;
		}
	}

	applyTranslations();
}

// Show/hide test buttons depending on TEST_MODE
function updateTestButtonsVisibility() {
	const enabled = formElements.TEST_MODE && formElements.TEST_MODE.checked;
	const testButtons = document.querySelectorAll('.btn-test');
	testButtons.forEach(btn => {
		btn.style.display = enabled ? 'inline-block' : 'none';
	});
}

// Show/hide console tab depending on DEBUG_MODE
function updateConsoleTabVisibility() {
	const enabled = formElements.DEBUG_MODE && formElements.DEBUG_MODE.checked;
	const consoleTab = document.getElementById('console-tab-btn');
	if (consoleTab) {
		consoleTab.style.display = enabled ? 'block' : 'none';
	}
}

// Show/hide API config section depending on TEST_MODE
function updateApiConfigVisibility() {
	const enabled = formElements.TEST_MODE && formElements.TEST_MODE.checked;
	const apiSection = document.getElementById('api-config-section');
	if (apiSection) {
		apiSection.style.display = enabled ? 'block' : 'none';
	}
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
		} else if (key === 'OVERLAY_POSITION') {
			const centerRadio = document.querySelector('input[name="overlay-position"][value="center"]');
			settings[key] = centerRadio.checked ? 'center' : 'top';
		} else if (key === 'API_ENV') {
			const devRadio = document.querySelector('input[name="api-env"][value="dev"]');
			settings[key] = devRadio.checked ? 'dev' : 'prod';
		} else if (key === 'ALERT_OVERLAY_MONITOR_INDEX') {
			settings[key] = element.value;
		} else if (key === 'LANGUAGE') {
			settings[key] = element.value || 'de';
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
			showStatus('?? Medrunner Token ist erforderlich!', 'error');
			return;
		}
		
		const result = await window.api.saveSettings(settings);

		if (result.success) {
			currentSettings = settings;
			if (result.restarted && result.restarted.success === false) {
				showStatus(`?? Gespeichert, aber Neustart fehlgeschlagen: ${result.restarted.message}`, 'error');
			} else {
				showStatus('? Einstellungen gespeichert!', 'success');
			}
		} else {
			showStatus(`? Fehler: ${result.error}`, 'error');
		}
	} catch (error) {
		console.error('Failed to save settings:', error);
		showStatus('? Fehler beim Speichern', 'error');
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
			soundList.innerHTML = `<p class="muted">${t('sounds_none')}</p>`;
			return;
		}
		
		soundList.innerHTML = '';
		sounds.forEach(sound => {
			const chip = document.createElement('span');
			chip.className = 'sound-chip';
			chip.textContent = sound.replace('./sounds/', '');
			chip.title = t('chip_tooltip');
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
				showStatus(`? Start fehlgeschlagen: ${result.message}`, 'error');
			}
		}
	} catch (error) {
		console.error('Failed to toggle assistant:', error);
		showStatus('? Fehler beim Starten/Stoppen', 'error');
	}
}

// Update assistant status UI
function updateAssistantStatus(running) {
	isAssistantRunning = running;
	const header = document.querySelector('header');
	
	if (running) {
		if (statusIndicator) statusIndicator.classList.add('running');
		if (statusText) statusText.textContent = t('status_running');
		if (startStopBtn) {
			startStopBtn.textContent = t('btn_stop');
			startStopBtn.classList.remove('btn-primary');
			startStopBtn.classList.add('btn-secondary');
		}
		if (header) {
			header.classList.remove('stopped');
			header.classList.add('running');
		}
	} else {
		if (statusIndicator) statusIndicator.classList.remove('running');
		if (statusText) statusText.textContent = t('status_stopped');
		if (startStopBtn) {
			startStopBtn.textContent = t('btn_start');
			startStopBtn.classList.remove('btn-secondary');
			startStopBtn.classList.add('btn-primary');
		}
		if (header) {
			header.classList.remove('running');
			header.classList.add('stopped');
		}
	}
}

// Log handling
function addLog(message, isError = false) {
	const logLine = document.createElement('div');
	logLine.className = isError ? 'log-line error' : 'log-line';

	const timestamp = new Date().toLocaleTimeString(translations[getLang()].timestampLocale);
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
	logOutput.innerHTML = `<p class="muted">${t('logs_cleared')}</p>`;
}

// Toggle token visibility
function toggleTokenVisibility() {
	if (tokenInput.type === 'password') {
		tokenInput.type = 'text';
		toggleTokenBtn.textContent = '??';
	} else {
		tokenInput.type = 'password';
		toggleTokenBtn.textContent = '???';
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
				button.textContent = '? L�dt...';
				
				const result = await window.api.testFeature(featureName, testNumber);
				
				if (result.success) {
					addLog(`? Test ${testNumber} f�r ${featureName}: ${result.message}`, false);
				} else {
					addLog(`? Test ${testNumber} fehlgeschlagen: ${result.message}`, true);
				}
				button.textContent = originalText;
			} catch (error) {
				addLog(`? Test-Fehler: ${error.message}`, true);
				button.textContent = button.textContent.replace('? L�dt...', `Test ${testNumber}`);
			} finally {
				button.disabled = false;
			}
		});
	});
}

// Load and display team members
async function loadTeamMembers() {
	try {
		const members = await window.api.getTeamMembers();
		displayTeamMembers(members);
	} catch (error) {
		console.error('Failed to load team members:', error);
	}
}

// Display team members in UI as table
function displayTeamMembers(members) {
	const teamMembersDiv = document.getElementById('team-members');
	
	if (!teamMembersDiv) return;
	
	if (!members || members.length === 0) {
		teamMembersDiv.innerHTML = `<p class="muted">${t('team_no_data')}</p>`;
		return;
	}
	
	// Create table
	const table = document.createElement('table');
	table.style.width = '100%';
	table.style.borderCollapse = 'collapse';
	table.style.marginTop = '1rem';
	
	// Header
	const thead = document.createElement('thead');
	const headerRow = document.createElement('tr');
	headerRow.style.borderBottom = '2px solid var(--border)';
	
	const headers = [t('table_order'), t('table_rsi'), t('table_discord'), t('table_role'), t('table_joined')];
	headers.forEach(headerText => {
		const th = document.createElement('th');
		th.textContent = headerText;
		th.style.padding = '0.75rem';
		th.style.textAlign = 'left';
		th.style.fontWeight = 'bold';
		th.style.color = 'var(--text)';
		headerRow.appendChild(th);
	});
	thead.appendChild(headerRow);
	table.appendChild(thead);
	
	// Body
	const tbody = document.createElement('tbody');
	members.forEach((member, index) => {
		const row = document.createElement('tr');
		if (index % 2 === 0) {
			row.style.backgroundColor = 'var(--surface)';
		}
		row.style.borderBottom = '1px solid var(--border)';

		const orderCell = document.createElement('td');
		orderCell.textContent = (member.order != null ? String(member.order) : '-');
		orderCell.style.padding = '0.75rem';
		orderCell.style.color = 'var(--text)';
		orderCell.style.fontWeight = 'bold';

		const rsiHandle = document.createElement('td');
		rsiHandle.textContent = member.rsiHandle || '-';
		rsiHandle.style.padding = '0.75rem';
		rsiHandle.style.color = 'var(--text)';
		
		const discordId = document.createElement('td');
		discordId.textContent = member.discordId || '-';
		discordId.style.padding = '0.75rem';
		discordId.style.color = 'var(--text)';
		discordId.style.fontFamily = 'monospace';
		
		const role = document.createElement('td');
		role.textContent = member.role || '-';
		role.style.padding = '0.75rem';
		role.style.color = 'var(--text)';

		const joined = document.createElement('td');
		if (member.joinedAt != null) {
			try {
				const d = new Date(member.joinedAt);
				joined.textContent = d.toLocaleString(translations[getLang()].timestampLocale);
			} catch (_) {
				joined.textContent = '-';
			}
		} else {
			joined.textContent = '-';
		}
		joined.style.padding = '0.75rem';
		joined.style.color = 'var(--text)';
		
		row.appendChild(orderCell);
		row.appendChild(rsiHandle);
		row.appendChild(discordId);
		row.appendChild(role);
		row.appendChild(joined);
		tbody.appendChild(row);
	});
	table.appendChild(tbody);
	
	teamMembersDiv.innerHTML = '';
	teamMembersDiv.appendChild(table);
}

// Listen to team members updates
window.api.onTeamMembersUpdate((members) => {
	displayTeamMembers(members);
});

// Listen to alert started events
window.api.onAlertStarted((alertData) => {
	if (alertData && alertData.name) {
		// Track in session set and update AAR dropdown
		if (typeof sessionAlerts !== 'undefined') {
			sessionAlerts.add(alertData.name);
		}
		updateAARAlertDropdown();
		if (window.setCurrentAlertName) {
			window.setCurrentAlertName(alertData.name);
		}
		console.log("[renderer] Alert started:", alertData.name);
	}
});

// Session alerts tracking and AAR dropdown population
const sessionAlerts = new Set();
function updateAARAlertDropdown() {
	const sel = document.getElementById('aar-alert-dropdown');
	if (!sel) return;
	const currentValue = sel.value;
	// Clear options
	while (sel.firstChild) sel.removeChild(sel.firstChild);
	// Placeholder
	const placeholder = document.createElement('option');
	placeholder.value = '';
	placeholder.textContent = 'Alert auswählen...';
	sel.appendChild(placeholder);
	// Add sorted alerts
	const alerts = Array.from(sessionAlerts).sort((a, b) => a.localeCompare(b));
	for (const name of alerts) {
		const opt = document.createElement('option');
		opt.value = name;
		opt.textContent = name;
		sel.appendChild(opt);
	}
	// Restore selection if still present
	if (currentValue && sessionAlerts.has(currentValue)) {
		sel.value = currentValue;
	} else {
		sel.value = '';
	}
}

// Wire dropdown change to set current alert (no impact on copies)
document.addEventListener('DOMContentLoaded', () => {
	const sel = document.getElementById('aar-alert-dropdown');
	if (sel) {
		sel.addEventListener('change', () => {
			const val = sel.value || null;
			if (val && window.setCurrentAlertName) {
				window.setCurrentAlertName(val);
			}
		});
		// Ensure initial placeholder
		updateAARAlertDropdown();
	}
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
	addLog(t('assistant_stopped_code', code), code !== 0);
});

// Menu save shortcut
window.api.onMenuSave(() => {
	saveSettings();
});

// Test workflow trigger from builder
window.electronAPI?.on?.('test-workflow-trigger', (data) => {
	console.log('[Renderer] Testing workflow:', data.workflow.name);
	
	// Import and use workflowManager to trigger the workflow
	try {
		// Store the test workflow temporarily
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('mrs_workflows_list', JSON.stringify([data.workflow]));
			localStorage.setItem('mrs_current_workflow_id', data.workflow.id);
		}
		
		// Trigger the workflow through workflowManager
		// This will handle pages, overlays, sounds, etc. properly
		if (window.workflowManager && window.workflowManager.triggerWorkflow) {
			window.workflowManager.triggerWorkflow(data.triggerType);
			alert(`Workflow "${data.workflow.name}" wird getestet!`);
		} else {
			console.warn('[Renderer] workflowManager not available for test');
		}
	} catch (e) {
		console.error('[Renderer] Failed to test workflow:', e);
	}
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
	await loadTeamMembers();
	await loadShipAndAARModules(); // Load ship assignment and AAR modules
	loadManualPositionFromStorage();
	initializeWorkflow(); // Initialize workflow display

	// Re-apply translations when language changes
	const langSelect = document.getElementById('language');
	if (langSelect) {
		langSelect.addEventListener('change', () => {
			applyTranslations();
			updateAssistantStatus(isAssistantRunning);
		});
	}
});

// ============================================================================
// WORKFLOW MANAGEMENT
// ============================================================================

let currentWorkflow = null;
let currentWorkflowPageIndex = 0;

function initializeWorkflow() {
	// Load workflow from localStorage
	loadWorkflow();
	renderWorkflow();
	
	// Setup builder button
	const openBuilderBtn = document.getElementById('open-builder-btn');
	if (openBuilderBtn) {
		openBuilderBtn.onclick = async () => {
			const result = await window.api.openWorkflowBuilder();
			if (!result.success) {
				console.error('Failed to open workflow builder');
			}
		};
	}
	
	// Setup navigation
	const prevBtn = document.getElementById('workflow-prev-btn');
	const nextBtn = document.getElementById('workflow-next-btn');
	
	if (prevBtn) {
		prevBtn.onclick = () => {
			if (currentWorkflowPageIndex > 0) {
				currentWorkflowPageIndex--;
				renderWorkflow();
			}
		};
	}
	
	if (nextBtn) {
		nextBtn.onclick = () => {
			if (currentWorkflow && currentWorkflowPageIndex < currentWorkflow.pages.length - 1) {
				currentWorkflowPageIndex++;
				renderWorkflow();
			}
		};
	}
}

function loadWorkflow() {
	try {
		const stored = localStorage.getItem('mrs_alert_workflow');
		if (stored) {
			currentWorkflow = JSON.parse(stored);
			currentWorkflowPageIndex = 0;
			console.log('[Workflow] Loaded:', currentWorkflow.name);
		}
	} catch (e) {
		console.error('[Workflow] Failed to load:', e);
	}
}

function renderWorkflow() {
	const buttonsContainer = document.getElementById('workflow-buttons-container');
	const pageNumber = document.getElementById('workflow-page-number');
	const pageIndicator = document.getElementById('workflow-page-indicator');
	const navigation = document.getElementById('workflow-navigation');
	const prevBtn = document.getElementById('workflow-prev-btn');
	const nextBtn = document.getElementById('workflow-next-btn');
	
	if (!currentWorkflow || !currentWorkflow.pages || currentWorkflow.pages.length === 0) {
		buttonsContainer.innerHTML = '<p style="text-align: center; color: #888; padding: 2rem;">Kein Workflow geladen. Öffne den Builder, um einen Workflow zu erstellen.</p>';
		navigation.style.display = 'none';
		return;
	}
	
	const page = currentWorkflow.pages[currentWorkflowPageIndex];
	if (!page) return;
	
	// Update page number
	pageNumber.textContent = `Seite ${page.id}`;
	pageIndicator.textContent = `${currentWorkflowPageIndex + 1} / ${currentWorkflow.pages.length}`;
	
	// Show/hide navigation
	if (currentWorkflow.pages.length > 1) {
		navigation.style.display = 'flex';
		prevBtn.disabled = currentWorkflowPageIndex === 0;
		nextBtn.disabled = currentWorkflowPageIndex === currentWorkflow.pages.length - 1;
	} else {
		navigation.style.display = 'none';
	}
	
	// Render buttons
	buttonsContainer.innerHTML = '';
	
	if (page.buttons.length === 0) {
		buttonsContainer.innerHTML = '<p style="text-align: center; color: #888; padding: 2rem;">Keine Buttons auf dieser Seite. Öffne den Builder, um Buttons hinzuzufügen.</p>';
		return;
	}
	
	page.buttons.forEach(button => {
		const btn = document.createElement('button');
		btn.className = 'workflow-button';
		btn.textContent = button.label;
		btn.style.backgroundColor = button.color;
		btn.onclick = () => executeWorkflowButton(button);
		buttonsContainer.appendChild(btn);
	});
}

async function executeWorkflowButton(button) {
	if (!button || !button.actions) return;
	
	console.log('[Workflow] Executing button:', button.label);
	
	for (const action of button.actions) {
		switch (action.type) {
			case 'navigate':
				if (action.targetPage && currentWorkflow) {
					const targetIndex = currentWorkflow.pages.findIndex(p => p.id === action.targetPage);
					if (targetIndex !== -1) {
						currentWorkflowPageIndex = targetIndex;
						renderWorkflow();
					}
				}
				break;
				
			case 'copy':
				if (action.text) {
					try {
						await navigator.clipboard.writeText(action.text);
						console.log('[Workflow] Text copied');
						// Could show a notification here
					} catch (e) {
						console.error('[Workflow] Copy failed:', e);
						// Fallback
						const textarea = document.createElement('textarea');
						textarea.value = action.text;
						document.body.appendChild(textarea);
						textarea.select();
						document.execCommand('copy');
						document.body.removeChild(textarea);
					}
				}
				break;
				
			case 'timer':
				if (action.action) {
					switch (action.action) {
						case 'advance':
							if (window.advanceAlertTimer) {
								window.advanceAlertTimer();
							}
							break;
						case 'reset':
							if (window.resetAlertTimer) {
								window.resetAlertTimer(false);
							}
							break;
					}
				}
				break;
				
			case 'end':
				console.log('[Workflow] Workflow ended');
				currentWorkflowPageIndex = 0;
				renderWorkflow();
				break;
		}
	}
}

// Listen for workflow updates from builder
window.api.onWorkflowUpdated((workflow) => {
	console.log('[Workflow] Updated from builder');
	currentWorkflow = workflow;
	renderWorkflow();
});

// Global functions will be loaded from shipaar-init.js during DOMContentLoaded
