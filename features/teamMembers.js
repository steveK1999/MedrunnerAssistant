import { getSelf } from "../lib/medrunnerAPI.js";

export const event = "TeamUpdate";

export const name = "Team_Members";

export let lastTeamMembers = [];

// Track the first time we saw each member so we can display a join timestamp even
// when the API payload does not include one.
const joinTimestamps = new Map();
let trackedTeamId = null;

export async function callback(teamUpdate) {
	// Always log to see the actual data structure
	console.log("===== TeamMembers: Callback triggered =====");
	console.log("TeamMembers: Received teamUpdate");
	console.log("Full teamUpdate:", JSON.stringify(teamUpdate, null, 2));

	try {
		const self = await getSelf();
		console.log(`TeamMembers: Self data - activeTeam: ${self.data.activeTeam}, id: ${self.data.id}`);
		console.log(`TeamMembers: Update - id: ${teamUpdate.id}, members count: ${teamUpdate.members ? teamUpdate.members.length : 'undefined'}`);

		// Check if this is the user's active team
		if (self.data.activeTeam === teamUpdate.id) {
			console.log("TeamMembers: ✓ This is the active team!");
			if (trackedTeamId !== teamUpdate.id) {
				joinTimestamps.clear();
				trackedTeamId = teamUpdate.id;
				console.log(`TeamMembers: Tracking new team ${trackedTeamId}, clearing cached join times`);
			}
			let members = [];
			
			// Process all members
			if (teamUpdate.members && Array.isArray(teamUpdate.members)) {
				console.log(`TeamMembers: Processing ${teamUpdate.members.length} members`);
				console.log("First member structure:", JSON.stringify(teamUpdate.members[0], null, 2));
				
				function mapClassToRole(cls) {
					switch (cls) {
						case 1: return "Medical";
						case 2: return "Security";
						case 3: return "Pilot";
						case 4: return "Teamlead";
						case 9: return "Combat Aerospace Patrol";
						default: return "Member";
					}
				}

				function getMemberKey(member, idx) {
					return member.id || member.rsiHandle || member.discordId || `idx-${idx}`;
				}

				function getJoinedAt(member) {
					// Try common field names; return timestamp (ms) if possible
					const val = member.joinedAt || member.joined_at || member.joinDate || member.joined || member.createdAt || member.created_at || null;
					if (!val) return null;
					try {
						// If val is numeric or Date-string, convert to ms
						const d = typeof val === 'number' ? new Date(val) : new Date(String(val));
						const ms = d.getTime();
						return Number.isNaN(ms) ? null : ms;
					} catch (_) {
						return null;
					}
				}

				function resolveJoinedAt(member, idx) {
					const key = getMemberKey(member, idx);
					const apiJoined = getJoinedAt(member);
					if (apiJoined !== null) {
						joinTimestamps.set(key, apiJoined);
						return apiJoined;
					}
					if (joinTimestamps.has(key)) {
						return joinTimestamps.get(key);
					}
					const now = Date.now();
					joinTimestamps.set(key, now);
					return now;
				}

				members = teamUpdate.members.map((member, idx) => {
					const joinedMs = resolveJoinedAt(member, idx);
					return {
						rsiHandle: member.rsiHandle || "Unknown",
						discordId: member.discordId || "-",
						role: mapClassToRole(member.class),
						joinedAt: joinedMs, // milliseconds since epoch or null
					};
				});

				// Remove cached join times for members no longer present
				const activeKeys = new Set(teamUpdate.members.map((m, idx) => getMemberKey(m, idx)));
				for (const key of Array.from(joinTimestamps.keys())) {
					if (!activeKeys.has(key)) joinTimestamps.delete(key);
				}

				// Sort by joinedAt ascending if available; otherwise keep original order
				const hasJoined = members.some(m => m.joinedAt !== null);
				if (hasJoined) {
					members.sort((a, b) => {
						if (a.joinedAt === null && b.joinedAt === null) return 0;
						if (a.joinedAt === null) return 1; // nulls last
						if (b.joinedAt === null) return -1;
						return a.joinedAt - b.joinedAt;
					});
				}

				// Assign order number: 1 = longest-tenured (earliest join)
				members = members.map((m, idx) => ({ ...m, order: idx + 1 }));
			} else {
				console.log("TeamMembers: ✗ No members array found");
			}
			
			lastTeamMembers = members;
			console.log(`TeamMembers: Updated ${members.length} members`);
			console.log("Members data:", JSON.stringify(members, null, 2));

			// Notify Electron main process/UI about updated members
			try {
				if (typeof process !== "undefined" && typeof process.send === "function") {
					process.send({ type: "team-members", data: members });
				}
			} catch (notifyErr) {
				console.error("TeamMembers: Failed to send team-members update:", notifyErr.message);
			}
		} else {
			console.log(`TeamMembers: ✗ Not active team (${self.data.activeTeam} !== ${teamUpdate.id})`);
		}
	} catch (error) {
		console.error("TeamMembers: Error in callback:", error.message);
	}
}

export async function test(number) {
	console.log(`\n*** TEST MODE: Team Members ${number} ***`);
	lastTeamMembers = [
		{
			rsiHandle: "TestPlayer1",
			discordId: "123456789012345678",
			role: "Pilot",
			joinedAt: Date.now() - 1000 * 60 * 30,
		},
		{
			rsiHandle: "TestPlayer2",
			discordId: "987654321098765432",
			role: "Member",
			joinedAt: Date.now() - 1000 * 60 * 20,
		},
		{
			rsiHandle: "TestPlayer3",
			discordId: "555555555555555555",
			role: "Engineer",
			joinedAt: Date.now() - 1000 * 60 * 10,
		},
	];
	console.log("Test team members set: " + JSON.stringify(lastTeamMembers));
}
