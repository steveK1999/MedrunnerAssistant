#!/usr/bin/env node

/**
 * Patch script to add missing German translations for workflow tab
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'ui', 'renderer.js');
let content = fs.readFileSync(filePath, 'utf8');

// German translations to add after alert_test_run_btn
const deTranslations = `alert_test_run_btn: 'Alert-Test ausführen',
		workflow_title: 'Workflow',
		workflow_desc: 'Erstelle und führe visuelle Workflows mit Buttons und Aktionen aus, die durch Events ausgelöst werden.',
		workflow_my_workflows: 'Meine Workflows',
		workflow_builder_open: 'Workflow Builder öffnen',
		workflow_empty: 'Keine Workflows vorhanden. Öffne den Builder, um einen Workflow zu erstellen.',
		workflow_enabled: 'Aktiviert',
		workflow_disable: 'Deaktivieren',
		workflow_delete: 'Löschen',
		workflow_test: 'Test',`;

const enTranslations = `alert_test_run_btn: 'Run Alert Test',
		workflow_title: 'Workflow',
		workflow_desc: 'Create and run visual workflows with buttons and actions that are triggered by events.',
		workflow_my_workflows: 'My Workflows',
		workflow_builder_open: 'Open Workflow Builder',
		workflow_empty: 'No workflows available. Open the builder to create a workflow.',
		workflow_enabled: 'Enabled',
		workflow_disable: 'Disable',
		workflow_delete: 'Delete',
		workflow_test: 'Test',`;

// Replace German translations
if (!content.includes('workflow_title')) {
	content = content.replace(
		/alert_test_run_btn: 'Alert-Test.*?(?=\s+},)/s,
		deTranslations
	);
	console.log('✓ German translations added');
}

// Replace English translations  
if (!content.includes('workflow_title')) {
	content = content.replace(
		/alert_test_run_btn: 'Run Alert Test',\s+more_settings_title/,
		enTranslations + '\n\t\tmore_settings_title'
	);
	console.log('✓ English translations added');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ File updated successfully');
