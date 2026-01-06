import { getSelf } from "../lib/medrunnerAPI.js";

export const event = "TeamUpdate";

export const name = "Print_TeamJoinOrder";

export let lastTeamOrder = [];

export async function callback(teamUpdate) {
	if (process.env.DEBUG_MODE === "true") {
		console.log("TeamJoinOrder: New team update received");
		console.log(JSON.stringify(teamUpdate, null, 4));
	}

	const self = await getSelf();

	if (self.data.activeClass == 4 && self.data.activeTeam == teamUpdate.id) {
		const order = [];
		// Determine joinedAt from common field names and sort ascending
		function getJoinedAt(member) {
			const val = member.joinedAt || member.joined_at || member.joinDate || member.joined || member.createdAt || member.created_at || null;
			if (!val) return null;
			try {
				const d = typeof val === 'number' ? new Date(val) : new Date(String(val));
				const ms = d.getTime();
				return Number.isNaN(ms) ? null : ms;
			} catch (_) {
				return null;
			}
		}
		const members = (teamUpdate.members || []).slice();
		const hasJoined = members.some(m => getJoinedAt(m) !== null);
		if (hasJoined) {
			members.sort((a, b) => {
				const aj = getJoinedAt(a), bj = getJoinedAt(b);
				if (aj === null && bj === null) return 0;
				if (aj === null) return 1;
				if (bj === null) return -1;
				return aj - bj;
			});
		}
		members.forEach((element, idx) => {
			order.push(`${idx + 1}. ${element.rsiHandle}`);
		});
		lastTeamOrder = order;
	}
}

export async function test(number) {
	console.log(`\n*** TEST MODE: Team Join Order ${number} ***`);
	lastTeamOrder = [
		"1. Test1",
		"2. Test2",
		"3. Test3",
		"4. Test4"
	];
	console.log("Test team order set: " + lastTeamOrder.join(" | "));
}
