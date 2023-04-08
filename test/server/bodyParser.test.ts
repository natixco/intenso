import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createServer, Intenso, Route } from '../../src';
import { setupTest, testRequest } from '../../test-helpers';
import { Response } from 'node-fetch';

describe.todo('bodyParser', () => {
  let server: Intenso;
  let port: number;

  beforeAll(async () => {
    port = setupTest({
      routes: [
        {
          pathname: '/',
          method: 'post',
          bodyParser(body) {
            if (body.id) {
              body.id = Number(body.id) + 1;
            }
            return body;
          },
          handler: async ({ body }) => {
            return {
              status: 200,
              body: `ok from GET / id: ${body.id}`
            };
          }
        },
      ]
    });

    server = await createServer({ port });
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
