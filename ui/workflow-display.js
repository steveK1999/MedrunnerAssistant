/**
 * Workflow Display Window
 * 
 * Displays workflow pages in a separate window
 * Handles page navigation and button actions
 */

const { ipcRenderer } = require('electron');

let workflow = null;
let currentPageIndex = 0;

// Initialize when window loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('[Workflow Display] Window loaded');
    
    // Request workflow data from main process
    ipcRenderer.send('workflow-display-ready');
});

// Receive workflow data
ipcRenderer.on('workflow-data', (event, workflowData) => {
    console.log('[Workflow Display] Received workflow data:', workflowData);
    workflow = workflowData;
    currentPageIndex = 0;
    renderCurrentPage();
});

// Navigate to specific page
ipcRenderer.on('navigate-to-page', (event, pageId) => {
    if (!workflow) return;
    
    const pageIndex = workflow.pages.findIndex(p => p.id === pageId);
    if (pageIndex !== -1) {
        currentPageIndex = pageIndex;
        renderCurrentPage();
    }
});

// Render current page
function renderCurrentPage() {
    if (!workflow || !workflow.pages || workflow.pages.length === 0) {
        document.getElementById('workflow-title').textContent = 'Kein Workflow';
        document.getElementById('page-indicator').textContent = '';
        document.getElementById('buttons-container').innerHTML = '<div class="no-buttons">Keine Seiten vorhanden</div>';
        return;
    }
    
    const currentPage = workflow.pages[currentPageIndex];
    
    // Update header
    document.getElementById('workflow-title').textContent = workflow.name || 'Workflow';
    document.getElementById('page-indicator').textContent = `Seite ${currentPageIndex + 1} / ${workflow.pages.length}`;
    
    // Render buttons
    const buttonsContainer = document.getElementById('buttons-container');
    buttonsContainer.innerHTML = '';
    
    if (!currentPage.buttons || currentPage.buttons.length === 0) {
        buttonsContainer.innerHTML = '<div class="no-buttons">Keine Buttons auf dieser Seite</div>';
    } else {
        currentPage.buttons.forEach(button => {
            const buttonElement = document.createElement('button');
            buttonElement.className = 'workflow-button';
            buttonElement.textContent = button.label || 'Button';
            buttonElement.style.backgroundColor = button.color || '#3b82f6';
            
            buttonElement.addEventListener('click', () => {
                handleButtonClick(button);
            });
            
            buttonsContainer.appendChild(buttonElement);
        });
    }
    
    // Update navigation buttons
    updateNavigationButtons();
}

// Update navigation buttons state
function updateNavigationButtons() {
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    
    if (!workflow || !workflow.pages) {
        prevButton.disabled = true;
        nextButton.disabled = true;
        return;
    }
    
    prevButton.disabled = currentPageIndex === 0;
    nextButton.disabled = currentPageIndex >= workflow.pages.length - 1;
}

// Handle button click
async function handleButtonClick(button) {
    console.log('[Workflow Display] Button clicked:', button.label);
    
    if (!button.actions || button.actions.length === 0) {
        return;
    }
    
    for (const action of button.actions) {
        await executeAction(action);
    }
}

// Execute a single action
async function executeAction(action) {
    console.log('[Workflow Display] Executing action:', action.type);
    
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
                    console.log('[Workflow Display] Text copied:', action.text);
                    // Optional: Show a brief notification
                    showNotification('Text kopiert');
                } catch (e) {
                    console.error('[Workflow Display] Failed to copy text:', e);
                }
            }
            break;
            
        case 'timer':
            // Send timer action to main window
            ipcRenderer.send('workflow-timer-action', action.action);
            break;
            
        case 'end':
            console.log('[Workflow Display] Workflow ended');
            // Reset to first page
            currentPageIndex = 0;
            renderCurrentPage();
            // Optionally close window after a delay
            setTimeout(() => {
                window.close();
            }, 500);
            break;
    }
}

// Navigate to page by ID
function navigateToPage(pageId) {
    if (!workflow) return;
    
    const pageIndex = workflow.pages.findIndex(p => p.id === pageId);
    if (pageIndex !== -1) {
        currentPageIndex = pageIndex;
        renderCurrentPage();
    }
}

// Navigate to previous page
function previousPage() {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        renderCurrentPage();
    }
}

// Navigate to next page
function nextPage() {
    if (workflow && currentPageIndex < workflow.pages.length - 1) {
        currentPageIndex++;
        renderCurrentPage();
    }
}

// Show notification
function showNotification(message) {
    // Simple notification - could be enhanced
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: #10b981;
        color: white;
        border-radius: 6px;
        font-weight: 500;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Event listeners for navigation buttons
document.getElementById('prev-button').addEventListener('click', previousPage);
document.getElementById('next-button').addEventListener('click', nextPage);
