/**
 * Workflow Builder
 * Visual editor for creating workflows with triggers, pages and buttons
 */

const { ipcRenderer } = require('electron');

// Translations
const translations = {
    de: {
        title: 'Workflow Builder',
        workflowName: 'Workflow-Name',
        enabled: 'Aktiviert',
        save: 'Speichern',
        close: 'Schließen',
        workflowTrigger: 'Workflow Trigger',
        triggerType: 'Trigger-Typ:',
        teamJoin: 'Person möchte Team beitreten',
        chatMessage: 'Neue Chatnachricht',
        newAlert: 'Neuer Alert für Team',
        alertTypes: 'Alert-Typen:',
        positionNote: 'Workflow wird nur bei Position 1 getriggert',
        pages: 'Seiten',
        addPage: 'Seite hinzufügen',
        page: 'Seite',
        deletePage: 'Seite löschen',
        prevPage: 'Vorherige Seite',
        nextPage: 'Nächste Seite',
        addButton: 'Button hinzufügen',
        editButton: 'Button bearbeiten',
        createButton: 'Neuen Button erstellen',
        selectButton: 'Wähle einen Button zum Bearbeiten',
        buttonText: 'Button Text:',
        buttonColor: 'Button Farbe:',
        actions: 'Aktionen:',
        addAction: 'Aktion hinzufügen',
        cancel: 'Abbrechen',
        actionType: 'Aktionstyp:',
        pleaseSelect: 'Bitte wählen...',
        navigateTo: 'Weiter zu Seite',
        copyText: 'Text kopieren',
        timerChange: 'Timer ändern',
        endWorkflow: 'Workflow beenden',
        targetPage: 'Ziel-Seite:',
        textToCopy: 'Text zum Kopieren:',
        enterText: 'Text eingeben...',
        timerAction: 'Timer Aktion:',
        timerAdvance: 'Timer fortsetzen',
        timerReset: 'Timer zurücksetzen',
        endNote: 'Beendet den Workflow und kehrt zur ersten Seite zurück.',
        add: 'Hinzufügen',
        noActions: 'Keine Aktionen hinzugefügt',
        remove: 'Entfernen',
        navigation: 'Navigation',
        minOnePage: 'Mindestens eine Seite muss vorhanden sein!',
        confirmDelete: 'Seite wirklich löschen?',
        confirmDeleteButton: 'Button wirklich löschen?',
        enterButtonText: 'Bitte Button-Text eingeben!',
        selectActionType: 'Bitte Aktionstyp auswählen!',
        selectTargetPage: 'Bitte Ziel-Seite auswählen!',
        enterCopyText: 'Bitte Text eingeben!',
        workflowSaved: 'Workflow gespeichert!',
        saveChanges: 'Änderungen speichern?',
        saveFailed: 'Fehler beim Speichern!',
        newWorkflow: 'Neuer Workflow',
        myWorkflows: 'Meine Workflows',
        triggerActions: 'Trigger Aktionen',
        playSound: 'Sound abspielen',
        soundFile: 'Sound Datei:',
        soundChooseOption: '-- Wähle einen Sound --',
        soundAlert: 'Alert Sound',
        soundChat: 'Chat Message Sound',
        soundTeamJoin: 'Team Join Sound',
        soundUnassigned: 'Unassigned Sound',
        showOverlay: 'Overlay anzeigen',
        triggerActionsNote: 'Aktionen, die ausgeführt werden wenn der Trigger ausgelöst wird'
    },
    en: {
        title: 'Workflow Builder',
        workflowName: 'Workflow Name',
        enabled: 'Enabled',
        save: 'Save',
        close: 'Close',
        workflowTrigger: 'Workflow Trigger',
        triggerType: 'Trigger Type:',
        teamJoin: 'Person Requesting to Join Team',
        chatMessage: 'New Chat Message',
        newAlert: 'New Alert for Team',
        alertTypes: 'Alert Types:',
        positionNote: 'Workflow only triggers at position 1',
        pages: 'Pages',
        addPage: 'Add Page',
        page: 'Page',
        deletePage: 'Delete Page',
        prevPage: 'Previous Page',
        nextPage: 'Next Page',
        addButton: 'Add Button',
        editButton: 'Edit Button',
        createButton: 'Create New Button',
        selectButton: 'Select a button to edit',
        buttonText: 'Button Text:',
        buttonColor: 'Button Color:',
        actions: 'Actions:',
        addAction: 'Add Action',
        cancel: 'Cancel',
        actionType: 'Action Type:',
        pleaseSelect: 'Please select...',
        navigateTo: 'Navigate to Page',
        copyText: 'Copy Text',
        timerChange: 'Change Timer',
        endWorkflow: 'End Workflow',
        targetPage: 'Target Page:',
        textToCopy: 'Text to Copy:',
        enterText: 'Enter text...',
        timerAction: 'Timer Action:',
        timerAdvance: 'Advance Timer',
        timerReset: 'Reset Timer',
        endNote: 'Ends the workflow and returns to the first page.',
        add: 'Add',
        noActions: 'No actions added',
        remove: 'Remove',
        navigation: 'Navigation',
        minOnePage: 'At least one page must exist!',
        confirmDelete: 'Really delete page?',
        confirmDeleteButton: 'Really delete button?',
        enterButtonText: 'Please enter button text!',
        selectActionType: 'Please select action type!',
        selectTargetPage: 'Please select target page!',
        enterCopyText: 'Please enter text!',
        workflowSaved: 'Workflow saved!',
        saveChanges: 'Save changes?',
        saveFailed: 'Failed to save!',
        newWorkflow: 'New Workflow',
        myWorkflows: 'My Workflows',
        triggerActions: 'Trigger Actions',
        playSound: 'Play Sound',
        soundFile: 'Sound File:',
        soundChooseOption: '-- Choose a Sound --',
        soundAlert: 'Alert Sound',
        soundChat: 'Chat Message Sound',
        soundTeamJoin: 'Team Join Sound',
        soundUnassigned: 'Unassigned Sound',
        showOverlay: 'Show Overlay',
        triggerActionsNote: 'Actions that are executed when the trigger is activated'
    }
};

