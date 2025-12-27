import { showAlertOverlay } from "../lib/showAlertOverlay.js";

export const name = "Alert_Overlay_Test";

export async function test(number) {
	console.log(`\n*** TEST MODE: Alert Overlay ${number} ***`);
	try {
		// Get the overlay settings from environment or use defaults
		const allMonitors = process.env.ALERT_OVERLAY_ALL_MONITORS === 'true';
		const monitorIndex = parseInt(process.env.ALERT_OVERLAY_MONITOR_INDEX || '0', 10);
		const durationMs = parseInt(process.env.OVERLAY_DURATION_MS || '3000', 10);
		const textPercent = parseInt(process.env.OVERLAY_TEXT_SIZE_PERCENT || '100', 10);
		const position = (process.env.OVERLAY_POSITION === 'center') ? 'center' : 'top';
		const borderStyle = process.env.OVERLAY_BORDER_STYLE || 'glow';
		const backgroundStyle = process.env.OVERLAY_BACKGROUND_STYLE || 'none';
		
		const overlayConfig = allMonitors 
			? { allMonitors: true }
			: { monitorIndex: monitorIndex };
		overlayConfig.durationMs = durationMs;
		overlayConfig.position = position;
		overlayConfig.textPercent = textPercent;
		overlayConfig.borderStyle = borderStyle;
		overlayConfig.backgroundStyle = backgroundStyle;

		await showAlertOverlay(overlayConfig, durationMs);
		console.log("Test overlay displayed successfully!");
	} catch (e) {
		console.error("Test failed:", e.message);
	}
}
