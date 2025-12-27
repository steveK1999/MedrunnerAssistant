import { screen } from "electron";

export function getAvailableMonitors() {
	try {
		const displays = screen.getAllDisplays();
		return displays.map((display, index) => ({
			id: display.id,
			name: `Monitor ${index + 1}${display.primary ? ' (Hauptmonitor)' : ''}`,
			index: index,
			x: display.bounds.x,
			y: display.bounds.y,
			width: display.bounds.width,
			height: display.bounds.height,
			primary: display.primary
		}));
	} catch (error) {
		console.error('Failed to get monitors:', error);
		return [{ id: 0, name: 'Monitor 1 (Hauptmonitor)', index: 0, primary: true }];
	}
}

export function getMonitorByIndex(index) {
	const monitors = getAvailableMonitors();
	return monitors[index] || monitors[0];
}

export function getPrimaryMonitor() {
	const monitors = getAvailableMonitors();
	return monitors.find(m => m.primary) || monitors[0];
}
