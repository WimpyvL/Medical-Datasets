import { ApiErrorResponse } from '../types';

export class ApiError extends Error {
  readonly status: number | null;
  readonly statusText: string;
  readonly details?: unknown;
  readonly response: ApiErrorResponse;

  constructor(response: ApiErrorResponse, statusText = '', details?: unknown) {
    super(response.message);
    this.name = 'ApiError';
    this.status = typeof response.status === 'number' ? response.status : null;
    this.statusText = statusText;
    this.details = details ?? response.details;
    this.response = { ...response, details: this.details };
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

  try {
    const response = await fetch(url, {
      ...rest,
      headers: mergeHeaders(headers),
    });

    if (!response.ok) {
      let errorDetails: unknown;
      let errorMessage = `Request failed with status ${response.status}`;
      let fieldErrors: Record<string, string[]> | undefined;

      try {
        const json = await response.json();
        errorDetails = json;
        if (json && typeof json === 'object') {
          const potentialMessage =
            (json as { message?: string }).message ?? (json as { error?: string }).error;
          if (potentialMessage) {
            errorMessage = potentialMessage;
          }

          const potentialErrors = (json as { errors?: unknown }).errors;
          if (potentialErrors && typeof potentialErrors === 'object' && !Array.isArray(potentialErrors)) {
            fieldErrors = Object.entries(potentialErrors as Record<string, unknown>).reduce<Record<string, string[]>>(
              (acc, [key, value]) => {
                if (typeof value === 'string') {
                  acc[key] = [value];
                } else if (Array.isArray(value)) {
                  acc[key] = value.map(String);
                }
                return acc;
              },
              {},
            );
            if (Object.keys(fieldErrors).length === 0) {
              fieldErrors = undefined;
            }
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

      const isValidation = response.status >= 400 && response.status < 500;
      const errorResponse: ApiErrorResponse = isValidation
        ? {
            type: 'validation',
            message: errorMessage,
            status: response.status,
            details: errorDetails,
            fieldErrors,
          }
        : {
            type: 'server',
            message: errorMessage,
            status: response.status,
            details: errorDetails,
          };

      throw new ApiError(errorResponse, response.statusText, errorDetails);
    }

    if (response.status === 204 || skipJsonParsing) {
      return undefined as T;
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new ApiError(
        {
          type: 'server',
          message: 'Failed to parse response body as JSON.',
          status: response.status,
          details: error,
        },
        response.statusText,
        error,
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Network request failed.';
    const networkError: ApiErrorResponse = {
      type: 'network',
      message,
      retryable: true,
      details: error,
    };

    throw new ApiError(networkError);
  }
};
