/**
 * Alert Workflow Builder
 * Visual editor for creating alert workflows with pages and buttons
 */

const { ipcRenderer } = require('electron');

// State
let currentWorkflow = null;
let currentPageIndex = 0;
let editingButton = null;
let editingActions = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeBuilder();
    loadOrCreateWorkflow();
    setupEventListeners();
});

function initializeBuilder() {
    console.log('[Builder] Initializing workflow builder');
}

function loadOrCreateWorkflow() {
    // Load from localStorage or create new
    const stored = localStorage.getItem('mrs_alert_workflow');
    if (stored) {
        try {
            currentWorkflow = JSON.parse(stored);
            console.log('[Builder] Loaded workflow:', currentWorkflow.name);
        } catch (e) {
            console.error('[Builder] Failed to parse workflow:', e);
            currentWorkflow = createNewWorkflow();
        }
    } else {
        currentWorkflow = createNewWorkflow();
    }
    
    document.getElementById('workflow-name').value = currentWorkflow.name;
    renderPageList();
    renderCurrentPage();
}

function createNewWorkflow() {
    return {
        name: 'Neuer Workflow',
        pages: [
            { id: 1, buttons: [] }
        ]
    };
}

function saveWorkflow() {
    if (!currentWorkflow) return;
    
    currentWorkflow.name = document.getElementById('workflow-name').value || 'Neuer Workflow';
    
    try {
        localStorage.setItem('mrs_alert_workflow', JSON.stringify(currentWorkflow));
        console.log('[Builder] Workflow saved');
        
        // Notify main window
        ipcRenderer.send('workflow-updated', currentWorkflow);
        
        showNotification('Workflow gespeichert!');
    } catch (e) {
        console.error('[Builder] Failed to save workflow:', e);
        showNotification('Fehler beim Speichern!', 'error');
    }
}

function showNotification(message, type = 'success') {
    // Simple notification (could be enhanced)
    alert(message);
}

// Page Management
function addPage() {
    const maxId = Math.max(0, ...currentWorkflow.pages.map(p => p.id));
    currentWorkflow.pages.push({
        id: maxId + 1,
        buttons: []
    });
    renderPageList();
    currentPageIndex = currentWorkflow.pages.length - 1;
    renderCurrentPage();
}

function deletePage() {
    if (currentWorkflow.pages.length <= 1) {
        alert('Mindestens eine Seite muss vorhanden sein!');
        return;
    }
    
    if (confirm('Seite wirklich löschen?')) {
        currentWorkflow.pages.splice(currentPageIndex, 1);
        if (currentPageIndex >= currentWorkflow.pages.length) {
            currentPageIndex = currentWorkflow.pages.length - 1;
        }
        renderPageList();
        renderCurrentPage();
    }
}

function selectPage(index) {
    currentPageIndex = index;
    renderPageList();
    renderCurrentPage();
}

function nextPage() {
    if (currentPageIndex < currentWorkflow.pages.length - 1) {
        currentPageIndex++;
        renderPageList();
        renderCurrentPage();
    }
}

function previousPage() {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        renderPageList();
        renderCurrentPage();
    }
}

function renderPageList() {
    const list = document.getElementById('page-list');
    list.innerHTML = '';
    
    currentWorkflow.pages.forEach((page, index) => {
        const li = document.createElement('li');
        li.textContent = `Seite ${page.id}`;
        li.className = index === currentPageIndex ? 'active' : '';
        li.onclick = () => selectPage(index);
        list.appendChild(li);
    });
}

