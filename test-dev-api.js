#!/usr/bin/env node

/**
 * Test script for Dev API connection
 * Usage: node test-dev-api.js
 * 
 * Environment variables:
 * - MEDRUNNER_TOKEN: Production API token (required)
 * - DEV_API_KEY: Development API key (optional, for dev API testing)
 * - API_ENV: 'dev' or 'prod' (default: 'prod')
 */

import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { MedrunnerApiClient } from "@medrunner/api-client";

console.log('\n=== Medrunner API Connection Test ===\n');

// Check required environment variables
if (!process.env.MEDRUNNER_TOKEN) {
	console.error('❌ ERROR: MEDRUNNER_TOKEN is not set!');
	process.exit(1);
}

const apiEnv = process.env.API_ENV || 'prod';
const devApiKey = process.env.DEV_API_KEY || '';

console.log(`Environment: ${apiEnv.toUpperCase()}`);
console.log(`Dev API Key configured: ${devApiKey ? 'Yes' : 'No'}\n`);

const apiConfig = {
	refreshToken: process.env.MEDRUNNER_TOKEN,
};

if (apiEnv === 'dev' && devApiKey) {
	apiConfig.accessToken = devApiKey;
	console.log('Using Dev API with provided API key\n');
} else if (apiEnv === 'dev') {
	console.warn('⚠️  Dev API selected but DEV_API_KEY is not configured.');
	console.warn('Will use Production API instead.\n');
} else {
	console.log('Using Production API\n');
}

try {
	console.log('Initializing API client...');
	const api = MedrunnerApiClient.buildClient(apiConfig);
	console.log('✅ API client initialized successfully\n');

	// Test basic connection by fetching status
	console.log('Testing API connection...');
	const response = await api.getCurrentUser();
	
	if (response && response.data) {
		console.log('✅ API connection successful!\n');
		console.log('User Data:');
		console.log(`  Handle: ${response.data.handle}`);
		console.log(`  Avatar: ${response.data.avatar?.small || 'N/A'}`);
		console.log(`\n✅ All tests passed!`);
		process.exit(0);
	} else {
		console.error('❌ Unexpected response from API');
		console.error(response);
		process.exit(1);
	}
} catch (error) {
	console.error('❌ API connection failed:\n');
	console.error(`Error: ${error.message}`);
	
	if (error.response) {
		console.error(`Status: ${error.response.status}`);
		console.error(`Details: ${JSON.stringify(error.response.data, null, 2)}`);
	}
	
	process.exit(1);
}
