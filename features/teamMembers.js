import { getSelf } from "../lib/medrunnerAPI.js";

export const event = "TeamUpdate";

export const name = "Team_Members";

export let lastTeamMembers = [];

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
			const members = [];
			
			// Process all members
			if (teamUpdate.members && Array.isArray(teamUpdate.members)) {
				console.log(`TeamMembers: Processing ${teamUpdate.members.length} members`);
				console.log("First member structure:", JSON.stringify(teamUpdate.members[0], null, 2));
				
				teamUpdate.members.forEach((member, index) => {
					members.push({
						rsiHandle: member.rsiHandle || "Unknown",
						discordId: member.discordId || "-",
						role: member.role || "Member",
					});
				});
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
		},
		{
			rsiHandle: "TestPlayer2",
			discordId: "987654321098765432",
			role: "Member",
		},
		{
			rsiHandle: "TestPlayer3",
			discordId: "555555555555555555",
			role: "Engineer",
		},
	];
	console.log("Test team members set: " + JSON.stringify(lastTeamMembers));
}
