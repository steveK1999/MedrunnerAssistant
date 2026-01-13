import fs from 'fs';

const file = './ui/renderer.js';
let content = fs.readFileSync(file, 'utf8');

// Add German translations
const deSection = `		alert_test_run_btn: 'Alert-Test ausführen',
		workflow_title: 'Workflow',
		workflow_desc: 'Erstelle und führe visuelle Workflows mit Buttons und Aktionen aus, die durch Events ausgelöst werden.',
		workflow_my_workflows: 'Meine Workflows',
		workflow_builder_open: 'Workflow Builder öffnen',
		workflow_empty: 'Keine Workflows vorhanden. Öffne den Builder, um einen Workflow zu erstellen.',
		workflow_enabled: 'Aktiviert',
		workflow_disable: 'Deaktivieren',
		workflow_delete: 'Löschen',
		workflow_test: 'Test',
	},`;

// Add English translations
const enSection = `		alert_test_run_btn: 'Run Alert Test',
		workflow_title: 'Workflow',
		workflow_desc: 'Create and run visual workflows with buttons and actions that are triggered by events.',
		workflow_my_workflows: 'My Workflows',
		workflow_builder_open: 'Open Workflow Builder',
		workflow_empty: 'No workflows available. Open the builder to create a workflow.',
		workflow_enabled: 'Enabled',
		workflow_disable: 'Disable',
		workflow_delete: 'Delete',
		workflow_test: 'Test',
		more_settings_title: 'More Settings',`;

// Replace German section
content = content.replace(
	/alert_test_run_btn: 'Alert-Test [^,]+',[\s\n]*},[\s\n]*en:/,
	deSection + '\n\ten:'
);

// Replace English section
content = content.replace(
	/alert_test_run_btn: 'Run Alert Test',[\s\n]*more_settings_title:/,
	enSection.trim() + '\n\t'
);

fs.writeFileSync(file, content);
console.log('✓ Translations added');
