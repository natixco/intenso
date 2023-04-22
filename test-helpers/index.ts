import { vi } from 'vitest';
import { Method } from '../src';
import fetch, { BodyInit, Response } from 'node-fetch';

const defaultPort = 8080;

export function getPort(): number {
  return defaultPort + Number(process.env.VITEST_WORKER_ID ?? 0);
}

export function testRequest(port: number, path: string, method: Method, body: BodyInit | null | undefined = undefined): Promise<Response> {
  return fetch(`http://localhost:${port}${path}`, {
    method,
    body
  });
}

export function mockConsole() {
  vi.spyOn(console, 'log').mockImplementation(() => {
  });
}
