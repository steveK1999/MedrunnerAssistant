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
		let i = 1;
		teamUpdate.members.forEach((element) => {
			order.push(`${i}. ${element.rsiHandle}`);
			i++;
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
