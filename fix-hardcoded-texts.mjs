import fs from 'fs';

// Update workflow-builder.html
let htmlContent = fs.readFileSync('./ui/workflow-builder.html', 'utf8');

const htmlReplacements = [
  { old: 'title="Alle Workflows anzeigen"', new: 'id="workflows-list-btn-title" title="Alle Workflows anzeigen"' },
  { old: 'placeholder="Workflow-Name"', new: 'id="workflow-name-input" placeholder="Workflow-Name"' },
  { old: '>Aktiviert<', new: 'id="workflow-enabled-label">Aktiviert<' },
  { old: 'title="Workflow testen"', new: 'id="test-workflow-title" title="Workflow testen"' },
  { old: '>Speichern</button>', new: 'id="save-workflow-text">Speichern</button>' },
  { old: '>Schließen</button>', new: 'id="close-builder-text">Schließen</button>' },
  { old: '>Seite hinzufügen<', new: 'id="add-page-btn-text">Seite hinzufügen<' },
  { old: '>Seite löschen<', new: 'id="delete-page-text">Seite löschen<' },
  { old: '>Button hinzufügen<', new: 'id="add-button-text">Button hinzufügen<' },
  { old: 'Button bearbeiten</h3>', new: 'Button bearbeiten</h3>' }, // Keep but will translate via JS
  { old: 'Wähle einen Button zum Bearbeiten', new: 'id="no-selection-text">Wähle einen Button zum Bearbeiten' },
  { old: 'Button bearbeiten</h2>', new: 'id="modal-title">Button bearbeiten</h2>' },
  { old: '>Aktion hinzufügen<', new: 'id="add-action-text">Aktion hinzufügen<' },
  { old: '>Hinzufügen</button>', new: 'id="save-action-text">Hinzufügen</button>' },
  { old: '>Abbrechen</button>', new: 'id="cancel-action-text">Abbrechen</button>' },
  { old: '>Aktion hinzufügen</h2>', new: 'id="add-action-title">Aktion hinzufügen</h2>' },
];

htmlReplacements.forEach(rep => {
  if (htmlContent.includes(rep.old)) {
    htmlContent = htmlContent.replace(rep.old, rep.new);
    console.log(`✓ HTML: ${rep.old.substring(0, 40)}...`);
  }
});

fs.writeFileSync('./ui/workflow-builder.html', htmlContent);
console.log('\n✓ workflow-builder.html updated');

// Update ui/index.html  
let indexHtml = fs.readFileSync('./ui/index.html', 'utf8');
const indexReplacements = [
  { old: '>Logs löschen</button>', new: 'id="clear-logs-text">Logs löschen</button>' },
];

indexReplacements.forEach(rep => {
  if (indexHtml.includes(rep.old)) {
    indexHtml = indexHtml.replace(rep.old, rep.new);
    console.log(`✓ index.html: ${rep.old.substring(0, 40)}...`);
  }
});

fs.writeFileSync('./ui/index.html', indexHtml);
console.log('✓ index.html updated');
