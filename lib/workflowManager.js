/**
 * Workflow Manager
 * 
 * Manages workflow execution based on triggers
 * - Loads workflow from localStorage
 * - Checks trigger conditions (event type, position, alert type)
 * - Triggers workflows when conditions are met
 * - Prevents default behavior (sounds/overlays) when workflow is active
 */

const WORKFLOW_STORAGE_KEY = "mrs_workflow";

let currentWorkflow = null;
let isWorkflowActive = false;
let currentPosition = null;
let currentPageIndex = 0;

/**
 * Creates a new empty workflow
 */
function createNewWorkflow(name = "Neuer Workflow") {
    return {
        name: name,
        pages: [
            {
                id: 1,
                buttons: []
            }
        ]
    };
}

/**
 * Saves workflow to localStorage
 */
function saveWorkflow(workflow) {
    try {
        localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflow));
        console.log("Workflow saved:", workflow.name);
        return true;
    } catch (e) {
        console.error("Failed to save workflow:", e);
        return false;
    }
}

/**
 * Loads workflow from localStorage
 */
function loadWorkflow() {
    try {
        const stored = localStorage.getItem(WORKFLOW_STORAGE_KEY);
        if (stored) {
            currentWorkflow = JSON.parse(stored);
            currentPageIndex = 0;
            console.log("Workflow loaded:", currentWorkflow.name);
            return currentWorkflow;
        }
    } catch (e) {
        console.error("Failed to load workflow:", e);
    }
    return null;
}

/**
 * Adds a new page to the workflow
 */
function addPage(workflow) {
    const maxId = Math.max(0, ...workflow.pages.map(p => p.id));
    workflow.pages.push({
        id: maxId + 1,
        buttons: []
    });
    return workflow;
}

/**
 * Removes a page from the workflow
 */
function removePage(workflow, pageId) {
    workflow.pages = workflow.pages.filter(p => p.id !== pageId);
    return workflow;
}

/**
 * Adds a button to a page
 */
