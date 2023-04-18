import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createRoute, createServer, Intenso } from '../../src';
import { setupTest, testRequest } from '../../test-helpers';
import { Response } from 'node-fetch';

describe('queryParser', () => {
  let server: Intenso;
  let port: number;

  beforeAll(async () => {
    port = setupTest({
      routes: [
        {
          pathname: '/[id]',
          method: 'get',
          routeHandler: createRoute({
            paramsParser: z => z.object({
              id: z.coerce.number()
            }),
            handler: ({ params }) => {
              return {
                status: 200,
                body: `ok from GET /[id]: ${params.id + 1}`
              };
            }
          }),
        },
      ]
    });

    server = await createServer({ port });
  });

  afterAll(() => {
    server.close();
  });

  describe('route: GET /123', async () => {
    let res: Response;
    const id = 123;
    const expectedId = 124;

    beforeEach(async () => {
      res = await testRequest(port, `/${id}`, 'get');
    });

    it('response should have the correct status', () => {
      expect(res.status).toEqual(200);
    });

    it('response should have the correct body', async () => {
      expect(await res.text()).toEqual(`ok from GET /[id]: ${expectedId}`);
    });
  });

});
