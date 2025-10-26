export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly details?: unknown;

  constructor(message: string, status: number, statusText: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.details = details;
  }
}

export interface ApiClientOptions extends RequestInit {
  skipJsonParsing?: boolean;
}

const DEFAULT_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const mergeHeaders = (headers?: HeadersInit): Headers => {
  const merged = new Headers(DEFAULT_HEADERS);
  if (!headers) {
    return merged;
  }

  const provided = new Headers(headers);
  provided.forEach((value, key) => {
    merged.set(key, value);
  });

  return merged;
};

export const apiFetch = async <T>(url: string, options: ApiClientOptions = {}): Promise<T> => {
  const { skipJsonParsing, headers, ...rest } = options;

  const response = await fetch(url, {
    ...rest,
    headers: mergeHeaders(headers),
  });

  if (!response.ok) {
    let errorDetails: unknown;
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const json = await response.json();
      errorDetails = json;
      if (json && typeof json === 'object') {
        const potentialMessage =
          (json as { message?: string }).message ?? (json as { error?: string }).error;
        if (potentialMessage) {
          errorMessage = potentialMessage;
        }
      }
    } catch {
      try {
        const text = await response.text();
        if (text) {
          errorDetails = text;
          errorMessage = text;
        }
      } catch {
        // ignore secondary parsing errors
      }
    }

    throw new ApiError(errorMessage, response.status, response.statusText, errorDetails);
  }

  if (response.status === 204 || skipJsonParsing) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new ApiError('Failed to parse response body as JSON.', response.status, response.statusText, error);
  }
};