// Get language from settings
let currentLang = 'de';

// Storage keys
const WORKFLOWS_LIST_KEY = 'mrs_workflows_list';
const CURRENT_WORKFLOW_KEY = 'mrs_current_workflow_id';

function initLanguage() {
    try {
        // Try to get language from main window settings
        const settings = localStorage.getItem('settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            if (parsed.LANGUAGE) {
                currentLang = parsed.LANGUAGE;
            }
        }
    } catch (e) {
        console.warn('Could not load language from settings:', e);
    }
    document.documentElement.lang = currentLang;
}

function t(key) {
    return translations[currentLang][key] || translations.de[key] || key;
}

// State
let currentWorkflow = null;
let currentWorkflowId = null;
let currentPageIndex = 0;
let editingButton = null;
let editingActions = [];

// Trigger Types
const TRIGGER_TYPES = {
    'team_join': { labelKey: 'teamJoin', requiresPosition: false },
    'chat_message': { labelKey: 'chatMessage', requiresPosition: false },
    'new_alert': { labelKey: 'newAlert', requiresPosition: true }
};

const ALERT_TYPES = ['PVE', 'PVP', 'Non-Threat'];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initializeBuilder();
    loadWorkflowsList();
    loadOrCreateWorkflow();
    setupEventListeners();
    applyTranslations();
});

function initializeBuilder() {
    console.log('[Builder] Initializing workflow builder');
}

/**
 * Get all saved workflows
 */