function addButton(workflow, pageId, buttonData) {
    const page = workflow.pages.find(p => p.id === pageId);
    if (page) {
        const buttonId = `btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        page.buttons.push({
            id: buttonId,
            label: buttonData.label || "Neuer Button",
            color: buttonData.color || "#3b82f6",
            actions: buttonData.actions || []
        });
    }
    return workflow;
}

/**
 * Updates a button
 */
function updateButton(workflow, pageId, buttonId, buttonData) {
    const page = workflow.pages.find(p => p.id === pageId);
    if (page) {
        const button = page.buttons.find(b => b.id === buttonId);
        if (button) {
            Object.assign(button, buttonData);
        }
    }
    return workflow;
}

/**
 * Removes a button from a page
 */
function removeButton(workflow, pageId, buttonId) {
    const page = workflow.pages.find(p => p.id === pageId);
    if (page) {
        page.buttons = page.buttons.filter(b => b.id !== buttonId);
    }
    return workflow;
}

/**
 * Gets the current page
 */
function getCurrentPage(workflow, pageIndex = currentPageIndex) {
    if (workflow && workflow.pages && workflow.pages[pageIndex]) {
        return workflow.pages[pageIndex];
    }
    return null;
}

/**
 * Navigates to a specific page
 */
function navigateToPage(pageId) {
    if (currentWorkflow) {
        const index = currentWorkflow.pages.findIndex(p => p.id === pageId);
        if (index !== -1) {
            currentPageIndex = index;
            return currentPageIndex;
        }
    }
    return -1;
}

/**
 * Navigates to next page
 */
function nextPage() {
    if (currentWorkflow && currentPageIndex < currentWorkflow.pages.length - 1) {
        currentPageIndex++;
        return currentPageIndex;
    }
    return currentPageIndex;
}

/**
 * Navigates to previous page
 */
function previousPage() {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        return currentPageIndex;
    }
    return currentPageIndex;
}

/**
 * Executes button actions
 */
async function executeButtonActions(button) {
    if (!button || !button.actions) return;

    for (const action of button.actions) {
        switch (action.type) {
            case 'navigate':
                if (action.targetPage) {
                    navigateToPage(action.targetPage);
                }
                break;

            case 'copy':
                if (action.text) {
                    try {
                        await navigator.clipboard.writeText(action.text);
                        console.log("Text copied:", action.text);
                    } catch (e) {
                        console.error("Failed to copy text:", e);
                    }
                }
                break;

            case 'timer':
                if (action.action && window.advanceAlertTimer) {
                    switch (action.action) {
                        case 'advance':
                            window.advanceAlertTimer();
                            break;
                        case 'reset':
                            if (window.resetAlertTimer) {
                                window.resetAlertTimer(false);
                            }
                            break;
                        // Add more timer actions as needed
                    }
                }
                break;

            case 'end':
                console.log("Workflow ended");
                // Reset to first page
                currentPageIndex = 0;
                break;
        }
    }
}

// ============================================================================
// POSITION TRACKING
// ============================================================================

/**
 * Set current team position
 * @param {number} position - Current team position
 */
function setPosition(position) {
    currentPosition = position;
    console.log("Team position updated:", position);
}

// ============================================================================
// ALERT TYPE DETECTION
// ============================================================================

/**
 * Determine alert type from alert data
 * @param {Object} alert - Alert object
 * @returns {string} Alert type: 'PVE', 'PVP', or 'Non-Threat'
 */
function getAlertType(alert) {
    // Check if alert has threat level or type information
    if (alert.threatLevel) {
        const level = alert.threatLevel.toLowerCase();
        if (level.includes('pve')) return 'PVE';
        if (level.includes('pvp')) return 'PVP';
        if (level.includes('non') || level.includes('none')) return 'Non-Threat';
    }
    
    // Check alert type or category
    if (alert.type) {
        const type = alert.type.toLowerCase();
        if (type.includes('pve') || type.includes('medical') || type.includes('rescue')) return 'PVE';
        if (type.includes('pvp') || type.includes('combat') || type.includes('hostile')) return 'PVP';
    }
    
    // Check alert description or notes
    if (alert.description) {
        const desc = alert.description.toLowerCase();
        if (desc.includes('combat') || desc.includes('hostile') || desc.includes('pvp')) return 'PVP';
        if (desc.includes('medical') || desc.includes('rescue') || desc.includes('pve')) return 'PVE';
    }
    
    // Default to Non-Threat if unclear
    return 'Non-Threat';
}

// ============================================================================
// TRIGGER CHECKING
// ============================================================================

/**
 * Check if workflow should trigger on team join
 * @returns {boolean} True if workflow should trigger
 */
function shouldTriggerOnTeamJoin() {
    const workflow = loadWorkflow();
    if (!workflow || !workflow.enabled) return false;
    
    return workflow.trigger && workflow.trigger.type === 'team_join';
}

/**
 * Check if workflow should trigger on chat message
 * @returns {boolean} True if workflow should trigger
 */
function shouldTriggerOnChatMessage() {
    const workflow = loadWorkflow();
    if (!workflow || !workflow.enabled) return false;
    
    return workflow.trigger && workflow.trigger.type === 'chat_message';
}

/**
 * Check if workflow should trigger on new alert
 * @param {Object} alert - Alert object
 * @returns {boolean} True if workflow should trigger
 */
function shouldTriggerOnNewAlert(alert) {
    const workflow = loadWorkflow();
    if (!workflow || !workflow.enabled) return false;
    
    // Check if trigger type is new_alert
    if (!workflow.trigger || workflow.trigger.type !== 'new_alert') return false;
    
    // Check position requirement (alert only triggers if team is position 1)
    if (currentPosition !== 1) {
        console.log("Alert workflow not triggered - team is not position 1 (current:", currentPosition, ")");
        return false;
    }
    
    // Check alert type filters
    if (workflow.trigger.alertTypes && workflow.trigger.alertTypes.length > 0) {
        const alertType = getAlertType(alert);
        if (!workflow.trigger.alertTypes.includes(alertType)) {
            console.log("Alert workflow not triggered - alert type", alertType, "not in filters:", workflow.trigger.alertTypes);
            return false;
        }
    }
    
    return true;
}

// ============================================================================
// WORKFLOW STATE
// ============================================================================

/**
 * Check if workflow is currently running
 * @returns {boolean} True if workflow is active
 */
function isWorkflowRunning() {
    return isWorkflowActive;
}

/**
 * Trigger workflow execution
 * @param {string} triggerType - Type of trigger ('team_join', 'chat_message', 'new_alert')
 */
function triggerWorkflow(triggerType) {
    const workflow = loadWorkflow();
    if (!workflow) return;
    
    isWorkflowActive = true;
    currentPageIndex = 0;
    console.log("Workflow triggered by:", triggerType);
    
    // Send IPC message to main window to show workflow UI
    if (window.electronAPI && window.electronAPI.send) {
        window.electronAPI.send('workflow-triggered', {
            workflow: workflow,
            triggerType: triggerType
        });
    }
}

/**
 * End workflow execution
 */
function endWorkflow() {
    isWorkflowActive = false;
    currentPageIndex = 0;
    console.log("Workflow ended");
}

// Export functions
export {
    createNewWorkflow,
    saveWorkflow,
    loadWorkflow,
    addPage,
    removePage,
    addButton,
    updateButton,
    removeButton,
    getCurrentPage,
    navigateToPage,
    nextPage,
    previousPage,
    executeButtonActions,
    setPosition,
    getAlertType,
    shouldTriggerOnTeamJoin,
    shouldTriggerOnChatMessage,
    shouldTriggerOnNewAlert,
    isWorkflowRunning,
    triggerWorkflow,
    endWorkflow,
    currentWorkflow,
    currentPageIndex
};
