import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, "..", ".env");

/**
 * Parse .env file content into an object
 */
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

/**
 * Convert settings object back to .env format
 */
function stringifyEnvFile(settings) {
	const lines = [];

	// Group settings by category
	const categories = {
		auth: ["MEDRUNNER_TOKEN"],
		sounds: ["CUSTOM_ALERT_SOUND", "CUSTOM_CHATMESSAGE_SOUND", "CUSTOM_TEAMJOIN_SOUND", "CUSTOM_ALERT_SOUND_DURATION_MS", "CUSTOM_CHATMESSAGE_SOUND_DURATION_MS", "CUSTOM_TEAMJOIN_SOUND_DURATION_MS"],
		features: [
			"ENABLE_CUSTOM_ALERT_SOUND",
			"ENABLE_CUSTOM_CHATMESSAGE_SOUND",
			"ENABLE_CUSTOM_TEAMJOIN_SOUND",
			"ENABLE_PRINT_SHIPASSIGNMENTS",
			"ENABLE_PRINT_TEAMJOINORDER",
			"ENABLE_ALERT_OVERLAY",
		],
		overlay: ["OVERLAY_DURATION_MS", "OVERLAY_TEXT_SIZE_PERCENT", "OVERLAY_POSITION", "ALERT_OVERLAY_MONITOR_INDEX", "OVERLAY_BORDER_STYLE", "OVERLAY_BACKGROUND_STYLE"],
		debug: ["DEBUG_MODE", "TEST_MODE"],
	};

	// Add each category
	for (const [category, keys] of Object.entries(categories)) {
		for (const key of keys) {
			if (settings.hasOwnProperty(key)) {
				lines.push(`${key}=${settings[key]}`);
			}
		}
		lines.push(""); // Empty line between categories
	}

	return lines.join("\n");
}

/**
 * Load settings from .env file
 */
export function loadSettings() {
	try {
		if (!fs.existsSync(envPath)) {
			// Copy from example if .env doesn't exist
			const examplePath = path.join(__dirname, "..", ".env.example");
			if (fs.existsSync(examplePath)) {
				fs.copyFileSync(examplePath, envPath);
			} else {
				return getDefaultSettings();
			}
		}

		const content = fs.readFileSync(envPath, "utf-8");
		return parseEnvFile(content);
	} catch (error) {
		console.error("Failed to load settings:", error);
		return getDefaultSettings();
	}
}

/**
 * Save settings to .env file
 */
export function saveSettings(settings) {
	try {
		const content = stringifyEnvFile(settings);
		fs.writeFileSync(envPath, content, "utf-8");
		return { success: true };
	} catch (error) {
		console.error("Failed to save settings:", error);
		return { success: false, error: error.message };
	}
}

/**
 * Get default settings
 */
export function getDefaultSettings() {
	return {
		MEDRUNNER_TOKEN: "",
		CUSTOM_ALERT_SOUND: "./sounds/tng_red_alert1.wav",
		CUSTOM_CHATMESSAGE_SOUND: "./sounds/ent_doorchime.wav",
		CUSTOM_TEAMJOIN_SOUND: "./sounds/ds9_doorchime.wav",
		CUSTOM_ALERT_SOUND_DURATION_MS: "0",
		CUSTOM_CHATMESSAGE_SOUND_DURATION_MS: "0",
		CUSTOM_TEAMJOIN_SOUND_DURATION_MS: "0",
		ENABLE_CUSTOM_ALERT_SOUND: "true",
		ENABLE_CUSTOM_CHATMESSAGE_SOUND: "true",
		ENABLE_CUSTOM_TEAMJOIN_SOUND: "true",
		ENABLE_PRINT_SHIPASSIGNMENTS: "true",
		ENABLE_PRINT_TEAMJOINORDER: "true",
		ENABLE_ALERT_OVERLAY: "false",
		OVERLAY_DURATION_MS: "3000",
		OVERLAY_TEXT_SIZE_PERCENT: "100",
		OVERLAY_POSITION: "top",
		ALERT_OVERLAY_MONITOR_INDEX: "0",
		OVERLAY_BORDER_STYLE: "none",
		OVERLAY_BACKGROUND_STYLE: "none",
		DEBUG_MODE: "false",
		TEST_MODE: "false",
	};
}

/**
 * Validate settings
 */
export function validateSettings(settings) {
	const errors = [];

	if (!settings.MEDRUNNER_TOKEN || settings.MEDRUNNER_TOKEN.trim() === "") {
		errors.push("Medrunner Token ist erforderlich");
	}

	// Validate screen index
	const screenIndex = parseInt(settings.ALERT_OVERLAY_SCREEN);
	if (isNaN(screenIndex) || screenIndex < 0) {
		errors.push("Bildschirm-Index muss eine positive Zahl sein");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * List available sound files
 */
export function getAvailableSounds() {
	try {
		const soundsDir = path.join(__dirname, "..", "sounds");
		if (!fs.existsSync(soundsDir)) {
			return [];
		}

		const files = fs.readdirSync(soundsDir);
		return files
			.filter((file) => file.endsWith(".wav"))
			.map((file) => `./sounds/${file}`);
	} catch (error) {
		console.error("Failed to list sounds:", error);
		return [];
	}
}