function getAllWorkflows() {
    try {
        const stored = localStorage.getItem(WORKFLOWS_LIST_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('[Builder] Failed to parse workflows list:', e);
        return [];
    }
}

/**
 * Save workflow to list
 */
function saveWorkflowToList(workflow) {
    try {
        const workflows = getAllWorkflows();
        const index = workflows.findIndex(w => w.id === workflow.id);
        
        if (index >= 0) {
            workflows[index] = workflow;
        } else {
            workflows.push(workflow);
        }
        
        localStorage.setItem(WORKFLOWS_LIST_KEY, JSON.stringify(workflows));
        console.log('[Builder] Workflow saved to list:', workflow.name);
        return true;
    } catch (e) {
        console.error('[Builder] Failed to save workflow to list:', e);
        return false;
    }
}

/**
 * Delete workflow from list
 */
function deleteWorkflowFromList(workflowId) {
    try {
        const workflows = getAllWorkflows().filter(w => w.id !== workflowId);
        localStorage.setItem(WORKFLOWS_LIST_KEY, JSON.stringify(workflows));
        console.log('[Builder] Workflow deleted:', workflowId);
        return true;
    } catch (e) {
        console.error('[Builder] Failed to delete workflow:', e);
        return false;
    }
}

/**
 * Create new workflow
 */
function createNewWorkflow() {
    const id = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
        id: id,
        name: t('newWorkflow') || 'Neuer Workflow',
        enabled: true,
        trigger: {
            type: 'team_join',
            alertTypes: [],
            actions: {
                playSound: false,
                soundFile: 'CUSTOM_ALERT_SOUND',
                showOverlay: false
            }
        },
        pages: [
            { id: 1, buttons: [] }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
}

function loadOrCreateWorkflow() {
    // Try to load current workflow ID
    const storedId = localStorage.getItem(CURRENT_WORKFLOW_KEY);
    const workflows = getAllWorkflows();
    
    if (storedId && workflows.length > 0) {
        const workflow = workflows.find(w => w.id === storedId);
        if (workflow) {
            currentWorkflow = workflow;
            currentWorkflowId = workflow.id;
        }
    }
    
    // If no workflow found, create new one
    if (!currentWorkflow) {
        currentWorkflow = createNewWorkflow();
        saveWorkflowToList(currentWorkflow);
        currentWorkflowId = currentWorkflow.id;
        localStorage.setItem(CURRENT_WORKFLOW_KEY, currentWorkflowId);
    }
    
    // Migrate old workflows from 'mrs_workflow' key
    const oldWorkflow = localStorage.getItem('mrs_workflow');
    if (oldWorkflow && workflows.length === 0) {
        try {
            const parsed = JSON.parse(oldWorkflow);
            const migratedWorkflow = createNewWorkflow();
            Object.assign(migratedWorkflow, parsed);
            currentWorkflow = migratedWorkflow;
            currentWorkflowId = migratedWorkflow.id;
            saveWorkflowToList(migratedWorkflow);
            localStorage.setItem(CURRENT_WORKFLOW_KEY, currentWorkflowId);
            localStorage.removeItem('mrs_workflow');
        } catch (e) {
            console.error('[Builder] Failed to migrate old workflow:', e);
        }
    }
    
    // Migrate old workflows (missing trigger and enabled fields)
    if (!currentWorkflow.trigger) {
        currentWorkflow.trigger = { type: 'new_alert', alertTypes: [], actions: { playSound: false, soundFile: 'CUSTOM_ALERT_SOUND', showOverlay: false } };
    }
    if (currentWorkflow.enabled === undefined) {
        currentWorkflow.enabled = true;
    }
    if (!currentWorkflow.trigger.actions) {
        currentWorkflow.trigger.actions = { playSound: false, soundFile: 'CUSTOM_ALERT_SOUND', showOverlay: false };
    }
    if (!currentWorkflow.trigger.actions.soundFile) {
        currentWorkflow.trigger.actions.soundFile = 'CUSTOM_ALERT_SOUND';
    }
    
    document.getElementById('workflow-name').value = currentWorkflow.name;
    document.getElementById('workflow-enabled').checked = currentWorkflow.enabled;
    updateTriggerUI();
    renderPageList();
    renderCurrentPage();
}

function saveWorkflow() {
    if (!currentWorkflow) return;
    
    currentWorkflow.name = document.getElementById('workflow-name').value || t('newWorkflow');
    currentWorkflow.enabled = document.getElementById('workflow-enabled').checked;
    currentWorkflow.updatedAt = Date.now();
    
    // Save trigger configuration
    currentWorkflow.trigger.type = document.getElementById('trigger-type').value;
    if (currentWorkflow.trigger.type === 'new_alert') {
        currentWorkflow.trigger.alertTypes = Array.from(
            document.querySelectorAll('.alert-type-checkbox:checked')
        ).map(cb => cb.value);
    }
    
    // Save trigger actions
    if (!currentWorkflow.trigger.actions) {
        currentWorkflow.trigger.actions = { playSound: false, soundFile: 'CUSTOM_ALERT_SOUND', showOverlay: false };
    }
    const soundCheckbox = document.getElementById('trigger-action-sound');
    const soundFileSelect = document.getElementById('trigger-sound-file');
    currentWorkflow.trigger.actions.playSound = soundCheckbox ? soundCheckbox.checked : false;
    currentWorkflow.trigger.actions.soundFile = soundFileSelect ? soundFileSelect.value : 'CUSTOM_ALERT_SOUND';
    currentWorkflow.trigger.actions.showOverlay = document.getElementById('trigger-action-overlay').checked;
    
    // Save to list
    if (!saveWorkflowToList(currentWorkflow)) {
        showNotification(t('saveFailed'), 'error');
        return;
    }
    
    // Save current workflow ID
    localStorage.setItem(CURRENT_WORKFLOW_KEY, currentWorkflowId);
    
    try {
        // Notify main window
        ipcRenderer.send('workflow-updated', currentWorkflow);
        showNotification(t('workflowSaved'));
    } catch (e) {
        console.error('[Builder] Failed to notify main window:', e);
    }
}

function showNotification(message, type = 'success') {
    // Simple notification (could be enhanced)
    alert(message);
}

/**
 * Load and display workflows list
 */
function loadWorkflowsList() {
    const workflows = getAllWorkflows();
    const listContainer = document.getElementById('workflows-list');
    
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    if (workflows.length === 0) {
        const emptyMsg = currentLang === 'en' 
            ? 'No workflows created yet. Create a new one!' 
            : 'Noch keine Workflows erstellt. Erstelle einen neuen!';
        listContainer.innerHTML = `<p style="text-align: center; color: #888; padding: 1rem;">${emptyMsg}</p>`;
        return;
    }
    
    workflows.forEach(workflow => {
        const item = document.createElement('div');
        item.className = 'workflow-item';
        item.style.cssText = 'padding: 1rem; border: 1px solid var(--border); border-radius: 6px; margin-bottom: 0.5rem; background: var(--surface); cursor: pointer; transition: all 0.2s;';
        
        if (workflow.id === currentWorkflowId) {
            item.style.borderColor = '#3b82f6';
            item.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        }
        
        item.onmouseover = () => item.style.borderColor = '#3b82f6';
        item.onmouseout = () => {
            if (workflow.id !== currentWorkflowId) {
                item.style.borderColor = 'var(--border)';
            }
        };
        
        const name = document.createElement('div');
        name.style.cssText = 'font-weight: bold; margin-bottom: 0.25rem;';
        name.textContent = workflow.name;
        
        const status = document.createElement('div');
        status.style.cssText = 'font-size: 0.875rem; color: #888; margin-bottom: 0.5rem;';
        const statusText = currentLang === 'en' 
            ? `Trigger: ${workflow.trigger?.type || 'N/A'} | ${workflow.pages?.length || 0} pages | ${workflow.enabled ? 'Enabled' : 'Disabled'}`
            : `Trigger: ${workflow.trigger?.type || 'N/A'} | ${workflow.pages?.length || 0} Seiten | ${workflow.enabled ? 'Aktiviert' : 'Deaktiviert'}`;
        status.textContent = statusText;
        
        const actions = document.createElement('div');
        actions.style.cssText = 'display: flex; gap: 0.5rem;';
        
        const loadBtn = document.createElement('button');
        loadBtn.className = 'btn btn-small';
        loadBtn.textContent = currentLang === 'en' ? 'Open' : 'Öffnen';
        loadBtn.style.cssText = 'flex: 1;';
        loadBtn.onclick = (e) => {
            e.stopPropagation();
            loadWorkflow(workflow.id);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger btn-small';
        deleteBtn.textContent = currentLang === 'en' ? 'Delete' : 'Löschen';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(currentLang === 'en' ? 'Delete this workflow?' : 'Diesen Workflow wirklich löschen?')) {
                deleteWorkflowFromList(workflow.id);
                if (currentWorkflowId === workflow.id) {
                    const remaining = getAllWorkflows();
                    if (remaining.length > 0) {
                        loadWorkflow(remaining[0].id);
                    } else {
                        createAndLoadNewWorkflow();
                    }
                }
                loadWorkflowsList();
            }
        };
        
        actions.appendChild(loadBtn);
        actions.appendChild(deleteBtn);
        
        item.appendChild(name);
        item.appendChild(status);
        item.appendChild(actions);
        listContainer.appendChild(item);
    });
}

/**
 * Load a workflow by ID
 */
function loadWorkflow(workflowId) {
    const workflows = getAllWorkflows();
    const workflow = workflows.find(w => w.id === workflowId);
    
    if (!workflow) {
        showNotification('Workflow not found!');
        return;
    }
    
    currentWorkflow = workflow;
    currentWorkflowId = workflowId;
    currentPageIndex = 0;
    
    localStorage.setItem(CURRENT_WORKFLOW_KEY, workflowId);
    
    document.getElementById('workflow-name').value = currentWorkflow.name;
    document.getElementById('workflow-enabled').checked = currentWorkflow.enabled;
    updateTriggerUI();
    renderPageList();
    renderCurrentPage();
    
    // Close workflows modal
    document.getElementById('workflows-modal').style.display = 'none';
    
    console.log('[Builder] Loaded workflow:', currentWorkflow.name);
}

/**
 * Create and load a new workflow
 */
function createAndLoadNewWorkflow() {
    const newWorkflow = createNewWorkflow();
    saveWorkflowToList(newWorkflow);
    currentWorkflow = newWorkflow;
    currentWorkflowId = newWorkflow.id;
    currentPageIndex = 0;
    
    localStorage.setItem(CURRENT_WORKFLOW_KEY, currentWorkflowId);
    
    document.getElementById('workflow-name').value = currentWorkflow.name;
    document.getElementById('workflow-enabled').checked = currentWorkflow.enabled;
    updateTriggerUI();
    renderPageList();
    renderCurrentPage();
    
    loadWorkflowsList();
    
    // Close workflows modal
    document.getElementById('workflows-modal').style.display = 'none';
    
    console.log('[Builder] Created new workflow:', currentWorkflow.name);
}

// Trigger Management
function updateTriggerUI() {
    const triggerType = currentWorkflow.trigger.type;
    document.getElementById('trigger-type').value = triggerType;
    
    // Show/hide alert type checkboxes
    const alertTypesContainer = document.getElementById('alert-types-container');
    if (triggerType === 'new_alert') {
        alertTypesContainer.style.display = 'block';
        
        // Update checkboxes
        ALERT_TYPES.forEach(type => {
            const checkbox = document.querySelector(`.alert-type-checkbox[value="${type}"]`);
            if (checkbox) {
                checkbox.checked = currentWorkflow.trigger.alertTypes.includes(type);
            }
        });
    } else {
        alertTypesContainer.style.display = 'none';
    }
    
    // Update trigger actions
    updateTriggerActions();
}

function updateTriggerActions() {
    const actions = currentWorkflow.trigger.actions || { playSound: false, soundFile: 'CUSTOM_ALERT_SOUND', showOverlay: false };
    
    const soundCheckbox = document.getElementById('trigger-action-sound');
    const overlayCheckbox = document.getElementById('trigger-action-overlay');
    const soundFileSelect = document.getElementById('trigger-sound-file');
    const soundSelection = document.getElementById('sound-selection');
    
    if (soundCheckbox) soundCheckbox.checked = actions.playSound || false;
    if (overlayCheckbox) overlayCheckbox.checked = actions.showOverlay || false;
    if (soundFileSelect) soundFileSelect.value = actions.soundFile || 'CUSTOM_ALERT_SOUND';
    
    // Show/hide sound selection based on playSound checkbox
    if (soundSelection) {
        soundSelection.style.display = actions.playSound ? 'block' : 'none';
    }
}

function onTriggerTypeChange() {
    currentWorkflow.trigger.type = document.getElementById('trigger-type').value;
    if (currentWorkflow.trigger.type !== 'new_alert') {
        currentWorkflow.trigger.alertTypes = [];
    }
    updateTriggerUI();
}

function onTriggerActionChange() {
    if (!currentWorkflow.trigger.actions) {
        currentWorkflow.trigger.actions = { playSound: false, soundFile: 'CUSTOM_ALERT_SOUND', showOverlay: false };
    }
    
    const soundCheckbox = document.getElementById('trigger-action-sound');
    const soundFileSelect = document.getElementById('trigger-sound-file');
    const soundSelection = document.getElementById('sound-selection');
    
    currentWorkflow.trigger.actions.playSound = soundCheckbox ? soundCheckbox.checked : false;
    currentWorkflow.trigger.actions.showOverlay = document.getElementById('trigger-action-overlay').checked;
    
    // Update soundFile when playSound is toggled
    if (soundCheckbox && soundCheckbox.checked && soundFileSelect) {
        currentWorkflow.trigger.actions.soundFile = soundFileSelect.value;
    }
    
    // Show/hide sound selection based on playSound checkbox
    if (soundSelection) {
        soundSelection.style.display = (soundCheckbox && soundCheckbox.checked) ? 'block' : 'none';
    }
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
        alert(t('minOnePage'));
        return;
    }
    
    if (confirm(t('confirmDelete'))) {
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
        li.textContent = `${t('page')} ${page.id}`;
        li.className = index === currentPageIndex ? 'active' : '';
        li.onclick = () => selectPage(index);
        list.appendChild(li);
    });
}

