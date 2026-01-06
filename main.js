import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { getApi, getSelf, getWebSocket } from "./lib/medrunnerAPI.js";
import fs from "fs";
import path from "path";
import { removeTeamFromMap } from "./lib/teamOrderPlace.js";
import { playAudio } from "./lib/playAudio.js";
import { resolveAudioPath } from "./lib/resolveAudioPath.js";
import { showAlertOverlay } from "./lib/showAlertOverlay.js";

const api = getApi();
const self = getSelf();
const ws = getWebSocket();

ws.onreconnected(async () => {
	console.log("MedrunnerSocket: Reconnected to the WebSocket");
});

ws.onclose(async () => {
	console.log("MedrunnerSocket: Connection has been lost");
});

// Load features and add them to websockets event listeners

const __dirname = path.dirname(".");

const files = fs.readdirSync(path.join(__dirname, "features"));

for (const file of files) {
	if (file.endsWith(".js")) {
		const module = await import(`./features/${file}`);
		if (process.env["ENABLE_" + module.name.toUpperCase()] === "true") {
			if (module.setup) {
				await module.setup();
			}
			if (module.event && module.callback) {
				ws.on(module.event, module.callback);
				console.log(`Registered event listener ${module.name} for ${module.event} from ${file}`);
			}
		}
	}
}

ws.on("TeamDelete", removeTeamFromMap);

// Listen for messages from electron-main.cjs
process.on("message", async (msg) => {
	if (msg.type === "set-team-position") {
		// Forward position change to teamPositionManager
		console.log(`[Main] Setting team position to: ${msg.position}`);
		const files = fs.readdirSync(path.join(__dirname, "features"));
		for (const file of files) {
			if (file.endsWith(".js")) {
				const module = await import(`./features/${file}`);
				if (module.name === "Team_Position_Manager" && module.setTeamPosition) {
					await module.setTeamPosition(msg.position);
					break;
				}
			}
		}
	} else if (msg.type === "test") {
		// Handle test requests
		console.log(`\n[Test] Running test for: ${msg.feature}`);
		
		// Create a normalized version of the feature name for matching (keep 'sound' so we don't confuse overlay with sound tests)
		const normalizeFeatureName = (name) => {
			return name.toLowerCase().replace(/[-_]/g, "");
		};
		
		const targetFeature = normalizeFeatureName(msg.feature);
		
		// Try to find and run the feature test function
		const files = fs.readdirSync(path.join(__dirname, "features"));
		for (const file of files) {
			if (file.endsWith(".js")) {
				const module = await import(`./features/${file}`);
				if (module.name) {
					const moduleName = normalizeFeatureName(module.name);
					if (moduleName.includes(targetFeature) || targetFeature.includes(moduleName)) {
						console.log(`[Test] Found matching feature: ${module.name}`);
						if (module.test) {
							try {
								await module.test(msg.number);
								console.log(`[Test] Test completed for ${module.name}`);
							} catch (error) {
								console.error(`[Test] Error running test: ${error.message}`);
							}
							// Send team members if this was a team members test
							if (module.lastTeamMembers) {
								process.send({
									type: "team-members",
									data: module.lastTeamMembers
								});
							}
						} else {
							console.warn(`[Test] Module ${module.name} has no test() function`);
						}
						break;
					}
				}
			}
		}
	} else if (msg.type === "get-team-members") {
		// Get current team members from Team_Members feature
		const files = fs.readdirSync(path.join(__dirname, "features"));
		for (const file of files) {
			if (file.endsWith(".js")) {
				const module = await import(`./features/${file}`);
				if (module.name === "Team_Members" && module.lastTeamMembers) {
					process.send({
						type: "team-members",
						data: module.lastTeamMembers
					});
					break;
				}
			}
		}
	} else if (msg.type === "test-alert-full") {
		try {
			console.log("\n[Test] Alert Test Full: playing sound and showing overlay");
			// Play alert sound using current settings
			const soundPath = process.env.CUSTOM_ALERT_SOUND;
			if (soundPath) {
				const absPath = resolveAudioPath(soundPath);
				playAudio(absPath);
				console.log(`[Test] Playing alert sound: ${absPath}`);
			} else {
				console.warn("[Test] No CUSTOM_ALERT_SOUND configured");
			}
			// Show overlay according to settings
			const allMonitors = process.env.ALERT_OVERLAY_ALL_MONITORS === 'true';
			const monitorIndex = parseInt(process.env.ALERT_OVERLAY_MONITOR_INDEX || '0', 10);
			const overlayConfig = allMonitors ? { allMonitors: true } : { monitorIndex: monitorIndex };
			overlayConfig.durationMs = parseInt(process.env.OVERLAY_DURATION_MS || '3000', 10);
			overlayConfig.textPercent = parseInt(process.env.OVERLAY_TEXT_SIZE_PERCENT || '100', 10);
			overlayConfig.position = (process.env.OVERLAY_POSITION === 'center') ? 'center' : 'top';
			overlayConfig.borderStyle = process.env.OVERLAY_BORDER_STYLE || 'glow';
			overlayConfig.backgroundStyle = process.env.OVERLAY_BACKGROUND_STYLE || 'none';
			await showAlertOverlay(overlayConfig, overlayConfig.durationMs);
			console.log("[Test] Overlay displayed successfully");
		} catch (error) {
			console.error(`[Test] Alert Test Full error: ${error.message}`);
		}
	}
});