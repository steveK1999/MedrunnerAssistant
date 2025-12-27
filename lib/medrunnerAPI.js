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

const apiConfig = {
	refreshToken: process.env.MEDRUNNER_TOKEN,
};

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
