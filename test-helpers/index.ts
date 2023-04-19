import { vi } from 'vitest';
import { Method, RouteMetadata } from '../src';
import fetch, { BodyInit, Response } from 'node-fetch';
import * as fileHelpers from '../src/helpers';

interface SetupOptions {
  routes?: RouteMetadata[];
  toMock?: {
    fileServiceFindRoutes: boolean;
  };
}

const defaultPort = 8080;

export function getPort(): number {
  return defaultPort + Number(process.env.VITEST_WORKER_ID ?? 0);
}

export function setupTest(options?: SetupOptions): void {
  mockFs();
  mockFileService(options ?? {});
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

function mockFs() {
  vi.mock('fs', async () => {
    return {
      ...(await vi.importActual<typeof import('fs')>('fs')),
      existsSync: vi.fn().mockReturnValue(true),
      readdirSync: vi.fn().mockReturnValue(['/get.ts']),
      statSync: vi.fn().mockReturnValue({
        isDirectory() {
          return false;
        }
      })
    };
  });
}

function mockFileService(options: SetupOptions) {
  if (options?.toMock?.fileServiceFindRoutes ?? true) {
    vi.spyOn(fileHelpers, 'findRoutes').mockReturnValue(Promise.resolve<RouteMetadata[]>(options?.routes ?? []));
  }

  vi.spyOn(fileHelpers, 'getCurrentPath').mockReturnValue('routes');

  vi.spyOn(fileHelpers, 'loadHandler').mockReturnValue(Promise.resolve<any>(null));
}