function renderCurrentPage() {
    const page = currentWorkflow.pages[currentPageIndex];
    if (!page) return;
    
    // Update page number
    document.getElementById('page-number').textContent = `Seite ${page.id}`;
    document.getElementById('page-indicator').textContent = 
        `${currentPageIndex + 1} / ${currentWorkflow.pages.length}`;
    
    // Update navigation buttons
    document.getElementById('prev-page-btn').disabled = currentPageIndex === 0;
    document.getElementById('next-page-btn').disabled = 
        currentPageIndex === currentWorkflow.pages.length - 1;
    
    // Render buttons
    const preview = document.getElementById('page-preview');
    preview.innerHTML = '';
    
    if (page.buttons.length === 0) {
        preview.innerHTML = '<p style="text-align: center; color: #888; margin-top: 2rem;">Keine Buttons vorhanden. Klicke auf "Button hinzufügen".</p>';
        return;
    }
    
    page.buttons.forEach(button => {
        const container = document.createElement('div');
        container.className = 'workflow-button-container';
        
        const btn = document.createElement('button');
        btn.className = 'workflow-button';
        btn.textContent = button.label;
        btn.style.backgroundColor = button.color;
        btn.onclick = () => executeButton(button);
        
        const actions = document.createElement('div');
        actions.className = 'button-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.textContent = 'Edit';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            openButtonEditor(button);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = 'Del';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteButton(button.id);
        };
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        container.appendChild(btn);
        container.appendChild(actions);
        preview.appendChild(container);
    });
}

// Button Management
function addButton() {
    editingButton = null;
    editingActions = [];
    openButtonEditor();
}

function openButtonEditor(button = null) {
    editingButton = button;
    editingActions = button ? [...button.actions] : [];
    
    const modal = document.getElementById('button-modal');
    const title = document.getElementById('modal-title');
    
    if (button) {
        title.textContent = 'Button bearbeiten';
        document.getElementById('button-label').value = button.label;
        document.getElementById('button-color').value = button.color;
        document.getElementById('button-color-hex').value = button.color;
    } else {
        title.textContent = 'Neuen Button erstellen';
        document.getElementById('button-label').value = '';
        document.getElementById('button-color').value = '#3b82f6';
        document.getElementById('button-color-hex').value = '#3b82f6';
    }
    
    renderActionsList();
    modal.style.display = 'flex';
}

function closeButtonEditor() {
    document.getElementById('button-modal').style.display = 'none';
}

