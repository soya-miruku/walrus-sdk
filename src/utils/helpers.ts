import type { StoreResponse } from '../types';

/**
 * Normalizes the response from store operations.
 * Ensures that blob information is consistently available in the response object.
 */
export function normalizeBlobResponse(response: StoreResponse): StoreResponse {
  // Ensure response has a blob property
  if (!response.blob) {
    response.blob = {
      blobId: '',
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
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse error response body to extract meaningful error message
 */
export async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const json = await response.json() as Record<string, unknown>;
      return (json.error as string) || (json.message as string) || `HTTP error ${response.status}`;
    } else {
      const text = await response.text();
      return text || `HTTP error ${response.status}`;
    }
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
  requiredLength?: number
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
    throw new Error('AES key must be 16, 24, or 32 bytes (128, 192, or 256 bits)');
  }
}

/**
 * Combines a base URL with a path, ensuring proper slash handling
 */
export function combineURLs(baseURL: string, path: string): string {
  const normalizedBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
} 