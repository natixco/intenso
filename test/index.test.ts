import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createServer, RouteMetadata } from '../src';
import { getPort, testRequest } from '../test-helpers';
import { Response } from 'node-fetch';
import * as fileHelpers from '../src/helpers';

const mock = require('mock-require')

mock('routes\\routes\\get.ts', { default: undefined });

vi.mock('fs', async () => {
  return {
    ...(await vi.importActual<typeof import('fs')>('fs')),
    existsSync: vi.fn().mockReturnValue(true),
    readdirSync: vi.fn().mockReturnValue(['get.ts']),
    statSync: vi.fn().mockReturnValue({
      isDirectory() {
        return false;
      }
    })
  };
});
vi.spyOn(fileHelpers, 'getCurrentPath').mockReturnValue('routes');

describe('when the server is successfully created', () => {
  let server: any;
  let port: number;

  beforeAll(async () => {
    port = getPort();
    server = createServer({ port });
    server.setup();
  });

  afterAll(() => {
    server.close();
  });

  it('should create the server', () => {
    expect(server).toBeTruthy();
  });
});

describe('index tests with the same server', () => {
  let server: any;
  let port: number;

  beforeAll(async () => {
    port = getPort();
    server = createServer({ port });

    const routes: RouteMetadata[] = [
      {
        pathname: '/route-without-handler',
        method: 'get',
        routeHandler: undefined
      },
      {
        pathname: '/json-response',
        method: 'get',
        routeHandler: server.createRoute({
          handler: () => {
            return {
              status: 200,
              body: {
                x: 123,
              }
            };
          }
        }),
      },
      {
        pathname: '/error',
        method: 'get',
        routeHandler: server.createRoute({
          handler: () => {
            throw new Error('error :(')
          }
        }),
      }
    ];
    vi.spyOn(fileHelpers, 'findRoutes').mockReturnValue(Promise.resolve<RouteMetadata[]>(routes));

    server.setup();
  });

  afterAll(() => {
    server.close();
  });

  describe('when the requested route does not exist', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/not-existing-route', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(404);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('The requested resource does not exist');
    });
  });

  describe('when the requested route doest not have a handler', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/route-without-handler', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(500);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('Unexpected error');
    });
  });

  describe('when the response is a json object', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/json-response', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.json()).toEqual({ x: 123 });
    });
  });

  describe('when the handler throws an error', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/error', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(500);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('error :(');
    });
  });

});


