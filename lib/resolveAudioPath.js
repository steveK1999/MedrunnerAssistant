import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

export function resolveAudioPath(filePath) {
	if (!filePath) {
		throw new Error("No audio file path provided");
	}

	// If the path is absolute, use it as-is
	if (path.isAbsolute(filePath)) {
		return filePath;
	}

	// If the path is relative, resolve it from the project root
	const resolvedPath = path.resolve(projectRoot, filePath);
	return resolvedPath;
}
