import { playAudio } from "../lib/playAudio.js";
import { showAlertOverlay } from "../lib/showAlertOverlay.js";
import { resolveAudioPath } from "../lib/resolveAudioPath.js";
import * as workflowManager from "../lib/workflowManager.js";

export const event = "EmergencyCreate";

export const name = "Custom_Alert_Sound";

export async function callback(alert) {
	if (process.env.DEBUG_MODE === "true") {
		console.log("New alert received: " + alert.missionName);
		console.log(JSON.stringify(alert, null, 4));
	}

	// Don't play the sound if the alert is an academy lesson
	if (alert.origin === 3) {
		return;
	}

	// Check if workflow should handle this alert instead
	if (workflowManager.shouldTriggerOnNewAlert(alert)) {
		console.log("Alert handled by workflow - skipping default sound/overlay");
		workflowManager.triggerWorkflow('new_alert');
		
		// Forward alert info to UI even when workflow handles it
		try {
			if (typeof process !== "undefined" && typeof process.send === "function") {
				process.send({
					type: "alert-started",
					data: {
						name: alert.missionName || alert.name || "Unknown Alert",
						timestamp: Date.now(),
						alertId: alert.id || null,
						location: alert.location || null,
						workflowTriggered: true
					}
				});
			}
		} catch (e) {
			console.error("Failed to forward alert to UI:", e);
		}
		
		return; // Skip default sound/overlay
	}

	// Default behavior: play sound and show overlay
	try {
		const audioPath = resolveAudioPath(process.env.CUSTOM_ALERT_SOUND);
		const durationMs = process.env.CUSTOM_ALERT_SOUND_DURATION_MS ? parseInt(process.env.CUSTOM_ALERT_SOUND_DURATION_MS, 10) : 0;
		await playAudio(audioPath, durationMs);
		console.log("Playback finished for alert.");
	} catch (e) {
		console.error("Failed to play audio:", e);
	}

	if (process.env.ENABLE_ALERT_OVERLAY === "true") {
		const screenIndex = Number.parseInt(process.env.ALERT_OVERLAY_SCREEN ?? "0", 10);
		const safeScreen = Number.isNaN(screenIndex) ? 0 : screenIndex;

		showAlertOverlay(safeScreen, 3000).catch((e) => {
			console.error("Failed to show alert overlay:", e);
		});
	}

	// Forward alert name to Electron UI for dropdown population
	try {
		if (typeof process !== "undefined" && typeof process.send === "function") {
			process.send({
				type: "alert-started",
				data: {
					name: alert.missionName || alert.name || "Unknown Alert",
					timestamp: Date.now(),
					alertId: alert.id || null,
					location: alert.location || null
				}
			});
		}
	} catch (e) {
		// Non-fatal; just log
		console.error("Failed to send alert-started message:", e.message);
	}
}

export async function test(number) {
	console.log(`\n*** TEST MODE: Custom Alert Sound ${number} ***`);
	try {
		const audioPath = resolveAudioPath(process.env.CUSTOM_ALERT_SOUND);
		const durationMs = process.env.CUSTOM_ALERT_SOUND_DURATION_MS ? parseInt(process.env.CUSTOM_ALERT_SOUND_DURATION_MS, 10) : 0;
		await playAudio(audioPath, durationMs);
		console.log("Test alert sound played successfully!");
	} catch (e) {
		console.error("Test failed:", e.message);
	}
}
