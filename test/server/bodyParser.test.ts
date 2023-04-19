import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createServer } from '../../src';
import { getPort, setupTest, testRequest } from '../../test-helpers';
import { Response } from 'node-fetch';

describe.todo('bodyParser', () => {
  let server: any;
  let port: number;

  beforeAll(async () => {
    port = getPort();
    server = createServer({ port });

    setupTest({
      routes: [
        {
          pathname: '/',
          method: 'post',
          routeHandler: server.createRoute({
            bodyParser: (z: any) => z.object({
              id: z.coerce.number()
            }),
            handler: ({ body }: any) => {
              return {
                status: 200,
                body: `ok from GET / id: ${body.id}`
              };
            }
          }),
        },
      ]
    });

    server.setup();
  });

  afterAll(() => {
    server.close();
  });

  describe('route: POST /', async () => {
    let res: Response;
    const id = 123;
    const expectedId = 124;

    beforeEach(async () => {
      res = await testRequest(port, '/', 'post', JSON.stringify({ id }));
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual(`ok from GET / id: ${expectedId}`);
    });
  });

});
