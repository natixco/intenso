import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createServer, Intenso } from '../../src';
import { setupTest, testRequest } from '../../test-helpers';
import { Response } from 'node-fetch';

describe('queryParser', () => {
  let server: Intenso;
  let port: number;

  beforeAll(async () => {
    port = setupTest({
      routes: [
        {
          pathname: '/',
          method: 'get',
          handler: {
            default() {
              return {
                queryParser(query) {
                  if (query.id) {
                    query.id = Number(query.id) + 1;
                  }
                  return query;
                },
                async handler({ query }) {
                  return {
                    status: 200,
                    body: `ok from GET / id: ${query.id}`
                  };
                }
              };
            }
          }
        },
      ]
    });

    server = await createServer({ port });
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
