import { getSelf, getApi } from "../lib/medrunnerAPI.js";

export const event = "TeamCreate|TeamUpdate|TeamDelete|EmergencyCreate|PersonUpdate";

export const name = "Team_Position_Manager";

let teamCount = 1;
let currentPosition = 1;
let allTeams = [];
let lastActiveTeamId = null;

/**
 * Fetch all teams from the API
 * The MedrunnerTeam interface includes: id, status, order, teamName, members[], etc.
 */
export async function fetchAllTeams() {
	try {
		const api = getApi();
		const self = await getSelf();
		
		// Try to get list of all teams from the organization
		// Based on the API client structure, teams should be accessible
		let teams = [];
		
		// Method 1: Direct teams endpoint
		if (api.teams && typeof api.teams.list === 'function') {
			const response = await api.teams.list();
			teams = response.data || response || [];
		}
		// Method 2: Via organization teams
		else if (api.org && typeof api.org.teams === 'function') {
			const response = await api.org.teams();
			teams = response.data || response || [];
		}
		// Method 3: Fetch from current unit teams
		else if (api.unit && typeof api.unit.listTeams === 'function') {
			const response = await api.unit.listTeams();
			teams = response.data || response || [];
		}
		
		// Store teams and sort by order property
		allTeams = Array.isArray(teams) ? teams.sort((a, b) => {
			const orderA = a.order !== undefined ? a.order : 999;
			const orderB = b.order !== undefined ? b.order : 999;
			return orderA - orderB;
		}) : [];
		
		teamCount = allTeams.length;
		console.log(`[TeamPositionManager] Fetched ${teamCount} teams from API`);
		return teamCount;
	} catch (error) {
		console.error("[TeamPositionManager] Failed to fetch teams from API:", error.message);
		// Fallback: return existing count
		return teamCount;
	}
}

/**
 * Get current team position from the MedrunnerTeam.order property
 * The order property in MedrunnerTeam indicates the team's position
 */
export async function getTeamPositionFromAPI() {
	try {
		const self = await getSelf();
		const activeTeamId = self.data.activeTeam;
		
		if (!activeTeamId) {
			console.log("[TeamPositionManager] No active team found");
			return currentPosition;
		}
		
		// Refresh teams list to get latest data
		await fetchAllTeams();
		
		// Find the position of current active team
		let position = 1;
		for (const team of allTeams) {
			if (team.id === activeTeamId) {
				// Use the 'order' property from MedrunnerTeam
				position = team.order !== undefined ? team.order : 1;
				currentPosition = position;
				console.log(`[TeamPositionManager] Current team position: ${position} (of ${teamCount})`);
				return position;
			}
		}
		
		return currentPosition;
	} catch (error) {
		console.error("[TeamPositionManager] Failed to get team position:", error.message);
		return currentPosition;
	}
}

/**
 * Update team count and position from API
 */
export async function updateTeamCountFromAPI() {
	const count = await fetchAllTeams();
	return count;
}

/**
 * Set new team position (for manual changes)
 */
export async function setTeamPosition(newPosition) {
	try {
		const self = await getSelf();
		const activeTeamId = self.data.activeTeam;
		
		if (!activeTeamId) {
			console.log("[TeamPositionManager] Cannot set position - no active team");
			return false;
		}
		
		// Validate position is within bounds
		let validPosition = newPosition;
		if (validPosition < 1) {
			validPosition = teamCount; // Wrap to last
		} else if (validPosition > teamCount) {
			validPosition = 1; // Wrap to first
		}
		
		currentPosition = validPosition;
		console.log(`[TeamPositionManager] Position set to ${validPosition} (of ${teamCount})`);
		
		// TODO: Implement API call to update team order if endpoint is available
		// This depends on actual API structure for updating team order
		
		return true;
	} catch (error) {
		console.error("[TeamPositionManager] Failed to set position:", error.message);
		return false;
	}
}

/**
 * Handle WebSocket events from the API
 * TeamCreate, TeamUpdate, TeamDelete: Refresh team list and update position
 * EmergencyCreate: Decrement position by 1 when alert comes in
 * PersonUpdate: Check if activeTeam changed
 */
export async function callback(eventData, eventType) {
	console.log(`[TeamPositionManager] Received event: ${eventType}`);
	
	// Team-related events: refresh the team list
	if (eventType === 'TeamCreate' || eventType === 'TeamDelete') {
		console.log(`[TeamPositionManager] Team list changed (${eventType})`);
		const newCount = await fetchAllTeams();
		await getTeamPositionFromAPI();
		console.log(`[TeamPositionManager] Updated - Total teams: ${newCount}, Current position: ${currentPosition}`);
	}
	
	// Team update: refresh position
	if (eventType === 'TeamUpdate') {
		const team = eventData; // MedrunnerTeam object
		if (team && team.order !== undefined) {
			console.log(`[TeamPositionManager] Team order updated: ${team.teamName} - order: ${team.order}`);
		}
		await getTeamPositionFromAPI();
	}
	
	// Alert received: decrement position
	if (eventType === 'EmergencyCreate') {
		console.log(`[TeamPositionManager] Alert received!`);
		
		if (teamCount > 0) {
			// Calculate new position: current - 1, wrap to max if at 1
			let newPosition = currentPosition - 1;
			if (newPosition < 1) {
				newPosition = teamCount;
			}
			
			console.log(`[TeamPositionManager] Position rotation: ${currentPosition} → ${newPosition} (of ${teamCount})`);
			currentPosition = newPosition;
			await setTeamPosition(newPosition);
		}
	}
	
	// Person update: check if activeTeam changed
	if (eventType === 'PersonUpdate') {
		const self = await getSelf();
		const activeTeamId = self.data.activeTeam;
		
		if (activeTeamId !== lastActiveTeamId) {
			console.log(`[TeamPositionManager] Active team changed: ${lastActiveTeamId} → ${activeTeamId}`);
			lastActiveTeamId = activeTeamId;
			await getTeamPositionFromAPI();
		}
	}
}

/**
 * Test function
 */
export async function test(number) {
	console.log(`\n*** TEST: Team Position Manager Test ${number} ***`);
	
	try {
		if (number === 1) {
			const count = await updateTeamCountFromAPI();
			const pos = await getTeamPositionFromAPI();
			console.log(`Status: ${pos}/${count} teams`);
		} else if (number === 2) {
			console.log("Simulating alert - decrementing position...");
			const newPos = currentPosition - 1 <= 0 ? teamCount : currentPosition - 1;
			currentPosition = newPos;
			console.log(`Position now: ${newPos}/${teamCount}`);
		}
	} catch (error) {
		console.error("Test error:", error.message);
	}
}
