import { delay, http, HttpResponse } from 'msw';

import { server } from '@/test/server';

import { ApiError, apiGet } from './apiClient';
import { env } from './env';

const base = env.apiBaseUrl;

describe('apiGet', () => {
  it('returns parsed JSON typed as T', async () => {
    server.use(http.get(`${base}/thing`, () => HttpResponse.json({ ok: true })));

    await expect(apiGet<{ ok: boolean }>('/thing')).resolves.toEqual({ ok: true });
  });

  it('normalizes a non-2xx response into an ApiError carrying the status', async () => {
    server.use(
      http.get(`${base}/thing`, () => HttpResponse.json(null, { status: 500 })),
    );

    await expect(apiGet('/thing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
    });
  });

  it('throws a parse ApiError when the body is not JSON', async () => {
    server.use(http.get(`${base}/thing`, () => HttpResponse.text('not json')));

    await expect(apiGet('/thing')).rejects.toMatchObject({
      message: 'Failed to parse server response.',
    });
  });

  it('throws a 408 ApiError when the request exceeds its timeout', async () => {
    server.use(
      http.get(`${base}/slow`, async () => {
        await delay(60);
        return HttpResponse.json({ ok: true });
      }),
    );

    await expect(apiGet('/slow', { timeoutMs: 10 })).rejects.toMatchObject({
      name: 'ApiError',
      status: 408,
    });
  });

  it('re-throws caller cancellation rather than wrapping it as an ApiError', async () => {
    server.use(http.get(`${base}/thing`, () => HttpResponse.json({ ok: true })));

    const controller = new AbortController();
    controller.abort();

    await expect(
      apiGet('/thing', { signal: controller.signal }),
    ).rejects.not.toBeInstanceOf(ApiError);
  });
});
