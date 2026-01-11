/**
 * Alert Name Tracker
 * 
 * Tracks the current alert name when an emergency is created
 * Stores it in memory (cleared when app closes)
 * Sends the alert name to the Electron main process/UI
 */

export const event = "EmergencyCreate";
export const name = "Alert_Name_Tracker";

let currentAlertName = null;
let alertStartTime = null;

export async function callback(alert) {
    if (!alert) return;

    // Extract the mission/alert name from the emergency object
    const alertName = alert.missionName || alert.name || "Unknown Alert";
    
    // Store in memory
    currentAlertName = alertName;
    alertStartTime = Date.now();

    console.log(`[AlertNameTracker] Alert started: "${alertName}" at ${new Date(alertStartTime).toISOString()}`);

    // Send to Electron main process
    try {
        if (typeof process !== "undefined" && typeof process.send === "function") {
            process.send({
                type: "alert-started",
                data: {
                    name: alertName,
                    timestamp: alertStartTime,
                    alertId: alert.id || null,
                    location: alert.location || null
                }
            });
            console.log("[AlertNameTracker] Alert data sent to UI");
        }
    } catch (err) {
        console.error("[AlertNameTracker] Failed to send alert data:", err.message);
    }

    // Log additional alert details if in debug mode
    if (process.env.DEBUG_MODE === "true") {
        console.log("[AlertNameTracker] Full alert data:", JSON.stringify(alert, null, 2));
    }
}

export async function test(number) {
    console.log(`\n*** TEST MODE: Alert Name Tracker ${number} ***`);
    
    // Simulate an emergency alert
    const testAlert = {
        missionName: `Test-Alert-${number}`,
        id: `test-${Date.now()}`,
        location: "Test Location",
        origin: 1
    };

    console.log("Simulating alert:", testAlert.missionName);
    await callback(testAlert);
    
    console.log("Alert Name Tracker test completed!");
}

/**
 * Get the current alert name (for internal use)
 */
export function getCurrentAlertName() {
    return currentAlertName;
}

/**
 * Get the alert start time (for internal use)
 */
export function getAlertStartTime() {
    return alertStartTime;
}

/**
 * Clear the alert (called manually or when mission ends)
 */
export function clearAlert() {
    console.log(`[AlertNameTracker] Alert cleared: "${currentAlertName}"`);
    currentAlertName = null;
    alertStartTime = null;
}