function saveButton() {
    const label = document.getElementById('button-label').value.trim();
    if (!label) {
        alert('Bitte Button-Text eingeben!');
        return;
    }
    
    const color = document.getElementById('button-color').value;
    const page = currentWorkflow.pages[currentPageIndex];
    
    if (editingButton) {
        // Update existing button
        editingButton.label = label;
        editingButton.color = color;
        editingButton.actions = editingActions;
    } else {
        // Create new button
        const buttonId = `btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        page.buttons.push({
            id: buttonId,
            label: label,
            color: color,
            actions: editingActions
        });
    }
    
    closeButtonEditor();
    renderCurrentPage();
}

function deleteButton(buttonId) {
    if (confirm('Button wirklich löschen?')) {
        const page = currentWorkflow.pages[currentPageIndex];
        page.buttons = page.buttons.filter(b => b.id !== buttonId);
        renderCurrentPage();
    }
}

function executeButton(button) {
    console.log('[Builder] Execute button:', button.label);
    // In builder, just log - actual execution happens in main app
    alert(`Button "${button.label}" würde folgende Aktionen ausführen:\n\n${
        button.actions.map(a => getActionDescription(a)).join('\n')
    }`);
}

// Action Management
function openActionEditor() {
    const modal = document.getElementById('action-modal');
    
    // Reset form
    document.getElementById('action-type').value = '';
    hideAllActionOptions();
    
    // Populate page list for navigation
    populatePageSelect();
    
    modal.style.display = 'flex';
}

function closeActionEditor() {
    document.getElementById('action-modal').style.display = 'none';
}

function saveAction() {
    const type = document.getElementById('action-type').value;
    if (!type) {
        alert('Bitte Aktionstyp auswählen!');
        return;
    }
    
    const action = { type };
    
    switch (type) {
        case 'navigate':
            const targetPage = parseInt(document.getElementById('target-page').value);
            if (!targetPage) {
                alert('Bitte Ziel-Seite auswählen!');
                return;
            }
            action.targetPage = targetPage;
            break;
            
        case 'copy':
            const text = document.getElementById('copy-text').value.trim();
            if (!text) {
                alert('Bitte Text eingeben!');
                return;
            }
            action.text = text;
            break;
            
        case 'timer':
            action.action = document.getElementById('timer-action').value;
            break;
            
        case 'end':
            // No additional data needed
            break;
    }
    
    editingActions.push(action);
    renderActionsList();
    closeActionEditor();
}

function removeAction(index) {
    editingActions.splice(index, 1);
    renderActionsList();
}

function renderActionsList() {
    const list = document.getElementById('actions-list');
    list.innerHTML = '';
    
    if (editingActions.length === 0) {
        list.innerHTML = '<p style="color: #888; font-size: 0.875rem;">Keine Aktionen hinzugefügt</p>';
        return;
    }
    
    editingActions.forEach((action, index) => {
        const item = document.createElement('div');
        item.className = 'action-item';
        
        const info = document.createElement('div');
        info.className = 'action-info';
        
        const typeDiv = document.createElement('div');
        typeDiv.className = 'action-type';
        typeDiv.textContent = getActionTypeName(action.type);
        
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'action-details';
        detailsDiv.textContent = getActionDescription(action);
        
        info.appendChild(typeDiv);
        info.appendChild(detailsDiv);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-action-btn';
        removeBtn.textContent = 'Entfernen';
        removeBtn.onclick = () => removeAction(index);
        
        item.appendChild(info);
        item.appendChild(removeBtn);
        list.appendChild(item);
    });
}

function getActionTypeName(type) {
    const names = {
        'navigate': 'Navigation',
        'copy': 'Text kopieren',
        'timer': 'Timer',
        'end': 'Workflow beenden'
    };
    return names[type] || type;
}

function getActionDescription(action) {
    switch (action.type) {
        case 'navigate':
            return `Weiter zu Seite ${action.targetPage}`;
        case 'copy':
            return `Kopiere: "${action.text.substring(0, 50)}${action.text.length > 50 ? '...' : ''}"`;
        case 'timer':
            const timerActions = {
                'advance': 'Timer fortsetzen',
                'reset': 'Timer zurücksetzen'
            };
            return timerActions[action.action] || action.action;
        case 'end':
            return 'Workflow beenden';
        default:
            return action.type;
    }
}

function populatePageSelect() {
    const select = document.getElementById('target-page');
    select.innerHTML = '<option value="">Bitte wählen...</option>';
    
    currentWorkflow.pages.forEach(page => {
        const option = document.createElement('option');
        option.value = page.id;
        option.textContent = `Seite ${page.id}`;
        select.appendChild(option);
    });
}

function hideAllActionOptions() {
    document.getElementById('navigate-options').style.display = 'none';
    document.getElementById('copy-options').style.display = 'none';
    document.getElementById('timer-options').style.display = 'none';
    document.getElementById('end-options').style.display = 'none';
}

// Event Listeners
function setupEventListeners() {
    // Header
    document.getElementById('save-workflow-btn').onclick = saveWorkflow;
    document.getElementById('close-builder-btn').onclick = () => {
        if (confirm('Änderungen speichern?')) {
            saveWorkflow();
        }
        window.close();
    };
    
    // Page management
    document.getElementById('add-page-btn').onclick = addPage;
    document.getElementById('delete-page-btn').onclick = deletePage;
    document.getElementById('prev-page-btn').onclick = previousPage;
    document.getElementById('next-page-btn').onclick = nextPage;
    
    // Button management
    document.getElementById('add-button-btn').onclick = addButton;
    document.getElementById('close-modal-btn').onclick = closeButtonEditor;
    document.getElementById('save-button-btn').onclick = saveButton;
    document.getElementById('cancel-button-btn').onclick = closeButtonEditor;
    
    // Color picker sync
    const colorInput = document.getElementById('button-color');
    const colorHex = document.getElementById('button-color-hex');
    colorInput.oninput = () => colorHex.value = colorInput.value;
    colorHex.oninput = () => {
        if (/^#[0-9A-F]{6}$/i.test(colorHex.value)) {
            colorInput.value = colorHex.value;
        }
    };
    
    // Action management
    document.getElementById('add-action-btn').onclick = openActionEditor;
    document.getElementById('close-action-modal-btn').onclick = closeActionEditor;
    document.getElementById('save-action-btn').onclick = saveAction;
    document.getElementById('cancel-action-btn').onclick = closeActionEditor;
    
    // Action type change
    document.getElementById('action-type').onchange = function() {
        hideAllActionOptions();
        const type = this.value;
        if (type) {
            document.getElementById(`${type}-options`).style.display = 'block';
            if (type === 'navigate') {
                populatePageSelect();
            }
        }
    };
}
