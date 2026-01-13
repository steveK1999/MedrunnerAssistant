import fs from 'fs';

// Update workflow-builder.js to use translations for displayed text
let wbContent = fs.readFileSync('./ui/workflow-builder.js', 'utf8');

// Replace hardcoded inline strings with t() function calls
const jsReplacements = [
  { old: `'? Fehler beim Speichern!'\n`, new: `t('save_failed')\n` },
  { old: `'Seite wirklich löschen?'\n`, new: `t('confirm_delete_page')\n` },
  { old: `'Button wirklich löschen?'\n`, new: `t('confirm_delete_button')\n` },
  { old: `'Diesen Workflow wirklich löschen?'`, new: `t('confirm_delete_workflow')` },
  { old: `'Keine Buttons vorhanden. Klicke auf "Button hinzufügen".'`, new: `t('no_buttons')` },
  { old: `"Löschen"`, new: `t('delete')` },
  { old: `"Seite hinzufügen"`, new: `t('add_page')` },
  { old: `"Button hinzufügen"`, new: `t('add_button')` },
  { old: `'Seiten'`, new: `t('pages')` },
  { old: `'Aktiviert'`, new: `t('workflow_enabled')` },
  { old: `'Deaktiviert'`, new: `\`\${t('workflow_disable')}\`` },
];

// Fix specific patterns
wbContent = wbContent.replace(
  /const saved = workflow\.enabled \? 'Aktiviert' : 'Deaktiviert'/,
  `const saved = workflow.enabled ? t('workflow_enabled') : t('workflow_disable')`
);

wbContent = wbContent.replace(
  /currentLang === 'en' \? 'Delete' : 'Löschen'/,
  `t('delete')`
);

wbContent = wbContent.replace(
  /currentLang === 'en' \? 'Delete this workflow\?' : 'Diesen Workflow wirklich löschen\?'/,
  `t('confirm_delete_workflow')`
);

wbContent = wbContent.replace(
  /currentLang === 'en' \? 'No buttons available\. Click "Add Button"\.' : 'Keine Buttons vorhanden\. Klicke auf "Button hinzufügen"\.'/,
  `t('no_buttons')`
);

fs.writeFileSync('./ui/workflow-builder.js', wbContent);
console.log('✓ workflow-builder.js updated to use translations');

// Update renderer.js for inline strings
let rendererContent = fs.readFileSync('./ui/renderer.js', 'utf8');

// Fix hardcoded inline strings
rendererContent = rendererContent.replace(
  /getLang\(\) === 'en' \? 'Clear Logs' : 'Logs löschen'/g,
  `t('clear_logs')`
);

rendererContent = rendererContent.replace(
  /lang === 'en' \? '🗑️ Delete' : '🗑️ Löschen'/g,
  `'🗑️ ' + t('delete')`
);

rendererContent = rendererContent.replace(
  /lang === 'en' \? 'Really delete this workflow\?' : 'Workflow wirklich löschen\?'/,
  `t('confirm_delete_workflow')`
);

rendererContent = rendererContent.replace(
  /workflow\.enabled \? '✓ Aktiviert' : '✗ Deaktiviert'/g,
  `workflow.enabled ? '✓ ' + t('workflow_enabled') : '✗ ' + t('workflow_disable')`
);

fs.writeFileSync('./ui/renderer.js', rendererContent);
console.log('✓ renderer.js updated to use translations for inline strings');

// Update index.html descriptions to use data attributes
let indexContent = fs.readFileSync('./ui/index.html', 'utf8');

indexContent = indexContent.replace(
  /<p class="description" id="test-mode-desc">Wenn aktiviert, werden alle Test-Buttons sichtbar\.<\/p>/,
  `<p class="description" id="test-mode-desc" data-i18n-de="Wenn aktiviert, werden alle Test-Buttons sichtbar." data-i18n-en="When enabled, all test buttons are visible.">Wenn aktiviert, werden alle Test-Buttons sichtbar.</p>`
);

indexContent = indexContent.replace(
  /<span id="console-desc">Echtzeit-Logs vom laufenden Assistenten\. Dieser Tab ist sichtbar, wenn der Debug-Modus aktiviert ist\.<\/span>/,
  `<span id="console-desc" data-i18n-de="Echtzeit-Logs vom laufenden Assistenten. Dieser Tab ist sichtbar, wenn der Debug-Modus aktiviert ist." data-i18n-en="Real-time logs from the running assistant. This tab is visible when Debug Mode is enabled.">Echtzeit-Logs vom laufenden Assistenten. Dieser Tab ist sichtbar, wenn der Debug-Modus aktiviert ist.</span>`
);

fs.writeFileSync('./ui/index.html', indexContent);
console.log('✓ index.html updated with translation data attributes');
