import { getSelf } from "../lib/medrunnerAPI.js";
import { playAudio } from "../lib/playAudio.js";
import { resolveAudioPath } from "../lib/resolveAudioPath.js";

export const event = "TeamUpdate";

export const name = "Custom_TeamJoin_Sound";

export async function callback(teamUpdate) {
	if (process.env.DEBUG_MODE === "true") {
		console.log("TeamJoinSound: New team update received");
		console.log(JSON.stringify(teamUpdate, null, 4));
	}

	const self = await getSelf();

	if (self.data.activeClass == 4 && self.data.activeTeam == teamUpdate.id) {
		if (teamUpdate.waitList && teamUpdate.waitList.length > 0) {
			teamUpdate.waitList.forEach((element) => {
				console.log(element.rsiHandle + " has requested to join the team");
				console.log("After accepting this request, the team will be " + (teamUpdate.members.length + teamUpdate.waitList.length) + " people big");
			});
			try {
				const audioPath = resolveAudioPath(process.env.CUSTOM_TEAMJOIN_SOUND);
				await playAudio(audioPath);
				console.log("Playback finished for teamupdate.");
			} catch (e) {
				console.error("Failed to play audio:", e);
			}
		}
	}
}

export async function test(number) {
	console.log(`\n*** TEST MODE: Team Join Sound ${number} ***`);
	try {
		const audioPath = resolveAudioPath(process.env.CUSTOM_TEAMJOIN_SOUND);
		await playAudio(audioPath);
		console.log("Test team join sound played successfully!");
	} catch (e) {
		console.error("Test failed:", e.message);
	}
}
