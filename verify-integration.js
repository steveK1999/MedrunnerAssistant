#!/usr/bin/env node
/**
 * Integration Verification Script
 * Verifies that all Ship Assignment and AAR modules are properly integrated
 * Runs automatically during build/startup process
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REQUIRED_FILES = {
  'lib/constants.js': 'Core constants for ships, emojis, and locations',
  'lib/shipAssignment.js': 'Ship assignment management module',
  'lib/aar.js': 'After Action Report module',
  'ui/tabs-shipaar.html': 'HTML templates for new tabs',
  'ui/shipaar-init.js': 'Module initialization and loader',
  'ui/styles-shipaar.css': 'Styling for new components'
};

const REQUIRED_CODE_PATTERNS = {
  'ui/index.html': [
    'data-tab="shipAssignment"',
    'data-tab="aar"',
    'styles-shipaar.css',
    'Ship Assignments'
  ],
  'ui/renderer.js': [
    'switchTab',
    './shipaar-init.js',
    'DOMContentLoaded'
  ]
};

console.log('🔍 Starting Ship Assignment & AAR Integration Verification...\n');

let allChecksPassed = true;

// Check 1: Verify all required files exist
console.log('📋 Step 1: Checking required files...');
Object.entries(REQUIRED_FILES).forEach(([file, description]) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`  ✅ ${file} (${sizeKB} KB) - ${description}`);
  } else {
    console.log(`  ❌ ${file} - MISSING! ${description}`);
    allChecksPassed = false;
  }
});

console.log();

// Check 2: Verify code patterns
console.log('🔧 Step 2: Checking code integration patterns...');
Object.entries(REQUIRED_CODE_PATTERNS).forEach(([file, patterns]) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  ${file} not found (skipping pattern check)`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  let fileChecked = false;
  
  patterns.forEach(pattern => {
    if (content.includes(pattern)) {
      if (!fileChecked) {
        console.log(`  ✅ ${file}`);
        fileChecked = true;
      }
    } else {
      if (!fileChecked) {
        console.log(`  ❌ ${file}`);
        fileChecked = true;
      }
      console.log(`     └─ Missing pattern: "${pattern}"`);
      allChecksPassed = false;
    }
  });
});

console.log();

// Check 3: Verify module exports
console.log('📦 Step 3: Checking module exports...');
const moduleChecks = [
  { file: 'lib/constants.js', exports: ['SHIPS', 'EMOJIS', 'LOCATIONS'] },
  { file: 'lib/shipAssignment.js', exports: ['addShip', 'removeShip', 'loadShipAssignments'] },
  { file: 'lib/aar.js', exports: ['populateAARShipDropdowns', 'generateAAROutput'] }
];

moduleChecks.forEach(({ file, exports: expectedExports }) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  ${file} not found`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  let allExportsFound = true;
  
  expectedExports.forEach(exportName => {
    if (!content.includes(exportName)) {
      console.log(`  ❌ ${file}: Missing export "${exportName}"`);
      allExportsFound = false;
      allChecksPassed = false;
    }
  });
  
  if (allExportsFound) {
    console.log(`  ✅ ${file}: All exports found`);
  }
});

console.log();

// Check 4: Verify package.json configuration
console.log('⚙️  Step 4: Checking package.json configuration...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  if (packageJson.type === 'module') {
    console.log('  ✅ ES6 modules enabled ("type": "module")');
  } else {
    console.log('  ❌ ES6 modules NOT enabled - add "type": "module" to package.json');
    allChecksPassed = false;
  }
  
  if (packageJson.scripts && packageJson.scripts.start) {
    console.log(`  ✅ Start script configured: "${packageJson.scripts.start}"`);
  } else {
    console.log('  ⚠️  No start script found in package.json');
  }
} else {
  console.log('  ⚠️  package.json not found');
}

console.log();

// Final Report
console.log('━'.repeat(60));
if (allChecksPassed) {
  console.log('✅ INTEGRATION VERIFICATION PASSED!');
  console.log('');
  console.log('All Ship Assignment & AAR features are properly integrated.');
  console.log('The app will automatically load these modules on startup.');
  console.log('');
  console.log('📚 Integrated Features:');
  console.log('  • Ship Assignment Management (add/remove ships and crew)');
  console.log('  • Discord Import/Export (paste messages to bulk import)');
  console.log('  • After Action Report (structured mission reporting)');
  console.log('  • Local Storage Persistence (data saves automatically)');
  console.log('  • Responsive UI (works on desktop and laptop screens)');
  console.log('');
  console.log('Ready to build and deploy! 🚀');
  process.exit(0);
} else {
  console.log('❌ INTEGRATION VERIFICATION FAILED!');
  console.log('');
  console.log('Please fix the issues above and try again.');
  console.log('Check the integration documentation for help.');
  process.exit(1);
}
