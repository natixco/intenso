import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createServer, RouteMetadata, Status } from '../../src';
import { getPort, testRequest } from '../../test-helpers';
import { Response } from 'node-fetch';
import * as fileHelpers from '../../src/helpers';

vi.mock('fs', async () => {
  return {
    existsSync: vi.fn().mockReturnValue(true),
  };
});
vi.spyOn(fileHelpers, 'getCurrentPath').mockReturnValue('routes');

describe('routes', () => {
  let server: any;
  let port: number;

  beforeAll(async () => {
    port = getPort();
    server = createServer({ port });

    const routes: RouteMetadata[] = [
      {
        pathname: '/',
        method: 'get',
        routeHandler: server.createRoute({
          handler: () => {
            return {
              status: 200,
              body: 'ok from GET /'
            };
          }
        })
      },
      {
        pathname: '/sub',
        method: 'get',
        routeHandler: server.createRoute({
          handler: () => {
            return {
              status: 200,
              body: 'ok from GET /sub'
            };
          }
        })
      },
      {
        pathname: '/sub',
        method: 'post',
        routeHandler: server.createRoute({
          handler: () => {
            return {
              status: 201,
              body: 'ok from POST /sub'
            };
          }
        })
      },
      {
        pathname: '/organizations/notOrgId',
        method: 'get',
        routeHandler: server.createRoute({
          handler: () => {
            return {
              status: 200,
              body: 'not org id'
            };
          }
        })
      },
      {
        pathname: '/organizations/[orgId]',
        method: 'get',
        routeHandler: server.createRoute({
          handler: ({ params }: any) => {
            return {
              status: 200,
              body: {
                orgId: params.orgId,
              }
            };
          }
        })
      },
      {
        pathname: '/organizations/[orgId]/applications/[appId]',
        method: 'get',
        routeHandler: server.createRoute({
          handler: ({ params }: any) => {
            return {
              status: 200,
              body: {
                orgId: params.orgId,
                appId: params.appId,
              }
            };
          }
        })
      },
      {
        pathname: '/should-redirect-with-permanent',
        method: 'get',
        routeHandler: server.createRoute({
          handler: () => {
            return {
              destination: '/should-redirect-to',
              permanent: false,
            };
          }
        })
      },
      {
        pathname: '/should-redirect-with-status',
        method: 'get',
        routeHandler: server.createRoute({
          handler: () => {
            return {
              destination: '/should-redirect-to',
              status: Status.MOVED_TEMPORARILY
            };
          }
        })
      },
      {
        pathname: '/should-redirect-to',
        method: 'get',
        routeHandler: server.createRoute({
          handler: () => {
            return {
              status: 200,
              body: 'ok',
            };
          }
        })
      }
    ];
    vi.spyOn(fileHelpers, 'findRoutes').mockReturnValue(Promise.resolve<RouteMetadata[]>(routes));

    server.setup();
  });

  afterAll(() => {
    server.close();
  });

  describe('route: GET /', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('ok from GET /');
    });
  });

  describe('route: GET /sub', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/sub', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('ok from GET /sub');
    });
  });

  describe('route: POST /sub', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/sub', 'post');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(201);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('ok from POST /sub');
    });
  });

  describe('route: GET /organizations/[orgId]', async () => {
    let res: Response;
    const orgId = 123;

    beforeEach(async () => {
      res = await testRequest(port, `/organizations/${orgId}`, 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.json()).toEqual({ orgId: orgId.toString() });
    });
  });

  describe('route: GET /organizations/notOrgId', async () => {
    let res: Response;

    beforeEach(async () => {
      res = await testRequest(port, '/organizations/notOrgId', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('not org id');
    });
  });

  describe('route: GET /organizations/[orgId]/applications/[appId]', async () => {
    let res: Response;
    const orgId = 123;
    const appId = 456;

    beforeEach(async () => {
      res = await testRequest(port, `/organizations/${orgId}/applications/${appId}`, 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.json()).toEqual({ orgId: orgId.toString(), appId: appId.toString() });
    });
  });

  describe('route: GET /should-redirect-with-permanent', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/should-redirect-with-permanent', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('ok');
    });

    it('response should have the correct url', () => {
      expect(res.url).toEqual(`http://localhost:${port}/should-redirect-to`);
    });
  });

  describe('route: GET /should-redirect-with-status', async () => {
    let res: Response;
    beforeEach(async () => {
      res = await testRequest(port, '/should-redirect-with-status', 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual('ok');
    });

    it('response should have the correct url', () => {
      expect(res.url).toEqual(`http://localhost:${port}/should-redirect-to`);
    });
  });

});
