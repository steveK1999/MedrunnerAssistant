import dotenv from "dotenv";
dotenv.config({ quiet: true });

/**
 * Initialize the Medrunner API client
 */
import { MedrunnerApiClient } from "@medrunner/api-client";

if (!process.env.MEDRUNNER_TOKEN) {
	console.error("ERROR: MEDRUNNER_TOKEN is not set!");
	console.error("Please configure your API token in the settings.");
	process.exit(1);
}

// Check for dev API configuration (test mode)
const apiEnv = process.env.API_ENV || 'prod';
const devApiKey = process.env.DEV_API_KEY || '';

const apiConfig = {
	refreshToken: process.env.MEDRUNNER_TOKEN,
};

// If dev API is enabled and key is provided, use it as access token
if (apiEnv === 'dev' && devApiKey) {
	apiConfig.accessToken = devApiKey;
	console.log('MedrunnerAPI: Using DEV API with provided API key');
} else if (apiEnv === 'dev') {
	console.warn('MedrunnerAPI: DEV API selected but DEV_API_KEY is not configured. Using production API.');
} else {
	console.log('MedrunnerAPI: Using PRODUCTION API');
}

// Helper to safely mask sensitive tokens in logs
function maskToken(token) {
	if (!token || typeof token !== 'string') return '[empty]';
	const visibleStart = 4;
	const visibleEnd = 4;
	if (token.length <= visibleStart + visibleEnd) return '[masked]';
	const start = token.slice(0, visibleStart);
	const end = token.slice(-visibleEnd);
	return `${start}…${end}`;
}

// Log connection details (without exposing secrets)
const authMethod = apiConfig.accessToken ? 'accessToken (DEV_API_KEY)' : 'refreshToken (MEDRUNNER_TOKEN)';
const masked = apiConfig.accessToken ? maskToken(apiConfig.accessToken) : maskToken(apiConfig.refreshToken);
console.log(`MedrunnerAPI: Environment = ${apiEnv.toUpperCase()}`);
console.log(`MedrunnerAPI: Auth method = ${authMethod}`);
console.log(`MedrunnerAPI: Token (masked) = ${masked}`);

const api = MedrunnerApiClient.buildClient(apiConfig);

let self;
try {
	self = await api.client.get();
	console.log("MedrunnerAPI: Authenticated as " + self.data.rsiHandle);
} catch (error) {
	console.error("MedrunnerAPI: Authentication failed!");
	console.error("Please make sure your MEDRUNNER_TOKEN is set correctly in the .env file.");
	console.error("Error details:", error.message);
	process.exit(1);
}

export function getApi() {
	return api;
}

export async function getSelf() {
	self = await api.client.get();
	return self;
}

// Initialize the websocket connection
const ws = await api.websocket.initialize();
await ws.start();

console.log("MedrunnerSocket: " + ws.state);

export function getWebSocket() {
	return ws;
}
