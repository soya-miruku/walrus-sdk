import type { StoreResponse } from "../types";

/**
 * Normalizes the response from store operations.
 * Ensures that blob information is consistently available in the response object.
 */
export function normalizeBlobResponse(response: StoreResponse): StoreResponse {
	// Ensure response has a blob property
	if (!response.blob) {
		response.blob = {
			blobId: "",
			endEpoch: 0,
		};
	}

	// If it's a newly created blob
	if (response.newlyCreated) {
		response.blob.blobId = response.newlyCreated.blobObject.blobId;
		response.blob.endEpoch = response.newlyCreated.blobObject.storage.endEpoch;
	}

	// If it's an already certified blob
	if (response.alreadyCertified) {
		response.blob.blobId = response.alreadyCertified.blobId;
		response.blob.endEpoch = response.alreadyCertified.endEpoch;
	}

	return response;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse error response body to extract meaningful error message
 */
export async function parseErrorResponse(response: Response): Promise<string> {
	try {
		if (response.headers.get("content-type")?.includes("application/json")) {
			const json = (await response.json()) as Record<string, unknown>;
			return (
				(json.error as string) ||
				(json.message as string) ||
				`HTTP error ${response.status}`
			);
		}
		const text = await response.text();
		return text || `HTTP error ${response.status}`;
	} catch (error) {
		return `HTTP error ${response.status}`;
	}
}

/**
 * Validates if a value is a Uint8Array and has a specific length (if specified)
 */
export function validateUint8Array(
	value: unknown,
	name: string,
	requiredLength?: number,
): void {
	if (!(value instanceof Uint8Array)) {
		throw new Error(`${name} must be a Uint8Array`);
	}

	if (requiredLength !== undefined && value.length !== requiredLength) {
		throw new Error(`${name} must be ${requiredLength} bytes long`);
	}
}

/**
 * Validates if a key is valid for AES encryption (16, 24, or 32 bytes)
 */
export function validateAesKey(key: Uint8Array): void {
	if (![16, 24, 32].includes(key.length)) {
		throw new Error(
			"AES key must be 16, 24, or 32 bytes (128, 192, or 256 bits)",
		);
	}
}

/**
 * Combines a base URL with a path, ensuring proper slash handling
 */
export function combineURLs(baseURL: string, path: string): string {
	const normalizedBase = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${normalizedBase}${normalizedPath}`;
}

/**
 * Gets content type based on file extension
 * @param filename The filename or path to determine content type for
 * @returns The MIME type for the file or 'application/octet-stream' if not determined
 */
export function getContentTypeFromFilename(filename: string): string {
	const ext = filename.toLowerCase().split(".").pop() || "";

	const contentTypes: Record<string, string> = {
		// Text files
		txt: "text/plain",
		html: "text/html",
		htm: "text/html",
		css: "text/css",
		csv: "text/csv",
		js: "text/javascript",
		ts: "text/typescript",
		md: "text/markdown",

		// Documents
		pdf: "application/pdf",
		doc: "application/msword",
		docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		xls: "application/vnd.ms-excel",
		xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		ppt: "application/vnd.ms-powerpoint",
		pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

		// Images
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
		svg: "image/svg+xml",
		webp: "image/webp",
		ico: "image/x-icon",

		// Audio
		mp3: "audio/mpeg",
		wav: "audio/wav",
		ogg: "audio/ogg",

		// Video
		mp4: "video/mp4",
		webm: "video/webm",
		avi: "video/x-msvideo",

		// Data formats
		json: "application/json",
		xml: "application/xml",
		yaml: "application/yaml",
		yml: "application/yaml",

		// Archives
		zip: "application/zip",
		tar: "application/x-tar",
		gz: "application/gzip",
		rar: "application/vnd.rar",
		"7z": "application/x-7z-compressed",

		// Miscellaneous
		wasm: "application/wasm",
		ttf: "font/ttf",
		otf: "font/otf",
		woff: "font/woff",
		woff2: "font/woff2",
	};

	return contentTypes[ext] || "application/octet-stream";
}