function renderCurrentPage() {
    const page = currentWorkflow.pages[currentPageIndex];
    if (!page) return;
    
    // Update page number
    document.getElementById('page-number').textContent = `${t('page')} ${page.id}`;
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
        const noButtonsMsg = currentLang === 'en' 
            ? 'No buttons available. Click "Add Button".' 
            : 'Keine Buttons vorhanden. Klicke auf "Button hinzufügen".';
        preview.innerHTML = `<p style="text-align: center; color: #888; margin-top: 2rem;">${noButtonsMsg}</p>`;
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
        editBtn.textContent = currentLang === 'en' ? 'Edit' : 'Bearb';
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
        title.textContent = t('editButton');
        document.getElementById('button-label').value = button.label;
        document.getElementById('button-color').value = button.color;
        document.getElementById('button-color-hex').value = button.color;
    } else {
        title.textContent = t('createButton');
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
        alert(t('enterButtonText'));
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
    if (confirm(t('confirmDeleteButton'))) {
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
        alert(t('selectActionType'));
        return;
    }
    
    const action = { type };
    
    switch (type) {
        case 'navigate':
            const targetPage = parseInt(document.getElementById('target-page').value);
            if (!targetPage) {
                alert(t('selectTargetPage'));
                return;
            }
            action.targetPage = targetPage;
            break;
            
        case 'copy':
            const text = document.getElementById('copy-text').value.trim();
            if (!text) {
                alert(t('enterCopyText'));
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
        list.innerHTML = `<p style="color: #888; font-size: 0.875rem;">${t('noActions')}</p>`;
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
        removeBtn.textContent = t('remove');
        removeBtn.onclick = () => removeAction(index);
        
        item.appendChild(info);
        item.appendChild(removeBtn);
        list.appendChild(item);
    });
}

