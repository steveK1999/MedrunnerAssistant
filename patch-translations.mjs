#!/usr/bin/env node

/**
 * Patch script to add missing German translations for workflow tab
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, 'ui', 'renderer.js');
let content = fs.readFileSync(filePath, 'utf8');

// Check if already patched
if (content.includes('workflow_title:')) {
	console.log('✓ Translations already present');
	process.exit(0);
}

// Find and replace German section - looking for alert_test_run_btn
const deMatch = content.match(/alert_test_run_btn: 'Alert-Test ausf[^']*',\s*},\s*en:/);
if (deMatch) {
	const newDe = `alert_test_run_btn: 'Alert-Test ausführen',
		workflow_title: 'Workflow',
		workflow_desc: 'Erstelle und führe visuelle Workflows mit Buttons und Aktionen aus, die durch Events ausgelöst werden.',
		workflow_my_workflows: 'Meine Workflows',
		workflow_builder_open: 'Workflow Builder öffnen',
		workflow_empty: 'Keine Workflows vorhanden. Öffne den Builder, um einen Workflow zu erstellen.',
		workflow_enabled: 'Aktiviert',
		workflow_disable: 'Deaktivieren',
		workflow_delete: 'Löschen',
		workflow_test: 'Test',
	},
	en:`;
	
	content = content.replace(deMatch[0], newDe);
	console.log('✓ German translations added');
}

// Find and replace English section
const enMatch = content.match(/alert_test_run_btn: 'Run Alert Test',\s+more_settings_title:/);
if (enMatch) {
	const newEn = `alert_test_run_btn: 'Run Alert Test',
		workflow_title: 'Workflow',
		workflow_desc: 'Create and run visual workflows with buttons and actions that are triggered by events.',
		workflow_my_workflows: 'My Workflows',
		workflow_builder_open: 'Open Workflow Builder',
		workflow_empty: 'No workflows available. Open the builder to create a workflow.',
		workflow_enabled: 'Enabled',
		workflow_disable: 'Disable',
		workflow_delete: 'Delete',
		workflow_test: 'Test',
		more_settings_title:`;
	
	content = content.replace(enMatch[0], newEn);
	console.log('✓ English translations added');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ File updated successfully');
