import fs from 'fs';

// Read renderer.js
let content = fs.readFileSync('./ui/renderer.js', 'utf8');

// Find the German translations object and add missing keys
const deInsertPoint = content.indexOf("		workflow_test: 'Test',\n\t},\n\ten: {");

if (deInsertPoint !== -1) {
  const deAdditions = `		workflow_test: 'Test',
		// Workflow Builder Texts
		builder_title: 'Workflow Builder',
		workflows_btn: 'Workflows',
		builder_save: 'Speichern',
		builder_close: 'Schließen',
		builder_test: 'Test',
		add_page: 'Seite hinzufügen',
		delete_page: 'Seite löschen',
		add_button: 'Button hinzufügen',
		edit_button: 'Button bearbeiten',
		select_button: 'Wähle einen Button zum Bearbeiten',
		add_action: 'Aktion hinzufügen',
		add: 'Hinzufügen',
		cancel: 'Abbrechen',
		delete: 'Löschen',
		pages: 'Seiten',
		confirm_delete_page: 'Seite wirklich löschen?',
		confirm_delete_button: 'Button wirklich löschen?',
		confirm_delete_workflow: 'Diesen Workflow wirklich löschen?',
		no_buttons: 'Keine Buttons vorhanden. Klicke auf "Button hinzufügen".',
		no_selection: 'Keine Auswahl',
		clear_logs: 'Logs löschen',
		workflow_info: 'Workflow Info',
	},
	en: {`;
  
  content = content.replace(
    `		workflow_test: 'Test',\n\t},\n\ten: {`,
    deAdditions
  );
  console.log('✓ German translations added');
}

// Find the English translations object and add missing keys
const enInsertPoint = content.indexOf("		workflow_test: 'Test',\n\t\tmore_settings_title: 'More Settings',");

if (enInsertPoint !== -1) {
  const enAdditions = `		workflow_test: 'Test',
		// Workflow Builder Texts
		builder_title: 'Workflow Builder',
		workflows_btn: 'Workflows',
		builder_save: 'Save',
		builder_close: 'Close',
		builder_test: 'Test',
		add_page: 'Add Page',
		delete_page: 'Delete Page',
		add_button: 'Add Button',
		edit_button: 'Edit Button',
		select_button: 'Select a button to edit',
		add_action: 'Add Action',
		add: 'Add',
		cancel: 'Cancel',
		delete: 'Delete',
		pages: 'Pages',
		confirm_delete_page: 'Really delete this page?',
		confirm_delete_button: 'Really delete this button?',
		confirm_delete_workflow: 'Really delete this workflow?',
		no_buttons: 'No buttons available. Click "Add Button".',
		no_selection: 'No Selection',
		clear_logs: 'Clear Logs',
		workflow_info: 'Workflow Info',
		more_settings_title: 'More Settings',`;
  
  content = content.replace(
    `		workflow_test: 'Test',\n\t\tmore_settings_title: 'More Settings',`,
    enAdditions
  );
  console.log('✓ English translations added');
}

fs.writeFileSync('./ui/renderer.js', content);
console.log('✓ renderer.js updated with new translations');
