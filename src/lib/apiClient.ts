import { env } from './env';

/**
 * Normalized API error thrown by every failed request so callers (React Query
 * hooks, screens) have a single, predictable error shape to render.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;

export interface ApiGetOptions {
  /** Caller signal (e.g. React Query's) merged with the internal timeout. */
  signal?: AbortSignal;
  /** Override the default request timeout. */
  timeoutMs?: number;
}

/**
 * Combine the caller's AbortSignal with an internal timeout signal so a request
 * is aborted by whichever fires first (unmount/param change OR timeout).
 *
 * Detection of "did we time out?" uses a closure flag, and caller cancellation
 * is detected via the caller signal's own `aborted` flag — deliberately NOT the
 * abort *reason* or `DOMException`, neither of which is reliably available in
 * the Hermes runtime.
 */
function withTimeout(
  signal: AbortSignal | undefined,
  timeoutMs: number,
): { signal: AbortSignal; cleanup: () => void; didTimeout: () => boolean } {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', onAbort);
    }
  }

  const cleanup = () => {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onAbort);
  };

  return { signal: controller.signal, cleanup, didTimeout: () => timedOut };
}

/**
 * Perform a typed GET against the configured base URL.
 *
 * - Joins `path` onto `env.apiBaseUrl`.
 * - Enforces a timeout via AbortController, merged with the caller's signal.
 * - Throws a normalized {@link ApiError} on non-2xx or network/timeout failure.
 * - Parses and returns JSON typed as `T` (the caller asserts the shape).
 */
export async function apiGet<T>(
  path: string,
  options: ApiGetOptions = {},
): Promise<T> {
  const { signal, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const url = `${env.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const { signal: mergedSignal, cleanup, didTimeout } = withTimeout(
    signal,
    timeoutMs,
  );

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: mergedSignal,
    });
  } catch (error) {
    cleanup();
    if (didTimeout()) {
      throw new ApiError(408, 'The request timed out. Please try again.');
    }
    // Re-throw genuine caller cancellations (unmount / param change) so React
    // Query can ignore them instead of surfacing an error state.
    if (signal?.aborted) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : 'Network request failed';
    throw new ApiError(0, message);
  }

  cleanup();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Request failed with status ${response.status}`,
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(response.status, 'Failed to parse server response.');
  }
}
