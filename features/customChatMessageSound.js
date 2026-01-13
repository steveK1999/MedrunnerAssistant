import { getSelf } from "../lib/medrunnerAPI.js";
import { playAudio } from "../lib/playAudio.js";
import { resolveAudioPath } from "../lib/resolveAudioPath.js";
import * as workflowManager from "../lib/workflowManager.js";

export const event = "ChatMessageCreate";

export const name = "Custom_ChatMessage_Sound";

export async function callback(chatMessage) {
	if (process.env.DEBUG_MODE === "true") {
		console.log("New chat message received: " + JSON.stringify(chatMessage.contents));
		console.log(JSON.stringify(chatMessage, null, 4));
	}

	const self = await getSelf();

	if (self.data.id !== chatMessage.senderId && self.data.activeClass == 4) {
		// Check if workflow should handle this chat message instead
		if (workflowManager.shouldTriggerOnChatMessage()) {
			console.log("Chat message handled by workflow - skipping default sound");
			workflowManager.triggerWorkflow('chat_message');
			return; // Skip default sound
		}

		// Default behavior: play sound
		try {
			const audioPath = resolveAudioPath(process.env.CUSTOM_CHATMESSAGE_SOUND);
			const durationMs = process.env.CUSTOM_CHATMESSAGE_SOUND_DURATION_MS ? parseInt(process.env.CUSTOM_CHATMESSAGE_SOUND_DURATION_MS, 10) : 0;
			await playAudio(audioPath, durationMs);
			console.log("Playback finished for chatmessage.");
		} catch (e) {
			console.error("Failed to play audio:", e);
		}
	}
}

export async function test(number) {
	console.log(`\n*** TEST MODE: Chat Message Sound ${number} ***`);
	try {
		const audioPath = resolveAudioPath(process.env.CUSTOM_CHATMESSAGE_SOUND);
		const durationMs = process.env.CUSTOM_CHATMESSAGE_SOUND_DURATION_MS ? parseInt(process.env.CUSTOM_CHATMESSAGE_SOUND_DURATION_MS, 10) : 0;
		await playAudio(audioPath, durationMs);
		console.log("Test chat message sound played successfully!");
	} catch (e) {
		console.error("Test failed:", e.message);
	}
}
