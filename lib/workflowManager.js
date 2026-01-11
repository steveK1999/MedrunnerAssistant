/**
 * Alert Workflow Manager
 * 
 * Manages workflow configurations with pages, buttons, and actions
 * Each workflow consists of pages with buttons that trigger various actions
 */

// ============================================================================
// WORKFLOW DATA MODEL
// ============================================================================

/**
 * Workflow structure:
 * {
 *   name: string,
 *   pages: [
 *     {
 *       id: number,
 *       buttons: [
 *         {
 *           id: string,
 *           label: string,
 *           color: string (hex color),
 *           actions: [
 *             { type: 'navigate', targetPage: number } |
 *             { type: 'copy', text: string } |
 *             { type: 'timer', action: 'start' | 'stop' | 'advance' | 'reset' } |
 *             { type: 'end' }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

const WORKFLOW_STORAGE_KEY = "mrs_alert_workflow";

let currentWorkflow = null;
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
    currentWorkflow,
    currentPageIndex
};
