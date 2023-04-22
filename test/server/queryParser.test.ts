import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createServer, RouteMetadata } from '../../src';
import { getPort, testRequest } from '../../test-helpers';
import { Response } from 'node-fetch';
import * as fileHelpers from '../../src/helpers';

vi.mock('fs', async () => {
  return {
    existsSync: vi.fn().mockReturnValue(true),
  };
});
vi.spyOn(fileHelpers, 'getCurrentPath').mockReturnValue('routes');

describe('queryParser', () => {
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
          queryParser: (z: any) => z.object({
            id: z.coerce.number()
          }),
          handler: ({ query }: any) => {
            return {
              status: 200,
              body: `ok from GET / id: ${query.id + 1}`
            };
          }
        }),
      },
    ];
    vi.spyOn(fileHelpers, 'findRoutes').mockReturnValue(Promise.resolve<RouteMetadata[]>(routes));

    server.setup();
  });

  afterAll(() => {
    server.close();
  });

  describe('route: GET /?id=123', async () => {
    let res: Response;
    const id = 123;
    const expectedId = 124;

    beforeEach(async () => {
      res = await testRequest(port, `/?id=${id}`, 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual(`ok from GET / id: ${expectedId}`);
    });
  });

});
