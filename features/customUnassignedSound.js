import { playAudio } from "../lib/playAudio.js";
import { resolveAudioPath } from "../lib/resolveAudioPath.js";

export const event = "play-unassigned-sound";

export const name = "Custom_Unassigned_Sound";

export async function callback() {
	try {
		const audioPath = resolveAudioPath(process.env.CUSTOM_UNASSIGNED_SOUND);
		const durationMs = process.env.CUSTOM_UNASSIGNED_SOUND_DURATION_MS ? parseInt(process.env.CUSTOM_UNASSIGNED_SOUND_DURATION_MS, 10) : 0;
		console.log(`[${name}] Playing unassigned crew sound: ${audioPath}`);
		await playAudio(audioPath, durationMs);
	} catch (error) {
		console.error(`[${name}] Error playing sound:`, error);
	}
}

export async function test(number) {
	console.log(`\n*** TEST MODE: Unassigned Crew Sound ${number} ***`);
	await callback();
}
