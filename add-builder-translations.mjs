import fs from 'fs';

// Add applyTranslations call to workflow-builder.html after the body loads
let htmlContent = fs.readFileSync('./ui/workflow-builder.html', 'utf8');

// Add IDs to all hardcoded text elements so they can be translated
const replacements = [
  { old: '📋 Workflows', new: 'id="workflows-btn-text">📋 Workflows' },
  { old: '🧪 Test', new: 'id="test-btn-text">🧪 Test' },
];

replacements.forEach(rep => {
  if (htmlContent.includes(rep.old)) {
    htmlContent = htmlContent.replace(rep.old, rep.new);
    console.log(`✓ Added ID: ${rep.new.split('"')[1]}`);
  }
});

fs.writeFileSync('./ui/workflow-builder.html', htmlContent);

// Now update workflow-builder.js to add applyTranslations function
let wbJsContent = fs.readFileSync('./ui/workflow-builder.js', 'utf8');

// Find where to insert the applyTranslations function (after the translations definition)
const insertPoint = wbJsContent.indexOf('function initializeWorkflowBuilder()');

if (insertPoint > 0) {
  const applyTranslationsFunc = `
function applyWorkflowBuilderTranslations() {
    const lang = currentLang || 'de';
    
    // Header elements
    const workflowNameInput = document.getElementById('workflow-name');
    if (workflowNameInput) workflowNameInput.placeholder = lang === 'en' ? 'Workflow Name' : 'Workflow-Name';
    
    const enabledLabel = document.querySelector('.checkbox-label');
    if (enabledLabel) enabledLabel.textContent = lang === 'en' ? 'Enabled' : 'Aktiviert';
    
    // Button texts
    const buttons = {
        'workflows-list-btn-text': lang === 'en' ? 'Workflows' : 'Workflows',
        'save-workflow-text': lang === 'en' ? 'Save' : 'Speichern',
        'close-builder-text': lang === 'en' ? 'Close' : 'Schließen',
        'test-btn-text': lang === 'en' ? 'Test' : 'Test',
        'add-page-btn-text': lang === 'en' ? 'Add Page' : 'Seite hinzufügen',
        'delete-page-text': lang === 'en' ? 'Delete Page' : 'Seite löschen',
        'add-button-text': lang === 'en' ? 'Add Button' : 'Button hinzufügen',
        'add-action-text': lang === 'en' ? 'Add Action' : 'Aktion hinzufügen',
        'save-action-text': lang === 'en' ? 'Add' : 'Hinzufügen',
        'cancel-action-text': lang === 'en' ? 'Cancel' : 'Abbrechen',
        'no-selection-text': lang === 'en' ? 'Select a button to edit' : 'Wähle einen Button zum Bearbeiten',
        'clear-logs-text': lang === 'en' ? 'Clear Logs' : 'Logs löschen',
    };
    
    Object.entries(buttons).forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    });
}

`;
  
  wbJsContent = wbJsContent.substring(0, insertPoint) + applyTranslationsFunc + wbJsContent.substring(insertPoint);
  
  // Call applyWorkflowBuilderTranslations after initialization
  wbJsContent = wbJsContent.replace(
    'initializeWorkflowBuilder();',
    'initializeWorkflowBuilder();\n    applyWorkflowBuilderTranslations();'
  );
  
  fs.writeFileSync('./ui/workflow-builder.js', wbJsContent);
  console.log('✓ Added applyWorkflowBuilderTranslations function');
}

console.log('✓ Workflow builder translations prepared');
