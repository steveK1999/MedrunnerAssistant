// Copied this solution from stack overflow: https://stackoverflow.com/a/79286769
import { spawn } from "node:child_process";

// On Windows we can offload the work to PowerShell:
const winFn = (filePath, durationMs) => {
	// Use Play() instead of PlaySync() so the sound can be interrupted after durationMs
	const psScript = `$player = New-Object Media.SoundPlayer "${filePath}"; $player.Play(); Start-Sleep -Milliseconds ${durationMs && durationMs > 0 ? durationMs : 1000000}`;
	const child = spawn(`powershell`, [`-c`, psScript]);
	
	if (durationMs && durationMs > 0) {
		setTimeout(() => {
			try {
				child.kill();
			} catch (e) {
				// Child process may have already exited
			}
		}, durationMs);
	}
	
	return child;
};

// On MacOS, we have afplay available:
const macFn = (filePath, durationMs) => {
	const child = spawn(`afplay`, [filePath]);
	
	if (durationMs && durationMs > 0) {
		setTimeout(() => {
			try {
				child.kill();
			} catch (e) {
				// Child process may have already exited
			}
		}, durationMs);
	}
	
	return child;
};

// And on everything else, i.e. linux/unix, we can use aplay:
const nxFn = (filePath, durationMs) => {
	const child = spawn(`aplay`, [filePath]);
	
	if (durationMs && durationMs > 0) {
		setTimeout(() => {
			try {
				child.kill();
			} catch (e) {
				// Child process may have already exited
			}
		}, durationMs);
	}
	
	return child;
};

// Then, because your OS doesn't change during a script
// run, we can simply bind the single function we'll need
// as "play(filePath, durationMs)":
const { platform: os } = process;
const playAudio = os === `win32` ? winFn : os === `darwin` ? macFn : nxFn;

// And then we can just export that for use anywhere in our codebase.
export { playAudio };