function getActionTypeName(type) {
    const names = {
        'navigate': t('navigation'),
        'copy': t('copyText'),
        'timer': 'Timer',
        'end': t('endWorkflow')
    };
    return names[type] || type;
}

function getActionDescription(action) {
    switch (action.type) {
        case 'navigate':
            return `${t('navigateTo')} ${action.targetPage}`;
        case 'copy':
            const copyLabel = currentLang === 'en' ? 'Copy:' : 'Kopiere:';
            return `${copyLabel} "${action.text.substring(0, 50)}${action.text.length > 50 ? '...' : ''}"`;
        case 'timer':
            const timerActions = {
                'advance': t('timerAdvance'),
                'reset': t('timerReset')
            };
            return timerActions[action.action] || action.action;
        case 'end':
            return t('endWorkflow');
        default:
            return action.type;
    }
}

function populatePageSelect() {
    const select = document.getElementById('target-page');
    select.innerHTML = `<option value="">${t('pleaseSelect')}</option>`;
    
    currentWorkflow.pages.forEach(page => {
        const option = document.createElement('option');
        option.value = page.id;
        option.textContent = `${t('page')} ${page.id}`;
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
    // Workflows list
    const workflowsListBtn = document.getElementById('workflows-list-btn');
    if (workflowsListBtn) {
        workflowsListBtn.onclick = () => {
            loadWorkflowsList();
            document.getElementById('workflows-modal').style.display = 'flex';
        };
    }
    
    const closeWorkflowsModalBtn = document.getElementById('close-workflows-modal-btn');
    if (closeWorkflowsModalBtn) {
        closeWorkflowsModalBtn.onclick = () => {
            document.getElementById('workflows-modal').style.display = 'none';
        };
    }
    
    const newWorkflowBtn = document.getElementById('new-workflow-btn');
    if (newWorkflowBtn) {
        newWorkflowBtn.onclick = createAndLoadNewWorkflow;
    }
    
    // Header
    document.getElementById('save-workflow-btn').onclick = saveWorkflow;
    document.getElementById('close-builder-btn').onclick = () => {
        if (confirm(t('saveChanges'))) {
            saveWorkflow();
        }
        window.close();
    };
    
    // Trigger configuration
    document.getElementById('trigger-type').onchange = onTriggerTypeChange;
    document.getElementById('workflow-enabled').onchange = () => {
        currentWorkflow.enabled = document.getElementById('workflow-enabled').checked;
    };
    
    // Trigger actions
    const soundCheckbox = document.getElementById('trigger-action-sound');
    const overlayCheckbox = document.getElementById('trigger-action-overlay');
    const soundFileSelect = document.getElementById('trigger-sound-file');
    if (soundCheckbox) soundCheckbox.onchange = onTriggerActionChange;
    if (overlayCheckbox) overlayCheckbox.onchange = onTriggerActionChange;
    if (soundFileSelect) soundFileSelect.onchange = onTriggerActionChange;
    
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
    
    // Close workflows modal when clicking outside
    const workflowsModal = document.getElementById('workflows-modal');
    if (workflowsModal) {
        workflowsModal.addEventListener('click', (e) => {
            if (e.target === workflowsModal) {
                workflowsModal.style.display = 'none';
            }
        });
    }
}

// Apply translations to HTML elements
function applyTranslations() {
    // Title
    document.title = t('title');
    document.querySelector('h1').textContent = t('title');
    
    // Header
    document.getElementById('workflow-name').placeholder = t('workflowName');
    document.querySelector('label[for="workflow-enabled"]').childNodes[2].textContent = ' ' + t('enabled');
    document.getElementById('save-workflow-btn').textContent = t('save');
    document.getElementById('close-builder-btn').textContent = t('close');
    
    // Sidebar
    document.querySelector('.sidebar-header h3').textContent = t('workflowTrigger');
    document.querySelector('label[for="trigger-type"]').textContent = t('triggerType');
    
    // Trigger actions
    const triggerActionsHeader = document.querySelectorAll('.sidebar-header h3')[1];
    if (triggerActionsHeader) triggerActionsHeader.textContent = t('triggerActions');
    
    const soundLabel = document.querySelector('label[for="trigger-action-sound"]');
    if (soundLabel) {
        soundLabel.textContent = t('playSound');
    }
    
    const soundFileLabel = document.querySelector('label[for="trigger-sound-file"]');
    if (soundFileLabel) {
        soundFileLabel.textContent = t('soundFile');
    }
    
    const overlayLabel = document.querySelector('label[for="trigger-action-overlay"]');
    if (overlayLabel) {
        overlayLabel.textContent = t('showOverlay');
    }
    
    const triggerActionsNote = document.querySelector('.trigger-actions-config small');
    if (triggerActionsNote) {
        triggerActionsNote.textContent = t('triggerActionsNote');
    }
    
    // Sound file options
    const soundFileSelect = document.getElementById('trigger-sound-file');
    if (soundFileSelect) {
        soundFileSelect.options[0].textContent = t('soundChooseOption');
        soundFileSelect.options[1].textContent = t('soundAlert');
        soundFileSelect.options[2].textContent = t('soundChat');
        soundFileSelect.options[3].textContent = t('soundTeamJoin');
        soundFileSelect.options[4].textContent = t('soundUnassigned');
    }
    
    // Trigger options
    const triggerSelect = document.getElementById('trigger-type');
    triggerSelect.options[0].textContent = t('teamJoin');
    triggerSelect.options[1].textContent = t('chatMessage');
    triggerSelect.options[2].textContent = t('newAlert');
    
    // Alert types
    const alertTypesLabel = document.querySelector('#alert-types-container label');
    if (alertTypesLabel) alertTypesLabel.textContent = t('alertTypes');
    const positionNote = document.querySelector('#alert-types-container small');
    if (positionNote) positionNote.textContent = t('positionNote');
    
    // Pages section
    document.querySelectorAll('.sidebar-header h3')[2].textContent = t('pages');
    document.getElementById('add-page-btn').title = t('addPage');
    
    // Page editor
    document.getElementById('delete-page-btn').textContent = t('deletePage');
    document.getElementById('prev-page-btn').title = t('prevPage');
    document.getElementById('next-page-btn').title = t('nextPage');
    document.getElementById('add-button-btn').textContent = t('addButton');
    
    // Properties panel
    document.querySelector('.properties-panel h3').textContent = t('editButton');
    document.querySelector('.no-selection').textContent = t('selectButton');
    
    // Button modal
    document.querySelector('label[for="button-label"]').textContent = t('buttonText');
    document.getElementById('button-label').placeholder = t('buttonText').replace(':', '');
    document.querySelector('label[for="button-color"]').textContent = t('buttonColor');
    document.querySelector('.modal-body label:nth-of-type(3)').textContent = t('actions');
    document.getElementById('add-action-btn').textContent = t('addAction');
    document.getElementById('save-button-btn').textContent = t('save');
    document.getElementById('cancel-button-btn').textContent = t('cancel');
    
    // Action modal
    document.querySelector('#action-modal .modal-header h2').textContent = t('addAction');
    document.querySelector('label[for="action-type"]').textContent = t('actionType');
    
    // Action type options
    const actionSelect = document.getElementById('action-type');
    actionSelect.options[0].textContent = t('pleaseSelect');
    actionSelect.options[1].textContent = t('navigateTo');
    actionSelect.options[2].textContent = t('copyText');
    actionSelect.options[3].textContent = t('timerChange');
    actionSelect.options[4].textContent = t('endWorkflow');
    
    // Action option labels
    document.querySelector('label[for="target-page"]').textContent = t('targetPage');
    document.querySelector('label[for="copy-text"]').textContent = t('textToCopy');
    document.getElementById('copy-text').placeholder = t('enterText');
    document.querySelector('label[for="timer-action"]').textContent = t('timerAction');
    
    // Timer options
    const timerSelect = document.getElementById('timer-action');
    timerSelect.options[0].textContent = t('timerAdvance');
    timerSelect.options[1].textContent = t('timerReset');
    
    // End workflow note
    document.querySelector('#end-options p').textContent = t('endNote');
    
    // Action modal buttons
    document.getElementById('save-action-btn').textContent = t('add');
    document.getElementById('cancel-action-btn').textContent = t('cancel');
    
    // Workflows modal
    const workflowsModalTitle = document.getElementById('workflows-modal-title');
    if (workflowsModalTitle) workflowsModalTitle.textContent = t('myWorkflows');
    
    const newWorkflowBtn = document.getElementById('new-workflow-btn');
    if (newWorkflowBtn) {
        const label = currentLang === 'en' ? '+ New Workflow' : '+ Neuer Workflow';
        newWorkflowBtn.textContent = label;
    }
}
