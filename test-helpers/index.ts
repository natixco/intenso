import { vi } from 'vitest';
import { FileService } from '../src/services/file-service';
import { Method, RouteMetadata } from '../src';
import fetch, { BodyInit, Response } from 'node-fetch';

interface SetupOptions {
  routes?: RouteMetadata[];
  toMock?: {
    fileServiceFindRoutes: boolean;
  };
}

const defaultPort = 8080;

export function setupTest(options?: SetupOptions): number {
  mockFs();
  mockFileService(options ?? {});
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
    vi.spyOn(FileService.prototype, 'findRoutes').mockReturnValue(Promise.resolve<RouteMetadata[]>(options?.routes ?? []));
  }

  vi.spyOn(FileService.prototype, 'getCurrentPath').mockImplementation(() => 'routes');

  vi.spyOn(FileService.prototype as any, 'loadHandler').mockReturnValue(Promise.resolve<any>(null));
}
