/**
 * Alert Timer Module
 * 
 * Handles mission timer functionality for After Action Report:
 * - Tracks mission phases (Alert, Depart, Client, RTB)
 * - Auto-populates elapsed time to AAR fields
 * - Displays formatted countdown (MM:SS:cs)
 * 
 * @module alert-timer
 */

// ============================================================================
// TIMER STAGE DEFINITIONS
// ============================================================================

/**
 * Timer stages in order
 * Each stage has an associated AAR field to auto-populate with elapsed minutes
 * @type {Array<{id: string, label: string, buttonText: string, field: string|null}>}
 */
const TIMER_STAGES = [
    { id: "idle", label: "Ready", buttonText: "Start Timer", field: null },
    { id: "alert", label: "Alert", buttonText: "Depart", field: "aar-alert" },
    { id: "depart", label: "En Route", buttonText: "Client", field: "aar-depart" },
    { id: "client", label: "On Scene", buttonText: "RTB", field: "aar-client" },
    { id: "rtb", label: "Complete", buttonText: "Reset", field: "aar-rtb" }
];

// ============================================================================
// GLOBAL TIMER STATE
// ============================================================================

let timerStageIndex = 0;
let timerStartTime = null;
let timerIntervalId = null;

// ============================================================================
// TIMER DISPLAY & BUTTON
// ============================================================================

/**
 * Updates the timer button text based on current stage
 */
function updateTimerButton() {
    const button = document.getElementById("alert-timer-button");
    if (!button) return;

    const stage = TIMER_STAGES[timerStageIndex];
    button.textContent = stage.buttonText;

    // Update button styling
    button.className = "rounded-lg px-6 py-3 text-base font-bold text-white transition border ";

    if (timerStageIndex === 0) {
        // Idle - green
        button.className += "bg-green-600 hover:bg-green-700 border-green-500";
    } else if (timerStageIndex === TIMER_STAGES.length - 1) {
        // Complete - blue
        button.className += "bg-blue-600 border-blue-500 cursor-default";
    } else {
        // Active - amber
        button.className += "bg-amber-600 hover:bg-amber-700 border-amber-500";
    }
}

/**
 * Updates the timer display (MM:SS:cs format) and current stage label
 */
function updateTimerDisplay() {
    const display = document.getElementById("alert-timer-display");
    const stageLabel = document.getElementById("alert-timer-stage");
    
    if (!display) return;

    if (timerStartTime) {
        const elapsedMs = Date.now() - timerStartTime;
        const totalSeconds = Math.floor(elapsedMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor((elapsedMs % 1000) / 10);
        display.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${centiseconds.toString().padStart(2, "0")}`;
    } else {
        display.textContent = "00:00:00";
    }

    if (stageLabel) {
        const stage = TIMER_STAGES[timerStageIndex];
        stageLabel.textContent = stage.label;
    }
}

// ============================================================================
// TIMER CONTROL
// ============================================================================

/**
 * Advances the timer to the next stage and auto-fills AAR field with elapsed minutes
 */
function advanceAlertTimer() {
    const currentStage = TIMER_STAGES[timerStageIndex];

    if (timerStageIndex === 0) {
        // Starting the timer
        timerStartTime = Date.now();
        timerStageIndex = 1;

        // Set Alert field to 00
        const alertField = document.getElementById("aar-alert");
        if (alertField) {
            alertField.value = "00";
            alertField.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // Start display update interval
        if (timerIntervalId) clearInterval(timerIntervalId);
        timerIntervalId = setInterval(updateTimerDisplay, 50);
        updateTimerDisplay();

    } else if (timerStageIndex < TIMER_STAGES.length - 1) {
        // Advancing to next stage
        timerStageIndex++;
        const newStage = TIMER_STAGES[timerStageIndex];

        // Calculate elapsed minutes
        const elapsedMs = Date.now() - timerStartTime;
        const elapsedMinutes = Math.floor(elapsedMs / 60000);

        // Fill in the AAR field for this stage
        if (newStage.field) {
            const field = document.getElementById(newStage.field);
            if (field) {
                field.value = elapsedMinutes.toString();
                field.dispatchEvent(new Event("input", { bubbles: true }));
            }
        }

        // If this is the last stage (RTB), show reminder and auto-reset after 3 seconds
        if (timerStageIndex === TIMER_STAGES.length - 1) {
            showTimerReminder("✅ Mission complete! Use RTB status to finish.", 5000);
            setTimeout(() => {
                resetAlertTimer(false);
            }, 3000);
        }
    }

    updateTimerButton();
    if (timerIntervalId && timerStageIndex > 0 && timerStageIndex < TIMER_STAGES.length - 1) {
        updateTimerDisplay();
    }
}

/**
 * Resets the timer to idle state
 * @param {boolean} clearTimestamps - Whether to clear AAR timestamp fields
 */
function resetAlertTimer(clearTimestamps = false) {
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }

    timerStageIndex = 0;
    timerStartTime = null;

    // Clear AAR timestamp fields if requested
    if (clearTimestamps) {
        const fields = ["aar-alert", "aar-depart", "aar-client", "aar-rtb"];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = "";
                field.dispatchEvent(new Event("input", { bubbles: true }));
            }
        });
    }

    updateTimerButton();
    updateTimerDisplay();
}

/**
 * Confirms and resets the timer with warning about clearing AAR timestamps
 */
function confirmResetAlertTimer() {
    if (!timerStartTime) {
        resetAlertTimer(false);
        return;
    }

    const message = "Reset the timer?\n\nThis will also clear the AAR timestamp fields (Alert, Depart, Client, RTB).";

    if (confirm(message)) {
        resetAlertTimer(true);
    }
}

/**
 * Shows a brief reminder message
 * @param {string} message - The reminder text
 * @param {number} duration - Duration in ms
 */
function showTimerReminder(message, duration = 4000) {
    const reminder = document.getElementById("timer-reminder");
    const reminderText = document.getElementById("timer-reminder-text");
    
    if (!reminder || !reminderText) return;

    reminderText.textContent = message;
    reminder.classList.remove("hidden");

    setTimeout(() => {
        reminder.classList.add("hidden");
    }, duration);
}

/**
 * Initialize timer on page load
 */
function initializeAlertTimer() {
    updateTimerButton();
    updateTimerDisplay();

    const timerBtn = document.getElementById("alert-timer-button");
    if (timerBtn) {
        timerBtn.addEventListener("click", advanceAlertTimer);
    }

    const resetBtn = document.getElementById("alert-timer-reset");
    if (resetBtn) {
        resetBtn.addEventListener("click", confirmResetAlertTimer);
    }
}

// Export for use in other modules
export {
    TIMER_STAGES,
    advanceAlertTimer,
    resetAlertTimer,
    confirmResetAlertTimer,
    updateTimerDisplay,
    updateTimerButton,
    showTimerReminder,
    initializeAlertTimer
};
